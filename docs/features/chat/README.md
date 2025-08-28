# Chat Feature - seda.fm

## Overview
Real-time music-first chat system with track unfurling, reactions, threads, and moderation tools.

## 🎯 Key Features
- **Real-time messaging** with WebSocket support (sub-200ms latency)
- **Music link unfurling** for Spotify, YouTube, Apple Music, Bandcamp, Beatport
- **Social interactions**: reactions, @mentions, 1-level reply threads
- **Moderation tools**: delete, mute, reaction clearing
- **Safety features**: rate limiting, profanity filter, spam detection
- **Analytics tracking** for all user interactions

## 📊 Analytics Events
All events are tracked per the PRD:
- `chat_message_sent`, `chat_message_viewed`
- `track_unfurled`, `reaction_added`, `reply_created`
- `mention_delivered`, `mod_action`, `spam_blocked`

## 🏗️ Architecture

### Backend Services
- **ChatService**: Core messaging logic
- **MusicUnfurlingService**: Link detection & metadata extraction
- **MentionsService**: @mention processing & notifications
- **SafetyService**: Content moderation & rate limiting
- **AnalyticsService**: Event tracking & metrics

### Database Models
- `Room`: Chat rooms (public/private)
- `Message`: Chat messages with track refs
- `Reaction`: Emoji reactions to messages
- `TrackRef`: Cached music metadata
- `RoomMembership`: User permissions per room
- `ModerationLog`: Audit trail

### API Endpoints
```
POST   /chat/rooms                    # Create room
POST   /chat/rooms/:id/join           # Join room
POST   /chat/rooms/:id/messages       # Send message
GET    /chat/rooms/:id/messages       # Get message history
POST   /chat/messages/:id/reactions   # Add reaction
DELETE /chat/messages/:id/reactions/:emoji # Remove reaction
POST   /chat/rooms/:id/moderation     # Moderation actions
```

### WebSocket Events (Namespace: /chat)
```typescript
// Client → Server
join_room, leave_room, send_message, add_reaction, 
remove_reaction, typing_start, typing_stop

// Server → Client  
message_created, message_deleted, reaction_added, 
reaction_removed, user_typing, user_joined, user_left, user_muted
```

## 🚀 Quick Start

### 1. Database Setup
```bash
npx prisma generate
npx prisma migrate dev --name "add-chat-system"
```

### 2. Environment Variables
```env
DATABASE_URL="postgresql://..."
FRONTEND_URL="http://localhost:3000"
```

### 3. Start Development
```bash
npm run start:dev
```

## 📚 Documentation Files
- [Backend Implementation Guide](./backend-guide.md)
- [Frontend Integration Guide](./frontend-guide.md) 
- [API Reference](./api-reference.md)
- [WebSocket Events Reference](./websocket-events.md)

## 🎵 Music Platform Support
- **Spotify**: Track/album/playlist links
- **YouTube**: Video links (music detection)
- **Apple Music**: Track/album links
- **Bandcamp**: Track/album links
- **Beatport**: Track links

## 🛡️ Safety & Moderation
- Rate limiting: 10 messages/minute per user per room
- Profanity filtering with auto-replacement
- Spam link detection and blocking
- User muting (24-hour duration)
- Message deletion by moderators
- Comprehensive audit logging

## 📈 Performance Targets (PRD)
- ✅ Sub-200ms message delivery latency
- ✅ 99.9% uptime requirement
- ✅ 60% of sessions include track unfurling
- ✅ 30% D1 activation rate support