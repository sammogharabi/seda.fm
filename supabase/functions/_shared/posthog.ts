/**
 * PostHog Analytics Integration for Sedā.fm Edge Functions
 * Minimal HTTP capture with environment property
 */

import { getEnvTag, logError } from './utils.ts';

export interface PostHogEvent {
  event: string;
  distinctId: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export interface PostHogCapture {
  api_key: string;
  event: string;
  distinct_id: string;
  properties: Record<string, any>;
  timestamp: string;
}

/**
 * Send event to PostHog with environment tagging
 */
export async function captureEvent(
  event: string,
  distinctId: string = 'anonymous',
  properties: Record<string, any> = {}
): Promise<boolean> {
  const postHogApiKey = Deno.env.get('POSTHOG_API_KEY');
  
  if (!postHogApiKey) {
    console.warn('PostHog API key not configured, skipping event:', event);
    return false;
  }
  
  try {
    const payload: PostHogCapture = {
      api_key: postHogApiKey,
      event,
      distinct_id: distinctId,
      properties: {
        ...properties,
        environment: getEnvTag(), // Always include environment
        $lib: 'supabase-edge-functions',
        $lib_version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
    
    const response = await fetch('https://app.posthog.com/capture/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'seda-fm-edge-functions/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`PostHog API responded with status: ${response.status}`);
    }

    return true;
  } catch (error) {
    logError(error, 'PostHog.captureEvent');
    return false;
  }
}

/**
 * Capture multiple events in batch
 */
export async function captureBatch(
  events: PostHogEvent[]
): Promise<boolean> {
  const postHogApiKey = Deno.env.get('POSTHOG_API_KEY');
  
  if (!postHogApiKey || events.length === 0) {
    return false;
  }
  
  try {
    const batch = events.map(event => ({
      api_key: postHogApiKey,
      event: event.event,
      distinct_id: event.distinctId,
      properties: {
        ...event.properties,
        environment: getEnvTag(),
        $lib: 'supabase-edge-functions',
        $lib_version: '1.0.0',
      },
      timestamp: event.timestamp || new Date().toISOString(),
    }));

    const response = await fetch('https://app.posthog.com/batch/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'seda-fm-edge-functions/1.0',
      },
      body: JSON.stringify({ batch }),
    });

    return response.ok;
  } catch (error) {
    logError(error, 'PostHog.captureBatch');
    return false;
  }
}

/**
 * Track API endpoint usage
 */
export async function trackApiUsage(
  endpoint: string,
  method: string,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await captureEvent(
    'api_endpoint_hit',
    userId || 'anonymous',
    {
      endpoint,
      method,
      ...metadata,
    }
  );
}

/**
 * Track user action
 */
export async function trackUserAction(
  action: string,
  userId: string,
  properties?: Record<string, any>
): Promise<void> {
  await captureEvent(
    action,
    userId,
    {
      user_id: userId,
      ...properties,
    }
  );
}

/**
 * Track system event
 */
export async function trackSystemEvent(
  event: string,
  properties?: Record<string, any>
): Promise<void> {
  await captureEvent(
    `system_${event}`,
    'system',
    {
      event_type: 'system',
      ...properties,
    }
  );
}

/**
 * Track error event
 */
export async function trackError(
  error: Error,
  context: string,
  userId?: string
): Promise<void> {
  await captureEvent(
    'error_occurred',
    userId || 'system',
    {
      error_message: error.message,
      error_stack: error.stack,
      context,
      error_type: error.constructor.name,
    }
  );
}

/**
 * Health check for PostHog integration
 */
export function isPostHogConfigured(): boolean {
  return !!Deno.env.get('POSTHOG_API_KEY');
}

/**
 * Get PostHog configuration status
 */
export function getPostHogStatus(): {
  configured: boolean;
  environment: string;
  apiKeyPresent: boolean;
} {
  const apiKey = Deno.env.get('POSTHOG_API_KEY');
  
  return {
    configured: !!apiKey,
    environment: getEnvTag(),
    apiKeyPresent: !!apiKey,
  };
}