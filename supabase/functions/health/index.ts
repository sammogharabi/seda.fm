/**
 * Health Check Edge Function for Sedā.fm
 * 
 * Simple JSON healthcheck endpoint
 * GET /health - Basic health status
 */

import { 
  createResponse, 
  withErrorHandling,
  getEnvTag
} from '../_shared/utils.ts';

const START_TIME = Date.now();

function getUptime(): number {
  return Math.floor((Date.now() - START_TIME) / 1000);
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  environment: string;
  uptime_seconds: number;
  version: string;
}

async function handleHealthCheck(): Promise<Response> {
  const environment = getEnvTag();
  const uptime = getUptime();
  
  const health: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment,
    uptime_seconds: uptime,
    version: '1.0.0',
  };
  
  return createResponse(health);
}




async function handleRequest(request: Request): Promise<Response> {
  const method = request.method;
  
  if (method !== 'GET') {
    return createResponse(null, false, 'Method not allowed', 405);
  }
  
  return await handleHealthCheck();
}

Deno.serve(withErrorHandling(handleRequest));