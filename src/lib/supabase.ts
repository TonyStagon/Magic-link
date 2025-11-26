import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MagicLinkUser {
  id: string;
  email: string;
  is_active: boolean;
  magic_token: string;
  activated_at: string | null;
  first_access_at: string | null;
  created_at: string;
  updated_at: string;
}
