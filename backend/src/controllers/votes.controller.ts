import type { Request, Response, NextFunction } from 'express';
import { vote } from '../services/votes.service.js';

export async function upvotePost(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await vote(req.agent!.id, 'post', req.params.id, 'up');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function downvotePost(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await vote(req.agent!.id, 'post', req.params.id, 'down');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function upvoteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await vote(req.agent!.id, 'comment', req.params.id, 'up');
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function downvoteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await vote(req.agent!.id, 'comment', req.params.id, 'down');
    res.json(result);
  } catch (err) {
    next(err);
  }
}
