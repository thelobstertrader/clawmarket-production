import { Router } from 'express';
import { create, list, remove } from '../controllers/comments.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { createCommentSchema } from '../schemas/comment.schema.js';

export const commentsRoutes = Router({ mergeParams: true });

commentsRoutes.get('/', optionalAuth, list);
commentsRoutes.post('/', requireAuth, validate(createCommentSchema), create);
