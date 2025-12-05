# WebSocket Events Reference

## 🔗 Connection Setup

### Basic Connection
```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token' // JWT token for authentication
  },
  transports: ['websocket', 'polling'], // Fallback transports
  timeout: 20000, // Connection timeout
  reconnection: true, // Auto-reconnect on disconnect
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});
```

### Connection Events
```typescript
// Connection established
socket.on('connect', () => {
  console.log('Connected to chat server');
  console.log('Socket ID:', socket.id);
});

// Connection failed
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
  if (error.message === 'Authentication failed') {
    // Redirect to login or refresh token
  }
});

// Disconnected
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server initiated disconnect - don't auto-reconnect
    socket.connect();
  }
  // Client will auto-reconnect for other reasons
});

// Reconnection attempts
socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Reconnection attempt ${attemptNumber}`);
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected after ${attemptNumber} attempts`);
  // Re-join rooms after reconnection
  rejoinAllRooms();
});
```

## 📤 Client → Server Events

### Room Management

#### Join Room
Join a chat room to start receiving messages and events.
```typescript
socket.emit('join_room', roomId: string);

// Example
socket.emit('join_room', 'room-123');
```

**Success Response:** User receives `user_joined` event  
**Error Response:** `error` event with failure reason

#### Leave Room
Leave a chat room and stop receiving its events.
```typescript
socket.emit('leave_room', roomId: string);

// Example
socket.emit('leave_room', 'room-123');
```

### Messaging

#### Send Message
Send a new message to a room.
```typescript
interface SendMessageData {
  roomId: string;
  text: string;
  trackRef?: TrackRef;
  parentId?: string; // For replies
}

socket.emit('send_message', data: SendMessageData);

// Text message example
socket.emit('send_message', {
  roomId: 'room-123',
  text: 'Hello everyone! 👋'
});

// Reply example
socket.emit('send_message', {
  roomId: 'room-123',
  text: 'Great choice!',
  parentId: 'msg-456'
});

// Track sharing example
socket.emit('send_message', {
  roomId: 'room-123',
  text: 'Check this out: https://open.spotify.com/track/xyz',
  trackRef: {
    provider: 'spotify',
    providerId: 'xyz',
    url: 'https://open.spotify.com/track/xyz',
    title: 'Amazing Song',
    artist: 'Cool Artist',
    artwork: 'https://image.url',
    duration: 180
  }
});
```

### Reactions

#### Add Reaction
Add an emoji reaction to a message.
```typescript
interface AddReactionData {
  messageId: string;
  emoji: string;
}

socket.emit('add_reaction', data: AddReactionData);

// Example
socket.emit('add_reaction', {
  messageId: 'msg-123',
  emoji: '🔥'
});
```

#### Remove Reaction
Remove your emoji reaction from a message.
```typescript
interface RemoveReactionData {
  messageId: string;
  emoji: string;
}

socket.emit('remove_reaction', data: RemoveReactionData);

// Example
socket.emit('remove_reaction', {
  messageId: 'msg-123',
  emoji: '🔥'
});
```

### Typing Indicators

#### Start Typing
Signal that user has started typing in a room.
```typescript
socket.emit('typing_start', roomId: string);

// Example
socket.emit('typing_start', 'room-123');
```

**Auto-cleanup:** Server automatically removes typing status after 5 seconds

#### Stop Typing
Signal that user has stopped typing in a room.
```typescript
socket.emit('typing_stop', roomId: string);

// Example  
socket.emit('typing_stop', 'room-123');
```

## 📥 Server → Client Events

### Message Events

#### Message Created
Receive new messages in real-time.
```typescript
interface MessageCreatedEvent {
  id: string;
  roomId: string;
  userId: string;
  type: 'TEXT' | 'TRACK_CARD' | 'SYSTEM' | 'REPLY';
  text?: string;
  trackRef?: TrackRef;
  parentId?: string;
  createdAt: string;
  user: UserReference;
  reactions: ReactionReference[];
}

socket.on('message_created', (message: MessageCreatedEvent) => {
  console.log('New message:', message);
  
  // Add to message list (prepend for reverse chronological order)
  setMessages(prev => [message, ...prev]);
  
  // Show notification if not from current user
  if (message.userId !== currentUserId) {
    showNotification(`${message.user.name}: ${message.text}`);
  }
  
  // Auto-scroll to bottom if user is at bottom
  if (isAtBottom) {
    scrollToBottom();
  }
});
```

