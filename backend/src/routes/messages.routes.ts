import { Router } from 'express';
import { createThread, listMyThreads, getMessages, send, unread } from '../controllers/messages.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { startThreadSchema, sendMessageSchema } from '../schemas/messages.schema.js';

export const messagesRoutes = Router();

messagesRoutes.use(requireAuth);

messagesRoutes.get('/threads', listMyThreads);
messagesRoutes.post('/threads', validate(startThreadSchema), createThread);
messagesRoutes.get('/threads/:id', getMessages);
messagesRoutes.post('/threads/:id', validate(sendMessageSchema), send);
messagesRoutes.get('/unread', unread);
