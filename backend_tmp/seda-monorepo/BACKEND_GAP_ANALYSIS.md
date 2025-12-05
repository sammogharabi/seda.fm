# Backend Gap Analysis: seda.fm v2 Features

**Generated:** 2025-11-08
**Repository:** seda-auth-service (NestJS + Prisma + Supabase)

---

## Executive Summary

This document analyzes the current backend implementation against v2 product specifications defined in the PRD documents. It identifies which features have full/partial/missing backend support and proposes additive, backward-compatible solutions to fill gaps.

**Current Backend Status:**
- ✅ **Implemented:** User authentication, Artist verification, Profiles (Wave A), Playlists (Wave A), Basic chat models
- ⚠️ **Partial:** Rooms (models exist, no controllers), Admin dashboard (verification only)
- ❌ **Missing:** DJ Mode/Sessions, Progression System, Social (follows/likes), Marketplace, Leaderboards, Badges, Newsfeed, Recommendations, Search

---

## Gap Analysis Table

| Feature | Spec Doc | Backend Status | Code References | Notes |
|---------|----------|----------------|-----------------|-------|
| **Auth & User Management** | sedfm-high-level-product-overview | ✅ Implemented | `User` model (schema:39)<br/>`user.module.ts` | Supabase auth integration complete |
| **Artist Verification** | artist-verification-flow, prd-admin-dashboard | ✅ Implemented | `VerificationRequest` (schema:85)<br/>`verification.controller.ts`<br/>`admin.controller.ts` | Full flow: request → crawl → admin review |
| **Artist Profiles** | prd-artist-profiles-mvp | ✅ Implemented | `ArtistProfile` (schema:64)<br/>Includes verification, URLs | Basic artist profile complete |
| **Fan Profiles** | prd-fan-profiles-mvp | ✅ Implemented | `Profile` (schema:239)<br/>`profiles.controller.ts` | Onboarding genres support added |
| **Playlists** | prd-playlists-overview, prd-fan-playlists-mvp | ✅ Implemented | `Playlist`, `PlaylistItem`, `PlaylistCollaborator` (schema:265-316)<br/>`playlists.controller.ts` | Collaborative playlists, cursor pagination |
| **Rooms (Basic)** | prd-rooms-mvp | ⚠️ **Partial** | `Room`, `RoomMembership` (schema:145-176) | Models exist but NO controllers/services.<br/>Missing: room creation, join/leave, discovery, pinned tracks, moderation |
| **Chat/Messages** | prd-chat-mvp, prd-rooms-mvp | ⚠️ **Partial** | `Message`, `Reaction` (schema:178-217)<br/>`TrackRef` (schema:219) | Models exist, ChatModule commented out in app.module.ts:10.<br/>Missing: WebSocket implementation, real-time sync |
| **DJ Mode (Fan)** | prd-fan-dj-mode-mvp | ❌ **Missing** | None | No models for DJ sessions, rotation, queue, skip voting |
| **DJ Mode (Artist)** | prd-artist-dj-mode-mvp | ❌ **Missing** | None | No artist-specific DJ session models |
| **Progression System** | prd-dj-points-progression-system | ❌ **Missing** | None | No models for DJ points, levels, XP, credits wallet |
| **Social (Follows/Likes)** | prd-social-follows-likes-mvp | ❌ **Missing** | None | No models for follows or likes on any entities |
| **Leaderboards** | prd-leaderboards | ❌ **Missing** | None | No models for global/genre/seasonal leaderboards |
| **Badges & Trophy Case** | prd-badges-trophy-case | ❌ **Missing** | None | No badge models or trophy case |
| **Marketplace (Merch/Concerts/Tracks)** | prd-artist-marketplace-high-level | ❌ **Missing** | None | No models for merch, concert tickets, track sales |
| **Chronological Newsfeed** | prd-chronological-newsfeed-rooms-activity | ❌ **Missing** | None | No feed event models or reactions |
| **Recommendation Engine** | prd-recommendation-engine | ❌ **Missing** | None | No models for linked accounts, recommendations, embeddings (pgvector not configured) |
| **Global Search** | sedfm-high-level-product-overview | ❌ **Missing** | None | No search endpoints for rooms/artists/playlists |
| **Mini Player** | sedfm-high-level-product-overview | N/A | Frontend only | Backend tracks via TrackRef |
| **Comments & History** | Inferred from chat PRD | ⚠️ **Partial** | `Message` supports replies via `parentId` | Missing: comment-specific endpoints, comment history views |
| **Moderation** | prd-moderation-dashboard, prd-safety-trust | ⚠️ **Partial** | `ModerationLog` (schema:318) | Model exists but no moderation controllers/services beyond verification |
| **Notifications** | prd-notification-center-mvp | ⚠️ **Partial** | `notification.service.ts` exists | Service file exists but likely incomplete, no Notification model |
| **Third-Party Music** | prd-third-party-music-integrations | ⚠️ **Partial** | `TrackRef` model supports multiple providers | No OAuth integrations for Spotify/Apple |

