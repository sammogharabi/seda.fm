# API_CONTRACTS.md - Phase 2 API Specifications

## Wave A: Artist Profiles & Playlists

### Profile Endpoints

#### Get Profile
```typescript
GET /api/v1/profiles/:username
Headers: { Authorization?: 'Bearer ${token}' } // Optional for public profiles

Response: {
  id: string
  username: string
  displayName: string
  bio: string
  avatar?: string
  coverImage?: string
  isArtist: boolean
  verified: boolean
  djPoints: number
  joinedAt: Date
  
  // Artist-specific fields
  artistProfile?: {
    discography: Track[]
    genres: string[]
    links: {
      spotify?: string
      apple?: string
      bandcamp?: string
      website?: string
    }
    monthlyListeners: number
  }
  
  // Stats
  stats: {
    followers: number
    following: number
    playlistCount: number
    badgeCount: number
  }
  
  // Relationships (if authenticated)
  isFollowing?: boolean
  isFollowedBy?: boolean
}

// #COMPLETION_DRIVE: DJ Points structure placeholder
// #SUGGEST_VERIFY: Finalize points calculation with product
```

#### Update Profile
```typescript
PATCH /api/v1/profiles
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  displayName?: string
  bio?: string // Max 500 chars
  avatar?: string // Base64 or URL
  coverImage?: string
  links?: {
    spotify?: string
    apple?: string
    bandcamp?: string
    website?: string
  }
}

Response: Profile // Same as GET
```

#### Get Profile Playlists
```typescript
GET /api/v1/profiles/:username/playlists
Headers: { Authorization?: 'Bearer ${token}' }
Query: {
  limit?: number // Default 20
  offset?: number
  sort?: 'recent' | 'popular' | 'alphabetical'
}

Response: {
  playlists: Playlist[]
  total: number
  hasMore: boolean
}
```

### Playlist Endpoints

#### Create Playlist
```typescript
POST /api/v1/playlists
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  name: string // Required, max 100 chars
  description?: string // Max 500 chars
  isPublic: boolean // Default true
  isCollaborative: boolean // Default false
  coverImage?: string
}

Response: {
  id: string
  name: string
  description: string
  ownerId: string
  ownerUsername: string
  isPublic: boolean
  isCollaborative: boolean
  coverImage?: string
  itemCount: 0
  duration: 0
  createdAt: Date
  updatedAt: Date
}
```

#### Get Playlist
```typescript
GET /api/v1/playlists/:playlistId
Headers: { Authorization?: 'Bearer ${token}' }

Response: {
  id: string
  name: string
  description: string
  ownerId: string
  ownerUsername: string
  isPublic: boolean
  isCollaborative: boolean
  coverImage?: string
  itemCount: number
  duration: number // Total seconds
  followers: number
  
  // Items with pagination
  items: PlaylistItem[]
  hasMoreItems: boolean
  
  // Collaborators
  collaborators: {
    id: string
    username: string
    avatar?: string
    addedItemsCount: number
  }[]
  
  // User relationship
  isFollowing?: boolean
  canEdit?: boolean // Owner or collaborator
  
  createdAt: Date
  updatedAt: Date
}
```

#### Add Items to Playlist
```typescript
POST /api/v1/playlists/:playlistId/items
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  items: Array<{
    provider: 'spotify' | 'apple' | 'youtube' | 'soundcloud'
    trackId: string
    metadata: {
      title: string
      artist: string
      album?: string
      duration: number // Seconds
      albumArt?: string
      previewUrl?: string
    }
    position?: number // If omitted, append to end
  }>
}

Response: {
  added: PlaylistItem[]
  failed: Array<{
    trackId: string
    reason: string
  }>
}

// #COMPLETION_DRIVE: Assuming we store metadata locally
// #SUGGEST_VERIFY: Decide on provider API integration strategy
```

#### Remove Items from Playlist
```typescript
DELETE /api/v1/playlists/:playlistId/items
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  itemIds: string[] // Playlist item IDs, not track IDs
}

Response: {
  removed: string[]
  failed: Array<{
    itemId: string
    reason: string
  }>
}
```

#### Reorder Playlist Items
```typescript
PATCH /api/v1/playlists/:playlistId/items/reorder
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  itemId: string
  newPosition: number
}

Response: {
  items: PlaylistItem[] // Updated order
}
```

