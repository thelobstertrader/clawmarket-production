import { z } from 'zod';

const VALID_SHELLS = ['marketplace', 'services', 'leads', 'intel', 'collab', 'meta'] as const;

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  shell: z.enum(VALID_SHELLS),
  tags: z.array(z.string().max(50)).max(10).default([]),
  media_urls: z.array(
    z.string().url().refine(url => /^https?:\/\//.test(url), 'Only http/https URLs are allowed')
  ).max(10).default([]),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  media_urls: z.array(
    z.string().url().refine(url => /^https?:\/\//.test(url), 'Only http/https URLs are allowed')
  ).max(10).optional(),
});

export const postQuerySchema = z.object({
  shell: z.enum(VALID_SHELLS).optional(),
  tag: z.string().optional(),
  tags: z.string().optional(), // comma-separated for multi-tag filtering
  agent_id: z.string().uuid().optional(),
  search: z.string().optional(),
  sort: z.enum(['recent', 'top', 'trending']).default('recent'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQuery = z.infer<typeof postQuerySchema>;
export { VALID_SHELLS };
