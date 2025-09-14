import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';
import { MusicUnfurlingService } from './music-unfurling.service';
import { MentionsService } from './mentions.service';
import { SafetyService } from './safety.service';
import { AnalyticsService } from './analytics.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { CreateRoomDto } from '../dto/create-room.dto';
import { GetMessagesDto } from '../dto/get-messages.dto';
import { ModerateUserDto, ModerationAction } from '../dto/moderate-user.dto';
import { MessageEntity } from '../entities/message.entity';
import { RoomEntity } from '../entities/room.entity';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private musicUnfurlingService: MusicUnfurlingService,
    private mentionsService: MentionsService,
    private safetyService: SafetyService,
    private analyticsService: AnalyticsService,
  ) {}

  async createRoom(userId: string, createRoomDto: CreateRoomDto): Promise<RoomEntity> {
    const room = await this.prisma.room.create({
      data: {
        ...createRoomDto,
        createdBy: userId,
        memberships: {
          create: {
            userId,
            isMod: true,
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                artistProfile: {
                  select: {
                    artistName: true,
                    verified: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return this.mapRoomToEntity(room);
  }

  async joinRoom(userId: string, roomId: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const existingMembership = await this.prisma.roomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!existingMembership) {
      await this.prisma.roomMembership.create({
        data: {
          roomId,
          userId,
        },
      });

      // Track analytics
      await this.analyticsService.trackRoomJoined(userId, roomId);
    }
  }

  async leaveRoom(userId: string, roomId: string): Promise<void> {
    await this.prisma.roomMembership.delete({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    // Track analytics
    await this.analyticsService.trackRoomLeft(userId, roomId);
  }

  async sendMessage(userId: string, roomId: string, sendMessageDto: SendMessageDto): Promise<MessageEntity> {
    // Check if user can send messages in this room
    await this.checkUserCanSendMessage(userId, roomId);

    // Check content safety
    const safetyCheck = await this.safetyService.checkMessageContent(
      userId,
      roomId,
      sendMessageDto.content,
    );

    if (!safetyCheck.allowed) {
      throw new ForbiddenException(safetyCheck.reason || 'Message not allowed');
    }

    // Process mentions
    const mentions = await this.mentionsService.extractMentions(sendMessageDto.content);

    // Create message
    const message = await this.prisma.message.create({
      data: {
        roomId,
        userId,
        content: safetyCheck.filtered ? safetyCheck.filteredContent : sendMessageDto.content,
        messageType: sendMessageDto.messageType || 'TEXT',
        parentId: sendMessageDto.parentId,
        metadata: {
          mentions,
          unfurled: await this.musicUnfurlingService.unfurlContent(sendMessageDto.content),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
            artistProfile: true,
          },
        },
        reactions: true,
        parent: true,
      },
    });

    // Send notifications for mentions
    if (mentions.length > 0) {
      await this.mentionsService.notifyMentioned(mentions, message.id, roomId);
    }

    // Track analytics
    await this.analyticsService.trackMessageSent(userId, roomId, message.id);

    return this.mapMessageToEntity(message);
  }

  async moderateUser(userId: string, roomId: string, moderateUserDto: ModerateUserDto): Promise<void> {
    // Check if user is mod
    const membership = await this.prisma.roomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership || !membership.isMod) {
      throw new ForbiddenException('Only moderators can perform this action');
    }

    switch (moderateUserDto.action) {
      case ModerationAction.DELETE_MESSAGE:
        await this.deleteMessage(moderateUserDto.targetId);
        break;
      case ModerationAction.MUTE_USER:
        await this.muteUser(moderateUserDto.targetId, moderateUserDto.duration || 24);
        break;
      case ModerationAction.CLEAR_REACTIONS:
        await this.clearReactions(moderateUserDto.targetId);
        break;
    }

    // Track moderation action
    await this.analyticsService.trackModerationAction(userId, roomId, moderateUserDto);
  }

  private async checkUserCanSendMessage(userId: string, roomId: string): Promise<void> {
    const membership = await this.prisma.roomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must join the room before sending messages');
    }

    // Check if user is muted
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.mutedUntil && user.mutedUntil > new Date()) {
      throw new ForbiddenException('You are muted in this room');
    }
  }

  private async checkUserCanAccessRoom(userId: string, roomId: string): Promise<void> {
    const membership = await this.prisma.roomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member of this room');
    }
  }

  // Enhanced methods with pagination and track cards
  async getMessages(roomId: string, options: GetMessagesDto): Promise<MessageEntity[]> {
    const { limit = 50, cursor, direction = 'before' } = options;

    const where: any = { roomId, deletedAt: null };
    
    if (cursor) {
      where.createdAt = direction === 'before' 
        ? { lt: new Date(cursor) }
        : { gt: new Date(cursor) };
    }

    const messages = await this.prisma.message.findMany({
      where,
      take: limit,
      orderBy: { createdAt: direction === 'before' ? 'desc' : 'asc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
            artistProfile: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    // If fetching before, reverse to maintain chronological order
    if (direction === 'before') {
      messages.reverse();
    }

    return messages.map(msg => this.mapMessageToEntity(msg));
  }

  async addReaction(userId: string, messageId: string, emoji: string): Promise<void> {
    // Validate emoji (allow common emojis)
    const validEmojis = ['❤️', '👍', '👎', '😂', '🔥', '🎵', '💯', '🙌', '😍', '🎉'];
    if (!validEmojis.includes(emoji)) {
      throw new BadRequestException('Invalid emoji');
    }

    // Check if message exists
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user has access to the room
    const membership = await this.prisma.roomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId: message.roomId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a room member to react');
    }

    // Upsert reaction (update if exists, create if not)
    await this.prisma.reaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
      update: {},
      create: {
        messageId,
        userId,
        emoji,
      },
    });

    // Track analytics
    await this.analyticsService.trackReactionAdded(userId, message.roomId, messageId, emoji);
  }

  async removeReaction(userId: string, messageId: string, emoji: string): Promise<void> {
    // Get message to find roomId
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    await this.prisma.reaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    });

    // Track analytics 
    await this.analyticsService.trackReactionRemoved(userId, message.roomId, messageId, emoji);
  }

  async getReactions(messageId: string): Promise<any[]> {
    const reactions = await this.prisma.reaction.findMany({
      where: { messageId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Group reactions by emoji
    const groupedReactions: Record<string, any> = {};
    
    reactions.forEach((reaction) => {
      if (!groupedReactions[reaction.emoji]) {
        groupedReactions[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
        };
      }
      groupedReactions[reaction.emoji].count++;
      groupedReactions[reaction.emoji].users.push({
        id: reaction.user.id,
        username: reaction.user.profile?.username || reaction.user.email,
        avatarUrl: reaction.user.profile?.avatarUrl,
      });
    });

    return Object.values(groupedReactions);
  }

  async sendTrackCard(userId: string, roomId: string, trackData: any): Promise<MessageEntity> {
    // Validate user is in room
    const membership = await this.prisma.roomMembership.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a room member to send messages');
    }

    // Create track card message
    const message = await this.prisma.message.create({
      data: {
        roomId,
        userId,
        messageType: 'TRACK_CARD',
        content: `🎵 ${trackData.title} - ${trackData.artist}`,
        metadata: {
          trackId: trackData.id,
          title: trackData.title,
          artist: trackData.artist,
          album: trackData.album,
          artworkUrl: trackData.artworkUrl,
          provider: trackData.provider, // spotify, apple, beatport
          uri: trackData.uri,
          duration: trackData.duration,
          previewUrl: trackData.previewUrl,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
            artistProfile: true,
          },
        },
        reactions: true,
      },
    });

    return this.mapMessageToEntity(message);
  }

  // Helper methods
  private async deleteMessage(messageId: string): Promise<void> {
    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  private async muteUser(userId: string, hours: number): Promise<void> {
    const mutedUntil = new Date();
    mutedUntil.setHours(mutedUntil.getHours() + hours);

    await this.prisma.user.update({
      where: { id: userId },
      data: { mutedUntil },
    });
  }

  private async clearReactions(messageId: string): Promise<void> {
    await this.prisma.reaction.deleteMany({
      where: { messageId },
    });
  }

  private mapMessageToEntity(message: any): MessageEntity {
    return {
      id: message.id,
      roomId: message.roomId,
      userId: message.userId,
      content: message.content,
      messageType: message.messageType,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      deletedAt: message.deletedAt,
      parentId: message.parentId,
      metadata: message.metadata,
      user: message.user,
      reactions: message.reactions,
      parent: message.parent,
    };
  }

  private mapRoomToEntity(room: any): RoomEntity {
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      isPrivate: room.isPrivate,
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      memberships: room.memberships?.map((membership: any) => ({
        id: membership.id,
        roomId: membership.roomId,
        userId: membership.userId,
        isMod: membership.isMod,
        joinedAt: membership.joinedAt,
        user: membership.user,
      })),
      memberCount: room.memberships?.length || 0,
    };
  }
}