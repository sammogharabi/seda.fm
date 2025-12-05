# Backend Gap Analysis for Seda.fm v2

**Purpose**: Map frontend v2 features to existing backend capabilities and identify gaps that must be filled for production readiness.

**Generated**: 2025-11-08

---

## Executive Summary

### Current State
- **Backend**: Production-ready NestJS + Prisma + Supabase with solid auth, profiles, playlists, and artist verification
- **Frontend v2**: Comprehensive Figma-generated prototype with 15+ major features defined in markdown specs
- **Integration Status**: ~15% implemented (profiles + playlists only)

### Critical Gaps
The backend currently supports:
1. ✅ User authentication (Supabase)
2. ✅ User profiles with onboarding
3. ✅ Playlists (needs rename to "Crates")
4. ✅ Artist profiles & verification system
5. ✅ Admin panel for verification approval

Missing for v2 feature parity:
1. ❌ Crates (social features, likes, shares)
2. ❌ Rooms & DJ sessions (real-time)
3. ❌ Social feed (posts, comments, reactions, reposts)
4. ❌ Progression system (XP, levels, badges, achievements)
5. ❌ Marketplace (products, purchases, payments)
6. ❌ Global search (multi-entity indexing)
7. ❌ Discover algorithms
8. ❌ Feedback system (partially exists via edge function)
9. ❌ AI detection system (needs backend integration)
10. ❌ Messaging system

---

## Feature-by-Feature Analysis

### 1. Crates (Playlists/Mixtapes)

| Aspect | Details |
|--------|---------|
| **User Need** | Core music curation feature - users organize tracks into themed collections ("crates") and share with community |
| **Frontend Refs** | `README-CRATES.md`, `Crates.tsx`, `CreateCrateModal.tsx` |
| **Backend Refs** | `Playlist` model, `PlaylistsController`, `PlaylistsService` |
| **Backend Status** | **PARTIAL** |
| **Gaps** | - Missing social features (likes, shares, reposts)<br>- Missing cover image upload/storage<br>- Missing public discovery feed<br>- Missing engagement metrics<br>- Terminology mismatch ("playlist" vs "crate")<br>- Missing crate-specific fields (mood, genre tags)<br>- No collaborative crates<br>- No featured/trending crates endpoint |

**What Exists**:
- `Playlist` model with owner, items, collaborators
- CRUD operations for playlists
- Add/remove tracks
- Public/private toggle
- Collaborative playlists support

**What's Missing**:
- Like/save crate functionality
- Share to social feed integration
- Play count tracking
- Trending/featured algorithm
- Cover image storage (Supabase Storage integration)
- Crate-level comments
- Mood/genre/theme tags

---

### 2. Rooms & DJ Sessions

| Aspect | Details |
|--------|---------|
| **User Need** | Real-time collaborative listening - users join rooms, participate in DJ sessions, vote on tracks, chat together |
| **Frontend Refs** | `README-ROOMS.md`, `README-DJ-MODE.md`, `RoomsView.tsx`, `DJMode.tsx`, `SessionsView.tsx` |
| **Backend Refs** | `Room`, `RoomMembership`, `Message` models (chat only) |
| **Backend Status** | **PARTIAL** |
| **Gaps** | - `Room` model exists but missing DJ session data<br>- No `DJSession` model<br>- No `SessionQueue` model<br>- No `Vote` model<br>- Missing real-time sync (Supabase Realtime integration)<br>- Missing session state management<br>- No DJ rotation logic<br>- No auto-skip logic<br>- No session analytics |

**What Exists**:
- `Room` model (basic: name, description, members)
- `RoomMembership` with moderator flag
- `Message` model for chat

**What's Missing**:
- `DJSession` entity linked to Room
- Queue management with voting
- Real-time presence tracking
- Synchronized playback state
- DJ turn rotation system
- Vote aggregation & auto-skip
- Session history/recording
- Live session endpoints

---

### 3. Social Feed (Posts, Comments, Reactions)

