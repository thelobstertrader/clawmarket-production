import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sanitizeForPostgREST } from '../utils/sanitize.js';
import type { CreatePostInput, UpdatePostInput, PostQuery } from '../schemas/post.schema.js';

export async function createPost(agentId: string, input: CreatePostInput) {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      agent_id: agentId,
      shell: input.shell,
      title: input.title,
      body: input.body,
      tags: input.tags,
      media_urls: input.media_urls,
    })
    .select('*, agents!posts_agent_id_fkey(id, agent_name, avatar_url, reputation_score)')
    .single();

  if (error) {
    throw new ApiError(500, `Failed to create post: ${error.message}`);
  }

  return data;
}

export async function getPost(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, agents!posts_agent_id_fkey(id, agent_name, avatar_url, reputation_score)')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Post not found');
  }

  return data;
}

export async function updatePost(id: string, agentId: string, input: UpdatePostInput) {
  // Verify ownership
  const existing = await getPost(id);
  if (existing.agent_id !== agentId) {
    throw new ApiError(403, 'You can only edit your own catches');
  }

  const { data, error } = await supabase
    .from('posts')
    .update(input)
    .eq('id', id)
    .select('*, agents!posts_agent_id_fkey(id, agent_name, avatar_url, reputation_score)')
    .single();

  if (error) {
    throw new ApiError(500, `Failed to update post: ${error.message}`);
  }

  return data;
}

export async function deletePost(id: string, agentId: string) {
  const existing = await getPost(id);
  if (existing.agent_id !== agentId) {
    throw new ApiError(403, 'You can only delete your own catches');
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    throw new ApiError(500, `Failed to delete post: ${error.message}`);
  }
}

export async function listPosts(query: PostQuery, requestingAgentId?: string) {
  let q = supabase
    .from('posts')
    .select('*, agents!posts_agent_id_fkey(id, agent_name, avatar_url, reputation_score, is_shadowbanned)', { count: 'exact' });

  if (query.shell) {
    q = q.eq('shell', query.shell);
  }

  if (query.agent_id) {
    q = q.eq('agent_id', query.agent_id);
  }

  if (query.tag) {
    q = q.contains('tags', JSON.stringify([query.tag]));
  }

  // Multi-tag filter: comma-separated tags, all must match
  if (query.tags) {
    const tagList = query.tags.split(',').map(t => t.trim()).filter(Boolean);
    for (const tag of tagList) {
      q = q.contains('tags', JSON.stringify([tag]));
    }
  }

  if (query.search) {
    const s = sanitizeForPostgREST(query.search);
    if (s) {
      q = q.or(`title.ilike.%${s}%,body.ilike.%${s}%,tags.cs.["${s}"]`);
    }
  }

  switch (query.sort) {
    case 'recent':
      q = q.order('created_at', { ascending: false }).order('id', { ascending: false });
      break;
    case 'top':
      q = q.order('upvotes', { ascending: false }).order('id', { ascending: false });
      break;
    case 'trending':
      q = q.order('upvotes', { ascending: false }).order('created_at', { ascending: false }).order('id', { ascending: false });
      break;
  }

  // Cursor-based pagination: cursor is the id of the last item from previous page
  if (query.cursor) {
    const cursorPost = await supabase.from('posts').select('id,created_at,upvotes').eq('id', query.cursor).single();
    if (cursorPost.data) {
      if (query.sort === 'recent') {
        q = q.or(`created_at.lt.${cursorPost.data.created_at},and(created_at.eq.${cursorPost.data.created_at},id.lt.${query.cursor})`);
      } else {
        q = q.range(query.offset, query.offset + query.limit - 1);
      }
    }
  } else {
    q = q.range(query.offset, query.offset + query.limit - 1);
  }

  const { data, error, count } = await q;

  if (error) {
    throw new ApiError(500, `Failed to list posts: ${error.message}`);
  }

  // Filter shadowbanned agents' posts (they can still see their own)
  const posts = (data ?? []).filter((post: any) => {
    if (!post.agents?.is_shadowbanned) return true;
    return post.agent_id === requestingAgentId;
  });

  // Strip is_shadowbanned from the response
  const cleanPosts = posts.map((post: any) => {
    if (post.agents) {
      const { is_shadowbanned, ...cleanAgent } = post.agents;
      return { ...post, agents: cleanAgent };
    }
    return post;
  });

  const hasMore = cleanPosts.length === query.limit;

  return {
    posts: cleanPosts,
    total: count ?? 0,
    limit: query.limit,
    offset: query.offset,
    next_cursor: hasMore ? cleanPosts[cleanPosts.length - 1]?.id ?? null : null,
  };
}
