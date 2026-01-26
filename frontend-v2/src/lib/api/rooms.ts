/**
 * Rooms API Client
 * Handles room management and messaging
 */

import { http, buildQueryString } from './http';
import type {
  Room,
  RoomMembership,
  RoomInvite,
  RoomMessage,
  CreateRoomDto,
  UpdateRoomDto,
  SendMessageDto,
  GetMessagesResponse,
} from './types';

export const roomsApi = {
  /**
   * Create a new room
   */
  async create(data: CreateRoomDto): Promise<Room> {
    return http.post<Room>('/rooms', data);
  },

  /**
   * Get all rooms (user has access to)
   */
  async getAll(): Promise<Room[]> {
    return http.get<Room[]>('/rooms');
  },

  /**
   * Get room by ID
   */
  async getById(id: string): Promise<Room> {
    return http.get<Room>(`/rooms/${id}`);
  },

  /**
   * Update a room
   */
  async update(id: string, data: UpdateRoomDto): Promise<Room> {
    return http.put<Room>(`/rooms/${id}`, data);
  },

  /**
   * Delete a room
   */
  async delete(id: string): Promise<{ message: string }> {
    return http.delete<{ message: string }>(`/rooms/${id}`);
  },

  /**
   * Join a room
   */
  async join(id: string): Promise<RoomMembership> {
    return http.post<RoomMembership>(`/rooms/${id}/join`);
  },

  /**
   * Leave a room
   */
  async leave(id: string): Promise<{ message: string }> {
    return http.post<{ message: string }>(`/rooms/${id}/leave`);
  },

  /**
   * Send a message to a room
   */
  async sendMessage(id: string, data: SendMessageDto): Promise<RoomMessage> {
    return http.post<RoomMessage>(`/rooms/${id}/messages`, data);
  },

  /**
   * Get messages for a room
   */
  async getMessages(
    id: string,
    options?: { cursor?: string; limit?: number }
  ): Promise<GetMessagesResponse> {
    const query = buildQueryString({
      cursor: options?.cursor,
      limit: options?.limit,
    });
    return http.get<GetMessagesResponse>(`/rooms/${id}/messages${query}`);
  },

  // ==================== INVITE METHODS ====================

  /**
   * Invite a user to a private room
   */
  async inviteUser(roomId: string, userId: string): Promise<RoomInvite> {
    return http.post<RoomInvite>(`/rooms/${roomId}/invites`, { userId });
  },

  /**
   * Get all my pending invites
   */
  async getMyInvites(): Promise<RoomInvite[]> {
    return http.get<RoomInvite[]>('/rooms/invites/mine');
  },

  /**
   * Get pending invites for a room (members only)
   */
  async getRoomInvites(roomId: string): Promise<RoomInvite[]> {
    return http.get<RoomInvite[]>(`/rooms/${roomId}/invites`);
  },

  /**
   * Accept or decline an invite
   */
  async respondToInvite(
    inviteId: string,
    accept: boolean
  ): Promise<{ message: string; roomId?: string }> {
    return http.post<{ message: string; roomId?: string }>(
      `/rooms/invites/${inviteId}/respond`,
      { accept }
    );
  },

  /**
   * Cancel an invite (inviter or admin only)
   */
  async cancelInvite(inviteId: string): Promise<{ message: string }> {
    return http.delete<{ message: string }>(`/rooms/invites/${inviteId}`);
  },
};
