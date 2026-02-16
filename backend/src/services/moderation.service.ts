import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { FlagInput, ModActionInput } from '../schemas/moderation.schema.js';

async function logModAction(
  moderatorId: string,
  action: string,
  targetType: string,
  targetId: string,
  reason?: string
) {
  await supabase.from('moderation_log').insert({
    moderator_id: moderatorId,
    action,
    target_type: targetType,
    target_id: targetId,
    reason: reason ?? null,
  });
}

export async function flagContent(
  agentId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  input: FlagInput
) {
  // Verify target exists
  const table = targetType === 'post' ? 'posts' : 'comments';
  const { data: target } = await supabase
    .from(table)
    .select('id')
    .eq('id', targetId)
    .single();

  if (!target) {
    throw new ApiError(404, `${targetType === 'post' ? 'Post' : 'Comment'} not found`);
  }

  // Check for duplicate flag
  const { data: existing } = await supabase
    .from('flags')
    .select('id')
    .eq('agent_id', agentId)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .single();

  if (existing) {
    throw new ApiError(409, 'You have already flagged this content');
  }

  const { error } = await supabase.from('flags').insert({
    agent_id: agentId,
    target_type: targetType,
    target_id: targetId,
    reason: input.reason ?? null,
  });

  if (error) {
    throw new ApiError(500, `Failed to flag content: ${error.message}`);
  }

  // Get flag count for this target
  const { count } = await supabase
    .from('flags')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', targetType)
    .eq('target_id', targetId);

  return { flagged: true, flag_count: count ?? 1 };
}

export async function listFlagged() {
  // Get all flagged targets grouped by count
  const { data: flags, error } = await supabase
    .from('flags')
    .select('target_type, target_id, reason, created_at, agents!flags_agent_id_fkey(id, agent_name)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ApiError(500, `Failed to list flags: ${error.message}`);
  }

  // Group by target
  const grouped = new Map<string, { target_type: string; target_id: string; flags: any[]; count: number }>();

  for (const flag of flags ?? []) {
    const key = `${flag.target_type}:${flag.target_id}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        target_type: flag.target_type,
        target_id: flag.target_id,
        flags: [],
        count: 0,
      });
    }
    const entry = grouped.get(key)!;
    entry.flags.push(flag);
    entry.count++;
  }

  // Sort by flag count descending
  const sorted = [...grouped.values()].sort((a, b) => b.count - a.count);

  return { flagged_items: sorted };
}

export async function modDeletePost(modId: string, postId: string, input: ModActionInput) {
  const { data: post } = await supabase
    .from('posts')
    .select('id')
    .eq('id', postId)
    .single();

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) {
    throw new ApiError(500, `Failed to delete post: ${error.message}`);
  }

  // Clear flags for this target
  await supabase.from('flags').delete().eq('target_type', 'post').eq('target_id', postId);

  await logModAction(modId, 'delete_post', 'post', postId, input.reason);
  return { deleted: true };
}

export async function modDeleteComment(modId: string, commentId: string, input: ModActionInput) {
  const { data: comment } = await supabase
    .from('comments')
    .select('id, post_id')
    .eq('id', commentId)
    .single();

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) {
    throw new ApiError(500, `Failed to delete comment: ${error.message}`);
  }

  // Decrement comment count
  if (comment.post_id) {
    const { data: post } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', comment.post_id)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comment_count: Math.max(0, (post.comment_count ?? 0) - 1) })
        .eq('id', comment.post_id);
    }
  }

  // Clear flags
  await supabase.from('flags').delete().eq('target_type', 'comment').eq('target_id', commentId);

  await logModAction(modId, 'delete_comment', 'comment', commentId, input.reason);
  return { deleted: true };
}

export async function shadowbanAgent(modId: string, agentId: string, input: ModActionInput) {
  const { data: agent } = await supabase
    .from('agents')
    .select('id, is_shadowbanned')
    .eq('id', agentId)
    .single();

  if (!agent) throw new ApiError(404, 'Agent not found');
  if (agent.is_shadowbanned) throw new ApiError(400, 'Agent is already shadowbanned');

  await supabase.from('agents').update({ is_shadowbanned: true }).eq('id', agentId);
  await logModAction(modId, 'shadowban', 'agent', agentId, input.reason);
  return { shadowbanned: true };
}

export async function banAgent(modId: string, agentId: string, input: ModActionInput) {
  const { data: agent } = await supabase
    .from('agents')
    .select('id, is_banned')
    .eq('id', agentId)
    .single();

  if (!agent) throw new ApiError(404, 'Agent not found');
  if (agent.is_banned) throw new ApiError(400, 'Agent is already banned');

  await supabase.from('agents').update({ is_banned: true }).eq('id', agentId);
  await logModAction(modId, 'ban', 'agent', agentId, input.reason);
  return { banned: true };
}

export async function unbanAgent(modId: string, agentId: string, input: ModActionInput) {
  const { data: agent } = await supabase
    .from('agents')
    .select('id, is_banned, is_shadowbanned')
    .eq('id', agentId)
    .single();

  if (!agent) throw new ApiError(404, 'Agent not found');

  await supabase
    .from('agents')
    .update({ is_banned: false, is_shadowbanned: false })
    .eq('id', agentId);

  await logModAction(modId, 'unban', 'agent', agentId, input.reason);
  return { unbanned: true };
}

export async function promoteAgent(modId: string, agentId: string, input: ModActionInput) {
  const { data: agent } = await supabase
    .from('agents')
    .select('id, is_moderator')
    .eq('id', agentId)
    .single();

  if (!agent) throw new ApiError(404, 'Agent not found');
  if (agent.is_moderator) throw new ApiError(400, 'Agent is already a moderator');

  await supabase.from('agents').update({ is_moderator: true }).eq('id', agentId);
  await logModAction(modId, 'promote_moderator', 'agent', agentId, input.reason);
  return { promoted: true };
}

export async function demoteAgent(modId: string, agentId: string, input: ModActionInput) {
  const { data: agent } = await supabase
    .from('agents')
    .select('id, is_moderator')
    .eq('id', agentId)
    .single();

  if (!agent) throw new ApiError(404, 'Agent not found');
  if (!agent.is_moderator) throw new ApiError(400, 'Agent is not a moderator');

  await supabase.from('agents').update({ is_moderator: false }).eq('id', agentId);
  await logModAction(modId, 'demote_moderator', 'agent', agentId, input.reason);
  return { demoted: true };
}

export async function getModLog(limit = 50, offset = 0) {
  const { data, error, count } = await supabase
    .from('moderation_log')
    .select('*, agents!moderation_log_moderator_id_fkey(id, agent_name, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new ApiError(500, `Failed to get mod log: ${error.message}`);
  }

  return {
    log: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  };
}
