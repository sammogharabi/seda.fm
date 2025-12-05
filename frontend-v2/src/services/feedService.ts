import api from './api';

export interface GetFeedParams {
  limit?: number;
  cursor?: string;
}

export interface CreatePostParams {
  type: 'TEXT' | 'TRACK_SHARE' | 'CRATE_SHARE' | 'LINK_SHARE';
  content?: string;
  trackRef?: string;
  crateId?: string;
  mediaUrls?: string[];
}

export const feedService = {
  // Get personalized feed (posts from followed users)
  async getFeed(params?: GetFeedParams) {
    const response = await api.get('/feed', { params });
    return response.data;
  },

  // Get global feed (all public posts)
  async getGlobalFeed(params?: GetFeedParams) {
    const response = await api.get('/feed/global', { params });
    return response.data;
  },

  // Get single post
  async getPost(postId: string) {
    const response = await api.get(`/feed/posts/${postId}`);
    return response.data;
  },

  // Create a new post
  async createPost(data: CreatePostParams) {
    const response = await api.post('/feed/posts', data);
    return response.data;
  },

  // Delete own post
  async deletePost(postId: string) {
    await api.delete(`/feed/posts/${postId}`);
  },

  // Like a post
  async likePost(postId: string) {
    const response = await api.post(`/feed/posts/${postId}/like`);
    return response.data;
  },

  // Unlike a post
  async unlikePost(postId: string) {
    await api.delete(`/feed/posts/${postId}/like`);
  },

  // Repost a post
  async repost(postId: string) {
    const response = await api.post(`/feed/posts/${postId}/repost`);
    return response.data;
  },

  // Remove repost
  async unrepost(postId: string) {
    await api.delete(`/feed/posts/${postId}/repost`);
  },

  // Get post comments
  async getComments(postId: string, params?: GetFeedParams) {
    const response = await api.get(`/feed/posts/${postId}/comments`, { params });
    return response.data;
  },

  // Create a comment
  async createComment(postId: string, content: string, parentId?: string) {
    const response = await api.post(`/feed/posts/${postId}/comments`, {
      content,
      parentId,
    });
    return response.data;
  },

  // Delete own comment
  async deleteComment(commentId: string) {
    await api.delete(`/feed/comments/${commentId}`);
  },

  // Like a comment
  async likeComment(commentId: string) {
    const response = await api.post(`/feed/comments/${commentId}/like`);
    return response.data;
  },

  // Unlike a comment
  async unlikeComment(commentId: string) {
    await api.delete(`/feed/comments/${commentId}/like`);
  },

  // Follow a user
  async followUser(username: string) {
    const response = await api.post(`/feed/follow/${username}`);
    return response.data;
  },

  // Unfollow a user
  async unfollowUser(username: string) {
    await api.delete(`/feed/follow/${username}`);
  },

  // Get user followers
  async getFollowers(username: string, params?: GetFeedParams) {
    const response = await api.get(`/feed/followers/${username}`, { params });
    return response.data;
  },

  // Get users followed by user
  async getFollowing(username: string, params?: GetFeedParams) {
    const response = await api.get(`/feed/following/${username}`, { params });
    return response.data;
  },
};

export default feedService;
