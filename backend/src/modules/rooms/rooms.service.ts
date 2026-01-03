import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { SendMessageDto, SendProductMessageDto } from './dto/send-message.dto';
import { RoomMemberRole, MessageType } from '@prisma/client';

// Standard include for product data in messages
const productInclude = {
  include: {
    artist: {
      include: { artistProfile: true },
    },
  },
};

// Standard include for user data in messages
const userInclude = {
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
};

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async createRoom(userId: string, createRoomDto: CreateRoomDto) {
    const room = await this.prisma.room.create({
      data: {
        ...createRoomDto,
        createdBy: userId,
        memberships: {
          create: {
            userId: userId,
            role: RoomMemberRole.ADMIN,
          },
        },
      },
      include: {
        creator: {
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
        memberships: {
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
        },
        _count: {
          select: {
            messages: true,
            memberships: true,
          },
        },
      },
    });

    return room;
  }

  async getAllRooms(userId: string) {
    const rooms = await this.prisma.room.findMany({
      where: {
        OR: [
          { isPrivate: false },
          {
            isPrivate: true,
            memberships: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        creator: {
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
        _count: {
          select: {
            messages: true,
            memberships: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return rooms;
  }

  async getRoomById(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        creator: {
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
        memberships: {
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
        },
        _count: {
          select: {
            messages: true,
            memberships: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user has access to private room
    if (room.isPrivate) {
      const isMember = room.memberships.some((m) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenException('You do not have access to this room');
      }
    }

    return room;
  }

  async updateRoom(
    roomId: string,
    userId: string,
    updateRoomDto: UpdateRoomDto,
  ) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        memberships: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is creator or admin
    const membership = room.memberships.find((m) => m.userId === userId);
    if (
      room.createdBy !== userId &&
      membership?.role !== RoomMemberRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only the creator or admins can update this room',
      );
    }

    const updatedRoom = await this.prisma.room.update({
      where: { id: roomId },
      data: updateRoomDto,
      include: {
        creator: {
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
        memberships: {
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
        },
        _count: {
          select: {
            messages: true,
            memberships: true,
          },
        },
      },
    });

    return updatedRoom;
  }

  async deleteRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Only creator can delete
    if (room.createdBy !== userId) {
      throw new ForbiddenException('Only the creator can delete this room');
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return { message: 'Room deleted successfully' };
  }

  async joinRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        memberships: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if already a member
    const existingMembership = room.memberships.find(
      (m) => m.userId === userId,
    );
    if (existingMembership) {
      throw new BadRequestException('You are already a member of this room');
    }

    // Check if room is private
    if (room.isPrivate) {
      throw new ForbiddenException('Cannot join private rooms without invite');
    }

    const membership = await this.prisma.roomMembership.create({
      data: {
        roomId: roomId,
        userId: userId,
        role: RoomMemberRole.MEMBER,
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

    return membership;
  }

  async leaveRoom(roomId: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Creator cannot leave, must delete room instead
    if (room.createdBy === userId) {
      throw new BadRequestException(
        'Creator cannot leave room. Delete the room instead.',
      );
    }

    const membership = await this.prisma.roomMembership.findFirst({
      where: {
        roomId: roomId,
        userId: userId,
      },
    });

    if (!membership) {
      throw new BadRequestException('You are not a member of this room');
    }

    await this.prisma.roomMembership.delete({
      where: { id: membership.id },
    });

    return { message: 'Left room successfully' };
  }

  async sendMessage(
    roomId: string,
    userId: string,
    sendMessageDto: SendMessageDto,
  ) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        memberships: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is a member
    const isMember = room.memberships.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You must be a member to send messages');
    }

    const message = await this.prisma.message.create({
      data: {
        text: sendMessageDto.content,
        userId: userId,
        roomId: roomId,
      },
      include: {
        user: userInclude,
        product: productInclude,
      },
    });

    return message;
  }

  async sendProductMessage(
    roomId: string,
    userId: string,
    dto: SendProductMessageDto,
  ) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        memberships: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user is a member
    const isMember = room.memberships.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You must be a member to send messages');
    }

    // Validate product exists and is published
    const product = await this.prisma.marketplaceProduct.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
    if (product.status !== 'PUBLISHED') {
      throw new BadRequestException('Cannot share unpublished products');
    }

    const message = await this.prisma.message.create({
      data: {
        type: MessageType.PRODUCT_CARD,
        text: dto.caption || null,
        productId: dto.productId,
        userId: userId,
        roomId: roomId,
      },
      include: {
        user: userInclude,
        product: productInclude,
      },
    });

    return message;
  }

  async getMessages(
    roomId: string,
    userId: string,
    cursor?: string,
    limit: number = 50,
  ) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        memberships: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if user has access
    if (room.isPrivate) {
      const isMember = room.memberships.some((m) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenException('You do not have access to this room');
      }
    }

    const messages = await this.prisma.message.findMany({
      where: {
        roomId: roomId,
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
      include: {
        user: userInclude,
        product: productInclude,
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      messages,
      nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
    };
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    // Verify message exists and get room info
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        room: {
          include: { memberships: true },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user has access to the room
    if (message.room.isPrivate) {
      const isMember = message.room.memberships.some((m) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenException('You do not have access to this room');
      }
    }

    // Check if reaction already exists
    const existingReaction = await this.prisma.reaction.findFirst({
      where: { messageId, userId, emoji },
    });

    if (existingReaction) {
      throw new BadRequestException('You have already reacted with this emoji');
    }

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

    return reaction;
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    // Verify message exists
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Find the reaction
    const reaction = await this.prisma.reaction.findFirst({
      where: { messageId, userId, emoji },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.prisma.reaction.delete({
      where: { id: reaction.id },
    });

    return { message: 'Reaction removed successfully' };
  }

  async editMessage(messageId: string, userId: string, newText: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.userId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: { text: newText },
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

    return updatedMessage;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        room: {
          include: { memberships: true },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Allow deletion if user owns the message OR is an admin of the room
    const membership = message.room.memberships.find((m) => m.userId === userId);
    const isAdmin = membership?.role === RoomMemberRole.ADMIN;
    const isOwner = message.userId === userId;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own messages or be an admin');
    }

    // Soft delete - just set deletedAt
    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Message deleted successfully' };
  }
}
