/**
 * Feature Flags Edge Function for Sedā.fm
 * 
 * GET /flags - Get all feature flags for current environment
 * POST /flags - Create or update feature flag (admin only)
 * DELETE /flags/:key - Delete feature flag (admin only)
 */

import { 
  createResponse, 
  getEnvTag, 
  requireAdminSecret,
  withErrorHandling,
  createAdminClient,
  parseRequestBody,
  getRequestParam,
  logError
} from '../_shared/utils.ts';
import { trackApiUsage } from '../_shared/posthog.ts';
import { FeatureFlag } from '../_shared/types.ts';

// Default feature flags for each environment
const DEFAULT_FLAGS: Record<string, FeatureFlag[]> = {
  qa: [
    { key: 'artist_verification', enabled: true, environment: 'qa', description: 'Enable artist verification flow' },
    { key: 'admin_dashboard', enabled: true, environment: 'qa', description: 'Enable admin dashboard features' },
    { key: 'posthog_analytics', enabled: true, environment: 'qa', description: 'Enable PostHog analytics tracking' },
    { key: 'rate_limiting', enabled: false, environment: 'qa', description: 'Enable rate limiting for API endpoints' },
  ],
  sandbox: [
    { key: 'artist_verification', enabled: true, environment: 'sandbox', description: 'Enable artist verification flow' },
    { key: 'admin_dashboard', enabled: true, environment: 'sandbox', description: 'Enable admin dashboard features' },
    { key: 'posthog_analytics', enabled: true, environment: 'sandbox', description: 'Enable PostHog analytics tracking' },
    { key: 'rate_limiting', enabled: true, environment: 'sandbox', description: 'Enable rate limiting for API endpoints' },
  ],
  production: [
    { key: 'artist_verification', enabled: true, environment: 'production', description: 'Enable artist verification flow' },
    { key: 'admin_dashboard', enabled: true, environment: 'production', description: 'Enable admin dashboard features' },
    { key: 'posthog_analytics', enabled: true, environment: 'production', description: 'Enable PostHog analytics tracking' },
    { key: 'rate_limiting', enabled: true, environment: 'production', description: 'Enable rate limiting for API endpoints' },
  ],
};

async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const environment = getEnvTag();
  
  try {
    const supabase = createAdminClient();
    
    // Try to get flags from database first
    const { data: dbFlags, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('environment', environment);
    
    if (error) {
      console.warn('Failed to fetch feature flags from database, using defaults:', error);
      return DEFAULT_FLAGS[environment] || DEFAULT_FLAGS.qa;
    }
    
    // If no flags in database, return defaults
    if (!dbFlags || dbFlags.length === 0) {
      return DEFAULT_FLAGS[environment] || DEFAULT_FLAGS.qa;
    }
    
    return dbFlags as FeatureFlag[];
  } catch (error) {
    logError(error, 'getFeatureFlags');
    return DEFAULT_FLAGS[environment] || DEFAULT_FLAGS.qa;
  }
}

async function setFeatureFlag(key: string, enabled: boolean, description?: string, rollout_percentage?: number): Promise<FeatureFlag> {
  const environment = getEnvTag();
  const supabase = createAdminClient();
  
  const flagData: FeatureFlag = {
    key,
    enabled,
    environment,
    description,
    rollout_percentage,
  };
  
  const { data, error } = await supabase
    .from('feature_flags')
    .upsert(flagData, { onConflict: 'key,environment' })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to set feature flag: ${error.message}`);
  }
  
  return data as FeatureFlag;
}

async function deleteFeatureFlag(key: string): Promise<void> {
  const environment = getEnvTag();
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('feature_flags')
    .delete()
    .eq('key', key)
    .eq('environment', environment);
  
  if (error) {
    throw new Error(`Failed to delete feature flag: ${error.message}`);
  }
}

async function handleGetFlags(): Promise<Response> {
  try {
    const flags = await getFeatureFlags();
    
    await trackApiUsage('/flags', 'GET', undefined, {
      flags_count: flags.length,
      environment: getEnvTag(),
    });
    
    return createResponse(flags);
  } catch (error) {
    logError(error, 'handleGetFlags');
    return createResponse(null, false, 'Failed to fetch feature flags', 500);
  }
}

async function handlePostFlag(request: Request): Promise<Response> {
  requireAdminSecret(request);
  
  try {
    const { key, enabled, description, rollout_percentage } = await request.json();
    
    if (!key || typeof enabled !== 'boolean') {
      return createResponse(null, false, 'Missing required fields: key, enabled', 400);
    }
    
    const flag = await setFeatureFlag(key, enabled, description, rollout_percentage);
    
    await trackApiUsage('/flags', 'POST', 'admin', {
      key,
      enabled,
      environment: getEnvTag(),
    });
    
    return createResponse(flag, true, 'Feature flag updated successfully');
  } catch (error) {
    logError(error, 'handlePostFlag');
    return createResponse(null, false, error.message || 'Failed to update feature flag', 500);
  }
}

async function handleDeleteFlag(request: Request, key: string): Promise<Response> {
  requireAdminSecret(request);
  
  try {
    await deleteFeatureFlag(key);
    
    await trackApiUsage('/flags', 'DELETE', 'admin', {
      key,
      environment: getEnvTag(),
    });
    
    return createResponse(null, true, 'Feature flag deleted successfully');
  } catch (error) {
    logError(error, 'handleDeleteFlag');
    return createResponse(null, false, error.message || 'Failed to delete feature flag', 500);
  }
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  const key = getRequestParam(url, 'key');
  
  switch (method) {
    case 'GET': {
      if (key) {
        // Get specific flag - no admin required for reading
        const flags = await getFeatureFlags();
        const flag = flags.find(f => f.key === key);
        if (!flag) {
          return createResponse(null, false, `Flag '${key}' not found`, 404);
        }
        return createResponse(flag);
      } else {
        // List all flags - no admin required for reading
        return await handleGetFlags();
      }
    }
    
    case 'POST': {
      // Create/update flag - admin required
      return await handlePostFlag(request);
    }
    
    case 'PUT': {
      // Toggle flag - admin required
      requireAdminSecret(request);
      if (!key) {
        return createResponse(null, false, 'Flag key is required', 400);
      }
      
      const flags = await getFeatureFlags();
      const flag = flags.find(f => f.key === key);
      if (!flag) {
        return createResponse(null, false, `Flag '${key}' not found`, 404);
      }
      
      const updatedFlag = await setFeatureFlag(key, !flag.enabled, flag.description, flag.rollout_percentage);
      await trackApiUsage('/flags', 'PUT', 'admin', {
        key,
        toggled_to: updatedFlag.enabled,
        environment: getEnvTag(),
      });
      
      return createResponse(updatedFlag, true, `Flag '${key}' ${updatedFlag.enabled ? 'enabled' : 'disabled'}`);
    }
    
    case 'DELETE': {
      // Delete flag - admin required
      if (!key) {
        return createResponse(null, false, 'Flag key is required', 400);
      }
      return await handleDeleteFlag(request, key);
    }
    
    default:
      return createResponse(null, false, 'Method not allowed', 405);
  }
}

Deno.serve(withErrorHandling(handleRequest));