# Sedā v2 API Client Library

Type-safe API client for the Sedā v2 backend.

## Overview

This library provides a complete, type-safe interface to all Sedā v2 backend endpoints at `/api/v1`.

## Features

- ✅ Type-safe requests and responses
- ✅ Automatic auth token handling
- ✅ Consistent error handling
- ✅ Environment-based API base URL
- ✅ Built-in query string building
- ✅ Cursor-based pagination support

## Usage

### Basic Import

```typescript
import { feedApi, playlistsApi, profilesApi } from '@/lib/api';

// Or import individual types
import type { FeedPost, Playlist, UserProfile } from '@/lib/api';
```

### Examples

#### Social Feed

```typescript
// Get personalized feed
const feed = await feedApi.getFeed({ limit: 20 });

// Create a post
const post = await feedApi.createPost({
  type: 'TEXT',
  content: 'Hello Sedā! 🎵',
});

// Like a post
await feedApi.likePost(post.id);

// Add a comment
const comment = await feedApi.addComment(post.id, {
  content: 'Great post!',
});
```

#### Playlists (Crates)

```typescript
// Create a playlist
const playlist = await playlistsApi.create({
  title: 'My Summer Vibes',
  description: 'Chill tracks for summer',
  isPublic: true,
});

// Add tracks
await playlistsApi.addItem(playlist.id, {
  provider: 'spotify',
  providerTrackId: 'track123',
  title: 'Track Title',
  artist: 'Artist Name',
});

// Get trending playlists
const trending = await playlistsApi.getTrending(10);
```

#### Profiles

```typescript
// Get current user profile
const me = await profilesApi.getMe();

// Get another user's profile
const user = await profilesApi.getByUsername('username');

// Update profile
await profilesApi.update(me.username, {
  displayName: 'New Name',
  bio: 'Updated bio',
});
```

#### Discover

```typescript
// Get trending content
const trending = await discoverApi.getTrending();

// Get personalized recommendations
const forYou = await discoverApi.getForYou();

// Get by genre
const houseTracks = await discoverApi.getByGenre('house');
```

#### Search

```typescript
// Universal search
const results = await searchApi.search({
  q: 'search term',
  type: 'all',
  limit: 20,
});

// Search specific entity
const users = await searchApi.searchUsers('username');
const crates = await searchApi.searchCrates('playlist name');
```

#### Progression

```typescript
// Get current user progression
const progress = await progressionApi.getMe();

// Record daily login
await progressionApi.recordDailyLogin();

// Get another user's progression
const userProgress = await progressionApi.getByUsername('username');
```

#### DJ Sessions

```typescript
// Create a DJ session
const session = await sessionsApi.create({
  roomId: 'room-id',
});

// Add track to queue
await sessionsApi.addToQueue(session.id, {
  trackRef: { ... },
});

// Vote on track
await sessionsApi.vote(session.id, queueItemId, {
  voteType: 'UPVOTE',
});

// Skip track
await sessionsApi.skip(session.id);
```

## Environment Setup

Ensure `NEXT_PUBLIC_API_BASE_URL` is set in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

For production:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.seda.fm/api/v1
```

## Authentication

The HTTP client automatically includes the auth token from localStorage:

```typescript
// Token is automatically added to requests
const feed = await feedApi.getFeed(); // Includes Authorization header
```

To disable auth for specific requests:

```typescript
import { http } from '@/lib/api';

// No auth header
const data = await http.get('/public-endpoint', { auth: false });
```

## Error Handling

All API calls throw `ApiException` on error:

```typescript
import { ApiException } from '@/lib/api';

try {
  const post = await feedApi.createPost(data);
} catch (error) {
  if (error instanceof ApiException) {
    console.error(error.message); // User-friendly message
    console.error(error.statusCode); // HTTP status code
    console.error(error.error); // Error type/code
  }
}
```

## Pagination

Endpoints that support pagination return `PaginatedResponse<T>`:

```typescript
let cursor: string | undefined;
const allPosts: FeedPost[] = [];

do {
  const response = await feedApi.getFeed({ cursor, limit: 20 });
  allPosts.push(...response.data);
  cursor = response.nextCursor;
} while (response.hasMore);
```

## Type Definitions

All types are exported from `types.ts` and match the backend DTOs:

- `FeedPost`, `Comment`, `Follow`
- `Playlist`, `PlaylistItem`
- `UserProfile`, `OnboardingStatus`
- `DJSession`, `QueueItem`, `Vote`
- `UserProgression`, `Badge`, `UserBadge`
- `SearchResults`
- Request DTOs: `CreatePostDto`, `UpdatePlaylistDto`, etc.

## Module Structure

```
lib/api/
├── http.ts              # Shared HTTP client
├── types.ts             # TypeScript type definitions
├── feed.ts              # Social feed API
├── playlists.ts         # Playlists/crates API
├── discover.ts          # Content discovery API
├── profiles.ts          # User profiles API
├── verification.ts      # Artist verification API
├── search.ts            # Universal search API
├── progression.ts       # User progression/XP API
├── sessions.ts          # DJ sessions API
├── index.ts             # Main export
└── README.md            # This file
```

## Migration from Old Code

Replace hardcoded fetch calls:

### Before

```typescript
const response = await fetch('http://localhost:3001/api/v1/feed', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const data = await response.json();
```

### After

```typescript
import { feedApi } from '@/lib/api';

const feed = await feedApi.getFeed();
```

## Notes

- All endpoints use `/api/v1` prefix automatically
- Auth tokens are managed automatically
- Type safety prevents runtime errors
- Consistent error handling across all endpoints
- Follows backend endpoint structure exactly
