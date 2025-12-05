# Sedā v2 Migration Checklist

**Date Started:** 2025-11-08
**Status:** Phase 1 Complete ✅

---

## Phase 1: Backend Scaffolding ✅ COMPLETE

### Database Schema
- [x] Added 13 new Prisma models (Post, Comment, Like, Follow, Repost, DJSession, QueueItem, Vote, UserProgression, Badge, UserBadge, AIDetectionResult, CommunityReport, Conversation, DirectMessage)
- [x] Extended 4 existing models (Profile, Playlist, Room, ArtistProfile)
- [x] Created migration SQL file
- [x] Generated Prisma client successfully

### Backend Modules
- [x] **FeedModule** - 18 endpoints (posts, comments, likes, follows, reposts)
- [x] **SessionsModule** - 10 endpoints (DJ sessions, queue management, voting)
- [x] **ProgressionModule** - 3 endpoints (XP, levels, streaks, badges)
- [x] **SearchModule** - 1 endpoint (universal search)
- [x] **DiscoverModule** - 4 endpoints (trending, new releases, personalized, genre)
- [x] **PlaylistsModule** - Extended with trending/featured endpoints
- [x] **FeatureGuard** - Added 5 new feature flags

### Build Verification
- [x] TypeScript compilation (0 errors)
- [x] All 60+ routes registered successfully
- [x] Dependency injection working correctly
- [x] CORS configured (`CORS_ORIGINS=*` in .env.development)

---

## Phase 2: Frontend API Client Library ✅ COMPLETE

### Core Infrastructure
- [x] Shared HTTP client ([http.ts](frontend-v2/src/lib/api/http.ts))
  - Environment-based API base URL
  - Automatic auth token injection
  - Consistent error handling with ApiException
  - Query string building utility
- [x] TypeScript type definitions ([types.ts](frontend-v2/src/lib/api/types.ts))
  - 40+ interface definitions
  - Request/Response types
  - Pagination types

### API Client Modules (71 methods total)
- [x] **feedApi** - 18 methods for social feed
- [x] **playlistsApi** - 7 methods for playlists/crates
- [x] **discoverApi** - 4 methods for discovery
- [x] **profilesApi** - 6 methods for profiles
- [x] **verificationApi** - 9 methods for artist verification
- [x] **searchApi** - 4 methods for search
- [x] **progressionApi** - 3 methods for progression
- [x] **sessionsApi** - 10 methods for DJ sessions

### Documentation & Examples
- [x] Comprehensive README with usage examples
- [x] Example component ([ApiClientExample.tsx](frontend-v2/src/components/ApiClientExample.tsx))
- [x] Migration guide from old fetch code

### Bug Fixes
- [x] Fixed duplicate React import in SocialFeed.tsx
- [x] Verified no hardcoded `localhost:3001` URLs

---

## Phase 3: Testing & Integration 🔄 IN PROGRESS

### Database Setup
- [ ] Start PostgreSQL database
  ```bash
  docker-compose up -d postgres
  ```
- [ ] Run Prisma migrations
  ```bash
  cd backend
  npx prisma migrate deploy
  ```
- [ ] Seed initial data (optional)

### Backend Verification
- [ ] Start backend server
  ```bash
  cd backend
  npm run start:dev
  ```
- [ ] Test health endpoint
  ```bash
  curl http://localhost:3001/api/v1/health
  # Expected: {"status":"ok",...}
  ```
- [ ] Test sample endpoints
  - [ ] GET /api/v1/feed/global
  - [ ] GET /api/v1/playlists/trending
  - [ ] GET /api/v1/discover/trending

### Frontend Integration
- [ ] Start frontend server
  ```bash
  cd frontend-v2
  npm run dev
  ```
- [ ] Test API client example component
- [ ] Verify CORS (no errors in console)
- [ ] Test API calls from browser

---

## Phase 4: Component Refactoring 📋 TODO

### High-Priority Components
- [ ] SocialFeed.tsx - Replace mock data with `feedApi`
- [ ] Crates.tsx - Use `playlistsApi` for CRUD operations
- [ ] DiscoverView.tsx - Use `discoverApi` for recommendations
- [ ] UserProfile.tsx - Use `profilesApi` for profile management
- [ ] DJMode.tsx / SessionsView.tsx - Use `sessionsApi`
- [ ] Search components - Use `searchApi`
- [ ] ProgressionDashboard.tsx - Use `progressionApi`

### Auth Integration
- [ ] Update `getAuthToken()` in http.ts to integrate with Supabase
- [ ] Add auth token to localStorage after login
- [ ] Clear token on logout
- [ ] Handle 401 Unauthorized responses

### Error Handling
- [ ] Add global error boundary for ApiException
- [ ] Toast notifications for user-friendly errors
- [ ] Retry logic for network errors
- [ ] Loading states for all API calls

---

## Phase 5: Advanced Features 🔮 FUTURE

### Real-time Features
- [ ] WebSocket integration for DJ sessions
- [ ] Live feed updates
- [ ] Real-time notifications

### Optimization
- [ ] Add React Query for caching
- [ ] Implement request deduplication
- [ ] Add optimistic updates
- [ ] Lazy load API modules

### Testing
- [ ] Unit tests for API clients
- [ ] Integration tests for components
- [ ] E2E tests for critical flows

---

## Environment Configuration ✅

### Backend (.env.development)
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=dummy-anon-key
SUPABASE_SERVICE_KEY=dummy-service-key
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
JWT_SECRET=dev-secret
CORS_ORIGINS=*
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

---

## Quick Start Commands

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

### Frontend
```bash
cd frontend-v2
npm install
npm run dev
```

### Verification
```bash
# Health check
curl http://localhost:3001/api/v1/health

# Test trending endpoint
curl http://localhost:3001/api/v1/discover/trending?limit=5

# Test search
curl "http://localhost:3001/api/v1/search?q=test&type=all"
```

---

## Success Criteria

### Backend
- ✅ All modules compile without errors
- ✅ All 60+ routes registered
- ⏳ Database connected and migrations applied
- ⏳ Health endpoint returns 200 OK

### Frontend
- ✅ API client library created and documented
- ✅ Type definitions match backend DTOs
- ✅ No TypeScript errors
- ⏳ Example component works without errors

### Integration
- ⏳ No CORS errors in browser console
- ⏳ API calls succeed from frontend
- ⏳ Auth tokens flow correctly
- ⏳ Error handling works as expected

---

## Notes

- The backend is fully implemented but waiting for database connection
- Frontend has complete API client library ready to use
- Example component demonstrates all major API patterns
- CORS is configured to allow all origins for local development
- Next step: Start database and test end-to-end integration

**Last Updated:** 2025-11-10
