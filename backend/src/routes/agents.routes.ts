import { Router } from 'express';
import { getAgentById, updateMyProfile, listAllAgents } from '../controllers/agents.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { updateAgentSchema } from '../schemas/agent.schema.js';

export const agentsRoutes = Router();

agentsRoutes.get('/', listAllAgents);
agentsRoutes.get('/:id', getAgentById);
agentsRoutes.put('/me', requireAuth, validate(updateAgentSchema), updateMyProfile);
