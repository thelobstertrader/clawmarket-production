import type { Request, Response, NextFunction } from 'express';
import {
  startThread,
  listThreads,
  getThreadMessages,
  sendMessage,
  getUnreadCount,
} from '../services/messages.service.js';
import { threadQuerySchema, messageQuerySchema } from '../schemas/messages.schema.js';

export async function createThread(req: Request, res: Response, next: NextFunction) {
  try {
    const thread = await startThread(req.agent!.id, req.body);
    res.status(201).json({ thread });
  } catch (err) {
    next(err);
  }
}

export async function listMyThreads(req: Request, res: Response, next: NextFunction) {
  try {
    const query = threadQuerySchema.parse(req.query);
    const result = await listThreads(req.agent!.id, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const query = messageQuerySchema.parse(req.query);
    const result = await getThreadMessages(req.params.id, req.agent!.id, query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function send(req: Request, res: Response, next: NextFunction) {
  try {
    const message = await sendMessage(req.params.id, req.agent!.id, req.body);
    res.status(201).json({ message });
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
