# DJ Mode & Sessions - Feature README

## Overview
DJ Mode is the core real-time music experience feature where users take turns playing tracks, vote on what plays next, and experience music together in synchronized sessions. Think of it as a virtual DJ booth where the crowd controls the music.

## Location
- **Main Component**: `/components/DJMode.tsx`
- **Session View**: `/components/SessionsView.tsx`
- **Mini Player**: `/components/MiniPlayer.tsx`
- **Minimized Session**: `/components/MinimizedDJSession.tsx`
- **Session Chat**: `/components/SessionChat.tsx`
- **Config**: `/components/DJSessionConfig.tsx`
- **Progress Overlay**: `/components/DJProgressOverlay.tsx`
- **Notifications**: `/components/DJNotificationSystem.tsx`

## Key Features

### Turn-Based DJ System
- Users take turns being the DJ
- Each DJ selects tracks from their crate or library
- Queue is managed by voting system
- Auto-skip functionality based on crowd votes

### Voting System
- Upvote/downvote for queued tracks
- Crowd-sourced curation
- Visual vote counts on each track
- Influences play order

### Real-Time Synchronization
- All participants hear the same track at the same time
- Synchronized playback progress
- Live updates when DJ changes
- Real-time queue updates

### Persistent Mini Player
- Continues playing when navigating away
- Shows current track and session info
- Click to return to full DJ Mode
- Minimize/maximize without interrupting playback

### Session Chat
- Live chat during sessions
- See who's in the session
- React to tracks being played
- Community interaction

## User Flow

### Joining a Session
1. Navigate to Sessions view
2. Browse active sessions
3. Click "Join Session"
4. Enters DJ Mode interface
5. Can vote on tracks immediately

### Becoming DJ
1. Wait for turn in rotation
2. System notifies when it's your turn
3. Select tracks from your crates
4. Tracks are added to queue
5. Watch crowd reactions and votes

### Adding Tracks to Queue
1. Click "Add to Queue" button
2. Browse your crates or library
3. Select track
4. Track appears in queue with vote buttons
5. Crowd can vote on your selection

### Voting
1. See upcoming tracks in queue
2. Click upvote (👍) or downvote (👎)
3. Vote count updates in real-time
4. Highly voted tracks move up in queue

### Mini Player Mode
1. Join a session
2. Navigate to another view
3. Mini player appears at bottom
4. Shows current track, session, progress
5. Click to return to full DJ Mode

## Components

### DJMode.tsx
**Purpose**: Main DJ session interface

**Key State**:
- Current track playing
- Queue of upcoming tracks
- Current DJ
- Participant list
- Vote counts

**Key Functions**:
- `handleVote()` - Process upvote/downvote
- `handleSkip()` - Skip to next track
- `handleAddToQueue()` - Add track to queue
- `handleLeaveSession()` - Exit session

**Props**:
- `session` - Active session data
- `user` - Current user
- `onClose` - Handler to exit

### SessionsView.tsx
**Purpose**: Browse and join active sessions

**Features**:
- List all active sessions
- Filter by genre, size, etc.
- Create new session
- Session preview cards

### MiniPlayer.tsx
**Purpose**: Persistent playback indicator

**Shows**:
- Current track info
- Session name
- Playback progress
- Play/pause controls
- Return to session button

**State Management**:
```typescript
const { activeSession, nowPlaying } = useAppState();
```

### DJSessionConfig.tsx
**Purpose**: Configure new session settings

**Settings**:
- Session name
- Genre/vibe
- Max participants
- Auto-skip threshold
- Public/private

## State Management

### Session State (useDJSession.ts)
```typescript
const {
  currentSession,      // Active session data
  queue,              // Upcoming tracks
  currentDJ,          // Who's DJ now
  participants,       // Users in session
  votes,              // Track votes
  joinSession,        // Join function
  leaveSession,       // Leave function
  addToQueue,         // Add track function
  vote               // Vote function
} = useDJSession();
```

