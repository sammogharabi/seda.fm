/**
 * TypeScript type definitions for Sedā v2 API
 * Based on backend DTOs and migration spec
 */

// ===== Social Feed Types =====

export interface FeedPost {
  id: string;
  type: 'TEXT' | 'TRACK' | 'CRATE' | 'MEDIA';
  content?: string;
  trackRef?: any;
  crateId?: string;
  mediaUrls?: string[];
  user: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
    likes: number;
    reposts: number;
  };
  hasLiked?: boolean;
  hasReposted?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  user: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  _count?: {
    likes: number;
  };
  hasLiked?: boolean;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

// ===== Playlist & Crate Types =====

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  genre?: string;
  mood?: string;
  tags?: string[];
  playCount?: number;
  owner: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  isPublic: boolean;
  isCollaborative: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
    likes: number;
  };
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  position: number;
  provider: string;
  providerTrackId: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  addedBy: {
    userId: string;
    username: string;
    displayName: string;
  };
  addedAt: string;
}

// ===== Discover Types =====

export interface DiscoverTrack {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  source?: 'trending' | 'new-release' | 'for-you' | 'genre';
}

export interface DiscoverPlaylistSummary {
  id: string;
  title: string;
  coverImageUrl?: string;
  itemsCount: number;
  ownerName: string;
  tag?: string;
}

// ===== Profile Types =====

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
  genres?: string[];
  isPremium?: boolean;
  isVerifiedArtist?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
    comments: number;
    likes: number;
    followers: number;
    following: number;
  };
  // Artist payment setup status
  paymentSetup?: {
    hasStripe: boolean;
    stripeStatus?: string;
    hasPayPal: boolean;
    paypalEmail?: string;
  };
}

export interface OnboardingStatus {
  hasProfile: boolean;
  hasGenres: boolean;
  hasCompletedIntro: boolean;
}

// ===== Verification Types =====

export interface ArtistVerificationRequest {
  id: string;
  userId: string;
  stageName: string;
  bio?: string;
  links: any; // JSON field
  profileImageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'UNDER_REVIEW';
  notes?: string;
  denialReason?: string;
  reviewedByAdminId?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}

// ===== DJ Session Types =====

export interface DJSession {
  id: string;
  roomId?: string;
  hostId: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  nowPlayingRef?: any;
  nowPlayingStart?: string;
  createdAt: string;
  endedAt?: string;
  queue?: QueueItem[];
}

export interface QueueItem {
  id: string;
  sessionId: string;
  trackRef: any;
  addedByUserId: string;
  position: number;
  upvotes: number;
  downvotes: number;
  playedAt?: string;
  addedAt: string;
}

export interface Vote {
  id: string;
  queueItemId: string;
  userId: string;
  voteType: 'UPVOTE' | 'DOWNVOTE';
  createdAt: string;
}

// ===== Progression Types =====

export interface UserProgression {
  id: string;
  userId: string;
  level: number;
  xp: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
  tracksPlayed: number;
  totalListeningTime: number;
  postsCreated: number;
  commentsCreated: number;
  cratesCreated: number;
  artistsDiscovered: number;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  category: 'ACTIVITY' | 'SOCIAL' | 'CURATOR' | 'DISCOVERY' | 'SPECIAL';
  requirementKey: string;
  requirementValue: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: string;
  badge: Badge;
}

// ===== Search Types =====

export interface SearchResults {
  users?: UserProfile[];
  tracks?: any[];
  artists?: any[];
  crates?: Playlist[];
  rooms?: any[];
}

// ===== Pagination Types =====

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface GetFeedDto {
  cursor?: string;
  limit?: number;
}

export interface GetPlaylistItemsDto {
  cursor?: string;
  limit?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// ===== Request DTOs =====

export interface CreatePostDto {
  type: 'TEXT' | 'TRACK' | 'CRATE' | 'MEDIA';
  content?: string;
  trackRef?: any;
  crateId?: string;
  mediaUrls?: string[];
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

export interface CreatePlaylistDto {
  title: string;
  description?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
}

export interface UpdatePlaylistDto {
  title?: string;
  description?: string;
  isPublic?: boolean;
  isCollaborative?: boolean;
}

export interface AddPlaylistItemDto {
  provider: string;
  providerTrackId: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  position?: number;
}

export interface CreateProfileDto {
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  website?: string;
}

export interface SetGenresDto {
  genres: string[];
}

export interface SearchDto {
  q: string;
  type?: 'all' | 'users' | 'tracks' | 'artists' | 'crates' | 'rooms';
  limit?: number;
}

export interface CreateSessionDto {
  roomId?: string;
  sessionName?: string;
  isPrivate?: boolean;
  initialTrack?: any;
  genre: string;
  tags?: string[];
}

export interface AddTrackToQueueDto {
  trackRef: any;
}

export interface VoteDto {
  voteType: 'UPVOTE' | 'DOWNVOTE';
}

// ===== Rooms Types =====

export interface Room {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  genre?: string;
  coverImageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
  memberships?: RoomMembership[];
  _count?: {
    messages: number;
    memberships: number;
  };
}

export interface RoomMembership {
  id: string;
  roomId: string;
  userId: string;
  role: 'MEMBER' | 'ADMIN';
  joinedAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
}

export interface RoomInvite {
  id: string;
  roomId: string;
  inviterId: string;
  inviteeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  createdAt: string;
  expiresAt?: string;
  room: {
    id: string;
    name: string;
    description?: string;
    coverImageUrl?: string;
    _count?: {
      memberships: number;
    };
  };
  inviter: {
    id: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
  invitee?: {
    id: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
}

export interface RoomMessage {
  id: string;
  roomId: string;
  userId: string;
  type: 'TEXT' | 'TRACK' | 'MEDIA';
  text?: string;
  trackRef?: any;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      username: string;
    };
  };
}

export interface CreateRoomDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
  genre?: string;
  coverImageUrl?: string;
}

export interface UpdateRoomDto {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  genre?: string;
  coverImageUrl?: string;
}

export interface SendMessageDto {
  content: string;
}

export interface GetMessagesResponse {
  messages: RoomMessage[];
  nextCursor: string | null;
}

// ===== Direct Messages Types =====

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  lastMessage?: DirectMessage;
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  joinedAt: string;
  lastReadAt?: string;
  user: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  sender: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
  reactions?: DirectMessageReaction[];
}

export interface DirectMessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface StartConversationDto {
  participantId: string;
  initialMessage?: string;
}

export interface SendDirectMessageDto {
  content: string;
}

export interface GetConversationMessagesResponse {
  messages: DirectMessage[];
  nextCursor: string | null;
}

export interface UnreadCountResponse {
  count: number;
}