#### Manage Collaborators
```typescript
// Add collaborator
POST /api/v1/playlists/:playlistId/collaborators
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  username: string // Or userId
}

Response: {
  collaborator: {
    id: string
    username: string
    avatar?: string
    addedAt: Date
  }
}

// Remove collaborator
DELETE /api/v1/playlists/:playlistId/collaborators/:userId
Headers: { Authorization: 'Bearer ${token}' }

Response: { success: boolean }
```

#### Follow/Unfollow Playlist
```typescript
POST /api/v1/playlists/:playlistId/follow
Headers: { Authorization: 'Bearer ${token}' }

Response: { following: true }

DELETE /api/v1/playlists/:playlistId/follow
Headers: { Authorization: 'Bearer ${token}' }

Response: { following: false }
```

## Wave B: Social Features, Leaderboards & Trophies

### Social Endpoints

#### Follow/Unfollow User
```typescript
POST /api/v1/users/:userId/follow
Headers: { Authorization: 'Bearer ${token}' }

Response: {
  following: true
  followersCount: number
}

DELETE /api/v1/users/:userId/follow
Headers: { Authorization: 'Bearer ${token}' }

Response: {
  following: false
  followersCount: number
}
```

#### Get Followers/Following
```typescript
GET /api/v1/users/:userId/followers
GET /api/v1/users/:userId/following
Headers: { Authorization?: 'Bearer ${token}' }
Query: {
  limit?: number // Default 50
  cursor?: string // For pagination
}

Response: {
  users: Array<{
    id: string
    username: string
    displayName: string
    avatar?: string
    isArtist: boolean
    verified: boolean
    isFollowing?: boolean // If authenticated
  }>
  nextCursor?: string
  hasMore: boolean
}
```

#### Like/Unlike Content
```typescript
// Like a playlist/track/message
POST /api/v1/likes
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  targetType: 'playlist' | 'track' | 'message'
  targetId: string
}

Response: {
  liked: true
  likesCount: number
}

// Unlike
DELETE /api/v1/likes/:targetType/:targetId
Headers: { Authorization: 'Bearer ${token}' }

Response: {
  liked: false
  likesCount: number
}
```

### Leaderboard Endpoints

#### Global Leaderboard
```typescript
GET /api/v1/leaderboards/global
Headers: { Authorization?: 'Bearer ${token}' }
Query: {
  timeframe?: 'all' | 'monthly' | 'weekly' | 'daily'
  limit?: number // Default 100
  offset?: number
}

Response: {
  timeframe: string
  updatedAt: Date
  leaderboard: Array<{
    rank: number
    userId: string
    username: string
    displayName: string
    avatar?: string
    djPoints: number
    tier: 'crown' | 'gold' | 'silver' | 'bronze' | 'fire' | 'music'
    change: number // Position change from previous period
    isCurrentUser?: boolean
  }>
  currentUserRank?: {
    rank: number
    djPoints: number
    tier: string
  }
}

// Tier mapping:
// 👑 Crown: #1
// 🥇 Gold: #2-3
// 🥈 Silver: #4-10
// 🥉 Bronze: #11-25
// 🔥 Fire: #26-50
// 🎶 Music: #51+
```

#### Genre Leaderboard
```typescript
GET /api/v1/leaderboards/genre/:genreId
Headers: { Authorization?: 'Bearer ${token}' }
Query: // Same as global

Response: // Same structure as global
```

#### Channel Leaderboard
```typescript
GET /api/v1/leaderboards/channel/:channelId
Headers: { Authorization?: 'Bearer ${token}' }
Query: // Same as global

Response: // Same structure as global
```

#### Artist Fan Leaderboard
```typescript
GET /api/v1/leaderboards/artist/:artistId
Headers: { Authorization?: 'Bearer ${token}' }
Query: {
  limit?: number // Default 50
}

Response: {
  artistId: string
  artistName: string
  leaderboard: Array<{
    rank: number
    userId: string
    username: string
    avatar?: string
    contributionPoints: number // Artist-specific points
    tracksPlayed: number
    playlistsCreated: number
  }>
}
```

### Trophy/Badge Endpoints

