// Core domain types for the seda.fm frontend

// ============================================
// User & Profile Types
// ============================================

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface ArtistProfile extends UserProfile {
  artistName: string;
  verified: boolean;
  followerCount?: number;
  monthlyListeners?: number;
  genres?: string[];
  socialLinks?: Record<string, string>;
}

export interface FanProfile extends UserProfile {
  totalPlays?: number;
  totalPurchases?: number;
  totalSpent?: number;
  favoriteGenres?: string[];
}

// ============================================
// Track & Music Types
// ============================================

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  duration?: number;
  artwork?: string;
  audioUrl?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  releaseDate?: string;
  playCount?: number;
  likeCount?: number;
}

export interface NowPlayingTrack extends Track {
  addedBy?: string;
  addedAt?: string;
  position?: number;
}

// ============================================
// DJ Session Types
// ============================================

export interface DJSession {
  id: string;
  roomId?: string;
  hostId: string;
  hostUsername?: string;
  status: 'active' | 'paused' | 'ended';
  activeListeners: number;
  isActive: boolean;
  nowPlaying?: NowPlayingTrack;
  queueLength: number;
  createdAt?: string;
  startedAt?: string;
}

export interface DJSessionConfig {
  roomId?: string;
  name?: string;
  isPublic?: boolean;
  allowRequests?: boolean;
  maxQueueSize?: number;
}

// ============================================
// Room Types
// ============================================

export interface Room {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isActive: boolean;
  unreadCount?: number;
  type: 'genre' | 'artist' | 'custom';
  region?: string;
  tags?: string[];
  isArtist?: boolean;
  isVerified?: boolean;
  pinnedTrack?: Track;
  session?: DJSession;
  ownerId?: string;
  createdAt?: string;
}

// ============================================
// Post & Feed Types
// ============================================

export interface Post {
  id: string;
  authorId: string;
  author?: UserProfile | ArtistProfile;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  track?: Track;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: UserProfile;
  content: string;
  likeCount: number;
  isLiked?: boolean;
  createdAt: string;
}

// ============================================
// Search Types
// ============================================

export interface SearchResults {
  users?: UserProfile[];
  tracks?: Track[];
  artists?: ArtistProfile[];
  crates?: Crate[];
  rooms?: Room[];
}

export type SearchType = 'all' | 'users' | 'tracks' | 'artists' | 'crates' | 'rooms';

// ============================================
// Crate (Playlist) Types
// ============================================

export interface Crate {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  ownerId: string;
  owner?: UserProfile;
  trackCount: number;
  tracks?: Track[];
  isPublic: boolean;
  followerCount?: number;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// Message Types
// ============================================

export interface Message {
  id: string;
  conversationId?: string;
  roomId?: string;
  senderId: string;
  sender?: UserProfile;
  content: string;
  reactions?: MessageReaction[];
  createdAt: string;
  updatedAt?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted?: boolean;
}

export interface Conversation {
  id: string;
  participants: UserProfile[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// Socket Response Types
// ============================================

export interface SocketResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface JoinRoomResponse {
  success?: boolean;
  error?: string;
  roomId?: string;
  users?: UserProfile[];
}

export interface OnlineUsersResponse {
  roomId: string;
  onlineCount: number;
  users: UserProfile[];
}

// ============================================
// API Error Types
// ============================================

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  requestId?: string;
}

// ============================================
// Date Range Type (for analytics)
// ============================================

export interface DateRange {
  from: Date;
  to: Date;
}
