# CONNECTION_NOTES.md - Phase 1 Wiring Details

## Endpoints & Payloads Reference

### Authentication Endpoints

#### Supabase Auth (Direct)
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
// Returns: { user, session: { access_token, refresh_token } }

// OAuth Login  
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'spotify' | 'google' | 'apple'
})

// Signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Get Session
const { data: { session } } = await supabase.auth.getSession()

// Sign Out
await supabase.auth.signOut()
```

### Artist Verification Endpoints

#### Request Verification
```typescript
POST /api/v1/artist/verification/request
Headers: { Authorization: 'Bearer ${token}' }
Body: {} // No body required

Response: {
  id: string
  claimCode: string // 8 characters
  expiresAt: Date
  status: 'PENDING'
}

// #COMPLETION_DRIVE: Assuming claimCode format is alphanumeric
// #SUGGEST_VERIFY: Check actual code generation in verification.service.ts
```

#### Submit URL for Verification
```typescript
POST /api/v1/artist/verification/submit
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  verificationId: string
  url: string // Where claim code is placed
}

Response: {
  id: string
  status: 'CRAWLING' | 'AWAITING_ADMIN' | 'APPROVED'
  crawlResult?: {
    codeFound: boolean
    screenshot?: string
  }
}
```

#### Check Verification Status
```typescript
GET /api/v1/artist/verification/status/:id
Headers: { Authorization: 'Bearer ${token}' }

Response: {
  id: string
  status: 'PENDING' | 'CRAWLING' | 'AWAITING_ADMIN' | 'APPROVED' | 'DENIED' | 'EXPIRED'
  claimCode: string
  url?: string
  approvedAt?: Date
  deniedAt?: Date
  denialReason?: string
}
```

### Chat/Messaging Endpoints

#### Create Room
```typescript
POST /api/v1/chat/rooms
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  name: string
  description?: string
  isPublic: boolean
}

Response: {
  id: string
  name: string
  description: string
  isPublic: boolean
  createdBy: string
  createdAt: Date
}
```

#### Join Room
```typescript
POST /api/v1/chat/rooms/:roomId/join
Headers: { Authorization: 'Bearer ${token}' }

Response: {
  roomId: string
  userId: string
  role: 'MEMBER' | 'MODERATOR' | 'OWNER'
  joinedAt: Date
}
```

#### Send Message
```typescript
POST /api/v1/chat/rooms/:roomId/messages
Headers: { Authorization: 'Bearer ${token}' }
Body: {
  text: string
  trackRef?: {
    provider: 'spotify' | 'apple' | 'youtube'
    trackId: string
    metadata: {
      title: string
      artist: string
      albumArt: string
      duration: number
    }
  }
  parentId?: string // For replies
}

Response: {
  id: string
  roomId: string
  userId: string
  text: string
  type: 'TEXT' | 'TRACK_CARD' | 'SYSTEM' | 'REPLY'
  trackRef?: TrackRef
  parentMessage?: Message
  createdAt: Date
}
```

#### Get Messages
```typescript
GET /api/v1/chat/rooms/:roomId/messages
Headers: { Authorization: 'Bearer ${token}' }
Query: {
  limit?: number // Default 50
  before?: string // Message ID for pagination
  after?: string // Message ID for real-time updates
}

Response: {
  messages: Message[]
  hasMore: boolean
  oldestMessageId: string
  newestMessageId: string
}

// #COMPLETION_DRIVE: Assuming cursor-based pagination
// #SUGGEST_VERIFY: Check if backend supports this pagination style
```

### WebSocket Authentication

#### Expected Headers & Auth Flow
```typescript
// WebSocket Connection with Bearer Token
const socket = io('ws://localhost:3001/chat', {
  auth: {
    token: localStorage.getItem('supabase.auth.token')
  },
  // OR via headers
  extraHeaders: {
    Authorization: `Bearer ${supabaseSession.access_token}`
  }
})

// Server-side Implementation Path
// #COMPLETION_DRIVE: Implement Supabase JWKS guard in ChatGateway
// Current: Placeholder auth returns 'user-id-placeholder'
// Target: Validate JWT against Supabase JWKS endpoint
// Implementation: 
//   1. Extract Bearer token from socket.handshake.auth.token
//   2. Verify JWT signature using Supabase public keys
//   3. Extract user_id from JWT claims
//   4. Store authenticated user in socket.data.user
```

#### Error Shapes
```typescript
// Authentication Errors
{
  event: 'error',
  data: {
    code: 'AUTH_INVALID_TOKEN' | 'AUTH_EXPIRED' | 'AUTH_MISSING',
    message: string,
    statusCode: 401
  }
}

// Connection Errors  
{
  event: 'connect_error',
  data: {
    type: 'TransportError',
    message: string
  }
}
```

### WebSocket Events

#### Connection
```typescript
// Client → Server
socket.emit('authenticate', { token: string })

// Server → Client  
socket.on('authenticated', { userId: string })
socket.on('error', { message: string })
```

#### Room Events
```typescript
// Join Room
socket.emit('join_room', roomId: string)
socket.on('user_joined', (roomId: string, userId: string))

// Leave Room
socket.emit('leave_room', roomId: string)
socket.on('user_left', (roomId: string, userId: string))
```

#### Message Events
```typescript
// Send Message
socket.emit('send_message', {
  roomId: string
  text: string
  trackRef?: TrackRef
  parentId?: string
})

// Receive Message
socket.on('message_created', (message: Message))
socket.on('message_deleted', (messageId: string, roomId: string))
```

#### Reaction Events
```typescript
// Add Reaction
socket.emit('add_reaction', {
  messageId: string
  emoji: string
})

