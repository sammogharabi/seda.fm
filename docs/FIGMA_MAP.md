# FIGMA_MAP.md - Screen to API Mapping

## Phase 1: Wire Existing Features (Immediate)

### 1. Authentication Screens

#### Login Screen
- **Figma**: Login page with providers
- **Route**: `/auth/login`
- **Components**:
  ```tsx
  LoginForm.tsx
  ProviderButtons.tsx
  ```
- **APIs**:
  - Supabase: `supabase.auth.signInWithPassword()`
  - Supabase: `supabase.auth.signInWithOAuth()`
- **State Flow**:
  ```
  IDLE → LOADING → SUCCESS/ERROR
  On success → Store JWT → Redirect to channels
  ```

#### Signup Screen
- **Figma**: Registration with email/providers
- **Route**: `/auth/signup`
- **Components**:
  ```tsx
  SignupForm.tsx
  GenrePicker.tsx
  ```
- **APIs**:
  - Supabase: `supabase.auth.signUp()`
  - Backend: Auto-creates User record via AuthGuard
- **State Flow**:
  ```
  REGISTER → PICK_GENRES → JOIN_CHANNELS → COMPLETE
  ```

#### Artist Onboarding
- **Figma**: Artist verification flow
- **Route**: `/artist/verify`
- **Components**:
  ```tsx
  ClaimCodeDisplay.tsx
  URLSubmissionForm.tsx
  VerificationStatus.tsx
  ```
- **APIs**:
  - `POST /api/v1/artist/verification/request`
  - `POST /api/v1/artist/verification/submit`
  - `GET /api/v1/artist/verification/status/:id`

### 2. Chat/Channel Screens

#### Channel Sidebar
- **Figma**: Slack-style channel list
- **Route**: Component in main layout
- **Components**:
  ```tsx
  ChannelList.tsx
  ChannelItem.tsx
  ```
- **APIs**:
  - `GET /api/v1/chat/rooms` (to be added)
  - WebSocket: `socket.on('room_created')`
- **State**:
  ```typescript
  // #COMPLETION_DRIVE: Assuming rooms are channels
  // #SUGGEST_VERIFY: Check if rooms === channels in DB schema
  channels: Room[]
  activeChannel: string
  unreadCounts: Map<string, number>
  ```

#### Channel Feed
- **Figma**: Main chat area with music cards
- **Route**: `/channels/:channelId`
- **Components**:
  ```tsx
  MessageList.tsx
  MessageItem.tsx
  MusicCard.tsx
  MessageComposer.tsx
  ```
- **APIs**:
  - `GET /api/v1/chat/rooms/:roomId/messages`
  - `POST /api/v1/chat/rooms/:roomId/messages`
  - WebSocket events:
    - `send_message`
    - `message_created`
    - `typing_start/stop`
    - `user_typing`
- **State**:
  ```typescript
  messages: Message[]
  typingUsers: Set<userId>
  isLoading: boolean
  hasMore: boolean
  ```

#### Message Reactions
- **Figma**: Emoji reactions on messages
- **Components**:
  ```tsx
  ReactionPicker.tsx
  ReactionList.tsx
  ```
- **APIs**:
  - `POST /api/v1/chat/messages/:messageId/reactions`
  - `DELETE /api/v1/chat/messages/:messageId/reactions/:emoji`
  - WebSocket: `reaction_added`, `reaction_removed`

### 3. Admin Screens

#### Admin Dashboard
- **Figma**: Verification management panel
- **Route**: `/admin`
- **Guards**: Role check for ADMIN/SUPER_ADMIN
- **Components**:
  ```tsx
  PendingVerifications.tsx
  VerificationDetail.tsx
  StatsOverview.tsx
  ```
- **APIs**:
  - `GET /api/v1/admin/verification/pending`
  - `GET /api/v1/admin/verification/:id`
  - `PATCH /api/v1/admin/verification/:id/approve`
  - `PATCH /api/v1/admin/verification/:id/deny`
  - `GET /api/v1/admin/verification/stats/overview`
- **Headers**: `X-Admin-Key: ${ADMIN_API_KEY}`

## State Management Architecture

```typescript
// Global Auth State (Context/Zustand)
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

// Chat State (Context/Zustand)
interface ChatState {
  socket: Socket | null
  rooms: Room[]
  activeRoom: string | null
  messages: Map<roomId, Message[]>
  typingUsers: Map<roomId, Set<userId>>
  joinRoom: (roomId) => void
  sendMessage: (text, trackRef?) => void
}

// Verification State
interface VerificationState {
  requests: VerificationRequest[]
  activeRequest: VerificationRequest | null
  claimCode: string | null
  requestVerification: () => Promise<void>
  submitURL: (url) => Promise<void>
  checkStatus: (id) => Promise<void>
}
```

