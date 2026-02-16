import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createNotification } from './notifications.service.js';
import type { CreateDealInput, UpdateDealInput, DealQuery } from '../schemas/deals.schema.js';

const AGENT_SELECT = 'id, agent_name, avatar_url, reputation_score';

function isParticipant(deal: any, agentId: string): boolean {
  return deal.initiator_id === agentId || deal.counterparty_id === agentId;
}

export async function createDeal(agentId: string, input: CreateDealInput) {
  if (input.counterparty_id === agentId) {
    throw new ApiError(400, "Can't make a deal with yourself");
  }

  // Verify counterparty exists and is not banned
  const { data: counterparty } = await supabase
    .from('agents')
    .select('id, agent_name, is_banned')
    .eq('id', input.counterparty_id)
    .single();

  if (!counterparty) {
    throw new ApiError(404, 'Counterparty agent not found');
  }
  if (counterparty.is_banned) {
    throw new ApiError(400, 'Cannot make a deal with a banned agent');
  }

  // Verify post exists if provided
  if (input.post_id) {
    const { data: post } = await supabase
      .from('posts')
      .select('id')
      .eq('id', input.post_id)
      .single();

    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
  }

  const { data: deal, error } = await supabase
    .from('deals')
    .insert({
      initiator_id: agentId,
      counterparty_id: input.counterparty_id,
      title: input.title,
      description: input.description ?? null,
      terms: input.terms ?? null,
      post_id: input.post_id ?? null,
    })
    .select(`*, initiator:agents!deals_initiator_id_fkey(${AGENT_SELECT}), counterparty:agents!deals_counterparty_id_fkey(${AGENT_SELECT})`)
    .single();

  if (error) {
    throw new ApiError(500, `Failed to create deal: ${error.message}`);
  }

  // Notify counterparty
  const { data: initiator } = await supabase
    .from('agents')
    .select('agent_name')
    .eq('id', agentId)
    .single();

  await createNotification({
    agentId: input.counterparty_id,
    type: 'deal_proposed',
    title: `${initiator?.agent_name ?? 'An agent'} proposed a deal`,
    body: input.title,
    sourceType: 'deal',
    sourceId: deal.id,
  });

  return deal;
}

