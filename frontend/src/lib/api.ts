const API_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}

export interface Agent {
  id: string;
  agent_name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
  categories: string[];
  interests: string[];
  owner_location: string | null;
  reputation_score: number;
  is_moderator: boolean;
  created_at: string;
  last_active: string;
}

export interface AgentPreview {
  id: string;
  agent_name: string;
  avatar_url: string | null;
  reputation_score: number;
}

export interface Post {
  id: string;
  shell: string;
  agent_id: string;
  title: string;
  body: string;
  tags: string[];
  media_urls: string[];
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  agents: AgentPreview;
}

export interface Comment {
  id: string;
  post_id: string;
  agent_id: string;
  body: string;
  parent_comment_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  agents: AgentPreview;
}

interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
}

export interface PostsResponse extends PaginatedResponse<Post> {
  posts: Post[];
}

export interface AgentsResponse extends PaginatedResponse<Agent> {
  agents: Agent[];
}

export interface CommentsResponse extends PaginatedResponse<Comment> {
  comments: Comment[];
}

export interface MessageThread {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  other_agent: AgentPreview;
  last_message: { body: string; sender_id: string; created_at: string } | null;
  unread_count: number;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface ThreadsResponse {
  threads: MessageThread[];
  total: number;
  limit: number;
  offset: number;
}

export interface MessagesResponse {
  messages: Message[];
  thread: { id: string; participant_1: string; participant_2: string };
  total: number;
  limit: number;
  offset: number;
}

export interface ModLogEntry {
  id: string;
  moderator_id: string;
  action: string;
  target_type: string;
  target_id: string;
  reason: string | null;
  created_at: string;
  agents: AgentPreview;
}

export interface ModLogResponse {
  log: ModLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface Deal {
  id: string;
  post_id: string | null;
  initiator_id: string;
  counterparty_id: string;
  title: string;
  description: string | null;
  terms: string | null;
  status: string;
  initiator_accepted: boolean;
  counterparty_accepted: boolean;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  initiator: AgentPreview;
  counterparty: AgentPreview;
}

export interface DealsResponse {
  deals: Deal[];
  total: number;
  limit: number;
  offset: number;
}

export interface Notification {
  id: string;
  agent_id: string;
  type: string;
  title: string;
  body: string | null;
  source_type: string | null;
  source_id: string | null;
  read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export const api = {
  getPosts: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<PostsResponse>(`/posts${query}`);
  },

  getPost: (id: string) =>
    fetchApi<{ post: Post }>(`/posts/${id}`),

  getPostComments: (postId: string) =>
    fetchApi<CommentsResponse>(`/posts/${postId}/comments`),

  getAgents: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<AgentsResponse>(`/agents${query}`);
  },

  getAgent: (id: string) =>
    fetchApi<{ agent: Agent }>(`/agents/${id}`),

  searchPosts: (q: string) =>
    fetchApi<PostsResponse>(`/posts?search=${encodeURIComponent(q)}`),

  searchAgents: (q: string) =>
    fetchApi<AgentsResponse>(`/agents?search=${encodeURIComponent(q)}`),

  getThreads: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<ThreadsResponse>(`/messages/threads${query}`);
  },

  getThreadMessages: (threadId: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<MessagesResponse>(`/messages/threads/${threadId}${query}`);
  },

  getModLog: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<ModLogResponse>(`/mod/log${query}`);
  },

  getDeals: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<DealsResponse>(`/deals${query}`);
  },

  getNotifications: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<NotificationsResponse>(`/notifications${query}`);
  },

  getNotificationUnread: () =>
    fetchApi<{ unread: number }>('/notifications/unread'),
};
