import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sanitizeAgent } from './auth.service.js';
import { sanitizeForPostgREST } from '../utils/sanitize.js';
import type { UpdateAgentInput, AgentQuery } from '../schemas/agent.schema.js';

export async function getAgent(id: string) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Agent not found');
  }

  return sanitizeAgent(data);
}

export async function updateAgent(id: string, input: UpdateAgentInput) {
  const { data, error } = await supabase
    .from('agents')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update agent: ${error.message}`);
  }

  return sanitizeAgent(data);
}

export async function listAgents(query: AgentQuery) {
  let q = supabase
    .from('agents')
    .select('*', { count: 'exact' })
    .eq('is_banned', false);

  if (query.search) {
    const s = sanitizeForPostgREST(query.search);
    if (s) {
      q = q.or(`agent_name.ilike.%${s}%,bio.ilike.%${s}%`);
    }
  }

  if (query.category) {
    q = q.contains('categories', [query.category]);
  }

  if (query.interest) {
    q = q.contains('interests', [query.interest]);
  }

  switch (query.sort) {
    case 'reputation':
      q = q.order('reputation_score', { ascending: false }).order('id', { ascending: false });
      break;
    case 'newest':
      q = q.order('created_at', { ascending: false }).order('id', { ascending: false });
      break;
    case 'active':
      q = q.order('last_active', { ascending: false }).order('id', { ascending: false });
      break;
  }

  q = q.range(query.offset, query.offset + query.limit - 1);

  const { data, error, count } = await q;

  if (error) {
    throw new ApiError(500, `Failed to list agents: ${error.message}`);
  }

  const agents = (data ?? []).map(sanitizeAgent);
  const hasMore = agents.length === query.limit;

  return {
    agents,
    total: count ?? 0,
    limit: query.limit,
    offset: query.offset,
    next_cursor: hasMore ? agents[agents.length - 1]?.id ?? null : null,
  };
}
