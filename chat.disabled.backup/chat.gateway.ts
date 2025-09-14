import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './services/chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { AddReactionDto } from './dto/add-reaction.dto';
import { ClientToServerEvents, ServerToClientEvents } from './interfaces/websocket-events.interface';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRooms?: Set<string>;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(ChatGateway.name);
  private typingUsers = new Map<string, Set<string>>(); // roomId -> Set<userId>

  constructor(private chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract user ID from authentication (implement your auth logic here)
      const userId = await this.authenticateSocket(client);
      if (!userId) {
        client.disconnect();
        return;
      }

      client.userId = userId;
      client.userRooms = new Set();

      this.logger.log(`User ${userId} connected`);
    } catch (error) {
      this.logger.error('Failed to authenticate socket connection', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId && client.userRooms) {
      // Clean up typing indicators
      for (const roomId of client.userRooms) {
        this.removeTypingUser(roomId, client.userId);
        client.to(roomId).emit('user_left', roomId, client.userId);
      }

      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', 'Not authenticated');
        return;
      }

      await this.chatService.joinRoom(client.userId, roomId);
      await client.join(roomId);
      client.userRooms?.add(roomId);

      client.to(roomId).emit('user_joined', roomId, client.userId);
      this.logger.log(`User ${client.userId} joined room ${roomId}`);
    } catch (error) {
      this.logger.error('Failed to join room', error);
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', 'Not authenticated');
        return;
      }

      await client.leave(roomId);
      client.userRooms?.delete(roomId);
      this.removeTypingUser(roomId, client.userId);

      client.to(roomId).emit('user_left', roomId, client.userId);
      this.logger.log(`User ${client.userId} left room ${roomId}`);
    } catch (error) {
      this.logger.error('Failed to leave room', error);
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; text: string; trackRef?: any; parentId?: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', 'Not authenticated');
        return;
      }

      const sendMessageDto: SendMessageDto = {
        text: data.text,
        trackRef: data.trackRef,
        parentId: data.parentId,
      };

      const message = await this.chatService.sendMessage(
        client.userId,
        data.roomId,
        sendMessageDto,
      );

      // Remove typing indicator
      this.removeTypingUser(data.roomId, client.userId);

      // Emit to all users in the room
      this.server.to(data.roomId).emit('message_created', message);

      this.logger.log(`Message sent by ${client.userId} in room ${data.roomId}`);
    } catch (error) {
      this.logger.error('Failed to send message', error);
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('add_reaction')
  async handleAddReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', 'Not authenticated');
        return;
      }

      await this.chatService.addReaction(client.userId, data.messageId, data.emoji);

      // Get the message to find the room
      // Note: You might want to optimize this by caching room info
      const reaction = {
        id: `${data.messageId}-${client.userId}-${data.emoji}`,
        messageId: data.messageId,
        userId: client.userId,
        emoji: data.emoji,
        createdAt: new Date(),
      };

      // Emit to all users (you'd need to get the room ID)
      this.server.emit('reaction_added', reaction);
    } catch (error) {
      this.logger.error('Failed to add reaction', error);
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('remove_reaction')
  async handleRemoveReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; emoji: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', 'Not authenticated');
        return;
      }

      await this.chatService.removeReaction(client.userId, data.messageId, data.emoji);

      // Emit to all users (you'd need to get the room ID)
      this.server.emit('reaction_removed', data.messageId, client.userId, data.emoji);
    } catch (error) {
      this.logger.error('Failed to remove reaction', error);
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ) {
    if (!client.userId) return;

    this.addTypingUser(roomId, client.userId);
    client.to(roomId).emit('user_typing', roomId, client.userId, true);
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() roomId: string,
  ) {
    if (!client.userId) return;

    this.removeTypingUser(roomId, client.userId);
    client.to(roomId).emit('user_typing', roomId, client.userId, false);
  }

  private async authenticateSocket(socket: AuthenticatedSocket): Promise<string | null> {
    try {
      // Extract token from handshake (implement your auth logic)
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      
      if (!token) {
        return null;
      }

      // Validate token with Supabase or your auth system
      // For now, return a placeholder - you'll need to implement proper auth
      // const user = await this.authService.validateToken(token);
      // return user?.id;
      
      // Placeholder for development - remove in production
      return 'user-id-placeholder';
    } catch (error) {
      this.logger.error('Socket authentication failed', error);
      return null;
    }
  }

  private addTypingUser(roomId: string, userId: string) {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    this.typingUsers.get(roomId)!.add(userId);

    // Auto-remove typing indicator after 5 seconds
    setTimeout(() => {
      this.removeTypingUser(roomId, userId);
    }, 5000);
  }

  private removeTypingUser(roomId: string, userId: string) {
    const roomTypingUsers = this.typingUsers.get(roomId);
    if (roomTypingUsers) {
      roomTypingUsers.delete(userId);
      if (roomTypingUsers.size === 0) {
        this.typingUsers.delete(roomId);
      }
    }
  }

  // Public method to emit events from other services
  emitMessageDeleted(messageId: string, roomId: string) {
    this.server.to(roomId).emit('message_deleted', messageId, roomId);
  }

  emitUserMuted(roomId: string, userId: string, mutedUntil: Date) {
    this.server.to(roomId).emit('user_muted', roomId, userId, mutedUntil);
  }
}