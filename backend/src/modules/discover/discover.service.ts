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

  async getPeopleSuggestions(userId: string, limit: number | string) {
    const take = typeof limit === 'string' ? parseInt(limit, 10) || 20 : limit || 20;

    // Get the current user's following list
    const userFollowing = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = userFollowing.map((f) => f.followingId);

    // Get the user's genres for genre-based suggestions
    const userProfile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { genres: true },
    });
    const userGenres = userProfile?.genres || [];

    // Find users with similar genres that the user doesn't already follow
    const suggestions = await this.prisma.profile.findMany({
      where: {
        userId: {
          notIn: [userId, ...followingIds], // Exclude self and already following
        },
        // At least one matching genre if user has genres
        ...(userGenres.length > 0 && {
          genres: {
            hasSome: userGenres,
          },
        }),
      },
      orderBy: [
        { followers: { _count: 'desc' } }, // Most followed first
      ],
      take,
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        user: {
          include: {
            artistProfile: {
              select: {
                verified: true,
              },
            },
          },
        },
      },
    });

    // Calculate mutual connections
    const suggestionsWithMutuals = await Promise.all(
      suggestions.map(async (profile) => {
        // Count mutual followers (people both users follow)
        const mutualCount = await this.prisma.follow.count({
          where: {
            followerId: {
              in: followingIds,
            },
            followingId: profile.userId,
          },
        });

        return {
          id: profile.userId,
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          bio: profile.bio,
          genres: profile.genres,
          followers: profile._count.followers,
          following: profile._count.following,
          mutualFollowers: mutualCount,
          verified: profile.user?.artistProfile?.verified || false,
          isArtist: !!profile.user?.artistProfile,
          reason: mutualCount > 0
            ? `Followed by ${mutualCount} people you follow`
            : userGenres.some((g) => profile.genres.includes(g))
              ? 'Similar music taste'
              : 'Popular on seda',
        };
      }),
    );

    return suggestionsWithMutuals;
  }

  async getTrendingRooms(limit: number | string) {
    const take = typeof limit === 'string' ? parseInt(limit, 10) || 20 : limit || 20;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get rooms with most messages in the last 7 days
    const rooms = await this.prisma.room.findMany({
      where: {
        isPrivate: false,
      },
      take,
      include: {
        creator: {
          include: {
            profile: {
              select: {
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            artistProfile: {
              select: {
                verified: true,
              },
            },
          },
        },
        _count: {
          select: {
            memberships: true,
            messages: true,
          },
        },
        // Get recent message count for trending calculation
        messages: {
          where: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Sort by recent activity (messages in last 7 days)
    const sortedRooms = rooms
      .map((room) => ({
        id: room.id,
        name: room.name,
        description: room.description,
        genre: room.genre,
        coverImageUrl: room.coverImageUrl,
        memberCount: room._count.memberships,
        messageCount: room._count.messages,
        recentActivity: room.messages.length, // Messages in last 7 days
        creator: room.creator.profile
          ? {
              username: room.creator.profile.username,
              displayName: room.creator.profile.displayName,
              avatarUrl: room.creator.profile.avatarUrl,
              verified: room.creator.artistProfile?.verified || false,
            }
          : null,
        createdAt: room.createdAt,
      }))
      .sort((a, b) => b.recentActivity - a.recentActivity);

    return sortedRooms;
  }
}
