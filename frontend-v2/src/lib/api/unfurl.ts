/**
 * Unfurl API Client
 * Handles link metadata fetching
 */

import { http } from './http';
import type { LinkMetadata } from '../../utils/linkParser';

export const unfurlApi = {
  /**
   * Unfurl a link to get its metadata
   */
  async unfurl(url: string): Promise<LinkMetadata | null> {
    try {
      return http.post<LinkMetadata | null>('/unfurl', { url });
    } catch (error) {
      console.error('Failed to unfurl link:', error);
      return null;
    }
  },
};
