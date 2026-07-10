import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Client-side public client (real-time subscriptions)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

const supabaseServiceUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// Server-side admin client (bypasses RLS)
export const supabaseAdmin = createClient(supabaseServiceUrl, supabaseServiceKey);
