import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { SupabaseService } from '../../config/supabase.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

interface JoinRoomPayload {
  roomId: string;
}

interface SendMessagePayload {
  roomId: string;
  content: string;
}

interface TypingPayload {
  roomId: string;
  isTyping: boolean;
}

interface DJSessionPayload {
  roomId: string;
  trackId?: string;
  action: 'play' | 'pause' | 'skip' | 'queue';
  position?: number;
}

interface ReactionPayload {
  messageId: string;
  emoji: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [
          'https://seda.fm',
          'https://www.seda.fm',
          process.env.FRONTEND_URL,
        ].filter(Boolean)
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://seda.fm',
          'https://www.seda.fm',
          process.env.FRONTEND_URL,
        ].filter(Boolean),
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds
  private userSockets: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without auth token`);
        client.disconnect();
        return;
      }

      // Verify token with Supabase
      const supabase = this.supabaseService.getClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        this.logger.warn(`Client ${client.id} failed authentication`);
        client.disconnect();
        return;
      }

      // Store user info on socket
      client.userId = user.id;
      client.userEmail = user.email;
      this.userSockets.set(client.id, user.id);

      this.logger.log(`User ${user.id} connected via socket ${client.id}`);

      // Send connection confirmation
      client.emit('connected', {
        userId: user.id,
        socketId: client.id,
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.userSockets.get(client.id);

    if (userId) {
      // Remove user from all rooms they were in
      this.connectedUsers.forEach((users, roomId) => {
        if (users.has(userId)) {
          users.delete(userId);
          // Notify room that user left
          this.server.to(roomId).emit('userLeft', {
            userId,
            roomId,
            timestamp: new Date().toISOString(),
          });
        }
      });

      this.userSockets.delete(client.id);
      this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    try {
      const userId = client.userId;
      if (!userId) {
        return { error: 'Not authenticated' };
      }

      const { roomId } = payload;

      // Verify user has access to room
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
        include: { memberships: true },
      });

      if (!room) {
        return { error: 'Room not found' };
      }

      if (room.isPrivate) {
        const isMember = room.memberships.some((m) => m.userId === userId);
        if (!isMember) {
          return { error: 'Access denied to private room' };
        }
      }

      // Join socket room
      client.join(roomId);

      // Track connected users
      if (!this.connectedUsers.has(roomId)) {
        this.connectedUsers.set(roomId, new Set());
      }
      this.connectedUsers.get(roomId)!.add(userId);

      // Get user profile for notification
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            select: { username: true, displayName: true, avatarUrl: true },
          },
        },
      });

      // Notify room members
      this.server.to(roomId).emit('userJoined', {
        userId,
        user: {
          id: userId,
          email: user?.email,
          profile: user?.profile,
        },
        roomId,
        onlineCount: this.connectedUsers.get(roomId)?.size || 0,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`User ${userId} joined room ${roomId}`);

      return {
        success: true,
        roomId,
        onlineCount: this.connectedUsers.get(roomId)?.size || 0,
      };
    } catch (error) {
      this.logger.error(`Join room error: ${error.message}`);
      return { error: 'Failed to join room' };
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const userId = client.userId;
    if (!userId) return { error: 'Not authenticated' };

    const { roomId } = payload;

    client.leave(roomId);

    // Remove from connected users
    const roomUsers = this.connectedUsers.get(roomId);
    if (roomUsers) {
      roomUsers.delete(userId);
    }

    // Notify room
    this.server.to(roomId).emit('userLeft', {
      userId,
      roomId,
      onlineCount: roomUsers?.size || 0,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`User ${userId} left room ${roomId}`);

    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    try {
      const userId = client.userId;
      if (!userId) {
        return { error: 'Not authenticated' };
      }

      const { roomId, content } = payload;

      // Verify user is a member of the room
      const membership = await this.prisma.roomMembership.findFirst({
        where: { roomId, userId },
      });

      if (!membership) {
        return { error: 'You must be a member to send messages' };
      }

      // Create message in database
      const message = await this.prisma.message.create({
        data: {
          text: content,
          userId,
          roomId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      // Broadcast to room
      this.server.to(roomId).emit('newMessage', {
        ...message,
        timestamp: message.createdAt.toISOString(),
      });

      this.logger.log(`Message sent in room ${roomId} by user ${userId}`);

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ) {
    const userId = client.userId;
    if (!userId) return;

    const { roomId, isTyping } = payload;

    // Get user info for display
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: { username: true, displayName: true },
        },
      },
    });

    // Broadcast to room (except sender)
    client.to(roomId).emit('userTyping', {
      userId,
      user: {
        displayName: user?.profile?.displayName || user?.profile?.username || 'User',
      },
      roomId,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('addReaction')
  async handleAddReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ReactionPayload,
  ) {
    try {
      const userId = client.userId;
      if (!userId) {
        return { error: 'Not authenticated' };
      }

      const { messageId, emoji } = payload;

      // Get the message to find its room
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        select: { roomId: true },
      });

      if (!message) {
        return { error: 'Message not found' };
      }

      // Check if reaction already exists
      const existingReaction = await this.prisma.reaction.findFirst({
        where: { messageId, userId, emoji },
      });

      if (existingReaction) {
        return { error: 'Reaction already exists' };
      }

      // Create reaction
      const reaction = await this.prisma.reaction.create({
        data: {
          messageId,
          userId,
          emoji,
        },
        include: {
          user: {
            select: {
              id: true,
              profile: { select: { username: true, displayName: true } },
            },
          },
        },
      });

      // Broadcast to room
      this.server.to(message.roomId).emit('reactionAdded', {
        messageId,
        reaction,
        timestamp: new Date().toISOString(),
      });

      return { success: true, reaction };
    } catch (error) {
      this.logger.error(`Add reaction error: ${error.message}`);
      return { error: 'Failed to add reaction' };
    }
  }

  @SubscribeMessage('removeReaction')
  async handleRemoveReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: ReactionPayload,
  ) {
    try {
      const userId = client.userId;
      if (!userId) {
        return { error: 'Not authenticated' };
      }

      const { messageId, emoji } = payload;

      // Get the message to find its room
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        select: { roomId: true },
      });

      if (!message) {
        return { error: 'Message not found' };
      }

      // Find and delete reaction
      const reaction = await this.prisma.reaction.findFirst({
        where: { messageId, userId, emoji },
      });

      if (!reaction) {
        return { error: 'Reaction not found' };
      }

      await this.prisma.reaction.delete({
        where: { id: reaction.id },
      });

      // Broadcast to room
      this.server.to(message.roomId).emit('reactionRemoved', {
        messageId,
        reactionId: reaction.id,
        emoji,
        userId,
        timestamp: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Remove reaction error: ${error.message}`);
      return { error: 'Failed to remove reaction' };
    }
  }

  @SubscribeMessage('djSession')
  async handleDJSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: DJSessionPayload,
  ) {
    try {
      const userId = client.userId;
      if (!userId) {
        return { error: 'Not authenticated' };
      }

      const { roomId, action, trackId, position } = payload;

      // Verify user is in room and has DJ permissions
      const membership = await this.prisma.roomMembership.findFirst({
        where: { roomId, userId },
      });

      if (!membership) {
        return { error: 'You must be a member to control DJ session' };
      }

      // Check DJ authorization: user must be either:
      // 1. Room creator/owner
      // 2. Room admin
      // 3. Current DJ in an active session for this room
      const room = await this.prisma.room.findUnique({
        where: { id: roomId },
        select: { createdBy: true },
      });

      const isRoomOwner = room?.createdBy === userId;
      const isAdmin = membership.role === 'ADMIN';

      // Check if user is the current DJ in an active session
      const activeDJSession = await this.prisma.dJSession.findFirst({
        where: {
          roomId,
          status: 'ACTIVE',
          currentDJId: userId,
        },
      });

      const isCurrentDJ = !!activeDJSession;

      if (!isRoomOwner && !isAdmin && !isCurrentDJ) {
        return { error: 'You must be the DJ, room owner, or admin to control playback' };
      }

      // Get user info
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: { select: { username: true, displayName: true, avatarUrl: true } },
        },
      });

      // Broadcast DJ action to room
      this.server.to(roomId).emit('djAction', {
        userId,
        user: {
          id: userId,
          profile: user?.profile,
        },
        action,
        trackId,
        position,
        roomId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`DJ action ${action} in room ${roomId} by user ${userId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`DJ session error: ${error.message}`);
      return { error: 'Failed to perform DJ action' };
    }
  }

  @SubscribeMessage('getOnlineUsers')
  async handleGetOnlineUsers(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { roomId } = payload;
    const onlineUserIds = Array.from(this.connectedUsers.get(roomId) || []);

    // Get user profiles
    const users = await this.prisma.user.findMany({
      where: { id: { in: onlineUserIds } },
      select: {
        id: true,
        email: true,
        profile: {
          select: { username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    return {
      roomId,
      onlineCount: users.length,
      users,
    };
  }

  // Helper method to broadcast to specific users (for notifications)
  async sendToUser(userId: string, event: string, data: any) {
    // Find all sockets for this user
    const userSocketIds: string[] = [];
    this.userSockets.forEach((uid, socketId) => {
      if (uid === userId) {
        userSocketIds.push(socketId);
      }
    });

    // Send to all user's sockets
    userSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit(event, data);
    });
  }

  // Helper method to broadcast to a room
  broadcastToRoom(roomId: string, event: string, data: any) {
    this.server.to(roomId).emit(event, data);
  }
}
