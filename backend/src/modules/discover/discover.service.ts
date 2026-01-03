import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class DiscoverService {
  constructor(private prisma: PrismaService) {}

  async getArtists(limit: number | string) {
    // Get all artists, with verified artists first
    const take = typeof limit === 'string' ? parseInt(limit, 10) || 20 : limit || 20;
    const artists = await this.prisma.artistProfile.findMany({
      orderBy: [
        { verified: 'desc' }, // Verified artists first
        { verifiedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take,
      include: {
        user: {
          include: {
            profile: {
              include: {
                _count: {
                  select: {
                    followers: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Normalize the response for frontend consumption
    return artists.map((artist) => ({
      id: artist.userId,
      artistProfileId: artist.id,
      displayName: artist.user.profile?.displayName || artist.artistName,
      username: artist.user.profile?.username || '',
      avatarUrl: artist.user.profile?.avatarUrl,
      verified: artist.verified,
      bio: artist.bio,
      genres: artist.user.profile?.genres || [],
      followers: artist.user.profile?._count?.followers || 0,
      websiteUrl: artist.websiteUrl,
      spotifyUrl: artist.spotifyUrl,
      bandcampUrl: artist.bandcampUrl,
      soundcloudUrl: artist.soundcloudUrl,
    }));
  }

  async getTrendingCrates(limit: number) {
    // Simple trending: most played in last 7 days
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
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true, likes: true } },
      },
    });
  }

  async getNewCrates(limit: number) {
    return this.prisma.playlist.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true } },
      },
    });
  }

  async getPersonalized(userId: string, limit: number) {
    // Simple personalization: based on user's genres
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { genres: true },
    });

    if (!profile || !profile.genres || profile.genres.length === 0) {
      return this.getTrendingCrates(limit);
    }

    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        genre: { in: profile.genres },
      },
      orderBy: { playCount: 'desc' },
      take: limit,
      include: {
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true } },
      },
    });
  }

  async getByGenre(genre: string, limit: number) {
    return this.prisma.playlist.findMany({
      where: {
        isPublic: true,
        genre: { equals: genre, mode: 'insensitive' },
      },
      orderBy: { playCount: 'desc' },
      take: limit,
      include: {
        owner: { select: { username: true, displayName: true } },
        _count: { select: { items: true } },
      },
    });
  }
}
