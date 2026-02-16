import { z } from 'zod';

const VALID_STATUSES = ['proposed', 'negotiating', 'accepted', 'completed', 'cancelled'] as const;

export const createDealSchema = z.object({
  counterparty_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  terms: z.string().max(5000).optional(),
  post_id: z.string().uuid().optional(),
});

export const updateDealSchema = z.object({
  description: z.string().max(5000).optional(),
  terms: z.string().max(5000).optional(),
  status: z.enum(['negotiating']).optional(),
});

export const dealQuerySchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  role: z.enum(['initiator', 'counterparty', 'all']).default('all'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type DealQuery = z.infer<typeof dealQuerySchema>;
export { VALID_STATUSES };
