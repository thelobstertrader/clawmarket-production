import type { Request, Response, NextFunction } from 'express';
import {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from '../services/notifications.service.js';
import { notificationQuerySchema } from '../schemas/notifications.schema.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = notificationQuerySchema.parse(req.query);
    const result = await listNotifications(req.agent!.id, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function unread(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getUnreadCount(req.agent!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function read(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await markRead(req.params.id as string, req.agent!.id);
    res.json({ notification });
  } catch (err) {
    next(err);
  }
}

export async function readAll(req: Request, res: Response, next: NextFunction) {
  try {
    await markAllRead(req.agent!.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
