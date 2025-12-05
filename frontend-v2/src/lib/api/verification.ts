/**
 * Artist Verification API Client
 * Handles artist verification requests
 */

import { http } from './http';
import type { ArtistVerificationRequest } from './types';

export const verificationApi = {
  // ===== User Endpoints =====

  /**
   * Request artist verification
   */
  async request(data: { stageName: string; links: any; notes?: string }): Promise<ArtistVerificationRequest> {
    return http.post<ArtistVerificationRequest>('/artist/verification/request', data);
  },

  /**
   * Submit verification details
   */
  async submit(data: {
    stageName: string;
    bio?: string;
    links: any;
    profileImageUrl?: string;
  }): Promise<ArtistVerificationRequest> {
    return http.post<ArtistVerificationRequest>('/artist/verification/submit', data);
  },

  /**
   * Get verification request status
   */
  async getStatus(id: string): Promise<ArtistVerificationRequest> {
    return http.get<ArtistVerificationRequest>(`/artist/verification/status/${id}`);
  },

  /**
   * Get all verification requests for current user
   */
  async getMyRequests(): Promise<ArtistVerificationRequest[]> {
    return http.get<ArtistVerificationRequest[]>('/artist/verification/my-requests');
  },

  // ===== Admin Endpoints =====

  /**
   * Get pending verification requests (admin only)
   */
  async getPending(): Promise<ArtistVerificationRequest[]> {
    return http.get<ArtistVerificationRequest[]>('/admin/verification/pending');
  },

  /**
   * Get verification request by ID (admin only)
   */
  async getById(id: string): Promise<ArtistVerificationRequest> {
    return http.get<ArtistVerificationRequest>(`/admin/verification/${id}`);
  },

  /**
   * Approve verification request (admin only)
   */
  async approve(id: string): Promise<ArtistVerificationRequest> {
    return http.patch<ArtistVerificationRequest>(`/admin/verification/${id}/approve`);
  },

  /**
   * Deny verification request (admin only)
   */
  async deny(id: string, reason: string): Promise<ArtistVerificationRequest> {
    return http.patch<ArtistVerificationRequest>(`/admin/verification/${id}/deny`, { reason });
  },

  /**
   * Get verification stats overview (admin only)
   */
  async getStats(): Promise<any> {
    return http.get<any>('/admin/verification/stats/overview');
  },
};
