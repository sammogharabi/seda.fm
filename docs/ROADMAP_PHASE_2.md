# ROADMAP_PHASE_2.md - Development Plan

## Phase 2 Implementation Roadmap

### Wave A: Artist Profiles & Playlists (2-3 weeks)

#### Epic 1: User Profiles (Week 1)
**Goal**: Enable users to have customizable profiles with social stats

**Stories**:
1. **Profile Data Model** (2 days)
   - [ ] Create profile table migration
   - [ ] Add profile relationship to User model
   - [ ] Create Profile entity and DTOs
   - [ ] Implement username validation/uniqueness

2. **Profile API** (2 days)
   - [ ] GET /profiles/:username endpoint
   - [ ] PATCH /profiles endpoint
   - [ ] Avatar upload integration with Supabase Storage
   - [ ] Profile privacy settings

3. **Profile UI** (3 days)
   - [ ] Profile page component
   - [ ] Edit profile modal
   - [ ] Avatar upload with crop
   - [ ] Stats display (followers, DJ points)

**Time-boxed Spikes**:
- Research avatar storage options (4 hours)
- Username reservation strategy (2 hours)

#### Epic 2: Playlist System (Week 2)
**Goal**: Allow users to create and manage music playlists

**Stories**:
1. **Playlist Data Model** (2 days)
   - [ ] Playlist tables migration
   - [ ] Playlist items with position tracking
   - [ ] Collaborator relationships
   - [ ] Track metadata storage

2. **Playlist CRUD API** (3 days)
   - [ ] Create/Read/Update/Delete playlists
   - [ ] Add/remove/reorder items
   - [ ] Collaborator management
   - [ ] Follow/unfollow playlists

3. **Playlist UI** (3 days)
   - [ ] Playlist creation flow
   - [ ] Playlist page with items
   - [ ] Drag-and-drop reordering
   - [ ] Collaboration invite modal
   - [ ] Track search and add interface

**Time-boxed Spikes**:
- Multi-provider track ID strategy (4 hours)
- Playlist import from Spotify/Apple (8 hours)

### Wave B: Social & Gamification (3-4 weeks)

#### Epic 3: Social Graph (Week 3)
**Goal**: Build follow system and social interactions

**Stories**:
1. **Follow System** (2 days)
   - [ ] Follow/unfollow database schema
   - [ ] Follow API endpoints
   - [ ] Follower/following counts
   - [ ] Activity feed foundation

2. **Like System** (2 days)
   - [ ] Polymorphic likes table
   - [ ] Like/unlike endpoints
   - [ ] Like counts and aggregation
   - [ ] Recently liked content

3. **Social UI Components** (3 days)
   - [ ] Follow/unfollow buttons
   - [ ] Follower/following lists
   - [ ] Like buttons and counts
   - [ ] Social stats widgets

#### Epic 4: Leaderboards (Week 4)
**Goal**: Implement competitive DJ rankings

**Stories**:
1. **Leaderboard Engine** (3 days)
   - [ ] DJ points calculation service
   - [ ] Leaderboard snapshot system
   - [ ] Ranking algorithms
   - [ ] Cache and refresh strategy

2. **Leaderboard APIs** (2 days)
   - [ ] Global/genre/channel endpoints
   - [ ] Artist fan leaderboards
   - [ ] Time-based filtering
   - [ ] User rank lookup

3. **Leaderboard UI** (2 days)
   - [ ] Leaderboard page with tabs
   - [ ] Rank cards with tier badges
   - [ ] Animated rank changes
   - [ ] Personal rank highlight

#### Epic 5: Trophy Case & Badges (Week 5)
**Goal**: Reward users with achievements

**Stories**:
1. **Badge System** (2 days)
   - [ ] Badge definitions and rules
   - [ ] Badge earning service
   - [ ] Progress tracking
   - [ ] Badge categories

2. **Badge APIs** (1 day)
   - [ ] User badges endpoint
   - [ ] Available badges list
   - [ ] Showcase management
   - [ ] Progress updates

3. **Trophy Case UI** (2 days)
   - [ ] Trophy case grid
   - [ ] Badge detail modal
   - [ ] Progress indicators
   - [ ] Showcase selector

**Time-boxed Spikes**:
- Badge earning rules engine (8 hours)
- Real-time leaderboard updates (4 hours)

## Technical Implementation Details

### Database Indexing Strategy
```sql
-- Performance-critical indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_playlists_owner ON playlists(owner_id);
CREATE INDEX idx_playlist_items_playlist ON playlist_items(playlist_id, position);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_likes_user ON likes(user_id, target_type);
CREATE INDEX idx_user_badges ON user_badges(user_id, earned_at DESC);
```

