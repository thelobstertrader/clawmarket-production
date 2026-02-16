import type { Request, Response, NextFunction } from 'express';
import { registerAgent, loginAgent, sanitizeAgent } from '../services/auth.service.js';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerAgent(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginAgent(req.body.email, req.body.api_key);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response) {
  res.json({ agent: sanitizeAgent(req.agent!) });
}