| Aspect | Details |
|--------|---------|
| **User Need** | Core social engagement - users post tracks/text/media, comment, like, repost, build community around music discovery |
| **Frontend Refs** | `README-SOCIAL-FEED.md`, `SocialFeed.tsx`, `Comments.tsx`, `CreatePostModal.tsx` |
| **Backend Refs** | None - completely missing |
| **Backend Status** | **MISSING** |
| **Gaps** | - No `Post` model<br>- No `Comment` model (different from room messages)<br>- No `Like`/`Reaction` model<br>- No `Repost` model<br>- No feed algorithm<br>- No engagement tracking<br>- No content moderation tools<br>- No post type handling (track/text/media) |

**What Exists**:
- N/A

**What's Missing**:
- Complete social graph infrastructure:
  - `Post` entity (with type: track/text/media/crate)
  - `Comment` entity with threading
  - `Like` entity (polymorphic: posts, comments, crates)
  - `Repost` entity
  - `Follow` relationship
- Feed generation algorithm
- Timeline aggregation
- Engagement metrics
- Content moderation system
- Report/flag system
- Block/mute functionality

---

### 4. Progression System (XP, Levels, Badges)

| Aspect | Details |
|--------|---------|
| **User Need** | Gamification to encourage engagement - users earn XP, level up, unlock badges, compete on leaderboards |
| **Frontend Refs** | `README-PROGRESSION-SYSTEM.md`, `ProgressionDashboard.tsx`, `XPNotificationSystem.tsx`, `/utils/progression.ts` |
| **Backend Refs** | None - completely missing |
| **Backend Status** | **MISSING** |
| **Gaps** | - No `UserProgression` model<br>- No `Badge` model<br>- No `Achievement` model<br>- No `Challenge` model<br>- No XP calculation service<br>- No badge unlock detection<br>- No leaderboard queries<br>- No activity tracking for XP awards |

**What Exists**:
- N/A

**What's Missing**:
- `UserProgression` model (level, XP, streaks)
- `Badge` definitions and unlock tracking
- `Challenge` system (daily, weekly, monthly)
- `Activity` event tracking
- XP calculation service
- Level-up rewards system
- Leaderboard aggregation
- Streak tracking (daily login, listening)
- Achievement progress tracking

---

### 5. Marketplace (Artist Monetization)

| Aspect | Details |
|--------|---------|
| **User Need** | Direct artist-to-fan sales - artists sell tracks, albums, merch; fans support artists financially |
| **Frontend Refs** | `README-MARKETPLACE.md`, `ArtistMarketplace.tsx`, `TrackPurchaseModal.tsx`, `StoreAnalytics.tsx` |
| **Backend Refs** | None - completely missing |
| **Backend Status** | **MISSING** |
| **Gaps** | - No `Product` model<br>- No `Purchase`/`Order` model<br>- No payment integration (Stripe)<br>- No digital download system<br>- No inventory management<br>- No revenue tracking<br>- No payout system |

**What Exists**:
- N/A

**What's Missing**:
- E-commerce infrastructure:
  - `Product` entity (tracks, albums, merch, digital goods)
  - `Order` & `OrderItem` entities
  - `Purchase` history
  - `Cart` session management
- Payment integration (Stripe Connect for artist payouts)
- Digital asset delivery (signed URLs for downloads)
- Inventory tracking for physical goods
- Revenue split calculation (artist 85%, platform 10%, processing 5%)
- Analytics dashboard data
- Discount/promotion system
- Pre-order system

---

### 6. Global Search

| Aspect | Details |
|--------|---------|
| **User Need** | Universal search across all content - users find tracks, artists, users, crates, rooms by keyword |
| **Frontend Refs** | `README-GLOBAL-SEARCH.md`, `PRD-Global-Search.md`, `GlobalSearch.tsx` |
| **Backend Refs** | None - no search endpoint |
| **Backend Status** | **MISSING** |
| **Gaps** | - No search indexing<br>- No multi-entity search endpoint<br>- No fuzzy matching<br>- No ranking algorithm<br>- No search history tracking<br>- No trending searches |

