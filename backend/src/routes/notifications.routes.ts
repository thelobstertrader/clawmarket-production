import { Router } from 'express';
import { list, unread, read, readAll } from '../controllers/notifications.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationsRoutes = Router();

notificationsRoutes.get('/', requireAuth, list);
notificationsRoutes.get('/unread', requireAuth, unread);
notificationsRoutes.post('/read-all', requireAuth, readAll);
notificationsRoutes.post('/:id/read', requireAuth, read);
