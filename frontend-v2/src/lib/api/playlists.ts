/**
 * Playlists (Crates) API Client
 * Handles playlist/crate CRUD operations
 */

import { http, buildQueryString } from './http';
import type {
  Playlist,
  PlaylistItem,
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddPlaylistItemDto,
  GetPlaylistItemsDto,
  PaginatedResponse,
} from './types';

export const playlistsApi = {
  // ===== Playlist CRUD =====

  /**
   * Create a new playlist
   */
  async create(data: CreatePlaylistDto): Promise<Playlist> {
    return http.post<Playlist>('/playlists', data);
  },

  /**
   * Get a playlist by ID
   */
  async getById(id: string): Promise<Playlist> {
    return http.get<Playlist>(`/playlists/${id}`);
  },

  /**
   * Update a playlist
   */
  async update(id: string, data: UpdatePlaylistDto): Promise<Playlist> {
    return http.patch<Playlist>(`/playlists/${id}`, data);
  },

  /**
   * Delete a playlist
   */
  async delete(id: string): Promise<void> {
    return http.delete(`/playlists/${id}`);
  },

  /**
   * Get current user's playlists (crates)
   */
  async getMine(): Promise<Playlist[]> {
    return http.get<Playlist[]>('/playlists/mine');
  },

  // ===== Playlist Items =====

  /**
   * Add an item to a playlist
   */
  async addItem(playlistId: string, data: AddPlaylistItemDto): Promise<PlaylistItem> {
    return http.post<PlaylistItem>(`/playlists/${playlistId}/items`, data);
  },

  /**
   * Get items in a playlist with pagination
   */
  async getItems(playlistId: string, params?: GetPlaylistItemsDto): Promise<PaginatedResponse<PlaylistItem>> {
    const query = params ? buildQueryString(params) : '';
    return http.get<PaginatedResponse<PlaylistItem>>(`/playlists/${playlistId}/items${query}`);
  },

  /**
   * Remove an item from a playlist
   */
  async removeItem(playlistId: string, itemId: string): Promise<void> {
    return http.delete(`/playlists/${playlistId}/items/${itemId}`);
  },

  /**
   * Reorder items in a playlist
   */
  async reorderItems(playlistId: string, items: { id: string; position: number }[]): Promise<void> {
    return http.patch(`/playlists/${playlistId}/items/reorder`, { items });
  },

  // ===== Crate Social Features =====

  /**
   * Get trending crates (most played in last 7 days) - public endpoint
   */
  async getTrending(limit: number = 20): Promise<Playlist[]> {
    return http.get<Playlist[]>(`/playlists/trending?limit=${limit}`, { auth: false });
  },

  /**
   * Get featured crates - public endpoint
   */
  async getFeatured(limit: number = 20): Promise<Playlist[]> {
    return http.get<Playlist[]>(`/playlists/featured?limit=${limit}`, { auth: false });
  },
};