---

## Design Proposals for Missing/Partial Features

### 1. DJ Mode & Sessions (HIGH PRIORITY)

**Status:** ❌ Missing
**PRDs:** prd-fan-dj-mode-mvp, prd-artist-dj-mode-mvp, prd-rooms-dj-sessions

#### Proposed Prisma Models

```prisma
enum DJSessionMode {
  FAN        // Fan rotation DJ mode
  ARTIST     // Artist-led DJ session
  PUBLIC     // Public voting queue
}

enum QueueItemStatus {
  QUEUED
  PLAYING
  COMPLETED
  SKIPPED
}

model DJSession {
  id            String         @id @default(uuid())
  roomId        String         @map("room_id")
  mode          DJSessionMode
  active        Boolean        @default(true)
  startedAt     DateTime       @default(now()) @map("started_at")
  endedAt       DateTime?      @map("ended_at")
  startedBy     String         @map("started_by")

  room          Room           @relation(fields: [roomId], references: [id], onDelete: Cascade)
  rotationSlots DJRotationSlot[]
  queueItems    QueueItem[]

  @@index([roomId, active])
  @@index([startedAt])
  @@map("dj_sessions")
}

model DJRotationSlot {
  id          String    @id @default(uuid())
  sessionId   String    @map("session_id")
  userId      String    @map("user_id")
  position    Int       // Order in rotation
  activeTurn  Boolean   @default(false) @map("active_turn")
  turnCount   Int       @default(0) @map("turn_count")
  joinedAt    DateTime  @default(now()) @map("joined_at")

  session     DJSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@unique([sessionId, userId])
  @@index([sessionId, position])
  @@map("dj_rotation_slots")
}

model QueueItem {
  id              String           @id @default(uuid())
  sessionId       String           @map("session_id")
  trackRefId      String           @map("track_ref_id")
  addedBy         String           @map("added_by")
  position        Int
  status          QueueItemStatus  @default(QUEUED)
  votesUp         Int              @default(0) @map("votes_up")
  votesDown       Int              @default(0) @map("votes_down")
  voterIds        String[]         @default([]) @map("voter_ids")  // For skip voting
  playedAt        DateTime?        @map("played_at")
  completedAt     DateTime?        @map("completed_at")
  createdAt       DateTime         @default(now()) @map("created_at")

  session         DJSession        @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  trackRef        TrackRef         @relation(fields: [trackRefId], references: [id])

  @@index([sessionId, position])
  @@index([status])
  @@map("queue_items")
}

// Add relation to Room model
model Room {
  // ... existing fields
  djSessions  DJSession[]
}

// Add relation to TrackRef model
model TrackRef {
  // ... existing fields
  queueItems  QueueItem[]
}
```

#### Proposed NestJS Module Structure

```
src/modules/dj/
├── dj.module.ts
├── dj.controller.ts
├── dj.service.ts
├── dto/
│   ├── start-session.dto.ts
│   ├── join-rotation.dto.ts
│   ├── add-to-queue.dto.ts
│   └── vote-skip.dto.ts
├── events/
│   ├── dj.gateway.ts          // WebSocket gateway
│   └── dj-events.service.ts
└── tests/
    └── dj.service.spec.ts
```

#### REST Endpoints

