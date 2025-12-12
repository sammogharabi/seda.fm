import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { PurchaseStatus } from '@prisma/client';

@Injectable()
export class ContentModerationService {
  private readonly logger = new Logger(ContentModerationService.name);

  constructor(private prisma: PrismaService) {}

  // ============ USERS ============
  async listUsers(limit = 50, offset = 0, search?: string) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { profile: { username: { contains: search, mode: 'insensitive' as const } } },
            { profile: { displayName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, limit, offset };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            posts: {
              where: { deletedAt: null },
              take: 20,
              orderBy: { createdAt: 'desc' },
              include: {
                _count: { select: { comments: true, likes: true } },
              },
            },
            comments: {
              where: { deletedAt: null },
              take: 20,
              orderBy: { createdAt: 'desc' },
              include: {
                post: {
                  select: { id: true, type: true, content: true },
                },
              },
            },
          },
        },
        artistProfile: true,
        messages: {
          where: { deletedAt: null },
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            room: { select: { id: true, name: true } },
          },
        },
        purchases: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            product: { select: { id: true, title: true, type: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get counts manually
    const profileUserId = user.profile?.userId;
    const [messageCount, purchaseCount, roomCount, postCount, commentCount] = await Promise.all([
      this.prisma.message.count({ where: { userId, deletedAt: null } }),
      this.prisma.purchase.count({ where: { buyerId: userId } }),
      this.prisma.roomMembership.count({ where: { userId } }),
      profileUserId
        ? this.prisma.post.count({ where: { userId: profileUserId, deletedAt: null } })
        : Promise.resolve(0),
      profileUserId
        ? this.prisma.comment.count({ where: { userId: profileUserId, deletedAt: null } })
        : Promise.resolve(0),
    ]);

    return {
      ...user,
      _count: {
        messages: messageCount,
        purchases: purchaseCount,
        rooms: roomCount,
        posts: postCount,
        comments: commentCount,
      },
    };
  }

  async deactivateUser(userId: string, adminId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Use the mutedUntil field to effectively deactivate the user
    // Set to a far future date to indicate permanent deactivation
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        mutedUntil: new Date('2099-12-31'), // Effectively deactivated
      },
    });

    // Log the admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'DEACTIVATE_USER',
        targetId: userId,
        targetType: 'user',
        details: { reason: reason || 'No reason provided' },
      },
    });

    this.logger.log(`User ${userId} deactivated by admin ${adminId}`);

    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        mutedUntil: updatedUser.mutedUntil,
      },
    };
  }

  async reactivateUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        mutedUntil: null,
      },
    });

    // Log the admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'REACTIVATE_USER',
        targetId: userId,
        targetType: 'user',
      },
    });

    this.logger.log(`User ${userId} reactivated by admin ${adminId}`);

    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        mutedUntil: updatedUser.mutedUntil,
      },
    };
  }

  // ============ COMMENTS ============
  async listComments(limit = 50, offset = 0, search?: string) {
    const where = search
      ? {
          content: { contains: search, mode: 'insensitive' as const },
        }
      : {};

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              displayName: true,
            },
          },
          post: {
            select: {
              id: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return { comments, total, limit, offset };
  }

  async deleteComment(commentId: string, adminId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Soft delete by setting deletedAt
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    // Log the admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'DELETE_COMMENT',
        targetId: commentId,
        targetType: 'comment',
      },
    });

    this.logger.log(`Comment ${commentId} deleted by admin ${adminId}`);

    return { success: true, deletedCommentId: commentId };
  }

  // ============ ROOMS ============
  async listRooms(limit = 50, offset = 0, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { username: true, displayName: true },
              },
            },
          },
          _count: {
            select: { memberships: true, messages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.room.count({ where }),
    ]);

    return { rooms, total, limit, offset };
  }

  async deleteRoom(roomId: string, adminId: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Delete room (cascades to memberships and messages due to schema config)
    await this.prisma.room.delete({ where: { id: roomId } });

    // Log the admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'DELETE_ROOM',
        targetId: roomId,
        targetType: 'room',
        details: { roomName: room.name },
      },
    });

    this.logger.log(`Room ${roomId} deleted by admin ${adminId}`);

    return { success: true, deletedRoomId: roomId };
  }

  // ============ PLAYLISTS (Crates) ============
  async listPlaylists(limit = 50, offset = 0, search?: string) {
    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [playlists, total] = await Promise.all([
      this.prisma.playlist.findMany({
        where,
        include: {
          owner: {
            select: {
              userId: true,
              username: true,
              displayName: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.playlist.count({ where }),
    ]);

    return { playlists, total, limit, offset };
  }

  async deletePlaylist(playlistId: string, adminId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Delete playlist (cascades to items due to schema config)
    await this.prisma.playlist.delete({ where: { id: playlistId } });

    // Log the admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'DELETE_PLAYLIST',
        targetId: playlistId,
        targetType: 'playlist',
        details: { playlistTitle: playlist.title },
      },
    });

    this.logger.log(`Playlist ${playlistId} deleted by admin ${adminId}`);

    return { success: true, deletedPlaylistId: playlistId };
  }

  // ============ PURCHASES/REFUNDS ============
  async listPurchases(limit = 50, offset = 0, status?: PurchaseStatus) {
    const where = status ? { status } : {};

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { username: true, displayName: true },
              },
            },
          },
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.purchase.count({ where }),
    ]);

    return { purchases, total, limit, offset };
  }

  async refundPurchase(purchaseId: string, adminId: string, reason?: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { buyer: true, product: true },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.status === PurchaseStatus.REFUNDED) {
      throw new BadRequestException('Purchase has already been refunded');
    }

    const updatedPurchase = await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: PurchaseStatus.REFUNDED,
      },
    });

    // Log the admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'REFUND_PURCHASE',
        targetId: purchaseId,
        targetType: 'purchase',
        details: {
          reason: reason || 'No reason provided',
          amount: purchase.amount,
          productId: purchase.productId,
        },
      },
    });

    this.logger.log(`Purchase ${purchaseId} refunded by admin ${adminId}`);

    return {
      success: true,
      purchase: {
        id: updatedPurchase.id,
        status: updatedPurchase.status,
        amount: updatedPurchase.amount,
      },
    };
  }

  // ============ DASHBOARD STATS ============
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersThisMonth,
      totalComments,
      totalRooms,
      totalPlaylists,
      totalPurchases,
      completedPurchases,
      pendingPurchases,
      totalMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.comment.count({ where: { deletedAt: null } }),
      this.prisma.room.count(),
      this.prisma.playlist.count(),
      this.prisma.purchase.count(),
      this.prisma.purchase.count({ where: { status: PurchaseStatus.COMPLETED } }),
      this.prisma.purchase.count({ where: { status: PurchaseStatus.PENDING } }),
      this.prisma.message.count({ where: { deletedAt: null } }),
    ]);

    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      content: {
        comments: totalComments,
        messages: totalMessages,
        rooms: totalRooms,
        playlists: totalPlaylists,
      },
      purchases: {
        total: totalPurchases,
        completed: completedPurchases,
        pending: pendingPurchases,
      },
    };
  }

  // ============ MESSAGES ============
  async listMessages(limit = 50, offset = 0, roomId?: string, search?: string) {
    const where: any = { deletedAt: null };

    if (roomId) {
      where.roomId = roomId;
    }

    if (search) {
      where.text = { contains: search, mode: 'insensitive' as const };
    }

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { username: true, displayName: true },
              },
            },
          },
          room: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.message.count({ where }),
    ]);

    return { messages, total, limit, offset };
  }

  async deleteMessage(messageId: string, adminId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Soft delete
    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    // Log the admin action
    await this.prisma.adminAction.create({
      data: {
        adminId,
        action: 'DELETE_MESSAGE',
        targetId: messageId,
        targetType: 'message',
      },
    });

    this.logger.log(`Message ${messageId} deleted by admin ${adminId}`);

    return { success: true, deletedMessageId: messageId };
  }
}