**What Exists**:
- Individual entity lookups (profile by username, playlist by ID)

**What's Missing**:
- Unified search endpoint (`GET /api/search?q={query}&type={type}`)
- Search index (consider Elasticsearch or PostgreSQL full-text)
- Result ranking algorithm
- Fuzzy matching / typo tolerance
- Search filters (genre, date, etc.)
- Search history storage
- Trending searches aggregation
- Recent searches per user

---

### 7. Discover (Content Recommendation)

| Aspect | Details |
|--------|---------|
| **User Need** | Personalized music discovery - users explore trending, new releases, genre-based, personalized recommendations |
| **Frontend Refs** | `README-DISCOVER.md`, `DiscoverView.tsx` |
| **Backend Refs** | None - no recommendation endpoint |
| **Backend Status** | **MISSING** |
| **Gaps** | - No recommendation algorithm<br>- No trending calculation<br>- No genre filtering<br>- No personalization based on listening history<br>- No "For You" feed |

**What Exists**:
- Can list playlists, profiles (no ranking)

**What's Missing**:
- Trending algorithm (time-weighted play counts)
- "For You" personalization based on:
  - Listening history
  - Followed artists
  - Saved crates
  - Genre preferences
- New releases endpoint (sorted by `createdAt`)
- Featured content curation (staff picks)
- Genre-based filtering
- Discovery analytics

---

### 8. Feedback System

| Aspect | Details |
|--------|---------|
| **User Need** | User feedback collection - users submit feedback with ratings directly to team |
| **Frontend Refs** | `FEATURE-FEEDBACK.md`, `FEEDBACK-SYSTEM-README.md`, `Feedback.tsx` |
| **Backend Refs** | `/supabase/functions/server/index.tsx` - feedback route (Edge Function) |
| **Backend Status** | **IMPLEMENTED** (via Edge Function) |
| **Gaps** | - Not integrated with main NestJS backend<br>- No database storage (email-only)<br>- No admin dashboard to review feedback<br>- No feedback categorization |

**What Exists**:
- Edge Function sends feedback email via Resend
- Captures userType, rating, comment, username

**What's Missing** (optional enhancements):
- Store feedback in database for admin review
- Feedback dashboard in admin panel
- Categorization/tagging
- Sentiment analysis
- Follow-up workflow

---

### 9. AI Detection System

| Aspect | Details |
|--------|---------|
| **User Need** | Trust & safety - detect AI-generated music, ensure only human-created music on platform |
| **Frontend Refs** | `AI-DETECTION-SYSTEM.md`, `AIAuthenticationAttestation.tsx`, `AIModeratorDashboard.tsx`, `TrustedUploaderBadge.tsx` |
| **Backend Refs** | None - no AI detection integration |
| **Backend Status** | **MISSING** |
| **Gaps** | - No `AIDetectionResult` model<br>- No AI detection service integration<br>- No trusted uploader flag on User/ArtistProfile<br>- No moderation queue for flagged content<br>- No community reporting system<br>- No proof-of-authorship upload |

**What Exists**:
- N/A

**What's Missing**:
- `AIDetectionResult` model (trackId, riskScore, status)
- `TrustedUploader` status on ArtistProfile
- `CommunityReport` model for user reports
- AI detection service integration (external API)
- Moderation queue endpoints
- Proof submission workflow (upload project files, stems)
- Detection status tracking (analyzing, flagged, verified, rejected)

---

### 10. Messaging System

| Aspect | Details |
|--------|---------|
| **User Need** | Direct user-to-user communication - artists message fans, fans message each other |
| **Frontend Refs** | `MessagesView.tsx`, message utilities in state management |
| **Backend Refs** | `Message` model (room messages only) |
| **Backend Status** | **PARTIAL** |
| **Gaps** | - `Message` model is room-only, not DM<br>- No `Conversation` model<br>- No DM endpoints<br>- No unread tracking<br>- No real-time delivery |

