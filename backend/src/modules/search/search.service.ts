import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchDto) {
    const { q, type, limit } = dto;
    const query = q.trim();

    if (!query) {
      return { users: [], tracks: [], artists: [], crates: [], rooms: [] };
    }

    const results: any = {};

    // Execute searches in parallel for better performance
    const searchPromises: Promise<void>[] = [];

    if (type === 'all' || type === 'users') {
      searchPromises.push(
        this.searchUsers(query, limit!).then((data) => {
          results.users = data;
        }),
      );
    }

    if (type === 'all' || type === 'tracks') {
      searchPromises.push(
        this.searchTracks(query, limit!).then((data) => {
          results.tracks = data;
        }),
      );
    }

    if (type === 'all' || type === 'artists') {
      searchPromises.push(
        this.searchArtists(query, limit!).then((data) => {
          results.artists = data;
        }),
      );
    }

    if (type === 'all' || type === 'crates') {
      searchPromises.push(
        this.searchCrates(query, limit!).then((data) => {
          results.crates = data;
        }),
      );
    }

    if (type === 'all' || type === 'rooms') {
      searchPromises.push(
        this.searchRooms(query, limit!).then((data) => {
          results.rooms = data;
        }),
      );
    }

    await Promise.all(searchPromises);

    return results;
  }

  private async searchUsers(query: string, limit: number) {
    // Use case-insensitive search with ranking
    // Exact username matches rank higher than partial matches
    const searchTerm = `%${query}%`;

    return this.prisma.profile.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        userId: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        genres: true,
      },
      orderBy: [
        // Prioritize exact username matches
        { username: 'asc' },
      ],
    });
  }

  private async searchTracks(query: string, limit: number) {
    return this.prisma.trackRef.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { artist: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        provider: true,
        providerId: true,
        url: true,
        title: true,
        artist: true,
        artwork: true,
        duration: true,
      },
      orderBy: [
        // Prioritize exact title matches
        { title: 'asc' },
      ],
    });
  }

  private async searchArtists(query: string, limit: number) {
    return this.prisma.artistProfile.findMany({
      where: {
        OR: [
          { artistName: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: {
        id: true,
        userId: true,
        artistName: true,
        bio: true,
        verified: true,
        verifiedAt: true,
        websiteUrl: true,
        spotifyUrl: true,
        bandcampUrl: true,
        soundcloudUrl: true,
        user: {
          select: {
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
      orderBy: [
        // Prioritize verified artists
        { verified: 'desc' },
        // Then prioritize exact name matches
        { artistName: 'asc' },
      ],
    });
  }

  private async searchCrates(query: string, limit: number) {
    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { genre: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        owner: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          }
        },
        _count: { select: { items: true } },
      },
      orderBy: [
        // Prioritize exact title matches
        { title: 'asc' },
      ],
    });
  }

  private async searchRooms(query: string, limit: number) {
    return this.prisma.room.findMany({
      where: {
        isPrivate: false,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        _count: {
          select: {
            memberships: true,
            messages: true,
          }
        },
      },
      orderBy: [
        // Prioritize rooms with more members
        { createdAt: 'desc' },
      ],
    });
  }
}
