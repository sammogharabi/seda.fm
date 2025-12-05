/**
 * Social Feed API Client
 * Handles posts, comments, likes, follows, and reposts
 */

import { http, buildQueryString } from './http';
import type {
  FeedPost,
  Comment,
  CreatePostDto,
  CreateCommentDto,
  GetFeedDto,
  PaginatedResponse,
  UserProfile,
} from './types';

export const feedApi = {
  // ===== Feed Endpoints =====

  /**
   * Get personalized feed for current user
   */
  async getFeed(params?: GetFeedDto): Promise<PaginatedResponse<FeedPost>> {
    const query = params ? buildQueryString(params) : '';
    return http.get<PaginatedResponse<FeedPost>>(`/feed${query}`);
  },

  /**
   * Get global feed (all public posts)
   */
  async getGlobalFeed(params?: GetFeedDto): Promise<PaginatedResponse<FeedPost>> {
    const query = params ? buildQueryString(params) : '';
    return http.get<PaginatedResponse<FeedPost>>(`/feed/global${query}`);
  },

  // ===== Post Endpoints =====

  /**
   * Create a new post
   */
  async createPost(data: CreatePostDto): Promise<FeedPost> {
    return http.post<FeedPost>('/feed/posts', data);
  },

  /**
   * Get a single post by ID
   */
  async getPost(postId: string): Promise<FeedPost> {
    return http.get<FeedPost>(`/feed/posts/${postId}`);
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<void> {
    return http.delete<void>(`/feed/posts/${postId}`);
  },

  // ===== Like Endpoints =====

  /**
   * Like a post
   */
  async likePost(postId: string): Promise<void> {
    return http.post<void>(`/feed/posts/${postId}/like`);
  },

  /**
   * Unlike a post
   */
  async unlikePost(postId: string): Promise<void> {
    return http.delete<void>(`/feed/posts/${postId}/like`);
  },

  /**
   * Like a comment
   */
  async likeComment(commentId: string): Promise<void> {
    return http.post<void>(`/feed/comments/${commentId}/like`);
  },

  /**
   * Unlike a comment
   */
  async unlikeComment(commentId: string): Promise<void> {
    return http.delete<void>(`/feed/comments/${commentId}/like`);
  },

  // ===== Repost Endpoints =====

  /**
   * Repost a post
   */
  async repost(postId: string): Promise<void> {
    return http.post<void>(`/feed/posts/${postId}/repost`);
  },

  /**
   * Unrepost a post
   */
  async unrepost(postId: string): Promise<void> {
    return http.delete<void>(`/feed/posts/${postId}/repost`);
  },

  // ===== Comment Endpoints =====

  /**
   * Add a comment to a post
   */
  async addComment(postId: string, data: CreateCommentDto): Promise<Comment> {
    return http.post<Comment>(`/feed/posts/${postId}/comments`, data);
  },

  /**
   * Get comments for a post
   */
  async getComments(postId: string, params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<Comment>> {
    const query = params ? buildQueryString(params) : '';
    return http.get<PaginatedResponse<Comment>>(`/feed/posts/${postId}/comments${query}`);
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    return http.delete<void>(`/feed/comments/${commentId}`);
  },

  // ===== Follow Endpoints =====

  /**
   * Follow a user
   */
  async followUser(username: string): Promise<void> {
    return http.post<void>(`/feed/follow/${username}`);
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(username: string): Promise<void> {
    return http.delete<void>(`/feed/follow/${username}`);
  },

  /**
   * Get followers for a user
   */
  async getFollowers(username: string, params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<UserProfile>> {
    const query = params ? buildQueryString(params) : '';
    return http.get<PaginatedResponse<UserProfile>>(`/feed/followers/${username}${query}`);
  },

  /**
   * Get following for a user
   */
  async getFollowing(username: string, params?: { cursor?: string; limit?: number }): Promise<PaginatedResponse<UserProfile>> {
    const query = params ? buildQueryString(params) : '';
    return http.get<PaginatedResponse<UserProfile>>(`/feed/following/${username}${query}`);
  },
};
