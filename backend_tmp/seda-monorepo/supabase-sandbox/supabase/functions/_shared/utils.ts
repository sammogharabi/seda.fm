/**
 * Shared utilities for Sedā.fm Edge Functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ApiResponse, AdminContext } from './types.ts';

/**
 * Get environment from ENV_TAG with NODE_ENV fallback
 */
export function getEnvTag(): string {
  return Deno.env.get('ENV_TAG') || Deno.env.get('NODE_ENV') || 'development';
}

/**
 * Get environment from request headers or Deno env
 * @deprecated Use getEnvTag() instead
 */
export function getEnvironment(): string {
  return getEnvTag();
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvTag() === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvTag() === 'development';
}

/**
 * Validate admin access using x-admin-secret header
 */
export function validateAdminAccess(request: Request): AdminContext {
  const adminSecret = request.headers.get('x-admin-secret');
  const expectedSecret = Deno.env.get('ADMIN_SECRET');
  
  if (!expectedSecret) {
    return { isAdmin: false, error: 'Admin secret not configured' };
  }
  
  if (!adminSecret || adminSecret !== expectedSecret) {
    return { isAdmin: false, error: 'Invalid or missing admin secret' };
  }
  
  return { isAdmin: true };
}

/**
 * Create standardized JSON response
 */
export function createResponse<T>(
  data?: T,
  success: boolean = true,
  message?: string,
  status: number = 200
): Response {
  const response: ApiResponse<T> = {
    success,
    timestamp: new Date().toISOString(),
  };
  
  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  if (!success && message) response.error = message;
  
  return new Response(JSON.stringify(response, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
  });
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  }
  return null;
}

/**
 * Send event to PostHog
 */
export async function sendPostHogEvent(
  event: string,
  properties: Record<string, any> = {},
  distinctId: string = 'anonymous'
): Promise<void> {
  const postHogApiKey = Deno.env.get('POSTHOG_API_KEY');
  const environment = getEnvironment();
  
  if (!postHogApiKey) {
    console.warn('PostHog API key not configured, skipping event');
    return;
  }
  
  try {
    const payload = {
      api_key: postHogApiKey,
      event,
      properties: {
        ...properties,
        environment: getEnvTag(), // Use getEnvTag instead of getEnvironment
        $lib: 'supabase-edge-functions',
        $lib_version: '1.0.0',
      },
      distinct_id: distinctId,
      timestamp: new Date().toISOString(),
    };
    
    await fetch('https://app.posthog.com/capture/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send PostHog event:', error);
  }
}

/**
 * Get Supabase client
 */
export function getSupabaseUrl(): string {
  return Deno.env.get('SUPABASE_URL') || '';
}

/**
 * Get Supabase service key
 */
export function getSupabaseServiceKey(): string {
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
}

/**
 * Create Supabase admin client
 */
export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceKey();
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL and service role key are required');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get environment variable with optional fallback
 */
export function getEnv(key: string, fallback?: string): string {
  const value = Deno.env.get(key);
  if (!value && fallback === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || fallback!;
}

/**
 * Parse request body as JSON
 */
export async function parseRequestBody(request: Request): Promise<any> {
  try {
    const text = await request.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Get URL search parameter
 */
export function getRequestParam(url: URL, param: string): string | null {
  return url.searchParams.get(param);
}

/**
 * Require admin secret header
 */
export function requireAdminSecret(request: Request): void {
  const adminSecret = request.headers.get('x-admin-secret');
  const expectedSecret = getEnv('ADMIN_SECRET');
  
  if (!adminSecret || adminSecret !== expectedSecret) {
    throw new Error('Unauthorized: Invalid admin secret');
  }
}

/**
 * Date utility functions
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function get24HoursAgo(): Date {
  const date = new Date();
  date.setHours(date.getHours() - 24);
  return date;
}

export function get7DaysAgo(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

export function get30DaysAgo(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

/**
 * Error handling wrapper for edge functions
 */
export function withErrorHandling(handler: (request: Request) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    try {
      const corsResponse = handleCors(request);
      if (corsResponse) return corsResponse;
      
      return await handler(request);
    } catch (error) {
      logError(error, 'EdgeFunction');
      
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          return createResponse(null, false, error.message, 401);
        }
        return createResponse(null, false, error.message, 400);
      }
      
      return createResponse(null, false, 'Internal server error', 500);
    }
  };
}

/**
 * Log error with context
 */
export function logError(error: any, context: string = ''): void {
  const timestamp = new Date().toISOString();
  const environment = getEnvTag();
  
  console.error({
    timestamp,
    environment,
    context,
    error: error.message || error,
    stack: error.stack || 'No stack trace available',
  });
}

/**
 * Extract user ID from Authorization header (Supabase JWT)
 */
export function extractUserIdFromAuth(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    // For edge functions, we'd typically validate this with Supabase
    // For now, we'll just extract without full validation
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (error) {
    logError(error, 'extractUserIdFromAuth');
    return null;
  }
}