#### Message Deleted
Notified when a message is deleted by moderation.
```typescript
socket.on('message_deleted', (messageId: string, roomId: string) => {
  console.log('Message deleted:', { messageId, roomId });
  
  // Remove from local state
  setMessages(prev => prev.filter(msg => msg.id !== messageId));
  
  // Show system notification
  showSystemMessage('A message was removed by moderation');
});
```

### Reaction Events

#### Reaction Added
Receive new reactions on messages.
```typescript
interface ReactionAddedEvent {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
  user?: UserReference;
}

socket.on('reaction_added', (reaction: ReactionAddedEvent) => {
  console.log('Reaction added:', reaction);
  
  // Update message in local state
  setMessages(prev => 
    prev.map(msg => 
      msg.id === reaction.messageId
        ? {
            ...msg,
            reactions: [...(msg.reactions || []), reaction]
          }
        : msg
    )
  );
  
  // Show brief animation
  animateReaction(reaction.messageId, reaction.emoji);
});
```

#### Reaction Removed
Receive reaction removal events.
```typescript
socket.on('reaction_removed', (
  messageId: string, 
  userId: string, 
  emoji: string
) => {
  console.log('Reaction removed:', { messageId, userId, emoji });
  
  // Remove from local state
  setMessages(prev =>
    prev.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            reactions: msg.reactions?.filter(r => 
              !(r.userId === userId && r.emoji === emoji)
            ) || []
          }
        : msg
    )
  );
});
```

### User Activity Events

#### User Typing
See when other users are typing.
```typescript
socket.on('user_typing', (
  roomId: string,
  userId: string, 
  isTyping: boolean
) => {
  console.log('User typing update:', { roomId, userId, isTyping });
  
  if (userId !== currentUserId) {
    if (isTyping) {
      setTypingUsers(prev => new Set(prev).add(userId));
    } else {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  }
});
```

#### User Joined
Track when users join the room.
```typescript
socket.on('user_joined', (roomId: string, userId: string) => {
  console.log('User joined room:', { roomId, userId });
  
  // Update online user list
  setOnlineUsers(prev => [...prev, userId]);
  
  // Show system message
  showSystemMessage(`${getUserName(userId)} joined the room`);
});
```

#### User Left
Track when users leave the room.
```typescript
socket.on('user_left', (roomId: string, userId: string) => {
  console.log('User left room:', { roomId, userId });
  
  // Update online user list
  setOnlineUsers(prev => prev.filter(id => id !== userId));
  
  // Remove from typing indicators
  setTypingUsers(prev => {
    const updated = new Set(prev);
    updated.delete(userId);
    return updated;
  });
  
  // Show system message
  showSystemMessage(`${getUserName(userId)} left the room`);
});
```

### Moderation Events

#### User Muted
Notified when a user is muted by moderation.
```typescript
socket.on('user_muted', (
  roomId: string, 
  userId: string, 
  mutedUntil: Date
) => {
  console.log('User muted:', { roomId, userId, mutedUntil });
  
  if (userId === currentUserId) {
    // Show mute notice to the muted user
    showMuteNotice(mutedUntil);
    disableMessageInput();
  } else {
    // Show system message to others
    showSystemMessage(`${getUserName(userId)} was muted`);
  }
});
```

### Error Events

#### Error Handling
Handle various error conditions.
```typescript
interface ErrorEvent {
  message: string;
  code?: string;
  details?: any;
}

socket.on('error', (error: string | ErrorEvent) => {
  const errorData = typeof error === 'string' ? { message: error } : error;
  
  console.error('Chat error:', errorData);
  
  switch (errorData.code) {
    case 'RATE_LIMIT_EXCEEDED':
      showToast('You\'re sending messages too quickly. Please slow down.', 'warning');
      break;
      
    case 'NOT_AUTHENTICATED':
      showToast('Authentication failed. Please log in again.', 'error');
      redirectToLogin();
      break;
      
    case 'FORBIDDEN':
      showToast('You don\'t have permission to perform this action.', 'error');
      break;
      
    case 'MESSAGE_TOO_LONG':
      showToast('Message is too long. Please keep it under 2000 characters.', 'warning');
      break;
      
    case 'USER_MUTED':
      showToast('You are currently muted and cannot send messages.', 'warning');
      break;
      
    default:
      showToast(`Error: ${errorData.message}`, 'error');
  }
});
```

