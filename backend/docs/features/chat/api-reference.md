# Chat API Reference

## 🔐 Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🏠 REST API Endpoints

### Create Room
Create a new chat room.

**Endpoint:** `POST /chat/rooms`

**Request Body:**
```json
{
  "name": "Music Lovers",
  "description": "Chat about your favorite tracks",
  "isPrivate": false
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Music Lovers", 
  "description": "Chat about your favorite tracks",
  "isPrivate": false,
  "createdBy": "user-id",
  "createdAt": "2024-08-24T21:33:16.438Z",
  "updatedAt": "2024-08-24T21:33:16.438Z",
  "memberCount": 1
}
```

### Join Room
Join an existing chat room.

**Endpoint:** `POST /chat/rooms/{roomId}/join`

**Response:**
```json
{
  "message": "Successfully joined room"
}
```

### Leave Room  
Leave a chat room.

**Endpoint:** `POST /chat/rooms/{roomId}/leave`

**Response:**
```json
{
  "message": "Successfully left room"
}
```

### Send Message
Send a message to a room.

**Endpoint:** `POST /chat/rooms/{roomId}/messages`

**Request Body:**
```json
{
  "text": "Check out this track! https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
  "type": "TEXT",
  "parentId": null,
  "trackRef": {
    "provider": "spotify",
    "providerId": "4iV5W9uYEdYUVa79Axb7Rh",
    "url": "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
    "title": "Mr. Brightside",
    "artist": "The Killers",
    "artwork": "https://i.scdn.co/image/ab67616d0000b273...",
    "duration": 222
  }
}
```

**Response:**
```json
{
  "id": "msg-123",
  "roomId": "room-123",
  "userId": "user-123",
  "type": "TRACK_CARD",
  "text": "Check out this track! https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
  "trackRef": {
    "provider": "spotify",
    "providerId": "4iV5W9uYEdYUVa79Axb7Rh",
    "url": "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
    "title": "Mr. Brightside",
    "artist": "The Killers",
    "artwork": "https://i.scdn.co/image/ab67616d0000b273...",
    "duration": 222
  },
  "parentId": null,
  "createdAt": "2024-08-24T21:33:16.438Z",
  "updatedAt": "2024-08-24T21:33:16.438Z",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "artistProfile": {
      "artistName": "DJ Cool",
      "verified": true
    }
  },
  "reactions": [],
  "replies": []
}
```

### Get Messages
Retrieve messages from a room with pagination.

**Endpoint:** `GET /chat/rooms/{roomId}/messages`

**Query Parameters:**
- `limit` (optional): Number of messages to return (1-100, default: 50)
- `cursor` (optional): Message ID for pagination
- `parentId` (optional): Get replies to a specific message

**Example:** `GET /chat/rooms/room-123/messages?limit=25&cursor=msg-456`

**Response:**
```json
[
  {
    "id": "msg-123",
    "roomId": "room-123", 
    "userId": "user-123",
    "type": "TEXT",
    "text": "Great song choice!",
    "parentId": "msg-456",
    "createdAt": "2024-08-24T21:33:16.438Z",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "artistProfile": {
        "artistName": "Music Fan",
        "verified": false
      }
    },
    "reactions": [
      {
        "id": "reaction-1",
        "messageId": "msg-123",
        "userId": "user-456", 
        "emoji": "🔥",
        "createdAt": "2024-08-24T21:34:16.438Z",
        "user": {
          "id": "user-456",
          "email": "fan@example.com"
        }
      }
    ]
  }
]
```

### Add Reaction
Add an emoji reaction to a message.

**Endpoint:** `POST /chat/messages/{messageId}/reactions`

**Request Body:**
```json
{
  "emoji": "🔥"
}
```

**Response:**
```json
{
  "message": "Reaction added successfully"
}
```

### Remove Reaction
Remove an emoji reaction from a message.

**Endpoint:** `DELETE /chat/messages/{messageId}/reactions/{emoji}`

**Example:** `DELETE /chat/messages/msg-123/reactions/🔥`

**Response:**
```json
{
  "message": "Reaction removed successfully"
}
```

### Moderation Actions
Perform moderation actions (moderators only).

**Endpoint:** `POST /chat/rooms/{roomId}/moderation`

**Request Body:**
```json
{
  "targetId": "msg-123",
  "action": "DELETE_MESSAGE",
  "reason": "Inappropriate content"
}
```

**Available Actions:**
- `DELETE_MESSAGE`: Soft delete a message
- `MUTE_USER`: Mute user for 24 hours  
- `CLEAR_REACTIONS`: Remove all reactions from a message

**Response:**
```json
{
  "message": "Moderation action completed"
}
```

## 🔌 WebSocket Events