### App State (useAppState.ts)
```typescript
const {
  activeSession,      // Session user is in
  setActiveSession,   // Set active session
  nowPlaying,         // Current track
  setNowPlaying      // Update now playing
} = useAppState();
```

## Mock Data

### Sample Session
```typescript
{
  id: 'session-1',
  name: 'Late Night Vibes',
  hostId: 'artist-1',
  hostName: 'midnight-theory',
  currentDJ: {
    id: 'fan-2',
    username: 'beatseeker',
    displayName: 'beatseeker'
  },
  participants: 12,
  maxParticipants: 50,
  genre: 'Electronic',
  isActive: true,
  queue: [...tracks],
  nowPlaying: track,
  createdAt: '2024-11-05T...'
}
```

## Design Patterns

### Auto-Skip Logic
- Track vote ratio monitored
- If downvotes exceed threshold (e.g., 60%), auto-skip
- Visual countdown when approaching skip
- Notification to DJ and participants

### Turn-Based DJ Rotation
- Queue of DJ turns
- Automatic rotation after X tracks
- DJ can extend turn if crowd votes
- Visual indicator of whose turn is next

### Vote Aggregation
```typescript
const netVotes = upvotes - downvotes;
const voteRatio = downvotes / (upvotes + downvotes);
const shouldSkip = voteRatio > 0.6;
```

## Styling

