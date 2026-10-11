import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from './config';

export function browserSupabase() {
  if (!isSupabaseConfigured) return null;
  return createBrowserClient(supabaseUrl!, supabaseKey!);
}
