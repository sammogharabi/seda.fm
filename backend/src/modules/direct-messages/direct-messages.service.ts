import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateMessageDto, StartConversationDto } from './dto/create-message.dto';

@Injectable()
export class DirectMessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    // Find all conversations where user is a participant
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Get participant profiles for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participantIds.find((id) => id !== userId);
        let otherUser = null;

        if (otherUserId) {
          otherUser = await this.prisma.user.findUnique({
            where: { id: otherUserId },
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
          });
        }

        const lastMessage = conv.messages[0];
        const unreadCount = await this.prisma.directMessage.count({
          where: {
            conversationId: conv.id,
            NOT: {
              readBy: {
                has: userId,
              },
            },
            senderId: {
              not: userId,
            },
          },
        });

        return {
          id: conv.id,
          participant: otherUser,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      }),
    );

    return conversationsWithParticipants;
  }

  async getOrCreateConversation(userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new BadRequestException('Cannot start a conversation with yourself');
    }

    // Check if recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Check for existing conversation
    const participants = [userId, recipientId].sort();
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { has: participants[0] } },
          { participantIds: { has: participants[1] } },
        ],
      },
    });

    if (existing) {
      return existing;
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        participantIds: participants,
      },
    });

    return conversation;
  }

  async startConversation(userId: string, dto: StartConversationDto) {
    const conversation = await this.getOrCreateConversation(userId, dto.recipientId);

    // Send the first message
    const message = await this.sendMessage(userId, conversation.id, {
      content: dto.content,
    });

    return {
      conversation,
      message,
    };
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Get other participant's profile
    const otherUserId = conversation.participantIds.find((id) => id !== userId);
    let otherUser = null;

    if (otherUserId) {
      otherUser = await this.prisma.user.findUnique({
        where: { id: otherUserId },
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
      });
    }

    return {
      ...conversation,
      participant: otherUser,
    };
  }

  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit: number = 50,
  ) {
    // Verify user is a participant
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const messages = await this.prisma.directMessage.findMany({
      where: {
        conversationId,
        ...(cursor && {
          id: {
            lt: cursor,
          },
        }),
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get sender profiles
    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const senders = await this.prisma.user.findMany({
      where: { id: { in: senderIds } },
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
    });

    const senderMap = new Map(senders.map((s) => [s.id, s]));

    const messagesWithSenders = messages.map((message) => ({
      ...message,
      sender: senderMap.get(message.senderId) || null,
    }));

    return {
      messages: messagesWithSenders,
      nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
    };
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: CreateMessageDto,
  ) {
    // Verify user is a participant
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Create message with sender already marked as read
    const message = await this.prisma.directMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content: dto.content,
        readBy: [userId], // Sender has "read" their own message
      },
    });

    // Update conversation's updatedAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Get sender profile
    const sender = await this.prisma.user.findUnique({
      where: { id: userId },
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
    });

    return {
      ...message,
      sender,
    };
  }

  async markAsRead(conversationId: string, userId: string) {
    // Verify user is a participant
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Mark all unread messages as read
    await this.prisma.directMessage.updateMany({
      where: {
        conversationId,
        NOT: {
          readBy: {
            has: userId,
          },
        },
      },
      data: {
        readBy: {
          push: userId,
        },
      },
    });

    return { success: true };
  }

  async getUnreadCount(userId: string) {
    // Count all unread messages across all conversations
    const count = await this.prisma.directMessage.count({
      where: {
        conversation: {
          participantIds: {
            has: userId,
          },
        },
        NOT: {
          readBy: {
            has: userId,
          },
        },
        senderId: {
          not: userId,
        },
      },
    });

    return { unreadCount: count };
  }
}
