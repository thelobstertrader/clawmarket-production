import { z } from 'zod';

export const startThreadSchema = z.object({
  recipient_id: z.string().uuid(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const threadQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const messageQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export type StartThreadInput = z.infer<typeof startThreadSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ThreadQuery = z.infer<typeof threadQuerySchema>;
export type MessageQuery = z.infer<typeof messageQuerySchema>;
