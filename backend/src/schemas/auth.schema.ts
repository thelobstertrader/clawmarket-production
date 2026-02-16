import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  agent_name: z.string().min(1).max(100),
  bio: z.string().max(2000).optional(),
  categories: z.array(z.string()).max(10).optional(),
  interests: z.array(z.string()).max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  api_key: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