```typescript
// DJ Session Management
POST   /api/v1/rooms/:roomId/dj/start        // Start DJ session
POST   /api/v1/rooms/:roomId/dj/stop         // End DJ session
GET    /api/v1/rooms/:roomId/dj              // Get active DJ session
GET    /api/v1/dj/sessions/:sessionId        // Get session details

// Fan DJ Rotation
POST   /api/v1/dj/sessions/:sessionId/rotation/join    // Join rotation
DELETE /api/v1/dj/sessions/:sessionId/rotation/leave   // Leave rotation
POST   /api/v1/dj/sessions/:sessionId/rotation/advance // Advance turn (system)

// Queue Management
POST   /api/v1/dj/sessions/:sessionId/queue            // Add track to queue
GET    /api/v1/dj/sessions/:sessionId/queue            // Get queue
DELETE /api/v1/dj/sessions/:sessionId/queue/:itemId    // Remove from queue

// Voting
POST   /api/v1/dj/queue/:itemId/vote                   // Vote up/down/skip
```

#### Auth Rules

- **Start Session:** Room owner or moderator
- **Join Rotation:** Any room member (if Fan mode)
- **Add to Queue:** Current DJ turn (Fan mode) or session host (Artist mode)
- **Vote:** Any active listener in room
- **Stop Session:** Session starter, room owner, or moderator

---

### 2. Progression System (XP, Levels, Credits) (HIGH PRIORITY)

**Status:** ❌ Missing
**PRDs:** prd-dj-points-progression-system

#### Proposed Prisma Models

```prisma
model UserProgression {
  id              String    @id @default(uuid())
  userId          String    @unique @map("user_id")
  totalPoints     Int       @default(0) @map("total_points")
  currentLevel    Int       @default(1) @map("current_level")
  seasonalPoints  Int       @default(0) @map("seasonal_points")
  creditsBalance  Int       @default(0) @map("credits_balance")  // 100 credits = 1mo Premium
  lastLevelUpAt   DateTime? @map("last_level_up_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  pointHistory    PointTransaction[]
  creditHistory   CreditTransaction[]

  @@index([totalPoints])
  @@index([seasonalPoints])
  @@map("user_progressions")
}

enum PointEventType {
  TRACK_PLAYED
  UPVOTE_RECEIVED
  DOWNVOTE_RECEIVED
  PLAYLIST_ADD
  LEVEL_UP_BONUS
}

model PointTransaction {
  id              String         @id @default(uuid())
  userId          String         @map("user_id")
  eventType       PointEventType @map("event_type")
  points          Int            // Can be negative
  sourceId        String?        @map("source_id")  // Track/Session/Queue item ID
  metadata        Json?
  createdAt       DateTime       @default(now()) @map("created_at")

  userProgression UserProgression @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([eventType])
  @@map("point_transactions")
}

enum CreditTransactionType {
  EARNED_LEVEL_UP
  EARNED_SEASONAL
  REDEEMED_PREMIUM
  EXPIRED
  ADMIN_ADJUSTMENT
}

model CreditTransaction {
  id              String                @id @default(uuid())
  userId          String                @map("user_id")
  type            CreditTransactionType
  credits         Int                   // Can be negative for redemptions
  description     String?
  metadata        Json?
  createdAt       DateTime              @default(now()) @map("created_at")

  userProgression UserProgression       @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@index([userId, createdAt])
  @@map("credit_transactions")
}

// Add relation to User model
model User {
  // ... existing fields
  progression  UserProgression?
}
```

#### Proposed Module Structure

```
src/modules/progression/
├── progression.module.ts
├── progression.controller.ts
├── progression.service.ts
├── points.service.ts
├── credits.service.ts
├── dto/
│   ├── award-points.dto.ts
│   └── redeem-credits.dto.ts
└── tests/
```

#### REST Endpoints

```typescript
GET    /api/v1/progression/me              // My progression stats
GET    /api/v1/progression/:userId         // User progression (public)
GET    /api/v1/progression/me/points       // Point history
GET    /api/v1/progression/me/credits      // Credit balance & history
POST   /api/v1/progression/credits/redeem  // Redeem credits for Premium
```

---

### 3. Social Layer (Follows & Likes) (HIGH PRIORITY)

**Status:** ❌ Missing
**PRDs:** prd-social-follows-likes-mvp

#### Proposed Prisma Models

