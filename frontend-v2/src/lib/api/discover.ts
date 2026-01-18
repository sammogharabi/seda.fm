/**
 * Discover API Client
 * Handles content discovery and recommendations
 */

import { http } from './http';
import type { Playlist } from './types';

export interface DiscoverArtist {
  id: string;
  artistProfileId: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  verified: boolean;
  bio?: string;
  genres: string[];
  followers: number;
  websiteUrl?: string;
  spotifyUrl?: string;
  bandcampUrl?: string;
  soundcloudUrl?: string;
}

export interface PeopleSuggestion {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  genres: string[];
  followers: number;
  following: number;
  mutualFollowers: number;
  verified: boolean;
  isArtist: boolean;
  reason: string;
}

export interface TrendingRoom {
  id: string;
  name: string;
  description: string | null;
  genre: string | null;
  coverImageUrl: string | null;
  memberCount: number;
  messageCount: number;
  recentActivity: number;
  creator: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    verified: boolean;
  } | null;
  createdAt: string;
}

export const discoverApi = {
  /**
   * Get verified artists for discovery (public endpoint - no auth required)
   */
  async getArtists(limit: number = 20): Promise<DiscoverArtist[]> {
    return http.get<DiscoverArtist[]>(`/discover/artists?limit=${limit}`, { auth: false });
  },

  /**
   * Get suggested people to follow based on mutual connections and genres
   */
  async getPeople(limit: number = 20): Promise<PeopleSuggestion[]> {
    return http.get<PeopleSuggestion[]>(`/discover/people?limit=${limit}`);
  },

  /**
   * Get trending rooms (most active in last 7 days)
   */
  async getRooms(limit: number = 20): Promise<TrendingRoom[]> {
    return http.get<TrendingRoom[]>(`/discover/rooms?limit=${limit}`, { auth: false });
  },

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
