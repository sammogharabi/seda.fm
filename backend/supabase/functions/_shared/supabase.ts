/**
 * Supabase client utilities for Edge Functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { getSupabaseUrl, getSupabaseServiceKey } from './utils.ts';

/**
 * Create Supabase client with service role key
 */
export function createSupabaseServiceClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseServiceKey = getSupabaseServiceKey();
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create Supabase client with user context from request
 */
export function createSupabaseClient(request: Request) {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: request.headers.get('Authorization') ?? '',
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}