```prisma
enum FollowableType {
  USER
  ARTIST
}

model Follow {
  id            String         @id @default(uuid())
  followerId    String         @map("follower_id")
  followeeId    String         @map("followee_id")
  followeeType  FollowableType @default(USER) @map("followee_type")
  createdAt     DateTime       @default(now()) @map("created_at")

  @@unique([followerId, followeeId, followeeType])
  @@index([followerId])
  @@index([followeeId])
  @@map("follows")
}

enum LikableType {
  TRACK_REF
  PLAYLIST
  PLAYLIST_ITEM
  MESSAGE
  FEED_EVENT
}

model Like {
  id          String      @id @default(uuid())
  userId      String      @map("user_id")
  entityType  LikableType @map("entity_type")
  entityId    String      @map("entity_id")
  createdAt   DateTime    @default(now()) @map("created_at")

  @@unique([userId, entityType, entityId])
  @@index([entityType, entityId])
  @@index([userId])
  @@map("likes")
}

// Materialized counts for performance
model EntityStats {
  id           String      @id @default(uuid())
  entityType   String      @map("entity_type")  // TRACK_REF, PLAYLIST, etc.
  entityId     String      @map("entity_id")
  likesCount   Int         @default(0) @map("likes_count")
  followsCount Int         @default(0) @map("follows_count")  // For users/artists
  updatedAt    DateTime    @updatedAt @map("updated_at")

  @@unique([entityType, entityId])
  @@index([entityType, likesCount])
  @@map("entity_stats")
}
```

#### Proposed Module Structure

```
src/modules/social/
├── social.module.ts
├── social.controller.ts
├── social.service.ts
├── follows.service.ts
├── likes.service.ts
├── dto/
│   ├── follow.dto.ts
│   └── like.dto.ts
└── tests/
```

#### REST Endpoints

```typescript
// Follows
POST   /api/v1/social/follow               // Follow user/artist
DELETE /api/v1/social/follow/:targetId     // Unfollow
GET    /api/v1/social/followers/:userId    // Get followers
GET    /api/v1/social/following/:userId    // Get following

// Likes
POST   /api/v1/social/like                 // Like entity
DELETE /api/v1/social/like/:entityType/:entityId  // Unlike
GET    /api/v1/social/likes/:entityType/:entityId // Get likes for entity
GET    /api/v1/social/me/likes             // My liked items
```

#### Auth Rules

- All endpoints require authentication
- Protected by `FEATURE_SOCIAL` flag (default OFF per PRD)

---

### 4. Rooms Module (Complete Implementation)

**Status:** ⚠️ Partial (models exist, no controllers)
**PRDs:** prd-rooms-mvp

#### Additional Prisma Models Needed

```prisma
enum RoomType {
  PUBLIC
  GENRE
  ARTIST
  PRIVATE
}

enum RoomVisibility {
  PUBLIC
  UNLISTED
  PRIVATE
}

enum JoinRequestStatus {
  PENDING
  APPROVED
  DENIED
}

// Extend existing Room model
model Room {
  // Update existing fields
  type          RoomType       @default(PUBLIC)
  visibility    RoomVisibility @default(PUBLIC)
  slug          String?        @unique
  tags          String[]       @default([])
  avatarUrl     String?        @map("avatar_url")
  pinnedTrackId String?        @map("pinned_track_id")
  region        String?        // Optional region hint

  // Add new relations
  pinnedTrack   TrackRef?      @relation("PinnedTrack", fields: [pinnedTrackId], references: [id])
  joinRequests  JoinRequest[]

  // Keep existing relations
  messages      Message[]
  memberships   RoomMembership[]
  djSessions    DJSession[]
}

model JoinRequest {
  id          String            @id @default(uuid())
  roomId      String            @map("room_id")
  userId      String            @map("user_id")
  status      JoinRequestStatus @default(PENDING)
  message     String?
  actedBy     String?           @map("acted_by")
  actedAt     DateTime?         @map("acted_at")
  createdAt   DateTime          @default(now()) @map("created_at")

  room        Room              @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@index([roomId, status])
  @@index([userId])
  @@map("join_requests")
}

// Add relation to TrackRef
model TrackRef {
  // ... existing fields
  pinnedInRooms Room[] @relation("PinnedTrack")
  queueItems    QueueItem[]
}
```

#### Proposed Module Structure

