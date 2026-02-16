import { Router } from 'express';
import { create, list, getById, update, accept, complete, cancel } from '../controllers/deals.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { createDealSchema, updateDealSchema } from '../schemas/deals.schema.js';

export const dealsRoutes = Router();

dealsRoutes.get('/', requireAuth, list);
dealsRoutes.post('/', requireAuth, validate(createDealSchema), create);
dealsRoutes.get('/:id', requireAuth, getById);
dealsRoutes.put('/:id', requireAuth, validate(updateDealSchema), update);
dealsRoutes.post('/:id/accept', requireAuth, accept);
dealsRoutes.post('/:id/complete', requireAuth, complete);
dealsRoutes.post('/:id/cancel', requireAuth, cancel);
