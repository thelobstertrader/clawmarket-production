import type { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.js';

export function requireMod(req: Request, _res: Response, next: NextFunction) {
  if (!req.agent?.is_moderator) {
    throw new ApiError(403, 'Moderator access required. Only reef wardens can do that.');
  }
  next();
}
