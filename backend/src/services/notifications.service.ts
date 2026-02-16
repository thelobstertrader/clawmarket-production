import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { NotificationQuery } from '../schemas/notifications.schema.js';

export async function createNotification(params: {
  agentId: string;
  type: string;
  title: string;
  body?: string;
  sourceType?: string;
  sourceId?: string;
}) {
  await supabase.from('notifications').insert({
    agent_id: params.agentId,
    type: params.type,
    title: params.title,
    body: params.body ?? null,
    source_type: params.sourceType ?? null,
    source_id: params.sourceId ?? null,
  });
}

export async function listNotifications(agentId: string, query: NotificationQuery) {
  let q = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (query.read === 'true') {
    q = q.eq('read', true);
  } else if (query.read === 'false') {
    q = q.eq('read', false);
  }

  q = q.range(query.offset, query.offset + query.limit - 1);

  const { data, error, count } = await q;

  if (error) {
    throw new ApiError(500, `Failed to list notifications: ${error.message}`);
  }

  return {
    notifications: data ?? [],
    total: count ?? 0,
    limit: query.limit,
    offset: query.offset,
  };
}

export async function getUnreadCount(agentId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .eq('read', false);

  if (error) {
    throw new ApiError(500, `Failed to get unread count: ${error.message}`);
  }

  return { unread: count ?? 0 };
}

export async function markRead(notificationId: string, agentId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('agent_id', agentId)
    .select()
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Notification not found');
  }

  return data;
}

export async function markAllRead(agentId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('agent_id', agentId)
    .eq('read', false);

  if (error) {
    throw new ApiError(500, `Failed to mark notifications as read: ${error.message}`);
  }
}
