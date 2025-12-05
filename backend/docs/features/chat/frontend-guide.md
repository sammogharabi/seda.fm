# Chat Frontend Integration Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install socket.io-client @types/socket.io-client
# For React projects, also install:
npm install react-use-websocket
```

### 2. Basic WebSocket Connection
```typescript
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## 🎯 Core Implementation Examples

### React Chat Hook
```typescript
// hooks/useChat.ts
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  roomId: string;
  userId: string;
  type: 'TEXT' | 'TRACK_CARD' | 'REPLY';
  text?: string;
  trackRef?: TrackRef;
  parentId?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    artistProfile?: {
      artistName: string;
      verified: boolean;
    };
  };
  reactions?: Reaction[];
}

export function useChat(roomId: string, token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newSocket = io('http://localhost:3000/chat', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_room', roomId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('message_created', (message: Message) => {
      setMessages(prev => [message, ...prev]);
    });

    newSocket.on('reaction_added', (reaction: Reaction) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === reaction.messageId
            ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
            : msg
        )
      );
    });

    newSocket.on('user_typing', (roomId: string, userId: string, isTyping: boolean) => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        if (isTyping) {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, token]);

  const sendMessage = useCallback((text: string, parentId?: string) => {
    if (socket && text.trim()) {
      socket.emit('send_message', {
        roomId,
        text: text.trim(),
        parentId
      });
    }
  }, [socket, roomId]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (socket) {
      socket.emit('add_reaction', { messageId, emoji });
    }
  }, [socket]);

  const startTyping = useCallback(() => {
    if (socket) {
      socket.emit('typing_start', roomId);
    }
  }, [socket, roomId]);

  const stopTyping = useCallback(() => {
    if (socket) {
      socket.emit('typing_stop', roomId);
    }
  }, [socket, roomId]);

  return {
    messages,
    isConnected,
    typingUsers,
    sendMessage,
    addReaction,
    startTyping,
    stopTyping
  };
}
```

### Chat Message Component
```tsx
// components/ChatMessage.tsx
import React from 'react';
import { Message } from '../types/chat';

interface ChatMessageProps {
  message: Message;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (messageId: string) => void;
}

export function ChatMessage({ message, onReaction, onReply }: ChatMessageProps) {
  return (
    <div className="chat-message">
      {/* User info */}
      <div className="message-header">
        <span className="username">
          {message.user.artistProfile?.artistName || message.user.email}
        </span>
        {message.user.artistProfile?.verified && (
          <span className="verified-badge">✓</span>
        )}
        <span className="timestamp">
          {new Date(message.createdAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Message content */}
      <div className="message-content">
        {message.type === 'TRACK_CARD' && message.trackRef ? (
          <TrackCard track={message.trackRef} />
        ) : (
          <p>{message.text}</p>
        )}
      </div>

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="reactions">
          {message.reactions.map((reaction) => (
            <button
              key={`${reaction.userId}-${reaction.emoji}`}
              className="reaction"
              onClick={() => onReaction(message.id, reaction.emoji)}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="message-actions">
        <button onClick={() => onReaction(message.id, '❤️')}>❤️</button>
        <button onClick={() => onReaction(message.id, '🔥')}>🔥</button>
        <button onClick={() => onReply(message.id)}>Reply</button>
      </div>
    </div>
  );
}
```

### Track Card Component
```tsx
// components/TrackCard.tsx
import React from 'react';

interface TrackRef {
  provider: string;
  providerId: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
}

interface TrackCardProps {
  track: TrackRef;
}

export function TrackCard({ track }: TrackCardProps) {
  const getProviderIcon = (provider: string) => {
    const icons = {
      spotify: '🎵',
      youtube: '📺',
      apple: '🍎',
      bandcamp: '🎪',
      beatport: '🎛️'
    };
    return icons[provider.toLowerCase()] || '🎵';
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="track-card">
      {track.artwork && (
        <img 
          src={track.artwork} 
          alt={`${track.title} artwork`} 
          className="track-artwork"
        />
      )}
      
      <div className="track-info">
        <h4 className="track-title">{track.title}</h4>
        <p className="track-artist">{track.artist}</p>
        
        <div className="track-meta">
          <span className="provider">
            {getProviderIcon(track.provider)} {track.provider}
          </span>
          {track.duration && (
            <span className="duration">{formatDuration(track.duration)}</span>
          )}
        </div>
      </div>

      <div className="track-actions">
        <a 
          href={track.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="play-button"
        >
          ▶️ Play
        </a>
        <button className="add-to-crate">
          ➕ Add to Crate
        </button>
      </div>
    </div>
  );
}
```

