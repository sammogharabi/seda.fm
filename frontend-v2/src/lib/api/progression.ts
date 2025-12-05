/**
 * Progression API Client
 * Handles user progression, XP, levels, streaks, and badges
 */

import { http } from './http';
import type { UserProgression } from './types';

export const progressionApi = {
  /**
   * Get current user's progression stats
   */
  async getMe(): Promise<UserProgression> {
    return http.get<UserProgression>('/progression/me');
  },

  /**
   * Get user progression by username
   */
  async getByUsername(username: string): Promise<UserProgression> {
    return http.get<UserProgression>(`/progression/users/${username}`);
  },

  /**
   * Record daily login for streak
   */
  async recordDailyLogin(): Promise<UserProgression> {
    return http.post<UserProgression>('/progression/daily-login');
  },
};