```
src/modules/rooms/
├── rooms.module.ts
├── rooms.controller.ts
├── rooms.service.ts
├── dto/
│   ├── create-room.dto.ts
│   ├── update-room.dto.ts
│   ├── join-room.dto.ts
│   └── pin-track.dto.ts
├── events/
│   ├── rooms.gateway.ts
│   └── presence.service.ts
└── tests/
```

#### REST Endpoints

```typescript
// Room Management
POST   /api/v1/rooms                        // Create room
GET    /api/v1/rooms/:id                    // Get room details
PATCH  /api/v1/rooms/:id                    // Update room
DELETE /api/v1/rooms/:id                    // Delete room
POST   /api/v1/rooms/:id/pin-track          // Pin track

// Membership
POST   /api/v1/rooms/:id/join               // Join room
POST   /api/v1/rooms/:id/leave              // Leave room
POST   /api/v1/rooms/:id/invite             // Invite user
GET    /api/v1/rooms/:id/members            // Get members
PATCH  /api/v1/rooms/:id/members/:userId    // Update member role

// Join Requests (Private rooms)
POST   /api/v1/rooms/:id/join-request       // Request to join
POST   /api/v1/rooms/:id/approve-join/:userId  // Approve request
POST   /api/v1/rooms/:id/deny-join/:userId     // Deny request

// Discovery
GET    /api/v1/rooms/discover               // Browse/search rooms
GET    /api/v1/rooms/trending               // Trending rooms
GET    /api/v1/rooms/me                     // My rooms
```

---

### 5. Leaderboards & Badges

**Status:** ❌ Missing
**PRDs:** prd-leaderboards, prd-badges-trophy-case

#### Proposed Prisma Models

```prisma
enum LeaderboardType {
  GLOBAL
  GENRE
  SEASONAL
  ROOM
}

enum BadgeTier {
  GOLD
  SILVER
  BRONZE
  PARTICIPANT
}

model Leaderboard {
  id          String          @id @default(uuid())
  type        LeaderboardType
  scope       String?         // Genre name, room ID, etc.
  season      String?         // "2025-Q1", "2025-Q2", etc.
  startDate   DateTime        @map("start_date")
  endDate     DateTime?       @map("end_date")
  active      Boolean         @default(true)

  entries     LeaderboardEntry[]

  @@unique([type, scope, season])
  @@index([type, active])
  @@map("leaderboards")
}

model LeaderboardEntry {
  id            String       @id @default(uuid())
  leaderboardId String       @map("leaderboard_id")
  userId        String       @map("user_id")
  rank          Int
  score         Int          // Total points
  updatedAt     DateTime     @updatedAt @map("updated_at")

  leaderboard   Leaderboard  @relation(fields: [leaderboardId], references: [id], onDelete: Cascade)

  @@unique([leaderboardId, userId])
  @@index([leaderboardId, rank])
  @@index([userId])
  @@map("leaderboard_entries")
}

model Badge {
  id          String    @id @default(uuid())
  code        String    @unique  // GOLD_DJ_2025_Q1, SILVER_HIPHOP, etc.
  name        String
  description String?
  tier        BadgeTier
  iconUrl     String?   @map("icon_url")
  season      String?   // "2025-Q1" for seasonal badges
  category    String    // "dj", "leaderboard", "community", etc.
  createdAt   DateTime  @default(now()) @map("created_at")

  awards      BadgeAward[]

  @@index([tier])
  @@index([season])
  @@map("badges")
}

model BadgeAward {
  id          String   @id @default(uuid())
  badgeId     String   @map("badge_id")
  userId      String   @map("user_id")
  awardedAt   DateTime @default(now()) @map("awarded_at")
  metadata    Json?    // Context: leaderboard rank, points, etc.

  badge       Badge    @relation(fields: [badgeId], references: [id])

  @@unique([badgeId, userId])
  @@index([userId])
  @@map("badge_awards")
}
```

---

### 6. Newsfeed & Activity

**Status:** ❌ Missing
**PRDs:** prd-chronological-newsfeed-rooms-activity

#### Proposed Prisma Models

