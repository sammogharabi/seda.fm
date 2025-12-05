import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, chatWebSocket } from '../services/api';
import { toast } from 'sonner';

export interface Room {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  lastMessage?: {
    id: string;
    text: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
    };
  };
}

export interface Message {
  id: string;
  text: string;
  type: string;
  roomId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
  reactions?: Array<{
    id: string;
    emoji: string;
    userId: string;
    user: {
      id: string;
      username: string;
    };
  }>;
  replyTo?: {
    id: string;
    text: string;
    user: {
      id: string;
      username: string;
    };
  };
}

interface UseChatServiceState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useChatService() {
  const [state, setState] = useState<UseChatServiceState>({
    rooms: [],
    currentRoom: null,
    messages: [],
    isConnected: false,
    isLoading: false,
    error: null,
  });

  const isInitialized = useRef(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  // Initialize WebSocket connection
  const initializeConnection = useCallback(() => {
    if (isInitialized.current) return;

    try {
      const user = localStorage.getItem('seda_user');
      let token = null;

      if (user) {
        try {
          const userData = JSON.parse(user);
          token = userData.token;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      console.log('🔗 Initializing chat WebSocket connection...');

      // Skip WebSocket connection if no backend is available (demo mode)
      const skipWebSocket = !import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.includes('localhost');

      if (skipWebSocket) {
        console.log('📝 Running in demo mode - WebSocket disabled');
        setState(prev => ({ ...prev, isConnected: false, error: null }));
        isInitialized.current = true;
        return;
      }

      chatWebSocket.connect(token);

      // Setup WebSocket event listeners
      chatWebSocket.on('connected', () => {
        console.log('✅ Chat WebSocket connected');
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        reconnectAttempts.current = 0;
      });

      chatWebSocket.on('disconnected', () => {
        console.log('🔌 Chat WebSocket disconnected');
        setState(prev => ({ ...prev, isConnected: false }));

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`🔄 Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            initializeConnection();
          }, 2000 * reconnectAttempts.current);
        }
      });

      chatWebSocket.on('error', (error) => {
        console.error('❌ Chat WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Connection error', isConnected: false }));
      });

      // Chat-specific event listeners
      chatWebSocket.on('message_created', (message: Message) => {
        console.log('📨 New message received:', message);
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, message],
        }));
      });

      chatWebSocket.on('message_deleted', (messageId: string) => {
        console.log('🗑️ Message deleted:', messageId);
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== messageId),
        }));
      });

      chatWebSocket.on('reaction_added', (reaction: any) => {
        console.log('👍 Reaction added:', reaction);
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === reaction.messageId
              ? {
                  ...msg,
                  reactions: [...(msg.reactions || []), reaction]
                }
              : msg
          ),
        }));
      });

      chatWebSocket.on('reaction_removed', (messageId: string, userId: string, emoji: string) => {
        console.log('👎 Reaction removed:', { messageId, userId, emoji });
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: (msg.reactions || []).filter(
                    r => !(r.userId === userId && r.emoji === emoji)
                  )
                }
              : msg
          ),
        }));
      });

      chatWebSocket.on('user_joined', (data: { roomId: string; user: any }) => {
        console.log('👋 User joined:', data);
        // Update room member count if needed
      });

      chatWebSocket.on('user_left', (data: { roomId: string; userId: string }) => {
        console.log('🚪 User left:', data);
        // Update room member count if needed
      });

      isInitialized.current = true;
    } catch (error) {
      console.error('Error initializing chat connection:', error);
      setState(prev => ({ ...prev, error: 'Failed to initialize connection' }));
    }
  }, []);

  // Create a new room
  const createRoom = useCallback(async (roomData: {
    name: string;
    description?: string;
    isPrivate?: boolean;
  }): Promise<Room> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🏗️ Creating room:', roomData);

      // Check if running in demo mode (no API or localhost)
      const skipAPI = !import.meta.env.VITE_API_URL ||
                     import.meta.env.VITE_API_URL.includes('localhost') ||
                     import.meta.env.VITE_API_URL.includes('127.0.0.1');

      if (skipAPI) {
        // Create a mock room for demo
        const mockRoom: Room = {
          id: `room-${Date.now()}`,
          name: roomData.name,
          description: roomData.description,
          isPrivate: roomData.isPrivate || false,
          createdBy: 'mock-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memberCount: 1,
        };

        setState(prev => ({
          ...prev,
          rooms: [...prev.rooms, mockRoom],
          isLoading: false,
        }));

        console.log('✅ Room created successfully (demo mode):', mockRoom);
        return mockRoom;
      }

      const room = await apiService.createRoom(roomData);

      setState(prev => ({
        ...prev,
        rooms: [...prev.rooms, room],
        isLoading: false,
      }));

      console.log('✅ Room created successfully:', room);
      return room;
    } catch (error) {
      console.error('❌ Error creating room:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create room',
        isLoading: false
      }));
      throw error;
    }
  }, []);

  // Join a room
  const joinRoom = useCallback(async (roomId: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🚪 Joining room:', roomId);

      // Check if running in demo mode
      const skipAPI = !import.meta.env.VITE_API_URL ||
                     import.meta.env.VITE_API_URL.includes('localhost') ||
                     import.meta.env.VITE_API_URL.includes('127.0.0.1');

      if (skipAPI) {
        // Demo mode - just simulate joining with mock data
        const room = state.rooms.find(r => r.id === roomId);

        setState(prev => ({
          ...prev,
          currentRoom: room || null,
          messages: [], // Empty messages for demo
          isLoading: false,
        }));

        console.log('✅ Joined room successfully (demo mode)');
        return;
      }

      await apiService.joinRoom(roomId);

      // Join via WebSocket for real-time updates
      chatWebSocket.joinRoom(roomId);

      // Load messages for the room
      const messages = await apiService.getMessages(roomId, { limit: 50 });
      const room = state.rooms.find(r => r.id === roomId);

      setState(prev => ({
        ...prev,
        currentRoom: room || null,
        messages: messages || [],
        isLoading: false,
      }));

      console.log('✅ Joined room successfully');
    } catch (error) {
      console.error('❌ Error joining room:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to join room',
        isLoading: false
      }));
      toast.error('Failed to join room');
    }
  }, [state.rooms]);

  // Leave a room
  const leaveRoom = useCallback(async (roomId: string): Promise<void> => {
    try {
      console.log('🚪 Leaving room:', roomId);
      await apiService.leaveRoom(roomId);

      // Leave via WebSocket
      chatWebSocket.leaveRoom(roomId);

      setState(prev => ({
        ...prev,
        currentRoom: prev.currentRoom?.id === roomId ? null : prev.currentRoom,
        messages: prev.currentRoom?.id === roomId ? [] : prev.messages,
      }));

      console.log('✅ Left room successfully');
    } catch (error) {
      console.error('❌ Error leaving room:', error);
      toast.error('Failed to leave room');
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (roomId: string, text: string): Promise<void> => {
    if (!text.trim()) return;

    try {
      console.log('💬 Sending message:', { roomId, text });
      const message = await apiService.sendMessage(roomId, { text: text.trim() });

      // Message will be added to state via WebSocket event
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, []);

  // Add reaction to message
  const addReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    try {
      console.log('👍 Adding reaction:', { messageId, emoji });
      await apiService.addReaction(messageId, emoji);

      // Reaction will be added to state via WebSocket event
      console.log('✅ Reaction added successfully');
    } catch (error) {
      console.error('❌ Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  }, []);

  // Remove reaction from message
  const removeReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    try {
      console.log('👎 Removing reaction:', { messageId, emoji });
      await apiService.removeReaction(messageId, emoji);

      // Reaction will be removed from state via WebSocket event
      console.log('✅ Reaction removed successfully');
    } catch (error) {
      console.error('❌ Error removing reaction:', error);
      toast.error('Failed to remove reaction');
    }
  }, []);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async (roomId: string, cursor?: string): Promise<void> => {
    try {
      console.log('📜 Loading more messages:', { roomId, cursor });
      const newMessages = await apiService.getMessages(roomId, {
        limit: 50,
        cursor,
        direction: 'before'
      });

      setState(prev => ({
        ...prev,
        messages: [...newMessages, ...prev.messages],
      }));

      console.log('✅ More messages loaded successfully');
    } catch (error) {
      console.error('❌ Error loading more messages:', error);
      toast.error('Failed to load more messages');
    }
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    initializeConnection();

    return () => {
      console.log('🔌 Cleaning up chat service...');
      chatWebSocket.disconnect();
      isInitialized.current = false;
    };
  }, [initializeConnection]);

  return {
    // State
    rooms: state.rooms,
    currentRoom: state.currentRoom,
    messages: state.messages,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    addReaction,
    removeReaction,
    loadMoreMessages,

    // Utility
    reinitialize: initializeConnection,
  };
}