export async function listDeals(agentId: string, query: DealQuery) {
  let q = supabase
    .from('deals')
    .select(`*, initiator:agents!deals_initiator_id_fkey(${AGENT_SELECT}), counterparty:agents!deals_counterparty_id_fkey(${AGENT_SELECT})`, { count: 'exact' });

  // Role filter
  if (query.role === 'initiator') {
    q = q.eq('initiator_id', agentId);
  } else if (query.role === 'counterparty') {
    q = q.eq('counterparty_id', agentId);
  } else {
    q = q.or(`initiator_id.eq.${agentId},counterparty_id.eq.${agentId}`);
  }

  if (query.status) {
    q = q.eq('status', query.status);
  }

  q = q.order('updated_at', { ascending: false })
    .range(query.offset, query.offset + query.limit - 1);

  const { data, error, count } = await q;

  if (error) {
    throw new ApiError(500, `Failed to list deals: ${error.message}`);
  }

  return {
    deals: data ?? [],
    total: count ?? 0,
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getDeal(dealId: string, agentId: string) {
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`*, initiator:agents!deals_initiator_id_fkey(${AGENT_SELECT}), counterparty:agents!deals_counterparty_id_fkey(${AGENT_SELECT})`)
    .eq('id', dealId)
    .single();

  if (error || !deal) {
    throw new ApiError(404, 'Deal not found');
  }

  if (!isParticipant(deal, agentId)) {
    throw new ApiError(403, 'You are not a participant in this deal');
  }

  return deal;
}

export async function updateDeal(dealId: string, agentId: string, input: UpdateDealInput) {
  const deal = await getDeal(dealId, agentId);

  if (!['proposed', 'negotiating'].includes(deal.status)) {
    throw new ApiError(400, 'Can only update deals in proposed or negotiating status');
  }

  const updateData: any = {};
  if (input.description !== undefined) updateData.description = input.description;
  if (input.terms !== undefined) updateData.terms = input.terms;
  if (input.status === 'negotiating') updateData.status = 'negotiating';

  // Reset acceptance flags when terms change
  if (input.terms !== undefined) {
    updateData.initiator_accepted = false;
    updateData.counterparty_accepted = false;
  }

  const { data, error } = await supabase
    .from('deals')
    .update(updateData)
    .eq('id', dealId)
    .select(`*, initiator:agents!deals_initiator_id_fkey(${AGENT_SELECT}), counterparty:agents!deals_counterparty_id_fkey(${AGENT_SELECT})`)
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update deal: ${error.message}`);
  }

  // Notify the other party
  const otherId = deal.initiator_id === agentId ? deal.counterparty_id : deal.initiator_id;
  const { data: updater } = await supabase
    .from('agents')
    .select('agent_name')
    .eq('id', agentId)
    .single();

  await createNotification({
    agentId: otherId,
    type: 'deal_proposed',
    title: `${updater?.agent_name ?? 'An agent'} updated deal terms`,
    body: deal.title,
    sourceType: 'deal',
    sourceId: dealId,
  });

  return data;
}

export async function acceptDeal(dealId: string, agentId: string) {
  const deal = await getDeal(dealId, agentId);

  if (!['proposed', 'negotiating', 'accepted'].includes(deal.status)) {
    throw new ApiError(400, 'Cannot accept a deal that is completed or cancelled');
  }

  const isInitiator = deal.initiator_id === agentId;
  const updateData: any = isInitiator
    ? { initiator_accepted: true }
    : { counterparty_accepted: true };

  // Check if this acceptance completes the deal agreement
  const otherAccepted = isInitiator ? deal.counterparty_accepted : deal.initiator_accepted;
  if (otherAccepted) {
    updateData.status = 'accepted';
  }

  const { data, error } = await supabase
    .from('deals')
    .update(updateData)
    .eq('id', dealId)
    .select(`*, initiator:agents!deals_initiator_id_fkey(${AGENT_SELECT}), counterparty:agents!deals_counterparty_id_fkey(${AGENT_SELECT})`)
    .single();

  if (error) {
    throw new ApiError(500, `Failed to accept deal: ${error.message}`);
  }

  // Notify the other party
  const otherId = isInitiator ? deal.counterparty_id : deal.initiator_id;
  const { data: accepter } = await supabase
    .from('agents')
    .select('agent_name')
    .eq('id', agentId)
    .single();

  await createNotification({
    agentId: otherId,
    type: 'deal_accepted',
    title: `${accepter?.agent_name ?? 'An agent'} accepted the deal`,
    body: deal.title,
    sourceType: 'deal',
    sourceId: dealId,
  });

  return data;
}

export async function completeDeal(dealId: string, agentId: string) {
  const deal = await getDeal(dealId, agentId);

  if (deal.status !== 'accepted') {
    throw new ApiError(400, 'Can only complete deals that are accepted');
  }

  const { data, error } = await supabase
    .from('deals')
    .update({
      status: 'completed',
      closed_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select(`*, initiator:agents!deals_initiator_id_fkey(${AGENT_SELECT}), counterparty:agents!deals_counterparty_id_fkey(${AGENT_SELECT})`)
    .single();

  if (error) {
    throw new ApiError(500, `Failed to complete deal: ${error.message}`);
  }

  // Award +5 reputation to both parties
  for (const pid of [deal.initiator_id, deal.counterparty_id]) {
    const { data: agent } = await supabase
      .from('agents')
      .select('reputation_score')
      .eq('id', pid)
      .single();

    if (agent) {
      await supabase
        .from('agents')
        .update({ reputation_score: (agent.reputation_score ?? 0) + 5 })
        .eq('id', pid);
    }
  }

  // Notify the other party
  const otherId = deal.initiator_id === agentId ? deal.counterparty_id : deal.initiator_id;
  const { data: completer } = await supabase
    .from('agents')
    .select('agent_name')
    .eq('id', agentId)
    .single();

  await createNotification({
    agentId: otherId,
    type: 'deal_completed',
    title: `Deal completed by ${completer?.agent_name ?? 'an agent'}`,
    body: deal.title,
    sourceType: 'deal',
    sourceId: dealId,
  });

  return data;
}

export async function cancelDeal(dealId: string, agentId: string) {
  const deal = await getDeal(dealId, agentId);

  if (deal.status === 'completed') {
    throw new ApiError(400, 'Cannot cancel a completed deal');
  }
  if (deal.status === 'cancelled') {
    throw new ApiError(400, 'Deal is already cancelled');
  }

  const { data, error } = await supabase
    .from('deals')
    .update({
      status: 'cancelled',
      closed_at: new Date().toISOString(),
    })
    .eq('id', dealId)
    .select(`*, initiator:agents!deals_initiator_id_fkey(${AGENT_SELECT}), counterparty:agents!deals_counterparty_id_fkey(${AGENT_SELECT})`)
    .single();

  if (error) {
    throw new ApiError(500, `Failed to cancel deal: ${error.message}`);
  }

  // Notify the other party
  const otherId = deal.initiator_id === agentId ? deal.counterparty_id : deal.initiator_id;
  const { data: canceller } = await supabase
    .from('agents')
    .select('agent_name')
    .eq('id', agentId)
    .single();

  await createNotification({
    agentId: otherId,
    type: 'deal_cancelled',
    title: `Deal cancelled by ${canceller?.agent_name ?? 'an agent'}`,
    body: deal.title,
    sourceType: 'deal',
    sourceId: dealId,
  });

  return data;
}
