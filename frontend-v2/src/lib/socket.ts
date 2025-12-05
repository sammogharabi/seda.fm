import { io, Socket } from 'socket.io-client';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
const SOCKET_URL = API_BASE_URL.replace('/api/v1', '');

let chatSocket: Socket | null = null;

export interface RoomMessage {
  id: string;
  text: string;
  userId: string;
  roomId: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
  reactions?: Array<{
    id: string;
    emoji: string;
    userId: string;
    user?: {
      id: string;
      profile?: { username: string };
    };
  }>;
}

export interface TypingUser {
  userId: string;
  user: { displayName: string };
  isTyping: boolean;
}

export interface UserJoinedEvent {
  userId: string;
  user: {
    id: string;
    email?: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
  roomId: string;
  onlineCount: number;
  timestamp: string;
}

export interface DJActionEvent {
  userId: string;
  user: {
    id: string;
    profile?: {
      username?: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
  action: 'play' | 'pause' | 'skip' | 'queue';
  trackId?: string;
  position?: number;
  roomId: string;
  timestamp: string;
}

export interface ReactionEvent {
  messageId: string;
  reaction?: {
    id: string;
    emoji: string;
    userId: string;
    user?: {
      id: string;
      profile?: { username: string; displayName?: string };
    };
  };
  reactionId?: string;
  emoji?: string;
  userId?: string;
  timestamp: string;
}

export const getChatSocket = async (): Promise<Socket | null> => {
  if (chatSocket?.connected) {
    return chatSocket;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    console.warn('No auth session for socket connection');
    return null;
  }

  chatSocket = io(`${SOCKET_URL}/chat`, {
    auth: {
      token: session.access_token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  chatSocket.on('connect', () => {
    console.log('Chat socket connected:', chatSocket?.id);
  });

  chatSocket.on('disconnect', (reason) => {
    console.log('Chat socket disconnected:', reason);
  });

  chatSocket.on('connect_error', (error) => {
    console.error('Chat socket connection error:', error.message);
  });

  return chatSocket;
};

export const disconnectChatSocket = () => {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
};

// Room operations
export const joinRoom = async (roomId: string): Promise<{ success?: boolean; error?: string; onlineCount?: number }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('joinRoom', { roomId }, (response: any) => {
      resolve(response);
    });
  });
};

export const leaveRoom = async (roomId: string): Promise<{ success?: boolean; error?: string }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('leaveRoom', { roomId }, (response: any) => {
      resolve(response);
    });
  });
};

export const sendMessage = async (roomId: string, content: string): Promise<{ success?: boolean; error?: string; message?: RoomMessage }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('sendMessage', { roomId, content }, (response: any) => {
      resolve(response);
    });
  });
};

export const sendTyping = async (roomId: string, isTyping: boolean): Promise<void> => {
  const socket = await getChatSocket();
  if (!socket) return;

  socket.emit('typing', { roomId, isTyping });
};

export const addReaction = async (messageId: string, emoji: string): Promise<{ success?: boolean; error?: string; reaction?: any }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('addReaction', { messageId, emoji }, (response: any) => {
      resolve(response);
    });
  });
};

export const removeReaction = async (messageId: string, emoji: string): Promise<{ success?: boolean; error?: string }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('removeReaction', { messageId, emoji }, (response: any) => {
      resolve(response);
    });
  });
};

export const sendDJAction = async (
  roomId: string,
  action: 'play' | 'pause' | 'skip' | 'queue',
  trackId?: string,
  position?: number
): Promise<{ success?: boolean; error?: string }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('djSession', { roomId, action, trackId, position }, (response: any) => {
      resolve(response);
    });
  });
};

export const getOnlineUsers = async (roomId: string): Promise<{ roomId: string; onlineCount: number; users: any[] } | { error: string }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('getOnlineUsers', { roomId }, (response: any) => {
      resolve(response);
    });
  });
};

// Event listeners
export const onNewMessage = async (callback: (message: RoomMessage) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('newMessage', callback);
  return () => socket.off('newMessage', callback);
};

export const onUserTyping = async (callback: (data: TypingUser & { roomId: string; timestamp: string }) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('userTyping', callback);
  return () => socket.off('userTyping', callback);
};

export const onUserJoined = async (callback: (data: UserJoinedEvent) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('userJoined', callback);
  return () => socket.off('userJoined', callback);
};

export const onUserLeft = async (callback: (data: { userId: string; roomId: string; onlineCount: number; timestamp: string }) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('userLeft', callback);
  return () => socket.off('userLeft', callback);
};

export const onReactionAdded = async (callback: (data: ReactionEvent) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('reactionAdded', callback);
  return () => socket.off('reactionAdded', callback);
};

export const onReactionRemoved = async (callback: (data: ReactionEvent) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('reactionRemoved', callback);
  return () => socket.off('reactionRemoved', callback);
};

export const onDJAction = async (callback: (data: DJActionEvent) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('djAction', callback);
  return () => socket.off('djAction', callback);
};

// ============================================
// Direct Messages Socket Functions
// ============================================

export interface DMMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  sender: {
    id: string;
    email: string;
    profile?: {
      username: string;
      displayName?: string;
      avatarUrl?: string;
    };
  };
}

export interface DMTypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  user: {
    displayName: string;
    avatarUrl?: string;
  };
}

// Join a DM conversation for real-time updates
export const joinConversation = async (conversationId: string): Promise<{ success?: boolean; error?: string }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('joinConversation', { conversationId }, (response: any) => {
      resolve(response);
    });
  });
};

// Leave a DM conversation
export const leaveConversation = async (conversationId: string): Promise<{ success?: boolean; error?: string }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('leaveConversation', { conversationId }, (response: any) => {
      resolve(response);
    });
  });
};

// Send a direct message via WebSocket
export const sendDirectMessage = async (
  conversationId: string,
  content: string
): Promise<{ success?: boolean; error?: string; message?: DMMessage }> => {
  const socket = await getChatSocket();
  if (!socket) return { error: 'Not connected' };

  return new Promise((resolve) => {
    socket.emit('sendDirectMessage', { conversationId, content }, (response: any) => {
      resolve(response);
    });
  });
};

// Send typing indicator for DMs
export const sendDMTyping = async (conversationId: string, isTyping: boolean): Promise<void> => {
  const socket = await getChatSocket();
  if (!socket) return;

  socket.emit('dmTyping', { conversationId, isTyping });
};

// Listen for new direct messages
export const onNewDirectMessage = async (callback: (message: DMMessage) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('newDirectMessage', callback);
  return () => socket.off('newDirectMessage', callback);
};

// Listen for DM typing indicator
export const onDMTyping = async (callback: (data: DMTypingEvent) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('dmTyping', callback);
  return () => socket.off('dmTyping', callback);
};

// Listen for message read receipts
export const onMessageRead = async (callback: (data: { conversationId: string; userId: string; readAt: string }) => void): Promise<() => void> => {
  const socket = await getChatSocket();
  if (!socket) return () => {};

  socket.on('messagesRead', callback);
  return () => socket.off('messagesRead', callback);
};
