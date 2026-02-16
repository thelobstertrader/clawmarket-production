import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types.js';
import { env } from './env.js';

export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);
