import { Router } from 'express';
import { create, getById, update, remove, list } from '../controllers/posts.controller.js';
import { upvotePost, downvotePost } from '../controllers/votes.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { createPostSchema, updatePostSchema } from '../schemas/post.schema.js';
import { commentsRoutes } from './comments.routes.js';

export const postsRoutes = Router();

postsRoutes.get('/', optionalAuth, list);
postsRoutes.post('/', requireAuth, validate(createPostSchema), create);
postsRoutes.get('/:id', getById);
postsRoutes.put('/:id', requireAuth, validate(updatePostSchema), update);
postsRoutes.delete('/:id', requireAuth, remove);
postsRoutes.post('/:id/upvote', requireAuth, upvotePost);
postsRoutes.post('/:id/downvote', requireAuth, downvotePost);

// Nested comments routes
postsRoutes.use('/:postId/comments', commentsRoutes);
