# READOUT.md - sedā.fm Built Features Analysis

## Executive Summary

The seda-auth-service backend currently implements a **complete authentication and verification system** with real-time chat capabilities. The system is built on NestJS with Supabase for auth/database and includes comprehensive artist verification workflows.

## Built Features Inventory

### ✅ Authentication System
- **Technology**: Supabase Auth with JWT tokens
- **Implementation**: 
  - `AuthGuard` validates Bearer tokens via Supabase
  - User creation/retrieval on first auth
  - Role-based access (USER, ARTIST, ADMIN, SUPER_ADMIN)
- **Files**:
  - `src/common/guards/auth.guard.ts`
  - `src/config/supabase.service.ts`
  - `src/modules/user/user.service.ts`

### ✅ Artist Verification System
- **Endpoints**:
  - `POST /api/v1/artist/verification/request` - Generate 8-char claim code
  - `POST /api/v1/artist/verification/submit` - Submit URL with code
  - `GET /api/v1/artist/verification/status/:id` - Check status
  - `GET /api/v1/artist/verification/my-requests` - User's requests
- **Features**:
  - Claim code generation with 7-day expiry
  - Rate limiting (3 requests/day)
  - Web crawling for automatic verification
  - Manual admin review fallback
- **Files**:
  - `src/modules/verification/verification.controller.ts`
  - `src/modules/verification/verification.service.ts`
  - `src/modules/crawler/crawler.service.ts`

### ✅ Real-time Chat System
- **REST API**:
  - `POST /api/v1/chat/rooms` - Create rooms
  - `POST /api/v1/chat/rooms/:roomId/join` - Join room
  - `POST /api/v1/chat/rooms/:roomId/messages` - Send message
  - `GET /api/v1/chat/rooms/:roomId/messages` - Get history
  - `POST /api/v1/chat/messages/:messageId/reactions` - Add reaction
  - `DELETE /api/v1/chat/messages/:messageId/reactions/:emoji` - Remove reaction
  - `POST /api/v1/chat/rooms/:roomId/moderation` - Moderate
- **WebSocket Events** (namespace: `/chat`):
  - `join_room`, `leave_room`
  - `send_message`, `message_created`
  - `add_reaction`, `reaction_added`
  - `typing_start`, `typing_stop`, `user_typing`
- **WebSocket Auth**: ⚠️ **PENDING** - Currently using placeholder auth. Supabase JWKS guard to be implemented.
- **Files**:
  - `src/modules/chat/chat.controller.ts`
  - `src/modules/chat/chat.gateway.ts`
  - `src/modules/chat/services/chat.service.ts`

### ✅ Admin Management
- **Endpoints**:
  - `GET /api/v1/admin/verification/pending` - Pending verifications
  - `GET /api/v1/admin/verification/:id` - Verification details
  - `PATCH /api/v1/admin/verification/:id/approve` - Approve
  - `PATCH /api/v1/admin/verification/:id/deny` - Deny
  - `GET /api/v1/admin/verification/stats/overview` - Statistics
- **Security**: Admin API key authentication
- **Files**:
  - `src/modules/admin/admin.controller.ts`
  - `src/modules/admin/admin.service.ts`
  - `src/common/guards/admin.guard.ts`

## Architecture Dependency Diagram

