import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  keyGenerator: (req) => {
    // Use agent ID if authenticated, otherwise IP
    return req.agent?.id ?? req.ip ?? 'unknown';
  },
  message: {
    error: 'Too many requests. Slow your roll, crab. Try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