**What Exists**:
- `Message` model for room chat
- Real-time potential via Supabase

**What's Missing**:
- `DirectMessage` or extend `Message` with `conversationId`
- `Conversation` model (1-on-1 or group)
- Unread message tracking
- Message delivery status
- Typing indicators
- Real-time DM delivery via Supabase Realtime
- Block/report in DMs

---

### 11. User Profiles (Extended)

| Aspect | Details |
|--------|---------|
| **User Need** | Rich user identity - display posts, comments, crates, listening history, badges, level |
| **Frontend Refs** | `README-USER-PROFILES.md`, `UserProfile-fixed.tsx` |
| **Backend Refs** | `Profile` model, `ProfilesController` |
| **Backend Status** | **PARTIAL** |
| **Gaps** | - Missing activity history aggregation<br>- Missing listening stats endpoint<br>- Missing badges/level integration<br>- Missing follow/follower relationships<br>- Missing post/comment history endpoints |

**What Exists**:
- `Profile` model with username, bio, genres
- Get profile by username
- Update profile
- Onboarding genres

**What's Missing**:
- `GET /api/profiles/:username/posts` - post history
- `GET /api/profiles/:username/comments` - comment history
- `GET /api/profiles/:username/crates` - user crates
- `GET /api/profiles/:username/listening` - listening stats
- `GET /api/profiles/:username/badges` - earned badges
- Follow/unfollow endpoints
- Follower/following lists
- Profile stats aggregation

---

### 12. Artist Profiles (Extended)

| Aspect | Details |
|--------|---------|
| **User Need** | Artist identity & marketplace - showcase music, sell products, get verified, track analytics |
| **Frontend Refs** | `README-ARTIST-PROFILES.md`, `ArtistDashboard.tsx`, `ArtistProfileCustomization.tsx` |
| **Backend Refs** | `ArtistProfile` model, verification system |
| **Backend Status** | **PARTIAL** |
| **Gaps** | - No track uploads storage<br>- No artist analytics<br>- No marketplace integration<br>- No social links beyond current fields<br>- No artist-specific customization |

**What Exists**:
- `ArtistProfile` model with verification status
- Artist verification workflow (claim code system)
- Admin verification approval

**What's Missing**:
- Track upload & storage system
- Artist analytics dashboard data
- Marketplace product association
- Extended social links (TikTok, Instagram, etc.)
- Custom profile themes/branding
- Artist tier system (Basic, Supporter, Patron)

---

### 13. Comments System

| Aspect | Details |
|--------|---------|
| **User Need** | Threaded discussions - users comment on posts, reply to comments, engage in conversations |
| **Frontend Refs** | `README-COMMENTS.md`, `Comments.tsx`, `FEATURE-POST-COMMENT-HISTORY.md` |
| **Backend Refs** | None (room messages exist but not feed comments) |
| **Backend Status** | **MISSING** |
| **Gaps** | - No `Comment` model for feed posts<br>- No threading/parent-child relationships<br>- No comment likes<br>- No comment moderation |

**What Exists**:
- `Message` model has threading (`parentId`) but only for rooms

**What's Missing**:
- `Comment` model distinct from room messages
- Comment-to-post relationship
- Comment threading (replies)
- Comment likes/reactions
- Comment edit/delete with history
- Comment moderation tools

---

### 14. Mini Player & Queue

| Aspect | Details |
|--------|---------|
| **User Need** | Persistent playback - music continues when navigating, queue management |
| **Frontend Refs** | `README-MINI-PLAYER.md`, `FEATURE-ADD-TO-QUEUE.md`, `MiniPlayer.tsx` |
| **Backend Refs** | None - client-side only |
| **Backend Status** | **N/A** (Client-side feature, but could benefit from backend) |
| **Gaps** | - No server-side queue persistence<br>- No cross-device queue sync<br>- No "Resume where you left off" |

**What Exists**:
- N/A (purely client state)

**What's Missing** (optional enhancements):
- `UserQueue` model to persist queue server-side
- Resume playback across devices
- Queue history