```
                    ┌─────────────────────┐
                    │   Supabase Cloud    │
                    │  ┌───────────────┐  │
                    │  │  Auth Service │  │
                    │  └───────┬───────┘  │
                    │          │          │
                    │  ┌───────▼───────┐  │
                    │  │  PostgreSQL   │  │
                    │  └───────────────┘  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   NestJS Backend    │
                    │  ┌───────────────┐  │
┌──────────┐        │  │  AuthGuard    │  │        ┌──────────┐
│  Client  │◄───────┤  └───────┬───────┘  ├───────►│  Admin   │
│   (PWA)  │  REST  │          │          │  REST  │  Panel   │
└────┬─────┘        │  ┌───────▼───────┐  │        └──────────┘
     │              │  │  User Module  │  │
     │              │  └───────┬───────┘  │
     │              │          │          │
     │ WebSocket    │  ┌───────▼───────┐  │
     └──────────────┤  │  Chat Module  │  │
                    │  │  ┌─────────┐  │  │
                    │  │  │ Gateway │  │  │
                    │  │  └─────────┘  │  │
                    │  └───────┬───────┘  │
                    │          │          │
                    │  ┌───────▼───────┐  │
                    │  │ Verification  │  │
                    │  │    Module     │  │
                    │  │  ┌─────────┐  │  │
                    │  │  │ Crawler │  │  │
                    │  │  └─────────┘  │  │
                    │  └───────────────┘  │
                    └─────────────────────┘
```

## Database Schema (Current)

```sql
-- Core Tables
User (id, email, supabaseId, role, createdAt, updatedAt)
ArtistProfile (id, userId, artistName, bio, verified, verifiedAt)
VerificationRequest (id, userId, claimCode, status, url, crawlResult)
AdminAction (id, adminUserId, action, targetId, notes)

-- Chat Tables  
Room (id, name, description, isPublic, createdBy)
RoomMembership (id, roomId, userId, role, joinedAt)
Message (id, roomId, userId, text, type, trackRef, parentId)
Reaction (id, messageId, userId, emoji)
ModerationLog (id, roomId, moderatorId, action, targetUserId)

-- Support Tables
CrawlerCache (id, url, content, crawledAt)
TrackRef (id, provider, trackId, metadata)
```

## API Authentication Flow

```
1. Client → POST /auth/login → Supabase
2. Supabase → JWT token → Client
3. Client → Bearer token → NestJS
4. AuthGuard → Verify with Supabase → User object
5. Request → Controller with authenticated user
```

## WebSocket Connection Flow

```
1. Client → Socket.IO connect with token
2. ChatGateway → authenticateSocket() → Validate token
3. Socket → join_room event → Join Socket.IO room
4. Message events → Broadcast to room members
5. Typing indicators → 5-second auto-cleanup
```

## Current Environment Variables

```env
# Supabase
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_KEY=[service_key]
DATABASE_URL=postgresql://[connection_string]

# API Config
PORT=3001
API_PREFIX=api/v1
NODE_ENV=production|sandbox|qa

# Security
ADMIN_API_KEY=[admin_key]
JWT_SECRET=[jwt_secret]
CORS_ORIGINS=https://seda.fm

# Features
RATE_LIMIT_VERIFICATION_PER_DAY=3
VERIFICATION_CODE_LENGTH=8
VERIFICATION_CODE_EXPIRY_DAYS=7
CRAWLER_TIMEOUT_MS=30000
```

## Key Implementation Notes

1. **Authentication**: All endpoints except health check require Bearer token
2. **WebSocket Auth**: Currently has placeholder auth - needs Supabase integration
3. **Rate Limiting**: Global throttler at 100 req/min + custom verification limits
4. **Crawler**: Puppeteer in sandboxed mode with caching
5. **Admin Access**: Separate authentication via X-Admin-Key header
6. **Error Handling**: Centralized with proper HTTP status codes
7. **Logging**: Winston logger with environment-based levels

## Missing Features for MVP (Not Built)

- ❌ Music player/streaming integration
- ❌ Artist profiles/pages (beyond basic verification)
- ❌ Discovery/search functionality
- ❌ Playlists system
- ❌ Social features (follows, likes)
- ❌ Leaderboards
- ❌ Trophy Case/Badges
- ❌ DJ Mode mechanics
- ❌ Provider integrations (Spotify/Apple/etc)
- ❌ Genre-based channels
- ❌ Advanced onboarding flow

## Next Steps

1. **Immediate**: Wire existing backend to Figma prototype
2. **Phase 2A**: Build artist profiles and playlists
3. **Phase 2B**: Add social features and gamification
4. **Phase 3**: Music player and discovery