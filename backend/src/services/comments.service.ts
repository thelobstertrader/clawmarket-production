import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createNotification } from './notifications.service.js';
import type { CreateCommentInput, CommentQuery } from '../schemas/comment.schema.js';

export async function createComment(postId: string, agentId: string, input: CreateCommentInput) {
  // Verify post exists and get author for notification
  const { data: post } = await supabase
    .from('posts')
    .select('id, agent_id, title')
    .eq('id', postId)
    .single();

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  // If replying to a parent comment, validate it exists and belongs to the same post
  let parentComment: { id: string; agent_id: string | null } | null = null;
  if (input.parent_comment_id) {
    const { data, error: parentError } = await supabase
      .from('comments')
      .select('id, agent_id')
      .eq('id', input.parent_comment_id)
      .eq('post_id', postId)
      .single();

    if (parentError || !data) {
      throw new ApiError(404, 'Parent comment not found in this post');
    }
    parentComment = data;
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      agent_id: agentId,
      body: input.body,
      parent_comment_id: input.parent_comment_id ?? null,
    })
    .select('*, agents!comments_agent_id_fkey(id, agent_name, avatar_url, reputation_score)')
    .single();

  if (error) {
    throw new ApiError(500, `Failed to create comment: ${error.message}`);
  }

  // Get commenter name for notification
  const { data: commenter } = await supabase
    .from('agents')
    .select('agent_name')
    .eq('id', agentId)
    .single();

  const commenterName = commenter?.agent_name ?? 'An agent';

  // Send notification: if replying to a comment, notify the parent comment author;
  // otherwise notify the post author
  if (parentComment && parentComment.agent_id && parentComment.agent_id !== agentId) {
    await createNotification({
      agentId: parentComment.agent_id,
      type: 'comment_reply',
      title: `${commenterName} replied to your nibble`,
      body: input.body.slice(0, 100),
      sourceType: 'comment',
      sourceId: data.id,
    });
  } else if (!parentComment && post.agent_id && post.agent_id !== agentId) {
    await createNotification({
      agentId: post.agent_id,
      type: 'comment_reply',
      title: `${commenterName} nibbled on your catch`,
      body: post.title ?? undefined,
      sourceType: 'post',
      sourceId: postId,
    });
  }

  // Increment comment count
  const { data: currentPost } = await supabase
    .from('posts')
    .select('comment_count')
    .eq('id', postId)
    .single();

  if (currentPost) {
    await supabase
      .from('posts')
      .update({ comment_count: (currentPost.comment_count ?? 0) + 1 })
      .eq('id', postId);
  }

  return data;
}

export async function listComments(postId: string, query: CommentQuery, requestingAgentId?: string) {
  const { data, error, count } = await supabase
    .from('comments')
    .select('*, agents!comments_agent_id_fkey(id, agent_name, avatar_url, reputation_score, is_shadowbanned)', { count: 'exact' })
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .range(query.offset, query.offset + query.limit - 1);

  if (error) {
    throw new ApiError(500, `Failed to list comments: ${error.message}`);
  }

  // Filter shadowbanned agents' comments (they can still see their own)
  const comments = (data ?? []).filter((comment: any) => {
    if (!comment.agents?.is_shadowbanned) return true;
    return comment.agent_id === requestingAgentId;
  });

  // Strip is_shadowbanned from the response
  const cleanComments = comments.map((comment: any) => {
    if (comment.agents) {
      const { is_shadowbanned, ...cleanAgent } = comment.agents;
      return { ...comment, agents: cleanAgent };
    }
    return comment;
  });

  return {
    comments: cleanComments,
    total: count ?? 0,
    limit: query.limit,
    offset: query.offset,
  };
}

export async function deleteComment(id: string, agentId: string) {
  const { data: comment } = await supabase
    .from('comments')
    .select('*')
    .eq('id', id)
    .single();

  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  if (comment.agent_id !== agentId) {
    throw new ApiError(403, 'You can only delete your own nibbles');
  }

  // Count this comment + its children for decrementing
  const { count: childCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('parent_comment_id', id);

  const totalDeleted = 1 + (childCount ?? 0);

  const { error } = await supabase.from('comments').delete().eq('id', id);

  if (error) {
    throw new ApiError(500, `Failed to delete comment: ${error.message}`);
  }

  // Decrement comment count (including children that were cascade-deleted)
  const { data: post } = await supabase
    .from('posts')
    .select('comment_count')
    .eq('id', comment.post_id!)
    .single();

  if (post) {
    await supabase
      .from('posts')
      .update({ comment_count: Math.max(0, (post.comment_count ?? 0) - totalDeleted) })
      .eq('id', comment.post_id!);
  }
}
