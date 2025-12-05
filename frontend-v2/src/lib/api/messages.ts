/**
 * Direct Messages API client
 * Handles all DM-related API calls
 */

import { http, buildQueryString } from './http';
import type {
  Conversation,
  DirectMessage,
  StartConversationDto,
  SendDirectMessageDto,
  GetConversationMessagesResponse,
  UnreadCountResponse,
} from './types';

export const messagesApi = {
  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    return http.get<Conversation[]>('/messages/conversations');
  },

  /**
   * Start a new conversation with another user
   */
  async startConversation(data: StartConversationDto): Promise<Conversation> {
    return http.post<Conversation>('/messages/conversations', data);
  },

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    return http.get<Conversation>(`/messages/conversations/${conversationId}`);
  },

  /**
   * Get messages in a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<GetConversationMessagesResponse> {
    const query = params ? buildQueryString(params) : '';
    return http.get<GetConversationMessagesResponse>(
      `/messages/conversations/${conversationId}/messages${query}`
    );
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    data: SendDirectMessageDto
  ): Promise<DirectMessage> {
    return http.post<DirectMessage>(
      `/messages/conversations/${conversationId}/messages`,
      data
    );
  },

  /**
   * Mark all messages in a conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    return http.post<void>(`/messages/conversations/${conversationId}/read`, {});
  },

  /**
   * Get total unread message count across all conversations
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return http.get<UnreadCountResponse>('/messages/unread-count');
  },

  /**
   * Edit a message (if within edit window)
   */
  async editMessage(
    conversationId: string,
    messageId: string,
    content: string
  ): Promise<DirectMessage> {
    return http.patch<DirectMessage>(
      `/messages/conversations/${conversationId}/messages/${messageId}`,
      { content }
    );
  },

  /**
   * Delete a message
   */
  async deleteMessage(
    conversationId: string,
    messageId: string
  ): Promise<void> {
    return http.delete<void>(
      `/messages/conversations/${conversationId}/messages/${messageId}`
    );
  },

  /**
   * Add a reaction to a message
   */
  async addReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<void> {
    return http.post<void>(
      `/messages/conversations/${conversationId}/messages/${messageId}/reactions`,
      { emoji }
    );
  },

  /**
   * Remove a reaction from a message
   */
  async removeReaction(
    conversationId: string,
    messageId: string,
    emoji: string
  ): Promise<void> {
    return http.delete<void>(
      `/messages/conversations/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`
    );
  },
};
