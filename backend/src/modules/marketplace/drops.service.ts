import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { DropStatus, DropGatingType } from '@prisma/client';
import { CreateDropDto, DropItemDto } from './dto/create-drop.dto';
import { UpdateDropDto } from './dto/update-drop.dto';
import { NativeProvider } from './providers/native.provider';
import { ShopifyProvider } from './providers/shopify.provider';
import { NormalizedProduct } from './providers/merch-provider.interface';

/**
 * Service for managing merch drops (time-limited product releases).
 */
@Injectable()
export class DropsService {
  private readonly logger = new Logger(DropsService.name);

  constructor(
    private prisma: PrismaService,
    private nativeProvider: NativeProvider,
    private shopifyProvider: ShopifyProvider,
  ) {}

  /**
   * Create a new drop.
   */
  async createDrop(artistId: string, dto: CreateDropDto) {
    // Validate room exists if gated to ROOM_ONLY
    if (dto.gatingType === DropGatingType.ROOM_ONLY) {
      if (!dto.roomId) {
        throw new BadRequestException(
          'Room ID required for room-only drops',
        );
      }

      // Verify artist owns the room
      const room = await this.prisma.room.findFirst({
        where: {
          id: dto.roomId,
          createdBy: artistId,
        },
      });

      if (!room) {
        throw new BadRequestException(
          'Invalid room or you do not own this room',
        );
      }
    }

    // Validate early access days for FOLLOWERS_EARLY_ACCESS
    if (
      dto.gatingType === DropGatingType.FOLLOWERS_EARLY_ACCESS &&
      !dto.earlyAccessDays
    ) {
      throw new BadRequestException(
        'Early access days required for early access drops',
      );
    }

    // Create the drop
    const drop = await this.prisma.merchDrop.create({
      data: {
        artistId,
        title: dto.title,
        description: dto.description,
        heroImage: dto.heroImage,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        showCountdown: dto.showCountdown ?? true,
        gatingType: dto.gatingType ?? DropGatingType.PUBLIC,
        roomId: dto.roomId,
        earlyAccessDays: dto.earlyAccessDays,
        showOnArtistPage: dto.showOnArtistPage ?? true,
        showInRoomFeed: dto.showInRoomFeed ?? false,
        showInSessions: dto.showInSessions ?? false,
        status: DropStatus.DRAFT,
      },
      include: {
        items: true,
        artist: {
          include: {
            profile: true,
            artistProfile: true,
          },
        },
      },
    });

    // Add items if provided
    if (dto.items?.length) {
      await this.addItemsToDrop(drop.id, dto.items);
    }

    return this.getDropById(drop.id, artistId);
  }

