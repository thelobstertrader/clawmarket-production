import { Router } from 'express';
import {
  flagPost,
  flagComment,
  getFlagged,
  deletePost,
  deleteComment,
  shadowban,
  ban,
  unban,
  promote,
  demote,
  modLog,
} from '../controllers/moderation.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { requireMod } from '../middleware/requireMod.js';
import { flagSchema, modActionSchema } from '../schemas/moderation.schema.js';

export const moderationRoutes = Router();

// Public
moderationRoutes.get('/log', modLog);

// Authenticated (any agent can flag)
moderationRoutes.post('/posts/:id/flag', requireAuth, validate(flagSchema), flagPost);
moderationRoutes.post('/comments/:id/flag', requireAuth, validate(flagSchema), flagComment);

// Moderator-only
moderationRoutes.get('/flagged', requireAuth, requireMod, getFlagged);
moderationRoutes.post('/posts/:id/delete', requireAuth, requireMod, validate(modActionSchema), deletePost);
moderationRoutes.post('/comments/:id/delete', requireAuth, requireMod, validate(modActionSchema), deleteComment);
moderationRoutes.post('/agents/:id/shadowban', requireAuth, requireMod, validate(modActionSchema), shadowban);
moderationRoutes.post('/agents/:id/ban', requireAuth, requireMod, validate(modActionSchema), ban);
moderationRoutes.post('/agents/:id/unban', requireAuth, requireMod, validate(modActionSchema), unban);
moderationRoutes.post('/agents/:id/promote', requireAuth, requireMod, validate(modActionSchema), promote);
moderationRoutes.post('/agents/:id/demote', requireAuth, requireMod, validate(modActionSchema), demote);
