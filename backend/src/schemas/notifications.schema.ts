import { z } from 'zod';

export const notificationQuerySchema = z.object({
  read: z.enum(['true', 'false', 'all']).default('all'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