  /**
   * Update an existing drop.
   */
  async updateDrop(artistId: string, dropId: string, dto: UpdateDropDto) {
    const drop = await this.prisma.merchDrop.findUnique({
      where: { id: dropId },
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    if (drop.artistId !== artistId) {
      throw new ForbiddenException('You do not own this drop');
    }

    // Cannot edit published drops (except to cancel)
    if (
      drop.status === DropStatus.LIVE ||
      drop.status === DropStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        'Cannot edit a published drop. Cancel it first.',
      );
    }

    // Validate room if changing gating to ROOM_ONLY
    if (dto.gatingType === DropGatingType.ROOM_ONLY) {
      const roomId = dto.roomId ?? drop.roomId;
      if (!roomId) {
        throw new BadRequestException('Room ID required for room-only drops');
      }

      const room = await this.prisma.room.findFirst({
        where: { id: roomId, createdBy: artistId },
      });

      if (!room) {
        throw new BadRequestException('Invalid room');
      }
    }

    // Update the drop
    await this.prisma.merchDrop.update({
      where: { id: dropId },
      data: {
        title: dto.title,
        description: dto.description,
        heroImage: dto.heroImage,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        showCountdown: dto.showCountdown,
        gatingType: dto.gatingType,
        roomId: dto.roomId,
        earlyAccessDays: dto.earlyAccessDays,
        showOnArtistPage: dto.showOnArtistPage,
        showInRoomFeed: dto.showInRoomFeed,
        showInSessions: dto.showInSessions,
      },
    });

    // Update items if provided
    if (dto.items) {
      // Remove existing items and add new ones
      await this.prisma.merchDropItem.deleteMany({
        where: { dropId },
      });
      await this.addItemsToDrop(dropId, dto.items);
    }

    return this.getDropById(dropId, artistId);
  }

  /**
   * Publish a drop.
   */
  async publishDrop(artistId: string, dropId: string) {
    const drop = await this.prisma.merchDrop.findUnique({
      where: { id: dropId },
      include: { items: true },
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    if (drop.artistId !== artistId) {
      throw new ForbiddenException('You do not own this drop');
    }

    if (drop.status !== DropStatus.DRAFT) {
      throw new BadRequestException('Only draft drops can be published');
    }

    if (!drop.items.length) {
      throw new BadRequestException('Drop must have at least one item');
    }

    // Determine status based on timing
    const now = new Date();
    let newStatus: DropStatus = DropStatus.LIVE;

    if (drop.startsAt && drop.startsAt > now) {
      newStatus = DropStatus.SCHEDULED;
    }

    // Check if already ended
    if (drop.endsAt && drop.endsAt < now) {
      throw new BadRequestException('Cannot publish a drop with an end time in the past');
    }

    await this.prisma.merchDrop.update({
      where: { id: dropId },
      data: {
        status: newStatus,
        publishedAt: now,
      },
    });

    return this.getDropById(dropId, artistId);
  }

  /**
   * Cancel/unpublish a drop.
   */
  async cancelDrop(artistId: string, dropId: string) {
    const drop = await this.prisma.merchDrop.findUnique({
      where: { id: dropId },
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    if (drop.artistId !== artistId) {
      throw new ForbiddenException('You do not own this drop');
    }

    await this.prisma.merchDrop.update({
      where: { id: dropId },
      data: {
        status: DropStatus.CANCELLED,
      },
    });

    return { success: true };
  }

  /**
   * Delete a draft drop.
   */
  async deleteDrop(artistId: string, dropId: string) {
    const drop = await this.prisma.merchDrop.findUnique({
      where: { id: dropId },
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    if (drop.artistId !== artistId) {
      throw new ForbiddenException('You do not own this drop');
    }

    if (drop.status !== DropStatus.DRAFT) {
      throw new BadRequestException('Only draft drops can be deleted');
    }

    await this.prisma.merchDrop.delete({
      where: { id: dropId },
    });

    return { success: true };
  }

  /**
   * Get a single drop by ID.
   */
  async getDropById(dropId: string, viewerId?: string) {
    const drop = await this.prisma.merchDrop.findUnique({
      where: { id: dropId },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        artist: {
          include: {
            profile: true,
            artistProfile: true,
          },
        },
      },
    });

    if (!drop) {
      throw new NotFoundException('Drop not found');
    }

    // Check if viewer can access this drop
    const canAccess = await this.canAccessDrop(drop, viewerId);

    // For fans, only return if it's live and accessible
    if (viewerId !== drop.artistId) {
      if (drop.status !== DropStatus.LIVE) {
        throw new NotFoundException('Drop not found');
      }
      if (!canAccess.hasAccess) {
        return {
          ...this.formatDrop(drop),
          accessDenied: true,
          accessMessage: canAccess.message,
          items: [], // Hide items if no access
        };
      }
    }

    // Fetch full product details for each item
    const itemsWithProducts = await this.enrichDropItems(drop.items);

    // Increment view count for non-owner
    if (viewerId !== drop.artistId) {
      await this.prisma.merchDrop.update({
        where: { id: dropId },
        data: { viewCount: { increment: 1 } },
      });
    }

    return {
      ...this.formatDrop(drop),
      items: itemsWithProducts,
    };
  }

  /**
   * Get all drops for an artist (artist view).
   */
  async getArtistDrops(artistId: string, status?: DropStatus) {
    const where: any = { artistId };
    if (status) {
      where.status = status;
    }

    const drops = await this.prisma.merchDrop.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        items: true,
        artist: {
          include: {
            profile: true,
            artistProfile: true,
          },
        },
      },
    });

    return drops.map((drop) => this.formatDrop(drop));
  }

  /**
   * Get live drops for an artist's public page.
   */
  async getPublicDrops(artistId: string, viewerId?: string) {
    const now = new Date();

    // artistId could be either the database user ID or the Supabase auth ID
    // Try to resolve to the database ID
    let resolvedArtistId = artistId;

    const userById = await this.prisma.user.findUnique({
      where: { id: artistId },
    });

    if (!userById) {
      const userBySupabaseId = await this.prisma.user.findUnique({
        where: { supabaseId: artistId },
      });

      if (userBySupabaseId) {
        resolvedArtistId = userBySupabaseId.id;
      }
    }

    const drops = await this.prisma.merchDrop.findMany({
      where: {
        artistId: resolvedArtistId,
        status: DropStatus.LIVE,
        showOnArtistPage: true,
        OR: [{ endsAt: null }, { endsAt: { gt: now } }],
      },
      orderBy: { startsAt: 'asc' },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        artist: {
          include: {
            profile: true,
            artistProfile: true,
          },
        },
      },
    });

    // Filter and enrich drops based on access
    const result = [];
    for (const drop of drops) {
      const access = await this.canAccessDrop(drop, viewerId);
      const itemsWithProducts = access.hasAccess
        ? await this.enrichDropItems(drop.items)
        : [];

      result.push({
        ...this.formatDrop(drop),
        items: itemsWithProducts,
        accessDenied: !access.hasAccess,
        accessMessage: access.message,
      });
    }

    return result;
  }

  /**
   * Check if a user can access a drop (for gating).
   */
  async canAccessDrop(
    drop: any,
    viewerId?: string,
  ): Promise<{ hasAccess: boolean; message?: string }> {
    // Public drops are always accessible
    if (drop.gatingType === DropGatingType.PUBLIC) {
      return { hasAccess: true };
    }

    // Must be logged in for gated drops
    if (!viewerId) {
      return {
        hasAccess: false,
        message: 'Sign in to access this exclusive drop',
      };
    }

    // ROOM_ONLY: Check room membership
    if (drop.gatingType === DropGatingType.ROOM_ONLY) {
      if (!drop.roomId) {
        return { hasAccess: true }; // No room restriction set
      }

      const membership = await this.prisma.roomMembership.findUnique({
        where: {
          roomId_userId: {
            roomId: drop.roomId,
            userId: viewerId,
          },
        },
      });

      if (!membership) {
        return {
          hasAccess: false,
          message: 'Join the room to unlock this drop',
        };
      }

      return { hasAccess: true };
    }

    // FOLLOWERS_ONLY: Check if user follows the artist
    if (drop.gatingType === DropGatingType.FOLLOWERS_ONLY) {
      const follow = await this.prisma.follow.findFirst({
        where: {
          followerId: viewerId,
          followingId: drop.artistId,
        },
      });

      if (!follow) {
        return {
          hasAccess: false,
          message: 'Follow the artist to unlock this drop',
        };
      }

      return { hasAccess: true };
    }

    // FOLLOWERS_EARLY_ACCESS: Followers get early access, everyone else waits
    if (drop.gatingType === DropGatingType.FOLLOWERS_EARLY_ACCESS) {
      const now = new Date();
      const earlyAccessStart = drop.startsAt
        ? new Date(
            drop.startsAt.getTime() -
              (drop.earlyAccessDays || 0) * 24 * 60 * 60 * 1000,
          )
        : null;

      // Check if user is a follower
      const follow = await this.prisma.follow.findFirst({
        where: {
          followerId: viewerId,
          followingId: drop.artistId,
        },
      });

      // If user is a follower and we're in early access window
      if (follow && earlyAccessStart && now >= earlyAccessStart) {
        return { hasAccess: true };
      }

      // If drop is live (past startsAt), everyone has access
      if (drop.startsAt && now >= drop.startsAt) {
        return { hasAccess: true };
      }

      // If we're in early access window but not a follower
      if (earlyAccessStart && now >= earlyAccessStart && now < drop.startsAt) {
        return {
          hasAccess: false,
          message: `Follow the artist for early access, or wait until ${this.formatTimeUntil(drop.startsAt)}`,
        };
      }

      // Drop hasn't started yet
      if (drop.startsAt && now < drop.startsAt) {
        if (follow) {
          return {
            hasAccess: false,
            message: `Early access starts ${this.formatTimeUntil(earlyAccessStart!)}`,
          };
        }
        return {
          hasAccess: false,
          message: `Drop starts ${this.formatTimeUntil(drop.startsAt)}`,
        };
      }

      return { hasAccess: true };
    }

    return { hasAccess: false };
  }

  /**
   * Add items to a drop.
   */
  private async addItemsToDrop(dropId: string, items: DropItemDto[]) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await this.prisma.merchDropItem.create({
        data: {
          dropId,
          productId: item.productId,
          provider: item.provider || 'native',
          sortOrder: item.sortOrder ?? i,
          customPrice: item.customPrice,
          customTitle: item.customTitle,
          maxQuantityPerUser: item.maxQuantityPerUser,
        },
      });
    }
  }

