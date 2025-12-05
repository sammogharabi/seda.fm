/**
 * Development Tools Edge Function for Sedā.fm
 * 
 * PostHog test event endpoints
 * DISABLED in production via ENV_TAG check
 * 
 * Available endpoints:
 * - POST /dev/test-event - Send test event to PostHog
 * - POST /dev/test-batch - Send batch test events to PostHog
 * - GET /dev/posthog-status - Check PostHog integration status
 * - GET /dev/info - Get environment and system information
 */

import { 
  createResponse, 
  withErrorHandling, 
  isProduction,
  getEnvTag,
  parseRequestBody
} from '../_shared/utils.ts';
import { 
  captureEvent, 
  captureBatch, 
  getPostHogStatus, 
  trackSystemEvent
} from '../_shared/posthog.ts';
import type { PostHogEvent } from '../_shared/posthog.ts';

// Test event templates
const TEST_EVENTS = {
  user_login: {
    event: 'user_login',
    properties: {
      login_method: 'email',
      user_type: 'artist',
      device_type: 'desktop',
    },
  },
  track_shared: {
    event: 'track_shared',
    properties: {
      platform: 'spotify',
      track_title: 'Test Song',
      artist_name: 'Test Artist',
      room_id: 'test-room-123',
    },
  },
  room_created: {
    event: 'room_created',
    properties: {
      room_type: 'public',
      room_name: 'Test Room',
      creator_type: 'artist',
    },
  },
  message_sent: {
    event: 'message_sent',
    properties: {
      message_type: 'track',
      room_id: 'test-room-123',
      has_mentions: false,
      track_platform: 'youtube',
    },
  },
};

async function handleGetInfo(): Promise<Response> {
  const environment = getEnvTag();
  
  const info = {
    environment,
    timestamp: new Date().toISOString(),
    deno_version: Deno.version.deno,
    v8_version: Deno.version.v8,
    typescript_version: Deno.version.typescript,
    env_vars: {
      supabase_url: !!Deno.env.get('SUPABASE_URL'),
      supabase_anon_key: !!Deno.env.get('SUPABASE_ANON_KEY'),
      supabase_service_key: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      posthog_api_key: !!Deno.env.get('POSTHOG_API_KEY'),
      admin_secret: !!Deno.env.get('ADMIN_SECRET'),
    },
    posthog_status: getPostHogStatus(),
  };
  
  await trackSystemEvent('dev_info_accessed', { environment });
  
  return createResponse(info);
}

async function handleTestEvent(request: Request): Promise<Response> {
  const body = await parseRequestBody(request);
  const { eventType = 'user_login', distinctId = 'test-user', customProperties = {} } = body;
  
  // Get predefined event or use custom
  const eventTemplate = TEST_EVENTS[eventType as keyof typeof TEST_EVENTS];
  
  if (!eventTemplate) {
    return createResponse(null, false, `Unknown event type: ${eventType}. Available: ${Object.keys(TEST_EVENTS).join(', ')}`, 400);
  }
  
  const success = await captureEvent(
    eventTemplate.event,
    distinctId,
    {
      ...eventTemplate.properties,
      ...customProperties,
      test_event: true,
      timestamp: new Date().toISOString(),
    }
  );
  
  return createResponse(
    {
      sent: success,
      event: eventTemplate.event,
      distinctId,
      properties: { ...eventTemplate.properties, ...customProperties },
    },
    success,
    success ? 'Test event sent successfully' : 'Failed to send test event'
  );
}

async function handleTestBatch(request: Request): Promise<Response> {
  const body = await parseRequestBody(request);
  const { count = 5, eventTypes = ['user_login', 'track_shared'], distinctId = 'test-user' } = body;
  
  const events: PostHogEvent[] = [];
  
  for (let i = 0; i < count; i++) {
    const eventType = eventTypes[i % eventTypes.length] as keyof typeof TEST_EVENTS;
    const eventTemplate = TEST_EVENTS[eventType];
    
    if (eventTemplate) {
      events.push({
        event: eventTemplate.event,
        distinctId: `${distinctId}-${i}`,
        properties: {
          ...eventTemplate.properties,
          test_event: true,
          batch_index: i,
          batch_id: `test-batch-${Date.now()}`,
        },
      });
    }
  }
  
  const success = await captureBatch(events);
  
  return createResponse(
    {
      sent: success,
      events_count: events.length,
      events: events.map(e => ({ event: e.event, distinctId: e.distinctId })),
    },
    success,
    success ? `Batch of ${events.length} test events sent successfully` : 'Failed to send batch events'
  );
}

async function handlePostHogStatus(): Promise<Response> {
  const status = getPostHogStatus();
  
  await trackSystemEvent('dev_posthog_status_checked', { 
    configured: status.configured 
  });
  
  return createResponse(status);
}


async function handleRequest(request: Request): Promise<Response> {
  // Return 404 in production - disabled via ENV_TAG
  if (getEnvTag() === 'production') {
    return new Response('Not Found', { status: 404 });
  }
  
  const url = new URL(request.url);
  const method = request.method;
  
  switch (method) {
    case 'GET': {
      if (url.pathname === '/dev/info') {
        return await handleGetInfo();
      }
      if (url.pathname === '/dev/posthog-status') {
        return await handlePostHogStatus();
      }
      break;
    }
    
    case 'POST': {
      if (url.pathname === '/dev/test-event') {
        return await handleTestEvent(request);
      }
      if (url.pathname === '/dev/test-batch') {
        return await handleTestBatch(request);
      }
      break;
    }
  }
  
  return createResponse(null, false, 'Endpoint not found', 404);
}

Deno.serve(withErrorHandling(handleRequest));