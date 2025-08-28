# Chat Backend Implementation Guide

## 🏗️ Architecture Overview

The chat system is built as a NestJS module with multiple services handling different concerns:

```typescript
ChatModule
├── ChatController      # REST API endpoints
├── ChatGateway        # WebSocket real-time events
├── ChatService        # Core messaging logic
├── MusicUnfurlingService  # Link detection & metadata
├── MentionsService    # @mention processing
├── SafetyService      # Content moderation
└── AnalyticsService   # Event tracking
```

## 📁 File Structure

```
src/modules/chat/
├── chat.controller.ts         # HTTP REST endpoints
├── chat.gateway.ts           # WebSocket gateway  
├── chat.module.ts            # Module definition
├── dto/                      # Data transfer objects
│   ├── send-message.dto.ts
│   ├── create-room.dto.ts
│   ├── get-messages.dto.ts
│   ├── add-reaction.dto.ts
│   └── moderate-user.dto.ts
├── entities/                 # Response entities
│   ├── message.entity.ts
│   └── room.entity.ts
├── interfaces/               # TypeScript interfaces
│   └── websocket-events.interface.ts
├── guards/                   # Custom guards (if needed)
└── services/                 # Business logic services
    ├── chat.service.ts
    ├── music-unfurling.service.ts
    ├── mentions.service.ts
    ├── safety.service.ts
    └── analytics.service.ts
```

## 🚀 Core Services Deep Dive

### ChatService
Main service handling all chat operations:

```typescript
// Key methods
async createRoom(userId: string, createRoomDto: CreateRoomDto)
async joinRoom(userId: string, roomId: string)
async sendMessage(userId: string, roomId: string, sendMessageDto: SendMessageDto)
async getMessages(roomId: string, getMessagesDto: GetMessagesDto)
async addReaction(userId: string, messageId: string, emoji: string)
async moderateUser(moderatorId: string, roomId: string, moderateUserDto: ModerateUserDto)
```

**File**: `src/modules/chat/services/chat.service.ts`

### MusicUnfurlingService
Handles music link detection and metadata extraction:

```typescript
// Detects music links in text
detectMusicLinks(text: string): string[]

// Extracts metadata from music URLs
async unfurlMusicLink(url: string): Promise<TrackRefDto | null>

// Supported platforms
- Spotify: open.spotify.com/track/*
- YouTube: youtube.com/watch?v=* or youtu.be/*
- Apple Music: music.apple.com/*/*
- Bandcamp: *.bandcamp.com/track/*
- Beatport: beatport.com/track/*/*
```

**File**: `src/modules/chat/services/music-unfurling.service.ts`

### SafetyService
Content moderation and safety features:

```typescript
// Rate limiting check
async checkRateLimit(userId: string, roomId: string): Promise<boolean>

// Content filtering
async filterMessage(text: string, userId: string, roomId: string)

// Safety checks
containsProfanity(text: string): boolean
isSpamLink(text: string): boolean
isMessageTooLong(text: string): boolean
```

**File**: `src/modules/chat/services/safety.service.ts`

## 🔌 WebSocket Implementation

### Connection Management
```typescript
// Authentication flow
async handleConnection(client: AuthenticatedSocket)
async authenticateSocket(socket: AuthenticatedSocket): Promise<string | null>

// Room management  
@SubscribeMessage('join_room')
@SubscribeMessage('leave_room')
@SubscribeMessage('send_message')
```

### Real-time Events
```typescript
// Emitting events to clients
this.server.to(roomId).emit('message_created', message);
this.server.to(roomId).emit('reaction_added', reaction);
this.server.to(roomId).emit('user_typing', roomId, userId, isTyping);
```

**File**: `src/modules/chat/chat.gateway.ts`

## 🗄️ Database Schema

### Core Models
```sql
-- Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES users(id),
  type MESSAGE_TYPE DEFAULT 'TEXT',
  text TEXT,
  track_ref JSONB,
  parent_id UUID REFERENCES messages(id),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Reactions
CREATE TABLE reactions (
  id UUID PRIMARY KEY,
  message_id UUID REFERENCES messages(id),
  user_id UUID REFERENCES users(id),
  emoji VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);
```

**File**: `prisma/schema.prisma`

## 🔧 Configuration

### Module Setup
```typescript
// app.module.ts
@Module({
  imports: [
    // ... other modules
    ChatModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
  ],
})
```

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/seda"
FRONTEND_URL="http://localhost:3000"
```

## 🧪 Testing

### Unit Tests
```bash
npm run test -- --testPathPattern=chat
```

### E2E Tests
```bash
npm run test:e2e -- --testPathPattern=chat
```

### Manual Testing
1. Start the server: `npm run start:dev`
2. Connect WebSocket client to `ws://localhost:3000/chat`
3. Use REST API endpoints for HTTP testing

## 🚨 Error Handling

### Common Error Scenarios
```typescript
// User not authenticated
throw new ForbiddenException('User is not a member of this room');

// Rate limiting
throw new BadRequestException('Rate limit exceeded');

// Message too long
throw new BadRequestException('Message too long');

// Invalid music link
// Gracefully fails, no error thrown
```

## 📊 Performance Considerations

### Database Indexing
```sql
-- Optimized for message retrieval
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at);
CREATE INDEX idx_messages_parent ON messages(parent_id);
CREATE INDEX idx_reactions_message ON reactions(message_id);
```

### Caching Strategy
- Track metadata cached in `track_refs` table
- Music link unfurling results cached indefinitely
- Rate limiting uses in-memory counters

### WebSocket Scaling
- Room-based event targeting: `server.to(roomId).emit()`
- Typing indicators auto-cleanup after 5s
- Connection cleanup on disconnect

## 🔒 Security Features

### Input Validation
- All DTOs use `class-validator` decorators
- SQL injection prevention via Prisma ORM
- XSS prevention through proper data encoding

### Authorization
- JWT token validation in WebSocket handshake
- Room membership checks before operations
- Moderator permission validation

### Rate Limiting
- Global: 100 requests/minute per IP
- Chat-specific: 10 messages/minute per user per room
- WebSocket connection limits