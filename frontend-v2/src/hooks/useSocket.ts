import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getChatSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  sendTyping,
  addReaction,
  removeReaction,
  onNewMessage,
  onUserTyping,
  onUserJoined,
  onUserLeft,
  onReactionAdded,
  onReactionRemoved,
  onDJAction,
  getOnlineUsers,
  RoomMessage,
  TypingUser,
  UserJoinedEvent,
  DJActionEvent,
  ReactionEvent,
  // Direct Message socket functions
  joinConversation,
  leaveConversation,
  sendDirectMessage,
  sendDMTyping,
  onNewDirectMessage,
  onDMTyping,
  onMessageRead,
  DMMessage,
  DMTypingEvent,
} from '@/lib/socket';

interface UseRoomSocketOptions {
  roomId: string;
  onMessage?: (message: RoomMessage) => void;
  onTyping?: (data: TypingUser & { roomId: string }) => void;
  onUserJoin?: (data: UserJoinedEvent) => void;
  onUserLeave?: (data: { userId: string; roomId: string; onlineCount: number }) => void;
  onReactionAdd?: (data: ReactionEvent) => void;
  onReactionRemove?: (data: ReactionEvent) => void;
  onDJ?: (data: DJActionEvent) => void;
}

export function useRoomSocket({
  roomId,
  onMessage,
  onTyping,
  onUserJoin,
  onUserLeave,
  onReactionAdd,
  onReactionRemove,
  onDJ,
}: UseRoomSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cleanupFns = useRef<(() => void)[]>([]);

  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      try {
        const socket = await getChatSocket();
        if (!socket || !mounted) return;

        setIsConnected(socket.connected);

        // Join the room
        const joinResult = await joinRoom(roomId);
        if ('error' in joinResult && joinResult.error) {
          setError(joinResult.error);
          return;
        }
        if (joinResult.onlineCount !== undefined) {
          setOnlineCount(joinResult.onlineCount);
        }

        // Set up event listeners
        if (onMessage) {
          const cleanup = await onNewMessage((msg) => {
            if (msg.roomId === roomId) onMessage(msg);
          });
          cleanupFns.current.push(cleanup);
        }

        if (onTyping) {
          const cleanup = await onUserTyping((data) => {
            if (data.roomId === roomId) onTyping(data);
          });
          cleanupFns.current.push(cleanup);
        }

        if (onUserJoin) {
          const cleanup = await onUserJoined((data) => {
            if (data.roomId === roomId) {
              setOnlineCount(data.onlineCount);
              onUserJoin(data);
            }
          });
          cleanupFns.current.push(cleanup);
        }

        if (onUserLeave) {
          const cleanup = await onUserLeft((data) => {
            if (data.roomId === roomId) {
              setOnlineCount(data.onlineCount);
              onUserLeave(data);
            }
          });
          cleanupFns.current.push(cleanup);
        }

        if (onReactionAdd) {
          const cleanup = await onReactionAdded(onReactionAdd);
          cleanupFns.current.push(cleanup);
        }

        if (onReactionRemove) {
          const cleanup = await onReactionRemoved(onReactionRemove);
          cleanupFns.current.push(cleanup);
        }

        if (onDJ) {
          const cleanup = await onDJAction((data) => {
            if (data.roomId === roomId) onDJ(data);
          });
          cleanupFns.current.push(cleanup);
        }

        // Get initial online users
        const usersResult = await getOnlineUsers(roomId);
        if (!('error' in usersResult)) {
          setOnlineCount(usersResult.onlineCount);
        }
      } catch (err) {
        console.error('Socket setup error:', err);
        setError('Failed to connect to chat');
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      // Clean up event listeners
      cleanupFns.current.forEach((fn) => fn());
      cleanupFns.current = [];
      // Leave room
      leaveRoom(roomId);
    };
  }, [roomId, onMessage, onTyping, onUserJoin, onUserLeave, onReactionAdd, onReactionRemove, onDJ]);

  const send = useCallback(
    async (content: string) => {
      const result = await sendMessage(roomId, content);
      if ('error' in result && result.error) {
        setError(result.error);
        return null;
      }
      return result.message;
    },
    [roomId]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      sendTyping(roomId, isTyping);
    },
    [roomId]
  );

  const react = useCallback(
    async (messageId: string, emoji: string) => {
      const result = await addReaction(messageId, emoji);
      if ('error' in result && result.error) {
        setError(result.error);
        return false;
      }
      return true;
    },
    []
  );

  const unreact = useCallback(
    async (messageId: string, emoji: string) => {
      const result = await removeReaction(messageId, emoji);
      if ('error' in result && result.error) {
        setError(result.error);
        return false;
      }
      return true;
    },
    []
  );

  return {
    isConnected,
    onlineCount,
    error,
    send,
    setTyping,
    react,
    unreact,
  };
}

export function useSocketConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      const socket = await getChatSocket();
      if (mounted && socket) {
        setIsConnected(socket.connected);

        socket.on('connect', () => {
          if (mounted) setIsConnected(true);
        });

        socket.on('disconnect', () => {
          if (mounted) setIsConnected(false);
        });
      }
    };

    checkConnection();

    return () => {
      mounted = false;
    };
  }, []);

  return { isConnected };
}

// ============================================
// Direct Messages Socket Hook
// ============================================

interface UseDirectMessageSocketOptions {
  conversationId: string | null;
  onMessage?: (message: DMMessage) => void;
  onTyping?: (data: DMTypingEvent) => void;
  onRead?: (data: { conversationId: string; userId: string; readAt: string }) => void;
}

export function useDirectMessageSocket({
  conversationId,
  onMessage,
  onTyping,
  onRead,
}: UseDirectMessageSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupFns = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!conversationId) return;

    let mounted = true;

    const setupSocket = async () => {
      try {
        const socket = await getChatSocket();
        if (!socket || !mounted) return;

        setIsConnected(socket.connected);

        // Join the conversation
        const joinResult = await joinConversation(conversationId);
        if ('error' in joinResult && joinResult.error) {
          setError(joinResult.error);
          return;
        }

        // Set up event listeners
        if (onMessage) {
          const cleanup = await onNewDirectMessage((msg) => {
            if (msg.conversationId === conversationId) onMessage(msg);
          });
          cleanupFns.current.push(cleanup);
        }

        if (onTyping) {
          const cleanup = await onDMTyping((data) => {
            if (data.conversationId === conversationId) onTyping(data);
          });
          cleanupFns.current.push(cleanup);
        }

        if (onRead) {
          const cleanup = await onMessageRead((data) => {
            if (data.conversationId === conversationId) onRead(data);
          });
          cleanupFns.current.push(cleanup);
        }
      } catch (err) {
        console.error('DM Socket setup error:', err);
        setError('Failed to connect to messaging');
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      // Clean up event listeners
      cleanupFns.current.forEach((fn) => fn());
      cleanupFns.current = [];
      // Leave conversation
      if (conversationId) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, onMessage, onTyping, onRead]);

  const send = useCallback(
    async (content: string) => {
      if (!conversationId) return null;

      const result = await sendDirectMessage(conversationId, content);
      if ('error' in result && result.error) {
        setError(result.error);
        return null;
      }
      return result.message;
    },
    [conversationId]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (conversationId) {
        sendDMTyping(conversationId, isTyping);
      }
    },
    [conversationId]
  );

  return {
    isConnected,
    error,
    send,
    setTyping,
  };
}
