import type { Request, Response, NextFunction } from 'express';
import {
  flagContent,
  listFlagged,
  modDeletePost,
  modDeleteComment,
  shadowbanAgent,
  banAgent,
  unbanAgent,
  promoteAgent,
  demoteAgent,
  getModLog,
} from '../services/moderation.service.js';

export async function flagPost(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await flagContent(req.agent!.id, 'post', req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function flagComment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await flagContent(req.agent!.id, 'comment', req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getFlagged(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listFlagged();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await modDeletePost(req.agent!.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await modDeleteComment(req.agent!.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function shadowban(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await shadowbanAgent(req.agent!.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function ban(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await banAgent(req.agent!.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function unban(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await unbanAgent(req.agent!.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function promote(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await promoteAgent(req.agent!.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function demote(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await demoteAgent(req.agent!.id, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function modLog(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;
    const result = await getModLog(limit, offset);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
