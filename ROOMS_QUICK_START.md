# Rooms Feature - Quick Start Guide

## Current Status: 45% Complete

### What's Working
- Database schema (100% complete)
- DJ Sessions backend API (production ready)
- Frontend UI components (60% done)
- Queue voting system
- Session management

### What's Missing (Critical for Production)
1. **Room management backend** - No create/update/delete room endpoints
2. **Message/chat API** - No send/receive message endpoints
3. **Frontend API integration** - UI uses mock data only
4. **Real-time updates** - No WebSocket/polling for live updates
5. **Authorization** - No permission checking

---

## Quick Facts

| Metric | Value |
|--------|-------|
| Backend Complete | 20% |
| Frontend UI Complete | 60% |
| Database Ready | 100% |
| Production Ready | 0% |
| Est. Dev Time (MVP) | 2-3 weeks |
| Est. Dev Time (Full) | 4-5 weeks |

---

## Files You Need to Know About

### Backend
- `/backend/src/modules/sessions/` - DONE (complete implementation)
- `/backend/src/modules/chat/` - MISSING (need to create)
- `/backend/src/app.module.ts` - Line 11: ChatModule commented out
- `/backend/prisma/schema.prisma` - COMPLETE (Room, Message, RoomMembership tables ready)

### Frontend
- `/frontend-v2/src/components/RoomsView.tsx` - UI complete, needs API calls
- `/frontend-v2/src/components/RoomView.tsx` - UI complete, needs API calls
- `/frontend-v2/src/services/api.ts` - Basic setup, needs room/message functions
- `/frontend-v2/src/components/DJMode.tsx` - Session UI exists, needs backend integration

---

## Critical Blockers

### 1. Missing Backend Endpoints
Needed for any room functionality:
```
POST   /rooms                  - Create room
GET    /rooms                  - List user's rooms
POST   /rooms/:id/join         - Join room
POST   /rooms/:id/messages     - Send message
GET    /rooms/:id/messages     - Get messages
POST   /rooms/:id/leave        - Leave room
```

### 2. No API Integration in Frontend
RoomsView and RoomView use mock data arrays (DISCOVERABLE_ROOMS, JOINED_ROOMS, MOCK_MESSAGES).
Need to replace with actual API calls.

### 3. No Real-Time Updates
Messages won't appear instantly without WebSocket or polling.

---

## Recommended Action Plan

### Week 1: Backend (3-4 days)
1. Uncomment ChatModule in app.module.ts
2. Create `/backend/src/modules/chat/` with:
   - `chat.controller.ts` (Room CRUD, messages)
   - `chat.service.ts` (Room business logic)
   - `message.service.ts` (Message operations)
   - DTOs for room/message operations
3. Add authorization/validation
4. Write tests

### Week 2: Frontend (3-4 days)
1. Create `roomsService.ts` API client
2. Create `messagesService.ts` API client
3. Replace mock data with API calls in RoomsView
4. Replace mock data with API calls in RoomView
5. Add loading states and error handling

### Week 3: Testing & Polish (2-3 days)
1. Integration testing
2. Real-time updates (WebSocket or polling)
3. Security audit
4. Performance testing

---

## For Deployment NOW

If you need to ship today:

**Option 1: Hide the Feature**
```typescript
// In frontend routing, disable rooms feature
if (!featureFlags.ROOMS_ENABLED) {
  return <DJSessionsOnly />;
}
```

**Option 2: Deploy DJ Sessions Only**
- Sessions are production ready
- Skip rooms feature for now
- Add later once implementation is complete

**Option 3: Deploy with Mock Data**
- Show UI with mock data
- Add "Coming Soon" badges
- Replace with real API later

---

## Implementation Difficulty

**Easy (1-2 days):**
- Room CRUD endpoints
- Basic message API
- Join/leave room

**Medium (3-5 days):**
- Authorization/permissions
- Message reactions
- Member management
- Frontend integration

**Hard (5+ days):**
- Real-time WebSocket
- Message pagination/infinite scroll
- Caching strategy
- Performance optimization

---

## Key Architecture Decisions Made

1. **Rooms can be linked to DJ Sessions**
   - When user joins session in a room, automatically added to room membership
   - Sessions can exist standalone too

2. **Message Types**
   - TEXT: Regular chat
   - TRACK_CARD: Music share
   - SYSTEM: Auto-generated (user joined, etc)
   - REPLY: Threaded replies

3. **Room Privacy**
   - isPrivate flag (not enforced yet)
   - Roles: creator is mod, can add/remove members

4. **Voting System**
   - Democratic queue management
   - Users can upvote/downvote tracks
   - Queue sorted by votes then position

---

## Database Structure (Ready to Use)

```
rooms (id, name, description, isPrivate, createdBy, createdAt)
  ├── messages (id, roomId, userId, type, text, trackRef, parentId)
  │   ├── reactions (id, messageId, userId, emoji)
  │   └── message threads (parentId relationship)
  ├── room_memberships (id, roomId, userId, isMod, joinedAt)
  └── dj_sessions (id, roomId, name, hostId, status, genre, tags)
       └── queue_items (id, sessionId, trackRef, position, upvotes, downvotes)
            └── votes (id, queueItemId, userId, voteType)
```

---

## Testing Strategy

### Must Have
- [ ] Room CRUD operations work
- [ ] Permission checks prevent non-members from messaging
- [ ] Private rooms only allow invited members
- [ ] Messages persist in database
- [ ] Voting system recalculates correctly

### Should Have
- [ ] Real-time updates work
- [ ] Infinite scroll pagination
- [ ] Message reactions work
- [ ] Member roles enforced
- [ ] Rate limiting on messages

### Nice to Have
- [ ] Presence awareness
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message search
- [ ] Analytics/stats

---

## Deployment Checklist

- [ ] All backend endpoints implemented and tested
- [ ] Frontend API client functions created
- [ ] Mock data replaced with API calls
- [ ] Loading states added to UI
- [ ] Error handling implemented
- [ ] Real-time updates working (or acceptable polling)
- [ ] Security audit passed
- [ ] Performance baseline measured
- [ ] Team trained on feature
- [ ] Monitoring/alerts configured
- [ ] Rollback plan documented

---

## Next Steps

1. **Read the full analysis:** `/ROOMS_FEATURE_ANALYSIS.md`
2. **Decide deployment strategy:** Now vs. later
3. **Create chat module:** Start backend implementation
4. **Implement API client:** Frontend integration
5. **Test thoroughly:** Before going to production

---

## Resources

- Database Schema: `/backend/prisma/schema.prisma` (lines 161-192, 500-570)
- DJ Sessions (reference): `/backend/src/modules/sessions/`
- Frontend UI: `/frontend-v2/src/components/RoomsView.tsx`, `RoomView.tsx`
- Test file: `/backend/test/chat.integration.spec.ts` (note: endpoints missing)

---

## Support

For detailed information about:
- **What's implemented:** See Part 1-2 of ROOMS_FEATURE_ANALYSIS.md
- **What's missing:** See Part 3 of ROOMS_FEATURE_ANALYSIS.md
- **How to fix:** See Part 6-8 of ROOMS_FEATURE_ANALYSIS.md
- **Development timeline:** See Part 9 of ROOMS_FEATURE_ANALYSIS.md

---

Generated: November 20, 2025