```prisma
enum FeedEventType {
  ROOM_CREATED
  ROOM_LIVE_STARTED
  USER_JOINED_ROOM
  TRACK_ADDED
  DJ_SET_STARTED
  CHAT_PINNED
  PLAYLIST_CREATED
  USER_FOLLOWED
}

enum FeedVisibility {
  PUBLIC
  FOLLOWERS
  FRIENDS
  PRIVATE
}

model FeedEvent {
  id           String         @id @default(uuid())
  type         FeedEventType
  actorUserId  String         @map("actor_user_id")
  roomId       String?        @map("room_id")
  trackId      String?        @map("track_id")
  playlistId   String?        @map("playlist_id")
  sessionId    String?        @map("session_id")
  messageId    String?        @map("message_id")
  visibility   FeedVisibility @default(PUBLIC)
  collapsedKey String?        @map("collapsed_key")  // For grouping similar events
  metadata     Json?
  createdAt    DateTime       @default(now()) @map("created_at")

  reactions    FeedReaction[]

  @@index([actorUserId, createdAt])
  @@index([type, createdAt])
  @@index([collapsedKey])
  @@map("feed_events")
}

enum ReactionType {
  CLAP      // 👏
  FIRE      // 🔥
  HEART     // ❤️
  STAR      // ⭐
  WAVE      // 👋
}

model FeedReaction {
  id          String       @id @default(uuid())
  eventId     String       @map("event_id")
  userId      String       @map("user_id")
  type        ReactionType
  createdAt   DateTime     @default(now()) @map("created_at")

  event       FeedEvent    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId, type])
  @@index([eventId])
  @@index([userId])
  @@map("feed_reactions")
}
```

---

### 7. Marketplace

**Status:** ❌ Missing
**PRDs:** prd-artist-marketplace-high-level

#### Proposed Prisma Models (MVP - External Links)

```prisma
enum MarketplaceItemType {
  MERCH
  CONCERT
  TRACK
}

model MarketplaceItem {
  id           String              @id @default(uuid())
  artistId     String              @map("artist_id")  // FK to User with role=ARTIST
  type         MarketplaceItemType
  title        String
  description  String?
  price        Decimal?            @db.Decimal(10, 2)
  currency     String?             @default("USD")
  externalUrl  String?             @map("external_url")  // MVP: link to Shopify, Bandcamp, etc.
  imageUrl     String?             @map("image_url")
  metadata     Json?               // For track: format options, DRM info; Concert: date, venue
  active       Boolean             @default(true)
  createdAt    DateTime            @default(now()) @map("created_at")
  updatedAt    DateTime            @updatedAt @map("updated_at")

  @@index([artistId, type, active])
  @@map("marketplace_items")
}
```

---

### 8. Recommendations

**Status:** ❌ Missing
**PRDs:** prd-recommendation-engine-rooms-playlists-artists

**Note:** Requires pgvector extension setup in Supabase.

#### Proposed Prisma Models

```prisma
enum LinkedAccountProvider {
  SPOTIFY
  APPLE_MUSIC
  YOUTUBE_MUSIC
  DEEZER
  BANDCAMP
}

model LinkedAccount {
  id               String                 @id @default(uuid())
  userId           String                 @map("user_id")
  provider         LinkedAccountProvider
  providerUserId   String                 @map("provider_user_id")
  accessToken      String?                @map("access_token")  // Encrypted
  refreshToken     String?                @map("refresh_token") // Encrypted
  expiresAt        DateTime?              @map("expires_at")
  lastSyncAt       DateTime?              @map("last_sync_at")
  createdAt        DateTime               @default(now()) @map("created_at")
  updatedAt        DateTime               @updatedAt @map("updated_at")

  @@unique([userId, provider])
  @@index([provider])
  @@map("linked_accounts")
}

model Recommendation {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  entityType   String   @map("entity_type")  // ROOM, PLAYLIST, ARTIST
  entityId     String   @map("entity_id")
  score        Float
  reason       String?  // "Based on your love of Kaytranada"
  dismissed    Boolean  @default(false)
  createdAt    DateTime @default(now()) @map("created_at")

  @@index([userId, createdAt])
  @@index([userId, entityType, score])
  @@map("recommendations")
}

// Note: Embeddings would be added as vector fields once pgvector is configured
// Example: embedding Vector(1536)
```

---

### 9. Moderation Tools

**Status:** ⚠️ Partial (model exists, no full implementation)
**PRDs:** prd-moderation-dashboard, prd-safety-trust

#### Complete Moderation Models

