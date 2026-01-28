/**
 * Sedā v2 API Client
 * Central export for all API modules
 */

export * from './types';
export * from './http';

export { feedApi } from './feed';
export { playlistsApi } from './playlists';
export { discoverApi } from './discover';
export { profilesApi } from './profiles';
export { verificationApi } from './verification';
export { searchApi } from './search';
export { progressionApi } from './progression';
export { sessionsApi } from './sessions';
export { roomsApi } from './rooms';
export { messagesApi } from './messages';
export { unfurlApi } from './unfurl';

// Import all APIs for convenience
import { feedApi } from './feed';
import { playlistsApi } from './playlists';
import { discoverApi } from './discover';
import { profilesApi } from './profiles';
import { verificationApi } from './verification';
import { searchApi } from './search';
import { progressionApi } from './progression';
import { sessionsApi } from './sessions';
import { roomsApi } from './rooms';
import { messagesApi } from './messages';
import { unfurlApi } from './unfurl';

/**
 * Combined API client object
 * Usage: import { api } from '@/lib/api';
 */
export const api = {
  feed: feedApi,
  playlists: playlistsApi,
  discover: discoverApi,
  profiles: profilesApi,
  verification: verificationApi,
  search: searchApi,
  progression: progressionApi,
  sessions: sessionsApi,
  rooms: roomsApi,
  messages: messagesApi,
  unfurl: unfurlApi,
};