  /**
   * Fetch product details for drop items.
   */
  private async enrichDropItems(items: any[]) {
    const enriched = [];

    for (const item of items) {
      let product: NormalizedProduct | null = null;

      if (item.provider === 'native') {
        product = await this.nativeProvider.getProduct(item.productId);
      } else if (item.provider === 'shopify') {
        product = await this.shopifyProvider.getProduct(item.productId);
      }

      enriched.push({
        id: item.id,
        sortOrder: item.sortOrder,
        customPrice: item.customPrice,
        customTitle: item.customTitle,
        maxQuantityPerUser: item.maxQuantityPerUser,
        product: product
          ? {
              ...product,
              // Apply custom overrides if set
              title: item.customTitle || product.title,
              price: item.customPrice ?? product.price,
            }
          : null,
      });
    }

    return enriched.filter((item) => item.product !== null);
  }

  /**
   * Format a drop for API response.
   */
  private formatDrop(drop: any) {
    const artistName =
      drop.artist?.artistProfile?.artistName ||
      drop.artist?.profile?.displayName ||
      drop.artist?.profile?.username ||
      'Artist';

    return {
      id: drop.id,
      title: drop.title,
      description: drop.description,
      heroImage: drop.heroImage,
      status: drop.status,
      startsAt: drop.startsAt,
      endsAt: drop.endsAt,
      showCountdown: drop.showCountdown,
      gatingType: drop.gatingType,
      roomId: drop.roomId,
      earlyAccessDays: drop.earlyAccessDays,
      showOnArtistPage: drop.showOnArtistPage,
      showInRoomFeed: drop.showInRoomFeed,
      showInSessions: drop.showInSessions,
      viewCount: drop.viewCount,
      purchaseCount: drop.purchaseCount,
      totalRevenue: drop.totalRevenue,
      publishedAt: drop.publishedAt,
      createdAt: drop.createdAt,
      updatedAt: drop.updatedAt,
      itemCount: drop.items?.length || 0,
      artist: {
        id: drop.artist?.id,
        name: artistName,
        avatarUrl: drop.artist?.profile?.avatarUrl,
      },
    };
  }

  /**
   * Format time until a date for display.
   */
  private formatTimeUntil(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}
