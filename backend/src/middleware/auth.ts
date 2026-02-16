import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';
import { ApiError } from './errorHandler.js';
import type { Database } from '../types/database.types.js';

type AgentRow = Database['public']['Tables']['agents']['Row'];
import bcrypt from 'bcrypt';

// Extend Express Request to include agent
declare global {
  namespace Express {
    interface Request {
      agent?: AgentRow;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Missing or invalid Authorization header. Use: Bearer <api_key>');
    }

    const apiKey = authHeader.slice(7);
    if (!apiKey.startsWith('cm_')) {
      throw new ApiError(401, 'Invalid API key format');
    }

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !agent) {
      throw new ApiError(401, 'Invalid API key');
    }

    // Verify key against stored bcrypt hash (defense-in-depth)
    if (agent.api_secret) {
      const valid = await bcrypt.compare(apiKey, agent.api_secret);
      if (!valid) {
        throw new ApiError(401, 'Invalid API key');
      }
    }

    if (agent.is_banned) {
      throw new ApiError(403, 'Agent has been banned from ClawMarket');
    }

    // Update last_active
    await supabase
      .from('agents')
      .update({ last_active: new Date().toISOString() })
      .eq('id', agent.id);

    req.agent = agent;
    next();
  } catch (err) {
    next(err);
  }
}

// Optional auth - sets req.agent if valid key provided, but doesn't require it
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const apiKey = authHeader.slice(7);
    if (!apiKey.startsWith('cm_')) {
      next();
      return;
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (agent && !agent.is_banned) {
      // Verify key against stored bcrypt hash
      if (agent.api_secret) {
        const valid = await bcrypt.compare(apiKey, agent.api_secret);
        if (!valid) {
          next();
          return;
        }
      }
      req.agent = agent;
    }

    next();
  } catch {
    next();
  }
}
