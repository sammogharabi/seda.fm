import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ accessToken: string; admin: AdminUser }>('/admin-auth/login', {
      email,
      password,
    });
    // Map response to expected format
    return {
      access_token: response.data.accessToken,
      user: response.data.admin,
    };
  },
  getMe: async () => {
    const response = await api.get<AdminUser>('/admin-auth/me');
    return response.data;
  },
};

// Moderation endpoints - Users
export const moderationApi = {
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await api.get<DashboardStats>('/admin/moderation/stats');
    return response.data;
  },

  // Users
  listUsers: async (params?: { limit?: number; offset?: number; search?: string }) => {
    const response = await api.get<UsersListResponse>('/admin/moderation/users', { params });
    return response.data;
  },
  getUserDetails: async (id: string) => {
    const response = await api.get<UserDetails>(`/admin/moderation/users/${id}`);
    return response.data;
  },
  deactivateUser: async (id: string, reason?: string) => {
    const response = await api.patch(`/admin/moderation/users/${id}/deactivate`, { reason });
    return response.data;
  },
  reactivateUser: async (id: string) => {
    const response = await api.patch(`/admin/moderation/users/${id}/reactivate`);
    return response.data;
  },

  // Comments
  listComments: async (params?: { limit?: number; offset?: number; search?: string }) => {
    const response = await api.get<CommentsListResponse>('/admin/moderation/comments', { params });
    return response.data;
  },
  deleteComment: async (id: string) => {
    const response = await api.delete(`/admin/moderation/comments/${id}`);
    return response.data;
  },

  // Messages
  listMessages: async (params?: { limit?: number; offset?: number; roomId?: string; search?: string }) => {
    const response = await api.get<MessagesListResponse>('/admin/moderation/messages', { params });
    return response.data;
  },
  deleteMessage: async (id: string) => {
    const response = await api.delete(`/admin/moderation/messages/${id}`);
    return response.data;
  },

  // Rooms
  listRooms: async (params?: { limit?: number; offset?: number; search?: string }) => {
    const response = await api.get<RoomsListResponse>('/admin/moderation/rooms', { params });
    return response.data;
  },
  deleteRoom: async (id: string) => {
    const response = await api.delete(`/admin/moderation/rooms/${id}`);
    return response.data;
  },

  // Playlists (Crates)
  listPlaylists: async (params?: { limit?: number; offset?: number; search?: string }) => {
    const response = await api.get<PlaylistsListResponse>('/admin/moderation/playlists', { params });
    return response.data;
  },
  deletePlaylist: async (id: string) => {
    const response = await api.delete(`/admin/moderation/playlists/${id}`);
    return response.data;
  },

  // Purchases
  listPurchases: async (params?: { limit?: number; offset?: number; status?: PurchaseStatus }) => {
    const response = await api.get<PurchasesListResponse>('/admin/moderation/purchases', { params });
    return response.data;
  },
  refundPurchase: async (id: string, reason?: string) => {
    const response = await api.patch(`/admin/moderation/purchases/${id}/refund`, { reason });
    return response.data;
  },
};

// Analytics endpoints
export const analyticsApi = {
  // Overview
  getOverview: async () => {
    const response = await api.get<AnalyticsOverview>('/admin/analytics/overview');
    return response.data;
  },

  // User analytics
  getUserGrowth: async (days = 30) => {
    const response = await api.get<TimeSeriesData[]>('/admin/analytics/users/growth', { params: { days } });
    return response.data;
  },
  getUsersByRole: async () => {
    const response = await api.get<UsersByRole>('/admin/analytics/users/by-role');
    return response.data;
  },
  getActiveUsers: async (days = 7) => {
    const response = await api.get<ActiveUsersResponse>('/admin/analytics/users/active', { params: { days } });
    return response.data;
  },

  // Content analytics
  getRoomsGrowth: async (days = 30) => {
    const response = await api.get<TimeSeriesData[]>('/admin/analytics/content/rooms/growth', { params: { days } });
    return response.data;
  },
  getPlaylistsGrowth: async (days = 30) => {
    const response = await api.get<TimeSeriesData[]>('/admin/analytics/content/playlists/growth', { params: { days } });
    return response.data;
  },
  getMessagesGrowth: async (days = 30) => {
    const response = await api.get<TimeSeriesData[]>('/admin/analytics/content/messages/growth', { params: { days } });
    return response.data;
  },
  getTopRooms: async (limit = 10) => {
    const response = await api.get<TopItem[]>('/admin/analytics/content/top-rooms', { params: { limit } });
    return response.data;
  },
  getTopPlaylists: async (limit = 10) => {
    const response = await api.get<TopItem[]>('/admin/analytics/content/top-playlists', { params: { limit } });
    return response.data;
  },

  // Revenue analytics
  getRevenueTimeSeries: async (days = 30) => {
    const response = await api.get<TimeSeriesData[]>('/admin/analytics/revenue/time-series', { params: { days } });
    return response.data;
  },
  getRevenueByProductType: async () => {
    const response = await api.get<RevenueByType[]>('/admin/analytics/revenue/by-product-type');
    return response.data;
  },
  getTopProducts: async (limit = 10) => {
    const response = await api.get<TopItem[]>('/admin/analytics/revenue/top-products', { params: { limit } });
    return response.data;
  },

  // Engagement analytics
  getEngagement: async (days = 7) => {
    const response = await api.get<EngagementMetrics>('/admin/analytics/engagement', { params: { days } });
    return response.data;
  },

  // Artist analytics
  getTopArtists: async (limit = 10) => {
    const response = await api.get<TopItem[]>('/admin/analytics/artists/top', { params: { limit } });
    return response.data;
  },
  getVerificationStats: async () => {
    const response = await api.get<VerificationStats>('/admin/analytics/verification/stats');
    return response.data;
  },
};

// Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';

// Dashboard Stats
export interface DashboardStats {
  users: {
    total: number;
    newThisMonth: number;
  };
  content: {
    comments: number;
    messages: number;
    rooms: number;
    playlists: number;
  };
  purchases: {
    total: number;
    completed: number;
    pending: number;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ARTIST' | 'ADMIN' | 'SUPER_ADMIN';
  mutedUntil: string | null;
  createdAt: string;
  profile?: {
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface UserPost {
  id: string;
  type: string;
  content: string | null;
  createdAt: string;
  _count: {
    comments: number;
    likes: number;
  };
}

export interface UserComment {
  id: string;
  content: string;
  createdAt: string;
  post: {
    id: string;
    type: string;
    content: string | null;
  };
}

export interface UserMessage {
  id: string;
  text: string;
  createdAt: string;
  room: {
    id: string;
    name: string;
  };
}

export interface UserPurchase {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: {
    id: string;
    title: string;
    type: string;
  };
}

export interface UserDetails extends User {
  artistProfile?: {
    artistName: string;
    verified: boolean;
  };
  profile?: User['profile'] & {
    posts: UserPost[];
    comments: UserComment[];
  };
  messages: UserMessage[];
  purchases: UserPurchase[];
  _count: {
    messages: number;
    purchases: number;
    rooms: number;
    posts: number;
    comments: number;
  };
}

export interface UsersListResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  deletedAt: string | null;
  user: {
    userId: string;
    username: string;
    displayName: string | null;
  };
  post: {
    id: string;
    type: string;
  };
}

export interface CommentsListResponse {
  comments: Comment[];
  total: number;
  limit: number;
  offset: number;
}

// Message types
export interface Message {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName: string | null;
    };
  };
  room: {
    id: string;
    name: string;
  };
}

export interface MessagesListResponse {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
}

// Room types
export interface Room {
  id: string;
  name: string;
  description: string | null;
  genre: string | null;
  createdAt: string;
  creator: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName: string | null;
    };
  };
  _count: {
    memberships: number;
    messages: number;
  };
}

export interface RoomsListResponse {
  rooms: Room[];
  total: number;
  limit: number;
  offset: number;
}

// Playlist types
export interface Playlist {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  isPublic: boolean;
  createdAt: string;
  owner: {
    userId: string;
    username: string;
    displayName: string | null;
  };
  _count: {
    items: number;
  };
}

export interface PlaylistsListResponse {
  playlists: Playlist[];
  total: number;
  limit: number;
  offset: number;
}

// Purchase types
export interface Purchase {
  id: string;
  amount: number;
  status: PurchaseStatus;
  createdAt: string;
  buyer: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName: string | null;
    };
  };
  product: {
    id: string;
    title: string;
    price: number;
    type: string;
  };
}

export interface PurchasesListResponse {
  purchases: Purchase[];
  total: number;
  limit: number;
  offset: number;
}

// Analytics types
export interface AnalyticsOverview {
  users: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    artists: number;
    growthToday: number;
  };
  content: {
    rooms: { total: number; today: number };
    playlists: { total: number; today: number };
    messages: { total: number; today: number };
    comments: { total: number; today: number };
  };
  revenue: {
    totalPurchases: number;
    purchasesToday: number;
    completedPurchases: number;
    conversionRate: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface TopItem {
  id: string;
  name: string;
  count: number;
  metadata?: Record<string, unknown>;
}

export interface UsersByRole {
  USER: number;
  ARTIST: number;
  ADMIN: number;
  SUPER_ADMIN: number;
}

export interface ActiveUsersResponse {
  count: number;
  period: string;
  since: string;
}

export interface RevenueByType {
  type: string;
  amount: number;
}

export interface EngagementMetrics {
  period: string;
  since: string;
  metrics: {
    messages: number;
    comments: number;
    likes: number;
    reposts: number;
    follows: number;
    total: number;
  };
}

export interface VerificationStats {
  pending: number;
  crawling: number;
  awaitingAdmin: number;
  approved: number;
  denied: number;
  expired: number;
  total: number;
}