### Connection
Connect to the chat WebSocket namespace:
```javascript
const socket = io('ws://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Client → Server Events

#### Join Room
Join a chat room to start receiving events.
```javascript
socket.emit('join_room', roomId);
```

#### Leave Room
Leave a chat room.
```javascript
socket.emit('leave_room', roomId);
```

#### Send Message
Send a message via WebSocket for real-time delivery.
```javascript
socket.emit('send_message', {
  roomId: 'room-123',
  text: 'Hello everyone!',
  parentId: null, // optional, for replies
  trackRef: null  // optional, for track cards
});
```

#### Add Reaction
Add a reaction to a message.
```javascript
socket.emit('add_reaction', {
  messageId: 'msg-123',
  emoji: '❤️'
});
```

#### Remove Reaction
Remove a reaction from a message.
```javascript
socket.emit('remove_reaction', {
  messageId: 'msg-123', 
  emoji: '❤️'
});
```

#### Typing Indicators
Signal when user starts/stops typing.
```javascript
// Start typing
socket.emit('typing_start', roomId);

// Stop typing  
socket.emit('typing_stop', roomId);
```

### Server → Client Events

#### Message Created
Receive new messages in real-time.
```javascript
socket.on('message_created', (message) => {
  console.log('New message:', message);
  // Add to message list
});
```

#### Message Deleted
Notified when a message is deleted by moderation.
```javascript
socket.on('message_deleted', (messageId, roomId) => {
  console.log('Message deleted:', messageId);
  // Remove from message list
});
```

#### Reaction Added
Receive reaction events.
```javascript
socket.on('reaction_added', (reaction) => {
  console.log('Reaction added:', reaction);
  // Update message reactions
});
```

#### Reaction Removed
Receive reaction removal events.
```javascript
socket.on('reaction_removed', (messageId, userId, emoji) => {
  console.log('Reaction removed:', { messageId, userId, emoji });
  // Remove from message reactions
});
```

#### User Typing
See when other users are typing.
```javascript
socket.on('user_typing', (roomId, userId, isTyping) => {
  console.log('User typing status:', { roomId, userId, isTyping });
  // Show/hide typing indicator
});
```

#### User Joined/Left
Track room membership changes.
```javascript
socket.on('user_joined', (roomId, userId) => {
  console.log('User joined:', { roomId, userId });
});

socket.on('user_left', (roomId, userId) => {
  console.log('User left:', { roomId, userId });
});
```

#### User Muted
Notified when a user is muted by moderation.
```javascript
socket.on('user_muted', (roomId, userId, mutedUntil) => {
  console.log('User muted:', { roomId, userId, mutedUntil });
});
```

#### Error Handling
Handle WebSocket errors.
```javascript
socket.on('error', (message, code) => {
  console.error('Chat error:', message, code);
  // Show error to user
});
```

## 📋 Data Models

### Message Types
```typescript
enum MessageType {
  TEXT = 'TEXT',
  TRACK_CARD = 'TRACK_CARD', 
  SYSTEM = 'SYSTEM',
  REPLY = 'REPLY'
}
```

### Track Reference
```typescript
interface TrackRef {
  provider: 'spotify' | 'youtube' | 'apple' | 'bandcamp' | 'beatport';
  providerId: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number; // seconds
}
```

### User Reference
```typescript
interface UserRef {
  id: string;
  email: string;
  artistProfile?: {
    artistName: string;
    verified: boolean;
  };
}
```

## ⚠️ Error Responses

### Common HTTP Error Codes
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid auth token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Room or message not found
- `429 Too Many Requests`: Rate limit exceeded

### WebSocket Error Events
```javascript
socket.on('error', (message, code) => {
  switch (code) {
    case 'RATE_LIMIT_EXCEEDED':
      // Show rate limit warning
      break;
    case 'NOT_AUTHENTICATED':
      // Redirect to login
      break;
    case 'FORBIDDEN':
      // Show permission error
      break;
  }
});
```

## 🚨 Rate Limits

### HTTP Endpoints
- **Global**: 100 requests per minute per IP
- **Message sending**: 10 messages per minute per user per room

### WebSocket Events
- **Message sending**: 10 messages per minute per user per room
- **Reactions**: 30 per minute per user
- **Typing indicators**: No limit (auto-throttled)

## 🔍 Testing with cURL

### Send a Message
```bash
curl -X POST http://localhost:3000/chat/rooms/room-123/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "text": "Hello from cURL!",
    "type": "TEXT"
  }'
```

### Get Messages  
```bash
curl -X GET "http://localhost:3000/chat/rooms/room-123/messages?limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Add Reaction
```bash
curl -X POST http://localhost:3000/chat/messages/msg-123/reactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "emoji": "🎵"
  }'
```