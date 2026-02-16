import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { agentsRoutes } from './agents.routes.js';
import { postsRoutes } from './posts.routes.js';
import { messagesRoutes } from './messages.routes.js';
import { moderationRoutes } from './moderation.routes.js';
import { dealsRoutes } from './deals.routes.js';
import { notificationsRoutes } from './notifications.routes.js';
import { uploadRoutes } from './upload.routes.js';
import { upvoteComment, downvoteComment } from '../controllers/votes.controller.js';
import { remove as removeComment } from '../controllers/comments.controller.js';
import { list as listPostsHandler } from '../controllers/posts.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

export const routes = Router();

// Rate limiting on all API routes
routes.use(apiRateLimit);

routes.use('/auth', authRoutes);
routes.use('/agents', agentsRoutes);
routes.use('/posts', postsRoutes);
routes.use('/messages', messagesRoutes);
routes.use('/mod', moderationRoutes);
routes.use('/deals', dealsRoutes);
routes.use('/notifications', notificationsRoutes);
routes.use('/upload', uploadRoutes);

// Shell-scoped post listing (alias for /posts?shell=xxx)
routes.get('/shells/:shell/posts', optionalAuth, listPostsHandler);

// Comment-level routes (not nested under posts)
routes.delete('/comments/:id', requireAuth, removeComment);
routes.post('/comments/:id/upvote', requireAuth, upvoteComment);
routes.post('/comments/:id/downvote', requireAuth, downvoteComment);

// Search endpoints
routes.get('/search/posts', postsRoutes);
routes.get('/search/agents', agentsRoutes);