#### Get User Badges
```typescript
GET /api/v1/users/:userId/badges
Headers: { Authorization?: 'Bearer ${token}' }

Response: {
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string // URL or emoji
    tier: 'legendary' | 'epic' | 'rare' | 'common'
    category: 'dj' | 'social' | 'artist' | 'seasonal'
    earnedAt: Date
    progress?: {
      current: number
      required: number
      percentage: number
    }
  }>
  totalBadges: number
  showcaseBadges: string[] // IDs of badges to highlight
}
```

#### Get Available Badges
```typescript
GET /api/v1/badges
Headers: { Authorization?: 'Bearer ${token}' }
Query: {
  category?: 'dj' | 'social' | 'artist' | 'seasonal'
  earned?: boolean
}

Response: {
  badges: Array<{
    id: string
    name: string
    description: string
    icon: string
    tier: string
    category: string
    requirements: string // Human-readable
    // If authenticated, include progress
    progress?: {
      current: number
      required: number
      percentage: number
      earned: boolean
      earnedAt?: Date
    }
  }>
}

// Example badges:
// - "First DJ" - Play your first track in DJ Mode
// - "Crowd Favorite" - Get 50+ upvotes on a single track
// - "Tastemaker" - Create 5 public playlists
// - "Super Fan" - Top 10 on an artist's leaderboard
// - "Genre Master" - Top 10 in a genre leaderboard
```

#### Update Showcase Badges
```typescript
PATCH /api/v1/users/badges/showcase
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  badgeIds: string[] // Max 3-5 badges to showcase
}

Response: {
  showcaseBadges: string[]
}
```

## Database Schema Updates

```sql
-- Wave A: Profiles & Playlists
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  username VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  dj_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlists (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT true,
  is_collaborative BOOLEAN DEFAULT false,
  cover_image_url TEXT,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlist_items (
  id UUID PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  provider VARCHAR(50),
  track_id VARCHAR(255),
  metadata JSONB, -- Store track details
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlist_collaborators (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  added_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (playlist_id, user_id)
);

-- Wave B: Social & Gamification
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE likes (
  user_id UUID REFERENCES users(id),
  target_type VARCHAR(50), -- 'playlist', 'track', 'message'
  target_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY,
  type VARCHAR(50), -- 'global', 'genre', 'channel', 'artist'
  scope_id VARCHAR(255), -- NULL for global, otherwise genre/channel/artist ID
  timeframe VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'all'
  data JSONB, -- Cached leaderboard data
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id),
  badge_id VARCHAR(100),
  earned_at TIMESTAMP DEFAULT NOW(),
  progress JSONB,
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE badge_definitions (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  icon TEXT,
  tier VARCHAR(50),
  category VARCHAR(50),
  requirements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Rate Limits & Pagination

### Rate Limits
- Profile updates: 10/hour
- Playlist creation: 20/day
- Playlist modifications: 100/hour
- Follow/unfollow: 50/hour
- Likes: 100/hour
- Leaderboard queries: 60/minute

### Pagination Strategies
- **Cursor-based**: Followers, following, feed
- **Offset-based**: Playlists, leaderboard
- **Infinite scroll**: Messages, playlist items
- **Load more**: Comments, reactions

## Error Codes

```typescript
enum ErrorCode {
  // Profiles
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  INVALID_USERNAME = 'INVALID_USERNAME',
  
  // Playlists
  PLAYLIST_NOT_FOUND = 'PLAYLIST_NOT_FOUND',
  PLAYLIST_PRIVATE = 'PLAYLIST_PRIVATE',
  NOT_PLAYLIST_OWNER = 'NOT_PLAYLIST_OWNER',
  NOT_COLLABORATOR = 'NOT_COLLABORATOR',
  DUPLICATE_TRACK = 'DUPLICATE_TRACK',
  
  // Social
  ALREADY_FOLLOWING = 'ALREADY_FOLLOWING',
  NOT_FOLLOWING = 'NOT_FOLLOWING',
  CANNOT_FOLLOW_SELF = 'CANNOT_FOLLOW_SELF',
  
  // Leaderboards
  INVALID_TIMEFRAME = 'INVALID_TIMEFRAME',
  LEADERBOARD_NOT_AVAILABLE = 'LEADERBOARD_NOT_AVAILABLE',
  
  // Badges
  BADGE_NOT_FOUND = 'BADGE_NOT_FOUND',
  BADGE_ALREADY_EARNED = 'BADGE_ALREADY_EARNED',
  INVALID_SHOWCASE = 'INVALID_SHOWCASE'
}
```