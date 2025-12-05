/**
 * Search API Client
 * Handles universal search across users, tracks, artists, crates, and rooms
 */

import { http, buildQueryString } from './http';
import type { SearchDto, SearchResults } from './types';

export const searchApi = {
  /**
   * Search across all entity types
   */
  async search(params: SearchDto): Promise<SearchResults> {
    const query = buildQueryString(params);
    return http.get<SearchResults>(`/search${query}`);
  },

  /**
   * Search users only
   */
  async searchUsers(q: string, limit?: number): Promise<SearchResults> {
    return searchApi.search({ q, type: 'users', limit });
  },

  /**
   * Search tracks only
   */
  async searchTracks(q: string, limit?: number): Promise<SearchResults> {
    return searchApi.search({ q, type: 'tracks', limit });
  },

  /**
   * Search artists only
   */
  async searchArtists(q: string, limit?: number): Promise<SearchResults> {
    return searchApi.search({ q, type: 'artists', limit });
  },

  /**
   * Search crates only
   */
  async searchCrates(q: string, limit?: number): Promise<SearchResults> {
    return searchApi.search({ q, type: 'crates', limit });
  },

  /**
   * Search rooms only
   */
  async searchRooms(q: string, limit?: number): Promise<SearchResults> {
    return searchApi.search({ q, type: 'rooms', limit });
  },
};
