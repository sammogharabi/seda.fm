/**
 * Streaming API client for Spotify and Apple Music integration
 */

import { supabase } from '../supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

/**
 * Get auth headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

interface ConnectionStatus {
  connected: boolean;
  displayName?: string;
  profileImageUrl?: string;
  isPremium?: boolean;
  country?: string;
  connectedAt?: string;
}

interface StreamingConnectionsResponse {
  spotify: ConnectionStatus;
  appleMusic: ConnectionStatus;
  tidal?: ConnectionStatus;
  configured: {
    spotify: boolean;
    appleMusic: boolean;
    tidal?: boolean;
  };
}

interface TrackResult {
  id: string;
  provider: 'spotify' | 'apple-music';
  name: string;
  artist: string;
  album: string;
  duration: number;
  artwork?: string;
  previewUrl?: string;
  externalUrl?: string;
  uri?: string;
}

interface SearchResults {
  spotify?: {
    tracks: TrackResult[];
    total: number;
  } | { error: string };
  appleMusic?: {
    tracks: TrackResult[];
    total: number;
  } | { error: string };
}

/**
 * Get all streaming connection statuses
 */
export async function getStreamingConnections(): Promise<StreamingConnectionsResponse> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/streaming/connections`, {
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch streaming connections');
  }

  return response.json();
}

/**
 * Get Spotify connection status
 */
export async function getSpotifyStatus(): Promise<ConnectionStatus> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/streaming/spotify/status`, {
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify status');
  }

  return response.json();
}

/**
 * Disconnect Spotify
 */
export async function disconnectSpotify(): Promise<{ success: boolean }> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/streaming/spotify/disconnect`, {
    method: 'DELETE',
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error('Failed to disconnect Spotify');
  }

  return response.json();
}

/**
 * Get Apple Music developer token for MusicKit initialization
 */
export async function getAppleMusicDeveloperToken(): Promise<{ developerToken: string }> {
  const response = await fetch(`${API_BASE}/streaming/apple-music/developer-token`);

  if (!response.ok) {
    throw new Error('Apple Music not configured');
  }

  return response.json();
}

/**
 * Connect Apple Music (after MusicKit authorization)
 */
export async function connectAppleMusic(
  musicUserToken: string,
  displayName?: string,
  country?: string,
): Promise<{ success: boolean }> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/streaming/apple-music/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ musicUserToken, displayName, country }),
  });

  if (!response.ok) {
    throw new Error('Failed to connect Apple Music');
  }

  return response.json();
}

/**
 * Get Apple Music connection status
 */
export async function getAppleMusicStatus(): Promise<ConnectionStatus> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/streaming/apple-music/status`, {
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Apple Music status');
  }

  return response.json();
}

/**
 * Disconnect Apple Music
 */
export async function disconnectAppleMusic(): Promise<{ success: boolean }> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/streaming/apple-music/disconnect`, {
    method: 'DELETE',
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error('Failed to disconnect Apple Music');
  }

  return response.json();
}

/**
 * Search for tracks across streaming services
 */
export async function searchTracks(
  query: string,
  options?: {
    provider?: 'spotify' | 'apple-music' | 'all';
    limit?: number;
    offset?: number;
  },
): Promise<SearchResults> {
  const params = new URLSearchParams({ q: query });

  if (options?.provider) {
    params.set('provider', options.provider);
  }
  if (options?.limit) {
    params.set('limit', options.limit.toString());
  }
  if (options?.offset) {
    params.set('offset', options.offset.toString());
  }

  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/streaming/search?${params.toString()}`, {
    headers: authHeaders,
  });

  if (!response.ok) {
    throw new Error('Search failed');
  }

  return response.json();
}

/**
 * Get track details by provider and ID
 */
export async function getTrack(
  provider: 'spotify' | 'apple-music',
  trackId: string,
): Promise<TrackResult> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE}/streaming/track/${provider}/${trackId}`,
    { headers: authHeaders },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch track');
  }

  return response.json();
}

/**
 * Get Spotify OAuth URL (for manual redirect if needed)
 */
export function getSpotifyConnectUrl(): string {
  return `${API_BASE}/streaming/spotify/connect`;
}

/**
 * Get Tidal OAuth URL
 */
export function getTidalConnectUrl(): string {
  return `${API_BASE}/streaming/tidal/connect`;
}

/**
 * Format track duration from seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get high-res artwork URL (for Spotify)
 */
export function getHighResArtwork(artwork: string, size = 640): string {
  if (!artwork) return '';

  // Spotify artwork URLs can have size in the URL
  if (artwork.includes('i.scdn.co')) {
    return artwork;
  }

  // Apple Music artwork URLs have {w} and {h} placeholders
  if (artwork.includes('{w}') || artwork.includes('{h}')) {
    return artwork.replace('{w}', size.toString()).replace('{h}', size.toString());
  }

  return artwork;
}
