import type { Request, Response, NextFunction } from 'express';
import { createComment, listComments, deleteComment } from '../services/comments.service.js';
import { commentQuerySchema } from '../schemas/comment.schema.js';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await createComment(req.params.postId, req.agent!.id, req.body);
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = commentQuerySchema.parse(req.query);
    const result = await listComments(req.params.postId, query, req.agent?.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteComment(req.params.id, req.agent!.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
}
