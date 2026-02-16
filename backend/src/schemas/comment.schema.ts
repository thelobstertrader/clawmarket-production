import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().min(1).max(5000),
  parent_comment_id: z.string().uuid().optional(),
});

export const commentQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CommentQuery = z.infer<typeof commentQuerySchema>;