### Colors
- Active session: Coral accent (#ff6b6b)
- Vote up: Mint accent (#95e1d3)
- Vote down: Red/coral
- Current DJ: Yellow highlight (#f9ca24)
- Queue items: Dark cards (#1a1a1a)

### Layout
- Split view: Queue on left, chat on right
- Full screen on mobile
- Progress bar at top
- Mini player at bottom when minimized

## Real-Time Features (TODO)

### Current State
- Mock real-time updates
- Simulated synchronization
- Local state management

### Production Needs
- WebSocket connection
- Real-time vote updates
- Synchronized playback
- Presence indicators
- Live chat messages

## Integration Points

### With Mini Player
```typescript
// Join session → Mini player appears
setActiveSession(session);

// Navigate away → Mini player persists
setCurrentView('feed');

// Click mini player → Return to DJ Mode
setCurrentView('dj-mode');

// Leave session → Mini player disappears
setActiveSession(null);
```

### With Crates
- DJ selects from their crates
- Add to queue from crate view
- Crate tracks shown in selection modal

### With Social Feed
- Share session to feed
- Post about tracks playing
- Invite friends to session

## Testing Checklist

### Basic Functionality
- [ ] Join session
- [ ] See current track playing
- [ ] View queue
- [ ] Vote on tracks
- [ ] Add tracks to queue
- [ ] Leave session
- [ ] Mini player appears when navigating away
- [ ] Mini player returns to session when clicked

### DJ Flow
- [ ] Become DJ in rotation
- [ ] Select tracks from crate
- [ ] See crowd votes
- [ ] Track auto-skips on too many downvotes
- [ ] Turn passes to next DJ

### Chat
- [ ] Send message in chat
- [ ] See other messages
- [ ] See participant list
- [ ] See who joins/leaves

### Mobile
- [ ] DJ Mode works on mobile
- [ ] Queue scrolls properly
- [ ] Vote buttons are touch-friendly
- [ ] Mini player visible and functional
- [ ] Chat accessible

## Common Issues

### Session Not Loading
- Check `activeSession` state
- Verify session ID exists in mock data
- Check `SessionsView` navigation

### Votes Not Updating
- Check vote state management
- Verify `handleVote()` function
- Check vote count calculation

### Mini Player Not Showing
- Verify `activeSession` is set
- Check `MiniPlayer` conditional render
- Verify z-index and positioning

### Playback Not Synchronized
- Currently using mock sync (no real sync yet)
- Need WebSocket for true real-time
- Plan for production: Supabase Realtime

## Future Enhancements

### Planned Features
1. **Collaborative Queues**: Multiple DJs at once
2. **Session Recording**: Save sessions as crates
3. **Live Reactions**: Emoji reactions to tracks
4. **DJ Stats**: Track your DJ performance
5. **Session Themes**: Visual themes for sessions
6. **Scheduled Sessions**: Plan sessions in advance
7. **Guest DJs**: Invite specific users to DJ
8. **Session Analytics**: Engagement metrics

### Real-Time Integration
```typescript
// Example WebSocket setup
const supabase = createClient(...);
const channel = supabase.channel(`session-${sessionId}`);

channel
  .on('broadcast', { event: 'vote' }, (payload) => {
    updateVotes(payload);
  })
  .on('broadcast', { event: 'queue-update' }, (payload) => {
    updateQueue(payload);
  })
  .subscribe();
```

## Code Examples

### Join Session
```typescript
const handleJoinSession = (session) => {
  setActiveSession(session);
  setCurrentView('dj-mode');
  setNowPlaying(session.nowPlaying);
  
  toast.success(`Joined ${session.name}`, {
    description: `${session.participants} people vibing`
  });
};
```

### Vote on Track
```typescript
const handleVote = (trackId, voteType) => {
  const updatedQueue = queue.map(item => {
    if (item.id === trackId) {
      return {
        ...item,
        upvotes: voteType === 'up' ? item.upvotes + 1 : item.upvotes,
        downvotes: voteType === 'down' ? item.downvotes + 1 : item.downvotes
      };
    }
    return item;
  });
  
  setQueue(updatedQueue);
  checkAutoSkip(updatedQueue.find(t => t.id === trackId));
};
```

### Auto-Skip Logic
```typescript
const checkAutoSkip = (track) => {
  const totalVotes = track.upvotes + track.downvotes;
  const skipThreshold = 0.6; // 60% downvotes
  
  if (totalVotes >= 10) { // Minimum votes required
    const downvoteRatio = track.downvotes / totalVotes;
    
    if (downvoteRatio >= skipThreshold) {
      toast.error('Track skipped by crowd vote');
      playNextTrack();
    }
  }
};
```

## Backend Requirements (Production)

### API Endpoints Needed
```
POST /sessions/create - Create new session
POST /sessions/:id/join - Join session
POST /sessions/:id/leave - Leave session
POST /sessions/:id/queue - Add to queue
POST /sessions/:id/vote - Vote on track
GET /sessions/active - List active sessions
```

### WebSocket Events
```
session:joined - User joined
session:left - User left
session:vote - Vote cast
session:queue-update - Queue changed
session:track-change - Now playing changed
session:dj-change - New DJ
```

### Data Storage
```typescript
// Session data in KV store
await kv.set(`session:${sessionId}`, {
  ...sessionData,
  participants: [...userIds],
  queue: [...tracks],
  nowPlaying: track,
  currentDJ: userId
});
```

## Performance Considerations

### Optimization
- Lazy load session participants
- Virtualize long queues
- Debounce vote submissions
- Cache session data locally
- Optimize WebSocket messages

### Scalability
- Limit max participants per session
- Queue length limits
- Vote rate limiting
- Message throttling in chat

## Accessibility

### Keyboard Navigation
- Tab through queue items
- Space to vote
- Enter to join session
- Escape to leave

### Screen Reader Support
- Announce now playing
- Announce vote counts
- Announce DJ changes
- Announce chat messages

## Related Files
- `/hooks/useDJSession.ts` - Session state management
- `/hooks/useAppState.ts` - Global app state
- `/data/mockData.ts` - Mock session data
- `/components/AddToQueueModal.tsx` - Add tracks interface

## Documentation
- See `ARCHITECTURE.md` for overall system design
- See `STATE-MANAGEMENT.md` for state patterns
- See `COMPONENT-GUIDE.md` for component details
