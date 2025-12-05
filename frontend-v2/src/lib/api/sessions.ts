/**
 * DJ Sessions API Client
 * Handles DJ sessions, queue management, and voting
 */

import { http } from './http';
import type {
  DJSession,
  QueueItem,
  CreateSessionDto,
  AddTrackToQueueDto,
  VoteDto,
} from './types';

export const sessionsApi = {
  /**
   * Create a new DJ session
   */
  async create(data: CreateSessionDto): Promise<DJSession> {
    return http.post<DJSession>('/sessions', data);
  },

  /**
   * Get active sessions
   */
  async getActive(): Promise<DJSession[]> {
    return http.get<DJSession[]>('/sessions/active');
  },

  /**
   * Get recently ended sessions
   */
  async getRecentlyEnded(limit?: number): Promise<DJSession[]> {
    return http.get<DJSession[]>(`/sessions/recent/ended${limit ? `?limit=${limit}` : ''}`);
  },

  /**
   * Get session by ID
   */
  async getById(id: string): Promise<DJSession> {
    return http.get<DJSession>(`/sessions/${id}`);
  },

  /**
   * Join a session
   */
  async join(id: string): Promise<void> {
    return http.post<void>(`/sessions/${id}/join`);
  },

  /**
   * Leave a session
   */
  async leave(id: string): Promise<void> {
    return http.post<void>(`/sessions/${id}/leave`);
  },

  /**
   * Add track to queue
   */
  async addToQueue(sessionId: string, data: AddTrackToQueueDto): Promise<QueueItem> {
    return http.post<QueueItem>(`/sessions/${sessionId}/queue`, data);
  },

  /**
   * Get queue for a session
   */
  async getQueue(sessionId: string): Promise<QueueItem[]> {
    return http.get<QueueItem[]>(`/sessions/${sessionId}/queue`);
  },

  /**
   * Vote on a queued track
   */
  async vote(sessionId: string, queueItemId: string, data: VoteDto): Promise<void> {
    return http.post<void>(`/sessions/${sessionId}/queue/${queueItemId}/vote`, data);
  },

  /**
   * Skip to next track
   */
  async skip(sessionId: string): Promise<DJSession> {
    return http.post<DJSession>(`/sessions/${sessionId}/skip`);
  },

  /**
   * End a session
   */
  async end(sessionId: string): Promise<DJSession> {
    return http.patch<DJSession>(`/sessions/${sessionId}/end`);
  },
};
