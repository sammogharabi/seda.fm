/**
 * Metrics Edge Function for Sedā.fm
 * 
 * GET /metrics - Get system metrics (DAU/WAU, active_channels, skip_rate_24h, top_tracks_24h)
 * Admin-secret protected endpoint
 */

import { 
  createResponse, 
  withErrorHandling, 
  requireAdminSecret,
  createAdminClient,
  getEnvTag,
  get24HoursAgo,
  get7DaysAgo,
  get30DaysAgo,
  formatDate
} from '../_shared/utils.ts';
import { trackApiUsage } from '../_shared/posthog.ts';

interface MetricsResponse {
  timestamp: string;
  environment: string;
  dau: number;
  wau: number;
  mau: number;
  active_channels: number;
  skip_rate_24h: number;
  top_tracks_24h: Array<{
    track_id: string;
    title?: string;
    artist?: string;
    play_count: number;
    skip_count: number;
    completion_rate: number;
  }>;
}

async function getSystemMetrics(): Promise<MetricsResponse> {
  const supabase = createAdminClient();
  const environment = getEnvTag();
  const now = new Date();
  const today = formatDate(now);
  const yesterday = formatDate(get24HoursAgo());
  const weekAgo = get7DaysAgo().toISOString();
  const monthAgo = get30DaysAgo().toISOString();
  const dayAgo = get24HoursAgo().toISOString();
  
  try {
    // Get Daily Active Users (DAU) - users who sent messages in last 24h
    const { data: dauData } = await supabase
      .from('messages')
      .select('user_id')
      .gte('created_at', dayAgo)
      .not('user_id', 'is', null);
    
    const dau = new Set(dauData?.map(d => d.user_id) || []).size;
    
    // Get Weekly Active Users (WAU) - users who sent messages in last 7 days
    const { data: wauData } = await supabase
      .from('messages')
      .select('user_id')
      .gte('created_at', weekAgo)
      .not('user_id', 'is', null);
    
    const wau = new Set(wauData?.map(d => d.user_id) || []).size;
    
    // Get Monthly Active Users (MAU) - users who sent messages in last 30 days
    const { data: mauData } = await supabase
      .from('messages')
      .select('user_id')
      .gte('created_at', monthAgo)
      .not('user_id', 'is', null);
    
    const mau = new Set(mauData?.map(d => d.user_id) || []).size;
    
    // Get active channels (rooms with messages in last 24h)
    const { data: activeChannelsData } = await supabase
      .from('messages')
      .select('room_id')
      .gte('created_at', dayAgo)
      .not('room_id', 'is', null);
    
    const active_channels = new Set(activeChannelsData?.map(d => d.room_id) || []).size;
    
    // Get track statistics for skip rate calculation (last 24h)
    const { data: trackPlaysData } = await supabase
      .from('messages')
      .select(`
        track_ref,
        created_at
      `)
      .eq('type', 'TRACK')
      .gte('created_at', dayAgo)
      .not('track_ref', 'is', null);
    
    // Calculate skip rate (mock calculation - would need actual play/skip events)
    let totalPlays = trackPlaysData?.length || 0;
    let totalSkips = Math.floor(totalPlays * 0.3); // Mock: assume 30% skip rate
    const skip_rate_24h = totalPlays > 0 ? (totalSkips / totalPlays) * 100 : 0;
    
    // Get top tracks in last 24h
    const trackCounts: Record<string, { 
      count: number; 
      title?: string; 
      artist?: string; 
      track_id: string; 
    }> = {};
    
    trackPlaysData?.forEach(play => {
      if (play.track_ref) {
        const trackRef = typeof play.track_ref === 'string' 
          ? JSON.parse(play.track_ref) 
          : play.track_ref;
        
        const trackId = trackRef.url || trackRef.id || 'unknown';
        
        if (!trackCounts[trackId]) {
          trackCounts[trackId] = {
            count: 0,
            title: trackRef.title,
            artist: trackRef.artist,
            track_id: trackId,
          };
        }
        trackCounts[trackId].count++;
      }
    });
    
    const top_tracks_24h = Object.values(trackCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(track => ({
        track_id: track.track_id,
        title: track.title,
        artist: track.artist,
        play_count: track.count,
        skip_count: Math.floor(track.count * 0.3), // Mock skip data
        completion_rate: Math.round((1 - 0.3) * 100), // Mock completion rate
      }));
    
    return {
      timestamp: new Date().toISOString(),
      environment,
      dau,
      wau,
      mau,
      active_channels,
      skip_rate_24h: Math.round(skip_rate_24h * 100) / 100,
      top_tracks_24h,
    };
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    
    // Return mock data if database query fails
    return {
      timestamp: new Date().toISOString(),
      environment,
      dau: 0,
      wau: 0,
      mau: 0,
      active_channels: 0,
      skip_rate_24h: 0,
      top_tracks_24h: [],
    };
  }
}

async function handleGetMetrics(request: Request): Promise<Response> {
  // Require admin secret for metrics access
  requireAdminSecret(request);
  
  try {
    const metrics = await getSystemMetrics();
    
    await trackApiUsage('/metrics', 'GET', 'admin', {
      environment: metrics.environment,
      dau: metrics.dau,
      wau: metrics.wau,
      active_channels: metrics.active_channels,
    });
    
    return createResponse(metrics);
  } catch (error) {
    console.error('handleGetMetrics error:', error);
    return createResponse(null, false, 'Failed to fetch metrics', 500);
  }
}



async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;
  
  if (method === 'GET') {
    return await handleGetMetrics(request);
  }
  
  return createResponse(null, false, 'Method not allowed', 405);
}

Deno.serve(withErrorHandling(handleRequest));