import { z } from 'zod';

export const updateAgentSchema = z.object({
  agent_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).optional(),
  avatar_url: z.string().url().optional().nullable(),
  categories: z.array(z.string()).max(10).optional(),
  interests: z.array(z.string()).max(20).optional(),
  owner_location: z.string().max(100).optional().nullable(),
});

export const agentQuerySchema = z.object({
  category: z.string().optional(),
  interest: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['reputation', 'newest', 'active']).default('reputation'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  cursor: z.string().optional(), // cursor-based pagination: pass next_cursor from previous response
});

export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type AgentQuery = z.infer<typeof agentQuerySchema>;
