import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { GetPlaylistItemsDto } from './dto/get-playlist-items.dto';
import {
  buildCursorWhere,
  createPaginatedResult,
  validatePaginationOptions,
} from '../../common/utils/cursor-pagination.util';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async createPlaylist(userId: string, dto: CreatePlaylistDto) {
    // Get user's profile (required for playlist ownership)
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found. Create a profile first.');
    }

    return this.prisma.playlist.create({
      data: {
        ownerUserId: profile.userId,
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
        isCollaborative: dto.isCollaborative ?? false,
      },
      include: {
        owner: {
          select: {
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
  }

  async getUserPlaylists(userId: string, includePrivate: boolean = true) {
    return this.prisma.playlist.findMany({
      where: {
        ownerUserId: userId,
        ...(includePrivate ? {} : { isPublic: true }),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        owner: {
          select: {
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            items: true,
            likes: true,
          },
        },
      },
    });
  }

  async getPlaylist(playlistId: string, requestingUserId?: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId },
      include: {
        owner: {
          select: {
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            items: true,
            collaborators: true,
          },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check if user can access this playlist
    if (!playlist.isPublic && playlist.ownerUserId !== requestingUserId) {
      // Check if user is a collaborator
      const isCollaborator = await this.prisma.playlistCollaborator.findFirst({
        where: {
          playlistId: playlistId,
          userId: requestingUserId || '',
        },
      });

      if (!isCollaborator) {
        throw new ForbiddenException('Not authorized to view this playlist');
      }
    }

    return playlist;
  }

  async updatePlaylist(playlistId: string, userId: string, dto: UpdatePlaylistDto) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check if user owns the playlist
    if (playlist.ownerUserId !== userId) {
      throw new ForbiddenException('Not authorized to update this playlist');
    }

    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic,
        isCollaborative: dto.isCollaborative,
        updatedAt: new Date(),
      },
      include: {
        owner: {
          select: {
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
  }

  async deletePlaylist(playlistId: string, userId: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check if user owns the playlist
    if (playlist.ownerUserId !== userId) {
      throw new ForbiddenException('Not authorized to delete this playlist');
    }

    // Delete playlist (cascade will handle items, collaborators, likes)
    await this.prisma.playlist.delete({
      where: { id: playlistId },
    });

    return { message: 'Playlist deleted successfully' };
  }

  async addPlaylistItem(playlistId: string, userId: string, dto: AddPlaylistItemDto) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check permissions
    const canModify =
      playlist.ownerUserId === userId ||
      (playlist.isCollaborative && (await this.isCollaborator(playlistId, userId)));

    if (!canModify) {
      throw new ForbiddenException('Not authorized to modify this playlist');
    }

    // Get user's profile for the added_by relationship
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    // Auto-increment position if not provided
    if (dto.position === undefined) {
      const lastItem = await this.prisma.playlistItem.findFirst({
        where: { playlistId: playlistId },
        orderBy: { position: 'desc' },
      });
      dto.position = (lastItem?.position || 0) + 1;
    } else {
      // Check if position is already taken
      const existingItem = await this.prisma.playlistItem.findFirst({
        where: {
          playlistId: playlistId,
          position: dto.position,
        },
      });

      if (existingItem) {
        throw new ConflictException('Position already taken');
      }
    }

    return this.prisma.playlistItem.create({
      data: {
        playlistId: playlistId,
        position: dto.position,
        provider: dto.provider,
        providerTrackId: dto.providerTrackId,
        title: dto.title,
        artist: dto.artist,
        artworkUrl: dto.artworkUrl,
        addedByUserId: profile.userId,
      },
      include: {
        addedBy: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  async getPlaylistItems(
    playlistId: string,
    query: GetPlaylistItemsDto,
    requestingUserId?: string,
  ) {
    // First verify access to the playlist
    await this.getPlaylist(playlistId, requestingUserId);

    // Validate pagination options
    const validatedQuery = validatePaginationOptions(query);

    // Build cursor-based where clause
    const cursorWhere = buildCursorWhere(
      validatedQuery.cursor,
      validatedQuery.sortField,
      validatedQuery.sortDirection,
    );

    const items = await this.prisma.playlistItem.findMany({
      where: {
        playlistId: playlistId,
        ...cursorWhere,
      },
      include: {
        addedBy: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        [validatedQuery.sortField]: validatedQuery.sortDirection,
      },
      take: validatedQuery.limit + 1, // Take one extra to check if there are more
    });

    return createPaginatedResult(items, validatedQuery.limit);
  }

  async removePlaylistItem(playlistId: string, itemId: string, userId: string) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check permissions
    const canModify =
      playlist.ownerUserId === userId ||
      (playlist.isCollaborative && (await this.isCollaborator(playlistId, userId)));

    if (!canModify) {
      throw new ForbiddenException('Not authorized to modify this playlist');
    }

    // Check if item exists
    const item = await this.prisma.playlistItem.findFirst({
      where: { id: itemId, playlistId: playlistId },
    });

    if (!item) {
      throw new NotFoundException('Item not found in playlist');
    }

    await this.prisma.playlistItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item removed from playlist' };
  }

  async reorderPlaylistItems(
    playlistId: string,
    userId: string,
    items: { id: string; position: number }[],
  ) {
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check permissions
    const canModify =
      playlist.ownerUserId === userId ||
      (playlist.isCollaborative && (await this.isCollaborator(playlistId, userId)));

    if (!canModify) {
      throw new ForbiddenException('Not authorized to modify this playlist');
    }

    // Update positions in a transaction
    await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.playlistItem.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );

    // Update playlist timestamp
    await this.prisma.playlist.update({
      where: { id: playlistId },
      data: { updatedAt: new Date() },
    });

    return { message: 'Items reordered successfully' };
  }

  private async isCollaborator(playlistId: string, userId: string): Promise<boolean> {
    const collaborator = await this.prisma.playlistCollaborator.findFirst({
      where: {
        playlistId: playlistId,
        userId: userId,
      },
    });
    return !!collaborator;
  }

  // === CRATE SOCIAL FEATURES ===

  async getTrending(limit: number = 20) {
    // Trending: most played in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        updatedAt: { gte: sevenDaysAgo },
      },
      orderBy: { playCount: 'desc' },
      take: limit,
      include: {
        owner: {
          select: {
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            items: true,
            likes: true,
          },
        },
      },
    });
  }

  async getFeatured(limit: number = 20) {
    // Featured: most liked public crates
    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        owner: {
          select: {
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            items: true,
            likes: true,
          },
        },
      },
    });
  }
}
