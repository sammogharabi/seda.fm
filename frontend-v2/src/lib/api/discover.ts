/**
 * Discover API Client
 * Handles content discovery and recommendations
 */

import { http } from './http';
import type { Playlist } from './types';

export const discoverApi = {
  /**
   * Get trending crates (most played in last 7 days)
   */
  async getTrending(limit: number = 20): Promise<Playlist[]> {
    return http.get<Playlist[]>(`/discover/trending?limit=${limit}`);
  },

  /**
   * Get new release crates
   */
  async getNewReleases(limit: number = 20): Promise<Playlist[]> {
    return http.get<Playlist[]>(`/discover/new-releases?limit=${limit}`);
  },

  /**
   * Get personalized recommendations for current user
   */
  async getForYou(limit: number = 20): Promise<Playlist[]> {
    return http.get<Playlist[]>(`/discover/for-you?limit=${limit}`);
  },

  /**
   * Get crates by genre
   */
  async getByGenre(genre: string, limit: number = 20): Promise<Playlist[]> {
    return http.get<Playlist[]>(`/discover/genre/${encodeURIComponent(genre)}?limit=${limit}`);
  },
};
