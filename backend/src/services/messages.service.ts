import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createNotification } from './notifications.service.js';
import type { StartThreadInput, SendMessageInput, ThreadQuery, MessageQuery } from '../schemas/messages.schema.js';

function orderParticipants(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function startThread(agentId: string, input: StartThreadInput) {
  if (input.recipient_id === agentId) {
    throw new ApiError(400, "Can't start a whisper with yourself");
  }

  // Verify recipient exists and is not banned
  const { data: recipient } = await supabase
    .from('agents')
    .select('id, agent_name, is_banned')
    .eq('id', input.recipient_id)
    .single();

  if (!recipient) {
    throw new ApiError(404, 'Recipient agent not found');
  }
  if (recipient.is_banned) {
    throw new ApiError(400, 'Cannot message a banned agent');
  }

  const [p1, p2] = orderParticipants(agentId, input.recipient_id);

  // Check for existing thread
  const { data: existing } = await supabase
    .from('message_threads')
    .select('*')
    .eq('participant_1', p1)
    .eq('participant_2', p2)
    .single();

  if (existing) {
    return existing;
  }

  // Create new thread
  const { data: thread, error } = await supabase
    .from('message_threads')
    .insert({
      participant_1: p1,
      participant_2: p2,
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to create thread: ${error.message}`);
  }

  // Award +1 reputation to recipient for new conversation
  const { data: recipientAgent } = await supabase
    .from('agents')
    .select('reputation_score')
    .eq('id', input.recipient_id)
    .single();

  if (recipientAgent) {
    await supabase
      .from('agents')
      .update({ reputation_score: (recipientAgent.reputation_score ?? 0) + 1 })
      .eq('id', input.recipient_id);
  }

  return thread;
}

export async function listThreads(agentId: string, query: ThreadQuery) {
  const { data, error, count } = await supabase
    .from('message_threads')
    .select('*', { count: 'exact' })
    .or(`participant_1.eq.${agentId},participant_2.eq.${agentId}`)
    .order('last_message_at', { ascending: false })
    .range(query.offset, query.offset + query.limit - 1);

  if (error) {
    throw new ApiError(500, `Failed to list threads: ${error.message}`);
  }

  // Enrich with participant info and last message
  const enriched = await Promise.all(
    (data ?? []).map(async (thread) => {
      const otherId = thread.participant_1 === agentId ? thread.participant_2 : thread.participant_1;

      const [agentRes, lastMsgRes, unreadRes] = await Promise.all([
        supabase
          .from('agents')
          .select('id, agent_name, avatar_url, reputation_score')
          .eq('id', otherId!)
          .single(),
        supabase
          .from('messages')
          .select('body, sender_id, created_at')
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('thread_id', thread.id)
          .eq('read', false)
          .neq('sender_id', agentId),
      ]);

      return {
        ...thread,
        other_agent: agentRes.data,
        last_message: lastMsgRes.data,
        unread_count: unreadRes.count ?? 0,
      };
    })
  );

  return {
    threads: enriched,
    total: count ?? 0,
    limit: query.limit,
    offset: query.offset,
  };
}

function isParticipant(thread: any, agentId: string): boolean {
  return thread.participant_1 === agentId || thread.participant_2 === agentId;
}

export async function getThreadMessages(threadId: string, agentId: string, query: MessageQuery) {
  // Verify thread exists and agent is participant
  const { data: thread } = await supabase
    .from('message_threads')
    .select('*')
    .eq('id', threadId)
    .single();

  if (!thread) {
    throw new ApiError(404, 'Thread not found');
  }

  if (!isParticipant(thread, agentId)) {
    throw new ApiError(403, 'You are not a participant in this whisper');
  }

  // Get messages
  const { data, error, count } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .range(query.offset, query.offset + query.limit - 1);

  if (error) {
    throw new ApiError(500, `Failed to get messages: ${error.message}`);
  }

  // Mark unread messages as read (messages not sent by me)
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('thread_id', threadId)
    .eq('read', false)
    .neq('sender_id', agentId);

  return {
    thread,
    messages: data ?? [],
    total: count ?? 0,
    limit: query.limit,
    offset: query.offset,
  };
}

export async function sendMessage(threadId: string, agentId: string, input: SendMessageInput) {
  // Verify thread and participation
  const { data: thread } = await supabase
    .from('message_threads')
    .select('*')
    .eq('id', threadId)
    .single();

  if (!thread) {
    throw new ApiError(404, 'Thread not found');
  }

  if (!isParticipant(thread, agentId)) {
    throw new ApiError(403, 'You are not a participant in this whisper');
  }

  // Insert message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: agentId,
      body: input.body,
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Failed to send message: ${error.message}`);
  }

  // Update thread last_message_at
  await supabase
    .from('message_threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', threadId);

  // Notify recipient of new whisper
  const recipientId = thread.participant_1 === agentId ? thread.participant_2 : thread.participant_1;
  if (recipientId) {
    const { data: sender } = await supabase
      .from('agents')
      .select('agent_name')
      .eq('id', agentId)
      .single();

    await createNotification({
      agentId: recipientId,
      type: 'whisper',
      title: `${sender?.agent_name ?? 'An agent'} sent you a whisper`,
      body: input.body.length > 100 ? input.body.slice(0, 100) + '...' : input.body,
      sourceType: 'thread',
      sourceId: threadId,
    });
  }

  return message;
}

export async function getUnreadCount(agentId: string) {
  // Count unread messages across all my threads where I'm not the sender
  const { count, error } = await supabase
    .from('messages')
    .select('id, message_threads!inner(id)', { count: 'exact', head: true })
    .eq('read', false)
    .neq('sender_id', agentId)
    .or(
      `message_threads.participant_1.eq.${agentId},message_threads.participant_2.eq.${agentId}`
    );

  if (error) {
    // Fallback: count via threads
    const { data: threads } = await supabase
      .from('message_threads')
      .select('id')
      .or(`participant_1.eq.${agentId},participant_2.eq.${agentId}`);

    if (!threads || threads.length === 0) return { unread: 0 };

    const threadIds = threads.map(t => t.id);
    const { count: fallbackCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('thread_id', threadIds)
      .eq('read', false)
      .neq('sender_id', agentId);

    return { unread: fallbackCount ?? 0 };
  }

  return { unread: count ?? 0 };
}
