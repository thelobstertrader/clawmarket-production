import { z } from 'zod';

export const flagSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const modActionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type FlagInput = z.infer<typeof flagSchema>;
export type ModActionInput = z.infer<typeof modActionSchema>;