### Chat Input Component with Typing Indicators
```tsx
// components/ChatInput.tsx
import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string, parentId?: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  replyingTo?: Message;
  onCancelReply?: () => void;
}

export function ChatInput({ 
  onSendMessage, 
  onTypingStart, 
  onTypingStop,
  replyingTo,
  onCancelReply 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop();
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, replyingTo?.id);
      setMessage('');
      setIsTyping(false);
      onTypingStop();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="chat-input-container">
      {replyingTo && (
        <div className="reply-preview">
          <span>Replying to {replyingTo.user.email}</span>
          <button onClick={onCancelReply}>×</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          placeholder="Share a track or start a conversation..."
          className="message-input"
          maxLength={2000}
        />
        <button type="submit" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
```

## 🎵 Music Link Detection

### Auto-detect Music Links
```typescript
// utils/musicDetection.ts
export const MUSIC_PATTERNS = {
  spotify: /https?:\/\/(?:open\.)?spotify\.com\/(?:track|album|playlist)\/[a-zA-Z0-9]+/g,
  youtube: /https?:\/\/(?:(?:www\.)?youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/g,
  apple: /https?:\/\/music\.apple\.com\/[^\/]+\/(?:album|song)\/[^\/]+\/\d+/g,
  bandcamp: /https?:\/\/[^.]+\.bandcamp\.com\/(?:track|album)\/[^\/\s]+/g,
  beatport: /https?:\/\/(?:www\.)?beatport\.com\/track\/[^\/\s]+\/\d+/g,
};

export function detectMusicLinks(text: string): string[] {
  const links: string[] = [];
  Object.values(MUSIC_PATTERNS).forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      links.push(...matches);
    }
  });
  return links;
}

// Auto-preview in input
export function ChatInputWithPreview({ onSendMessage }: { onSendMessage: (text: string) => void }) {
  const [text, setText] = useState('');
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);

  useEffect(() => {
    const links = detectMusicLinks(text);
    setDetectedLinks(links);
  }, [text]);

  return (
    <div>
      <input 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste a music link or type a message..."
      />
      
      {detectedLinks.length > 0 && (
        <div className="link-preview">
          <p>🎵 Music link detected!</p>
          {detectedLinks.map(link => (
            <small key={link}>{link}</small>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 📱 Responsive Design Considerations

### Mobile-First Chat Layout
```css
/* styles/chat.css */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  /* Reverse order for chat */
  display: flex;
  flex-direction: column-reverse;
}

.chat-input-container {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #eee;
  padding: 1rem;
}

.track-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin: 0.5rem 0;
}

.track-artwork {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .track-card {
    flex-direction: column;
  }
  
  .track-artwork {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
  }
}
```

## 🔧 Advanced Features

### Message Virtualization (for performance)
```typescript
// For rooms with thousands of messages
import { FixedSizeList as List } from 'react-window';

function VirtualizedMessageList({ messages }: { messages: Message[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ChatMessage message={messages[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

### Optimistic Updates
```typescript
// Add message optimistically before server confirmation
const sendMessageOptimistic = useCallback((text: string) => {
  const optimisticMessage: Message = {
    id: `temp-${Date.now()}`,
    roomId,
    userId: currentUser.id,
    type: 'TEXT',
    text,
    createdAt: new Date().toISOString(),
    user: currentUser,
    reactions: [],
    isPending: true // Mark as pending
  };

  // Add to local state immediately
  setMessages(prev => [optimisticMessage, ...prev]);

  // Send to server
  socket.emit('send_message', { roomId, text });
}, [socket, roomId, currentUser]);

// Replace optimistic message when server confirms
useEffect(() => {
  socket.on('message_created', (serverMessage: Message) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.isPending && msg.text === serverMessage.text 
          ? serverMessage 
          : msg
      )
    );
  });
}, [socket]);
```

## 🚀 Performance Tips

1. **Debounce typing indicators** (1s timeout)
2. **Limit message history** (load more on scroll)
3. **Virtualize long message lists**
4. **Cache track metadata** locally
5. **Use WebSocket connection pooling** for multiple rooms
6. **Implement message pagination** with cursor-based loading

## 🎨 UI/UX Best Practices

1. **Music-first design**: Make track cards prominent
2. **1-2 tap sharing**: Quick access to share buttons
3. **Presence indicators**: Show online users
4. **Typing feedback**: Real-time typing indicators
5. **Thread visualization**: Clear parent-child relationships
6. **Reaction clustering**: Group identical reactions
7. **Loading states**: Skeleton screens while loading