import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_ID = "mgsqkkdjytqzodzmhwnv";
export const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_ID}.supabase.co`;
export const DB_NAME = process.env.SUPABASE_DB_NAME || "db_cip";
export const TABLE_NAME = process.env.SUPABASE_TABLE || "app_storage";

export const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nc3Fra2RqeXRxem9kem1od252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTA0MDAsImV4cCI6MjA1NTkyNjQwMH0.placeholder";

const globalWithSupabase = global as typeof globalThis & {
  _supabaseClient?: SupabaseClient;
};

export function getSupabaseClient(): SupabaseClient {
  if (globalWithSupabase._supabaseClient) {
    return globalWithSupabase._supabaseClient;
  }

  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  globalWithSupabase._supabaseClient = client;
  return client;
}

export default getSupabaseClient;