## WebSocket Connection Setup

```typescript
// apps/web/src/lib/socket.ts
import io from 'socket.io-client'

export const initSocket = (token: string) => {
  const socket = io(`${API_URL}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.on('connect', () => {
    console.log('Connected to chat')
  })

  socket.on('error', (error) => {
    // #COMPLETION_DRIVE: Assuming error is string
    // #SUGGEST_VERIFY: Check error type from backend
    console.error('Socket error:', error)
  })

  return socket
}
```

## Hook Examples

```typescript
// useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    // #COMPLETION_DRIVE: Assuming Supabase session persistence
    // #SUGGEST_VERIFY: Check if session auto-refreshes
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(data.session.user)
      }
    })
  }, [])
  
  return { user, isAuthenticated: !!user }
}

// useChat.ts  
export const useChat = (roomId: string) => {
  const socket = useSocket()
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    if (!socket) return
    
    socket.emit('join_room', roomId)
    
    socket.on('message_created', (message) => {
      setMessages(prev => [...prev, message])
    })
    
    return () => {
      socket.emit('leave_room', roomId)
    }
  }, [socket, roomId])
  
  const sendMessage = (text: string) => {
    socket.emit('send_message', { roomId, text })
  }
  
  return { messages, sendMessage }
}
```

## Phase 2: New Features (To Build)

### Wave A: Artist Profiles & Playlists

#### Artist Profile Page
- **Figma**: Profile with discography, stats
- **Route**: `/artists/:username`
- **APIs** (TO BUILD):
  - `GET /api/v1/profiles/:username`
  - `PATCH /api/v1/profiles/:username`
  - `GET /api/v1/profiles/:username/discography`
- **State**:
  ```typescript
  // #COMPLETION_DRIVE: Profile structure based on PRD
  // #SUGGEST_VERIFY: Confirm fields with product team
  interface ArtistProfile {
    id: string
    username: string
    bio: string
    verified: boolean
    discography: Track[]
    playlists: Playlist[]
    fanLeaderboard: FanRank[]
  }
  ```

#### Playlists
- **Figma**: Playlist creation/management
- **Route**: `/playlists/:playlistId`
- **APIs** (TO BUILD):
  - `POST /api/v1/playlists`
  - `GET /api/v1/playlists/:id`
  - `POST /api/v1/playlists/:id/items`
  - `DELETE /api/v1/playlists/:id/items/:itemId`
  - `POST /api/v1/playlists/:id/collaborators`

### Wave B: Social & Gamification

#### Leaderboards
- **Figma**: Global/Genre/Channel/Artist rankings
- **Route**: `/leaderboards`
- **APIs** (TO BUILD):
  - `GET /api/v1/leaderboards/global`
  - `GET /api/v1/leaderboards/genre/:genreId`
  - `GET /api/v1/leaderboards/channel/:channelId`
  - `GET /api/v1/leaderboards/artist/:artistId`

#### Trophy Case
- **Figma**: Badge grid with dates
- **Route**: `/profile/:username/trophies`
- **APIs** (TO BUILD):
  - `GET /api/v1/users/:userId/badges`
  - `GET /api/v1/badges/available`

## Phase 3: Future Features (Plan Only)

### DJ Mode
- **Route**: `/channels/:channelId/dj`
- **Requirements**:
  - Queue management system
  - Track preloading logic
  - Voting mechanism
  - Auto-skip at 50% downvotes
  - Attribution tracking

### Music Player
- **Component**: Persistent bottom player
- **Requirements**:
  - Provider-agnostic interface
  - SDK integrations (Spotify, Apple, etc)
  - Playback state sync across tabs
  - Queue management

### Discovery/Search
- **Route**: `/discover`
- **Requirements**:
  - Full-text search
  - Filter by genre/mood/artist
  - Recommendation engine
  - Trending algorithms

## Error States & Edge Cases

1. **Auth Failures**:
   - Token expired → Auto-refresh
   - Network error → Retry with exponential backoff
   - Invalid credentials → Show error message

2. **WebSocket Disconnection**:
   - Auto-reconnect with backoff
   - Queue messages while offline
   - Sync state on reconnection

3. **Rate Limiting**:
   - Show cooldown timer
   - Disable actions until reset
   - Cache responses where possible

4. **Empty States**:
   - No messages → "Be the first to chat!"
   - No channels → "Join a channel to get started"
   - No verification → "Verify your artist account"

## Performance Optimizations

1. **Message Virtualization**: Use react-window for long message lists
2. **Image Optimization**: Lazy load album artwork
3. **WebSocket Debouncing**: Batch typing indicators
4. **API Caching**: Cache user profiles, channel lists
5. **Optimistic Updates**: Show messages immediately, rollback on error