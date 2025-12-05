/**
 * Profiles API Client
 * Handles user profile operations
 */

import { http } from './http';
import type {
  UserProfile,
  CreateProfileDto,
  UpdateProfileDto,
  SetGenresDto,
  OnboardingStatus,
} from './types';

export const profilesApi = {
  /**
   * Check if username is available
   */
  async checkUsername(username: string): Promise<{ available: boolean; username: string }> {
    return http.get<{ available: boolean; username: string }>(`/profiles/check-username?username=${encodeURIComponent(username)}`);
  },

  /**
   * Create a new profile
   */
  async create(data: CreateProfileDto): Promise<UserProfile> {
    return http.post<UserProfile>('/profiles', data);
  },

  /**
   * Get a profile by username
   */
  async getByUsername(username: string): Promise<UserProfile> {
    return http.get<UserProfile>(`/profiles/${username}`);
  },

  /**
   * Update a profile
   */
  async update(username: string, data: UpdateProfileDto): Promise<UserProfile> {
    return http.patch<UserProfile>(`/profiles/${username}`, data);
  },

  /**
   * Get current user's profile
   */
  async getMe(): Promise<UserProfile> {
    return http.get<UserProfile>('/profiles/me/profile');
  },

  /**
   * Set user's music genres
   */
  async setGenres(data: SetGenresDto): Promise<UserProfile> {
    return http.post<UserProfile>('/profiles/me/genres', data);
  },

  /**
   * Get onboarding status for current user
   */
  async getOnboardingStatus(): Promise<OnboardingStatus> {
    return http.get<OnboardingStatus>('/profiles/me/onboarding-status');
  },

  /**
   * Update profile customization (cover, photos, videos, highlights, social links)
   */
  async updateCustomization(data: any): Promise<UserProfile> {
    return http.patch<UserProfile>('/profiles/me/customization', data);
  },

  /**
   * Follow a user
   */
  async follow(username: string): Promise<any> {
    return http.post<any>(`/profiles/${username}/follow`, {});
  },

  /**
   * Unfollow a user
   */
  async unfollow(username: string): Promise<any> {
    return http.post<any>(`/profiles/${username}/unfollow`, {});
  },

  /**
   * Get followers for a user
   */
  async getFollowers(username: string, limit?: number): Promise<any[]> {
    const params = limit ? `?limit=${limit}` : '';
    return http.get<any[]>(`/profiles/${username}/followers${params}`);
  },

  /**
   * Get users that this user follows
   */
  async getFollowing(username: string, limit?: number): Promise<any[]> {
    const params = limit ? `?limit=${limit}` : '';
    return http.get<any[]>(`/profiles/${username}/following${params}`);
  },

  /**
   * Check if current user is following this user
   */
  async isFollowing(username: string): Promise<{ following: boolean }> {
    return http.get<{ following: boolean }>(`/profiles/${username}/is-following`);
  },

  /**
   * Get profile statistics
   */
  async getStats(username: string): Promise<{
    followers: number;
    following: number;
    posts: number;
    tracks: number;
    totalPlays: number;
  }> {
    return http.get(`/profiles/${username}/stats`);
  },

  /**
   * Get user posts
   */
  async getPosts(username: string, limit?: number, offset?: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const queryString = params.toString();
    return http.get<any[]>(`/profiles/${username}/posts${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get user comment history
   */
  async getComments(username: string, limit?: number, offset?: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const queryString = params.toString();
    return http.get<any[]>(`/profiles/${username}/comments${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get user published tracks
   */
  async getTracks(username: string): Promise<any[]> {
    return http.get<any[]>(`/profiles/${username}/tracks`);
  },

  /**
   * Get top fans by total spent
   */
  async getTopFans(username: string, limit?: number): Promise<any[]> {
    const params = limit ? `?limit=${limit}` : '';
    return http.get<any[]>(`/profiles/${username}/top-fans${params}`);
  },
};
