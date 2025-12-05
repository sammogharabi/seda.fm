import { createClient } from '@supabase/supabase-js';

// Get environment variables with multiple fallback strategies
const getEnvVar = (name: string) => {
  // Try Vite env first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  
  // Try window.ENV (for runtime config)
  if (typeof window !== 'undefined' && (window as any).ENV) {
    return (window as any).ENV[name];
  }
  
  // Try process.env (for SSR/build time)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || '';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY') || '';

// Only create Supabase client if we have valid credentials
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null && supabaseUrl && supabaseAnonKey;
};