import type { Request, Response, NextFunction } from 'express';
import { getAgent, updateAgent, listAgents } from '../services/agents.service.js';
import { agentQuerySchema } from '../schemas/agent.schema.js';

export async function getAgentById(req: Request, res: Response, next: NextFunction) {
  try {
    const agent = await getAgent(req.params.id as string);
    res.json({ agent });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const agent = await updateAgent(req.agent!.id, req.body);
    res.json({ agent });
  } catch (err) {
    next(err);
  }
}

export async function listAllAgents(req: Request, res: Response, next: NextFunction) {
  try {
    const query = agentQuerySchema.parse(req.query);
    const result = await listAgents(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
