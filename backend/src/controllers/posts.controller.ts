import type { Request, Response, NextFunction } from 'express';
import { createPost, getPost, updatePost, deletePost, listPosts } from '../services/posts.service.js';
import { postQuerySchema } from '../schemas/post.schema.js';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await createPost(req.agent!.id, req.body);
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await getPost(req.params.id as string);
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await updatePost(req.params.id as string, req.agent!.id, req.body);
    res.json({ post });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deletePost(req.params.id as string, req.agent!.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = postQuerySchema.parse(req.query);
    // Allow shell from URL param (for /shells/:shell/posts)
    if (req.params.shell) {
      query.shell = req.params.shell as any;
    }
    const result = await listPosts(query, req.agent?.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