```prisma
// ModerationLog exists (schema:318), extend with additional actions
enum ModerationAction {
  DELETE_MESSAGE
  MUTE_USER
  BAN_USER
  CLEAR_REACTIONS
  REMOVE_DJ
  CLEAR_QUEUE
  PIN_MESSAGE
  UNPIN_MESSAGE
  KICK_FROM_ROOM
}

// Add new models
model UserModerationStatus {
  id          String    @id @default(uuid())
  userId      String    @unique @map("user_id")
  isBanned    Boolean   @default(false) @map("is_banned")
  bannedUntil DateTime? @map("banned_until")
  mutedUntil  DateTime? @map("muted_until")
  warnCount   Int       @default(0) @map("warn_count")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@index([isBanned])
  @@map("user_moderation_status")
}

model ModerationReport {
  id          String   @id @default(uuid())
  reporterId  String   @map("reporter_id")
  targetType  String   @map("target_type")  // USER, MESSAGE, ROOM
  targetId    String   @map("target_id")
  reason      String
  description String?
  status      String   @default("PENDING")  // PENDING, REVIEWED, ACTIONED, DISMISSED
  reviewedBy  String?  @map("reviewed_by")
  reviewedAt  DateTime? @map("reviewed_at")
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([status])
  @@index([targetType, targetId])
  @@map("moderation_reports")
}
```

---

## Integration Plan: Adding to app.module.ts

All new modules follow the existing pattern and integrate cleanly:

```typescript
// seda-auth-service/src/app.module.ts
@Module({
  imports: [
    // ... existing imports
    ProfilesModule,
    PlaylistsModule,

    // NEW MODULES (additive)
    RoomsModule,         // Complete rooms implementation
    DJModule,            // DJ sessions, rotation, queue
    ProgressionModule,   // XP, levels, credits
    SocialModule,        // Follows, likes
    LeaderboardsModule,  // Leaderboards & badges
    FeedModule,          // Newsfeed & activity
    MarketplaceModule,   // Artist marketplace (MVP)
    RecommendationsModule, // Recommendation engine
    ModerationModule,    // Full moderation tools

    HealthModule,
  ],
})
export class AppModule {}
```

---

## Authentication & Authorization Patterns

All new endpoints will use existing guards:

```typescript
// Existing guards to reuse
@UseGuards(AuthGuard)           // Requires valid JWT
@UseGuards(AdminGuard)          // Requires admin/super_admin role
@UseGuards(FeatureGuard)        // Checks feature flags
@Feature('FEATURE_NAME')        // Decorator for feature gating
```

### RLS Considerations

Since the backend uses Supabase, Row Level Security policies should be added for:
- Rooms (visibility based on public/private)
- DJ Sessions (room membership)
- Social (follows, likes respect blocks)
- Feed Events (visibility enum)
- Leaderboards (public by default)

---

## Migration Strategy

### Phase 1: Critical Path (Weeks 1-2)
1. **Rooms Module** - Complete implementation
2. **DJ Mode** - Core session management
3. **Social Layer** - Follows & likes

### Phase 2: Engagement (Weeks 3-4)
4. **Progression System** - Points, levels, credits
5. **Leaderboards & Badges** - Recognition system
6. **Newsfeed** - Activity stream

### Phase 3: Discovery & Growth (Weeks 5-6)
7. **Recommendations** - Basic content-based recs
8. **Marketplace** - External links MVP
9. **Enhanced Moderation** - Full toolset

---

## Backward Compatibility Confirmation

✅ **All proposed changes are additive only:**
- No existing models modified
- No existing endpoints changed
- New tables use separate namespaces
- Existing relations remain intact
- Feature flags protect rollout

✅ **Existing APIs unchanged:**
- `POST /profiles` - Still works
- `POST /playlists` - Still works
- `POST /artist/verification/request` - Still works
- All DTOs remain compatible

✅ **Database migrations are safe:**
- All new tables
- All new enums
- Optional new fields on existing models use nullable or default values
- No breaking schema changes

---

## Next Steps

1. Review and approve this gap analysis
2. Prioritize features based on business goals
3. Generate detailed code scaffolds for Phase 1 features
4. Set up pgvector extension in Supabase
5. Create migration files for new models
6. Implement feature flags for gradual rollout

---

**Generated by:** Claude Code
**Analysis Date:** 2025-11-08
**Status:** Ready for Implementation