## 🎯 Event Handling Patterns

### React Hook Pattern
```typescript
// hooks/useChatEvents.ts
export function useChatEvents(socket: Socket, roomId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Message events
    socket.on('message_created', handleMessageCreated);
    socket.on('message_deleted', handleMessageDeleted);
    
    // Reaction events
    socket.on('reaction_added', handleReactionAdded);
    socket.on('reaction_removed', handleReactionRemoved);
    
    // User activity events
    socket.on('user_typing', handleUserTyping);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);
    
    // Moderation events
    socket.on('user_muted', handleUserMuted);
    
    // Error handling
    socket.on('error', handleError);

    return () => {
      socket.off('message_created', handleMessageCreated);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('reaction_added', handleReactionAdded);
      socket.off('reaction_removed', handleReactionRemoved);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
      socket.off('user_muted', handleUserMuted);
      socket.off('error', handleError);
    };
  }, [socket, roomId]);

  return {
    messages,
    typingUsers,
    onlineUsers
  };
}
```

### Event Queue Pattern
```typescript
// Handle events that arrive before component is ready
class EventQueue {
  private queue: Array<() => void> = [];
  private isReady = false;

  enqueue(handler: () => void) {
    if (this.isReady) {
      handler();
    } else {
      this.queue.push(handler);
    }
  }

  markReady() {
    this.isReady = true;
    this.queue.forEach(handler => handler());
    this.queue = [];
  }
}

const eventQueue = new EventQueue();

socket.on('message_created', (message) => {
  eventQueue.enqueue(() => {
    // Handle message when component is ready
    handleMessageCreated(message);
  });
});

// Mark ready when component mounts
useEffect(() => {
  eventQueue.markReady();
}, []);
```

## 🔧 Advanced Configuration

### Custom Namespace Connection
```typescript
const socket = io('/chat', {
  auth: {
    token: authToken,
    roomId: 'room-123' // Optional: auto-join room
  },
  query: {
    version: '1.0',
    client: 'web'
  }
});
```

### Connection Health Monitoring
```typescript
let lastPong: number;

socket.on('connect', () => {
  // Send ping every 30 seconds to check connection health
  const pingInterval = setInterval(() => {
    lastPong = Date.now();
    socket.emit('ping');
  }, 30000);

  socket.on('pong', () => {
    const latency = Date.now() - lastPong;
    updateConnectionStatus('connected', latency);
  });

  socket.on('disconnect', () => {
    clearInterval(pingInterval);
    updateConnectionStatus('disconnected');
  });
});
```

## 🚨 Error Recovery Strategies

### Message Recovery After Reconnection
```typescript
socket.on('reconnect', () => {
  // Get messages since last known message
  const lastMessageId = getLastMessageId();
  
  fetch(`/api/chat/rooms/${roomId}/messages?since=${lastMessageId}`)
    .then(response => response.json())
    .then(missedMessages => {
      // Merge missed messages into local state
      setMessages(prev => [...missedMessages.reverse(), ...prev]);
    });
});
```

### Optimistic Updates with Rollback
```typescript
const sendMessageWithOptimisticUpdate = (text: string) => {
  const tempId = `temp-${Date.now()}`;
  const optimisticMessage = {
    id: tempId,
    text,
    isPending: true,
    createdAt: new Date().toISOString()
  };

  // Add optimistically
  setMessages(prev => [optimisticMessage, ...prev]);

  // Send to server
  socket.emit('send_message', { roomId, text }, (response: any) => {
    if (response.error) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      showError('Failed to send message');
    } else {
      // Replace optimistic message with server response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? response.message : msg
        )
      );
    }
  });
};
```