---

## Summary Table

| Feature | Frontend Exists | Backend Status | Priority |
|---------|----------------|----------------|----------|
| Crates (social features) | ✅ | Partial | **P0** |
| Rooms & DJ Sessions | ✅ | Partial | **P0** |
| Social Feed (Posts, Comments) | ✅ | Missing | **P0** |
| Progression System | ✅ | Missing | **P1** |
| Marketplace | ✅ | Missing | **P1** |
| Global Search | ✅ | Missing | **P0** |
| Discover | ✅ | Missing | **P1** |
| Feedback System | ✅ | Implemented | **P2** |
| AI Detection | ✅ | Missing | **P1** |
| Messaging (DMs) | ✅ | Partial | **P2** |
| User Profiles (extended) | ✅ | Partial | **P1** |
| Artist Profiles (extended) | ✅ | Partial | **P1** |
| Comments System | ✅ | Missing | **P0** |
| Mini Player & Queue | ✅ | N/A | **P3** |

**Priority Definitions**:
- **P0**: Blocker for MVP / core experience
- **P1**: Important for product-market fit
- **P2**: Nice-to-have, can defer
- **P3**: Optional enhancement

---

## Integration Points & Dependencies

### Authentication & Authorization
- ✅ **Implemented**: Supabase Auth + JWT guards in NestJS
- Works with all new features

### File Storage
- ❌ **Missing**: Supabase Storage integration for:
  - Track audio files
  - Crate cover images
  - Product images (marketplace)
  - Proof-of-authorship files (AI detection)

### Real-Time
- ❌ **Missing**: Supabase Realtime channels for:
  - DJ sessions sync
  - Room chat
  - Direct messages
  - Live notifications

### Payment Processing
- ❌ **Missing**: Stripe integration for:
  - Marketplace purchases
  - Artist payouts (Stripe Connect)
  - Subscription handling

### Email Service
- ✅ **Implemented**: Resend for feedback emails
- Can extend for:
  - Purchase receipts
  - Verification emails
  - Notification emails

---

## Recommended Implementation Order

Based on user value and technical dependencies:

### Phase 1: Core Social Features (MVP)
1. **Social Feed** (posts, likes, reposts)
2. **Comments System** (threaded, nested)
3. **Crates Social Features** (like, share to feed)
4. **Global Search** (basic cross-entity)
5. **Extended User Profiles** (post/comment/crate history)

**Why**: Enables core community engagement and content discovery.

### Phase 2: Real-Time Collaboration
6. **Rooms & DJ Sessions** (real-time with voting)
7. **Direct Messaging** (1-on-1 chat)

**Why**: Differentiator feature, requires real-time infra setup.

### Phase 3: Monetization & Growth
8. **Marketplace** (track sales, merch, Stripe integration)
9. **Progression System** (XP, levels, badges)
10. **Discover Algorithm** (trending, personalized)

**Why**: Drives revenue and retention.

### Phase 4: Trust & Safety
11. **AI Detection System** (automated + manual moderation)
12. **Content Moderation Tools** (reports, blocks, mutes)

**Why**: Platform integrity, can start with manual processes.

### Phase 5: Enhancements
13. **Advanced Search** (filters, facets, typo tolerance)
14. **Artist Analytics** (dashboard, insights)
15. **Cross-Device Queue Sync**

**Why**: Quality-of-life improvements.

---

## Next Steps

1. Review this gap analysis with product & engineering team
2. Prioritize features based on business goals
3. Proceed to `IMPLEMENTATION_SCAFFOLDS.md` for detailed technical specs
4. Begin implementation with Phase 1 features
5. Set up missing infrastructure (Supabase Storage, Realtime, Stripe)

---

## Notes

- All markdown specs are comprehensive and well-documented
- Frontend UI is complete for all features
- Backend follows solid NestJS + Prisma patterns
- Existing backend code is production-quality
- Gap filling should follow same patterns (DI, DTOs, guards, services)