// Remove Reaction
socket.emit('remove_reaction', {
  messageId: string
  emoji: string
})

// Reaction Updates
socket.on('reaction_added', (reaction: Reaction))
socket.on('reaction_removed', (messageId: string, userId: string, emoji: string))
```

#### Typing Indicators
```typescript
// Start Typing
socket.emit('typing_start', roomId: string)

// Stop Typing
socket.emit('typing_stop', roomId: string)

// Typing Status
socket.on('user_typing', (roomId: string, userId: string, isTyping: boolean))
```

### Admin Endpoints

#### Get Pending Verifications
```typescript
GET /api/v1/admin/verification/pending
Headers: { 
  Authorization: 'Bearer ${token}',
  'X-Admin-Key': '${ADMIN_API_KEY}'
}
Query: {
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'status'
}

Response: {
  verifications: VerificationRequest[]
  total: number
  hasMore: boolean
}
```

#### Approve Verification
```typescript
PATCH /api/v1/admin/verification/:id/approve
Headers: { 
  Authorization: 'Bearer ${token}',
  'X-Admin-Key': '${ADMIN_API_KEY}'
}
Body: {
  notes?: string
}

Response: {
  id: string
  status: 'APPROVED'
  approvedAt: Date
  approvedBy: string
}
```

## API Gaps & Missing Endpoints

### Critical Gaps (Need immediate implementation)

1. **Get User Profile**
   ```typescript
   // MISSING - Need to add to user.controller.ts
   GET /api/v1/users/me
   GET /api/v1/users/:id
   ```

2. **List Rooms/Channels**
   ```typescript
   // MISSING - Need to add to chat.controller.ts
   GET /api/v1/chat/rooms
   GET /api/v1/chat/rooms/joined
   ```

3. **Room Members**
   ```typescript
   // MISSING - Need to add
   GET /api/v1/chat/rooms/:roomId/members
   ```

4. **Genre Management**
   ```typescript
   // MISSING - Need new module
   GET /api/v1/genres
   POST /api/v1/users/genres // User genre preferences
   ```

### Authentication Gaps

1. **Token Refresh**
   - Currently relying on Supabase auto-refresh
   - Need explicit refresh endpoint for mobile apps
   - #COMPLETION_DRIVE: Assuming Supabase handles refresh automatically
   - #SUGGEST_VERIFY: Test refresh behavior in production

2. **Session Management**
   - No explicit session listing/management
   - No device tracking
   - No "Sign out all devices" functionality

3. **OAuth Callback Handling**
   - Need frontend routes for OAuth callbacks
   - Handle provider-specific data (Spotify playlists, etc.)

### WebSocket Gaps

1. **Authentication**
   - Currently using placeholder auth in gateway
   - Need proper Supabase token validation
   - #COMPLETION_DRIVE: Placeholder returns 'user-id-placeholder'
   - #SUGGEST_VERIFY: Implement real auth in authenticateSocket()

2. **Reconnection Logic**
   - No state recovery after disconnect
   - No message queue for offline sending
   - No duplicate detection

3. **Room State Sync**
   - No bulk room join on connect
   - No unread count tracking
   - No presence system (online/offline users)

## Frontend Integration Checklist

### Environment Variables Needed
```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADMIN_API_KEY= # Only for admin builds
```

### Required Packages
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.43.0",
    "socket.io-client": "^4.7.0",
    "axios": "^1.6.0",
    "zustand": "^4.5.0", // Or your state manager
    "react-query": "^3.39.0", // For API caching
    "react-window": "^1.8.10" // For message virtualization
  }
}
```

### CORS Configuration
Backend currently allows:
- Origins from CORS_ORIGINS env variable
- Credentials: true
- Methods: GET, POST, PATCH, DELETE
- Headers: Authorization, X-Admin-Key

### Rate Limiting
- Global: 100 requests/minute
- Verification requests: 3/day per user
- WebSocket events: No explicit limits
- #COMPLETION_DRIVE: Assuming no WebSocket rate limits
- #SUGGEST_VERIFY: Add rate limiting for socket events

## Testing Endpoints

### Health Check
```bash
curl http://localhost:3001/api/v1/health
# Response: { status: 'healthy', timestamp: '...' }
```

### Auth Test
```bash
# Get token from Supabase
TOKEN=$(curl -X POST https://[project].supabase.co/auth/v1/token \
  -H "apikey: [anon_key]" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.access_token')

# Test authenticated endpoint
curl http://localhost:3001/api/v1/artist/verification/my-requests \
  -H "Authorization: Bearer $TOKEN"
```

### WebSocket Test
```javascript
// Browser console
const socket = io('http://localhost:3001/chat', {
  auth: { token: localStorage.getItem('supabase.auth.token') }
})

socket.on('connect', () => console.log('Connected'))
socket.emit('join_room', 'test-room')
socket.on('user_joined', console.log)
```

## Known Issues & Workarounds

1. **WebSocket Auth**: Currently returns placeholder user ID
   - Workaround: Use HTTP endpoints for critical operations
   
2. **Message Pagination**: May not handle large histories well
   - Workaround: Implement virtual scrolling on frontend
   
3. **File Uploads**: No direct support for media
   - Workaround: Use Supabase Storage directly
   
4. **Push Notifications**: Not implemented
   - Workaround: Poll for updates or use WebSocket

5. **Offline Support**: No message queuing
   - Workaround: Store in localStorage, retry on reconnect