### Caching Strategy
1. **Redis/Memory Cache**:
   - User profiles (5 min TTL)
   - Follower counts (1 min TTL)
   - Leaderboards (5 min TTL)
   - Badge definitions (1 hour TTL)

2. **Database Cache**:
   - Leaderboard snapshots (hourly generation)
   - Aggregated stats (daily rollup)

### Feature Flags
```typescript
// Wave A flags
FEATURE_PROFILES = false
FEATURE_PLAYLISTS = false
FEATURE_PLAYLIST_COLLABORATION = false

// Wave B flags
FEATURE_SOCIAL = false
FEATURE_LEADERBOARDS = false
FEATURE_TROPHY_CASE = false
FEATURE_DJ_POINTS = false
```

### Testing Strategy
1. **Unit Tests**:
   - Service logic (80% coverage)
   - DTOs and validators
   - Utility functions

2. **Integration Tests**:
   - API endpoints
   - Database operations
   - Cache behavior

3. **E2E Tests**:
   - Profile creation flow
   - Playlist CRUD operations
   - Follow/unfollow flow
   - Leaderboard viewing

### Performance Targets
- Profile load: < 200ms
- Playlist operations: < 300ms
- Leaderboard load: < 500ms
- Follow/like actions: < 100ms

### Monitoring & Analytics
1. **Metrics to Track**:
   - Profile views
   - Playlist creation rate
   - Follow/unfollow rate
   - Leaderboard engagement
   - Badge earning rate

2. **Error Monitoring**:
   - Failed profile updates
   - Playlist sync issues
   - Leaderboard calculation errors
   - Badge awarding failures

## Migration Plan

### Phase 1: Data Migration
1. Generate usernames from existing emails
2. Create default profiles for all users
3. Migrate any existing artist data
4. Set up initial badge definitions

### Phase 2: Feature Rollout
1. **Week 1**: Enable profiles for internal testing
2. **Week 2**: Beta test playlists with select users
3. **Week 3**: Launch social features
4. **Week 4**: Enable leaderboards
5. **Week 5**: Full trophy case launch

### Rollback Plan
Each feature behind flag allows:
1. Instant disable via flag
2. Database migrations are reversible
3. Cache can be cleared
4. Old UI remains accessible

## Dependencies & Blockers

### External Dependencies
1. **Supabase Storage**: For avatar/cover images
2. **Music Provider APIs**: For track metadata
3. **Redis/Upstash**: For caching (optional)
4. **PostHog**: For analytics

### Potential Blockers
1. **Music licensing**: Storing track metadata
   - Mitigation: Store only IDs and fetch on-demand
   
2. **Performance at scale**: Leaderboard calculations
   - Mitigation: Pre-compute and cache aggressively
   
3. **Username conflicts**: Existing users
   - Mitigation: Auto-generate with option to change

4. **Storage costs**: Avatar/playlist images
   - Mitigation: Image compression and CDN

## Success Criteria

### Wave A Success Metrics
- 80% of users create a profile
- 50% of users create at least one playlist
- Average 3 playlists per active user
- < 1% error rate on profile/playlist operations

### Wave B Success Metrics  
- 60% of users follow at least one other user
- 40% engagement with leaderboards weekly
- 30% of users earn at least 3 badges
- Daily active users increase by 25%

## Resource Requirements

### Engineering
- 2 Backend developers
- 2 Frontend developers  
- 1 DevOps/Infrastructure
- 1 QA engineer

### Design
- UI/UX updates for new features
- Badge icon designs
- Leaderboard tier visuals

### Product
- Feature prioritization
- User acceptance testing
- Success metric tracking

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Scope creep | High | Medium | Strict feature flags, MVP focus |
| Performance issues | Medium | High | Early load testing, caching strategy |
| User adoption | Medium | High | Beta testing, gradual rollout |
| Technical debt | Medium | Medium | Code reviews, refactoring sprints |
| Provider API limits | Low | High | Rate limiting, caching, fallbacks |

## Next Steps

1. **Immediate Actions**:
   - [ ] Review and approve technical design
   - [ ] Set up feature flag infrastructure
   - [ ] Create database migration scripts
   - [ ] Initialize Wave A API scaffolding

2. **Week 1 Goals**:
   - [ ] Complete profile data model
   - [ ] Implement basic profile endpoints
   - [ ] Create profile UI components
   - [ ] Set up integration tests

3. **Communication**:
   - [ ] Daily standups during implementation
   - [ ] Weekly stakeholder updates
   - [ ] Beta user feedback sessions
   - [ ] Launch announcement preparation