import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
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
        throw new NotFoundException('Playlist not found'); // Don't reveal private playlist existence
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

  async addPlaylistItem(playlistId: string, userId: string, dto: AddPlaylistItemDto) {
    // Check if playlist exists and user can modify it
    const playlist = await this.prisma.playlist.findFirst({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check permissions
    const canModify = playlist.ownerUserId === userId || 
      (playlist.isCollaborative && await this.isCollaborator(playlistId, userId));

    if (!canModify) {
      throw new ForbiddenException('Not authorized to add items to this playlist');
    }

    // Get user's profile for the addedBy relation
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    // Determine position
    let position = dto.position;
    if (position === undefined) {
      // Add to end of playlist
      const lastItem = await this.prisma.playlistItem.findFirst({
        where: { playlistId: playlistId },
        orderBy: { position: 'desc' },
      });
      position = (lastItem?.position ?? -1) + 1;
    } else {
      // Check if position is already taken
      const existingItem = await this.prisma.playlistItem.findFirst({
        where: {
          playlistId: playlistId,
          position: position,
        },
      });

      if (existingItem) {
        throw new ConflictException(`Position ${position} is already taken`);
      }
    }

    return this.prisma.playlistItem.create({
      data: {
        playlistId: playlistId,
        position: position,
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

  async getPlaylistItems(playlistId: string, dto: GetPlaylistItemsDto, requestingUserId?: string) {
    // Check if playlist exists and user can access it
    await this.getPlaylist(playlistId, requestingUserId);

    const sortField = dto.sortField === 'addedAt' ? 'addedAt' : 'position';
    const options = validatePaginationOptions({
      limit: dto.limit,
      cursor: dto.cursor,
      sortField: sortField,
      sortDirection: dto.sortDirection,
    });

    const where = buildCursorWhere(
      options.cursor,
      options.sortField,
      options.sortDirection,
      { playlistId: playlistId },
    );

    // Fetch one extra item to determine if there are more
    const items = await this.prisma.playlistItem.findMany({
      where,
      orderBy: {
        [options.sortField]: options.sortDirection,
      },
      take: options.limit + 1,
      include: {
        addedBy: {
          select: {
            username: true,
            displayName: true,
          },
        },
      },
    });

    return createPaginatedResult(items, options.limit, options.sortField);
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
}
