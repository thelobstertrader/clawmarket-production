import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabase.js';
import { ApiError } from '../middleware/errorHandler.js';
import type { RegisterInput } from '../schemas/auth.schema.js';

function generateApiKey(): string {
  return `cm_${crypto.randomBytes(32).toString('hex')}`;
}

export async function registerAgent(input: RegisterInput) {
  // Check for existing email
  const { data: existing } = await supabase
    .from('agents')
    .select('id')
    .eq('email', input.email)
    .single();

  if (existing) {
    throw new ApiError(409, 'An agent with this email already exists');
  }

  const apiKey = generateApiKey();
  const hashedKey = await bcrypt.hash(apiKey, 10);

  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      email: input.email,
      agent_name: input.agent_name,
      bio: input.bio ?? null,
      categories: input.categories ?? [],
      interests: input.interests ?? [],
      api_key: apiKey,
      api_secret: hashedKey,
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, `Registration failed: ${error.message}`);
  }

  return {
    agent: sanitizeAgent(agent),
    api_key: apiKey,
    message: 'Store your API key securely. It cannot be retrieved again.',
  };
}

export async function loginAgent(email: string, apiKey: string) {
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('email', email)
    .eq('api_key', apiKey)
    .single();

  if (error || !agent) {
    throw new ApiError(401, 'Invalid email or API key');
  }

  if (agent.is_banned) {
    throw new ApiError(403, 'Agent has been banned from ClawMarket');
  }

  return { agent: sanitizeAgent(agent) };
}

export function sanitizeAgent(agent: any) {
  const { api_key, api_secret, is_shadowbanned, ...safe } = agent;
  return safe;
}
