import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    // Check if user already has a profile
    const existingProfile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    if (existingProfile) {
      throw new ConflictException('User already has a profile');
    }

    // Canonicalize username: trim and lowercase
    const canonicalUsername = dto.username.trim().toLowerCase();

    // Check if username is already taken (case-insensitive)
    const existingUsername = await this.prisma.profile.findFirst({
      where: { username: canonicalUsername },
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    return this.prisma.profile.create({
      data: {
        userId: userId,
        username: canonicalUsername,
        displayName: dto.displayName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      },
    });
  }

  async getProfileByUsername(username: string) {
    // Canonicalize username for lookup
    const canonicalUsername = username.trim().toLowerCase();

    return this.prisma.profile.findFirst({
      where: { username: canonicalUsername },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
      include: {
        user: {
          select: {
            emailVerified: true,
            userType: true,
          },
        },
      },
    });

    if (!profile) {
      return null;
    }

    // Flatten the response to include emailVerified at the top level
    return {
      ...profile,
      emailVerified: profile.user?.emailVerified ?? false,
      userType: profile.user?.userType ?? 'fan',
    };
  }

  async updateProfile(userId: string, username: string, dto: UpdateProfileDto) {
    // Canonicalize username for lookup
    const canonicalUsername = username.trim().toLowerCase();

    // Get the profile to check ownership
    const profile = await this.prisma.profile.findFirst({
      where: { username: canonicalUsername },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    if (profile.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this profile');
    }

    // If updating username, check if it's available
    let newCanonicalUsername: string | undefined;
    if (dto.username) {
      newCanonicalUsername = dto.username.trim().toLowerCase();

      // Only check availability if username is actually changing
      if (newCanonicalUsername !== canonicalUsername) {
        const existingUsername = await this.prisma.profile.findFirst({
          where: { username: newCanonicalUsername },
        });

        if (existingUsername) {
          throw new ConflictException('Username already taken');
        }
      }
    }

    return this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        username: newCanonicalUsername || profile.username,
        displayName: dto.displayName !== undefined ? dto.displayName : profile.displayName,
        bio: dto.bio !== undefined ? dto.bio : profile.bio,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : profile.avatarUrl,
        updatedAt: new Date(),
      },
    });
  }

  async updateGenres(userId: string, genres: string[]) {
    // #COMPLETION_DRIVE: Assuming user might not have a profile yet
    // #SUGGEST_VERIFY: Check if we should auto-create profile or require explicit creation first

    // Get or create profile for the user
    let profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    const isFirstTimeCompletion = !profile || !profile.genresCompleted;

    if (!profile) {
      // Auto-create profile if user doesn't have one
      // Use a temporary username based on user ID that they can change later
      const tempUsername = `user_${userId.slice(-8)}`;
      profile = await this.prisma.profile.create({
        data: {
          userId: userId,
          username: tempUsername,
          genres: genres,
          genresCompleted: true,
          genresCompletedAt: new Date(),
        },
      });
    } else {
      // Update existing profile
      profile = await this.prisma.profile.update({
        where: { id: profile.id },
        data: {
          genres: genres,
          genresCompleted: true,
          genresCompletedAt: profile.genresCompleted ? profile.genresCompletedAt : new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return {
      profile,
      isFirstTimeCompletion,
      statusCode: isFirstTimeCompletion ? 201 : 200,
    };
  }

  async getOnboardingStatus(userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    const genresCompleted = profile?.genresCompleted || false;
    const hasGenres = profile?.genres && profile.genres.length > 0;

    return {
      genresCompleted,
      genresCompletedAt: profile?.genresCompletedAt || null,
      shouldShowGenresStep: !genresCompleted && !hasGenres,
    };
  }

  // Utility function to check if user should see genres step
  async shouldShowGenresStep(userId: string): Promise<boolean> {
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    // Show genres step if user has no profile OR profile exists but genres not completed
    return !profile?.genresCompleted && (!profile?.genres || profile.genres.length === 0);
  }

  // Profile Customization
  async updateProfileCustomization(userId: string, customizationData: any) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId: userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        coverImage: customizationData.coverImage,
        location: customizationData.location,
        photos: customizationData.photos,
        videos: customizationData.videos,
        highlightedTracks: customizationData.highlightedTracks,
        highlightedMerch: customizationData.highlightedMerch,
        highlightedConcerts: customizationData.highlightedConcerts,
        instagramUrl: customizationData.instagramUrl,
        youtubeUrl: customizationData.youtubeUrl,
        websiteUrl: customizationData.websiteUrl,
        updatedAt: new Date(),
      },
    });
  }

  // Follower/Following Management
  async followUser(followerId: string, followingUsername: string) {
    const followingProfile = await this.getProfileByUsername(followingUsername);

    if (!followingProfile) {
      throw new NotFoundException('User not found');
    }

    if (followingProfile.userId === followerId) {
      throw new ForbiddenException('Cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findFirst({
      where: {
        followerId: followerId,
        followingId: followingProfile.userId,
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    return this.prisma.follow.create({
      data: {
        followerId: followerId,
        followingId: followingProfile.userId,
      },
    });
  }

  async unfollowUser(followerId: string, followingUsername: string) {
    const followingProfile = await this.getProfileByUsername(followingUsername);

    if (!followingProfile) {
      throw new NotFoundException('User not found');
    }

    const follow = await this.prisma.follow.findFirst({
      where: {
        followerId: followerId,
        followingId: followingProfile.userId,
      },
    });

    if (!follow) {
      throw new NotFoundException('Not following this user');
    }

    await this.prisma.follow.delete({
      where: { id: follow.id },
    });

    return { success: true };
  }

  async getFollowers(username: string, limit: number = 50) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const followers = await this.prisma.follow.findMany({
      where: { followingId: profile.userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            userId: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    return followers.map(f => ({
      ...f.follower,
      followedAt: f.createdAt,
    }));
  }

  async getFollowing(username: string, limit: number = 50) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const following = await this.prisma.follow.findMany({
      where: { followerId: profile.userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            userId: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    return following.map(f => ({
      ...f.following,
      followedAt: f.createdAt,
    }));
  }

  async getFollowerCount(username: string) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      return 0;
    }

    return this.prisma.follow.count({
      where: { followingId: profile.userId },
    });
  }

  async getFollowingCount(username: string) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      return 0;
    }

    return this.prisma.follow.count({
      where: { followerId: profile.userId },
    });
  }

  async isFollowing(followerId: string, followingUsername: string) {
    const followingProfile = await this.getProfileByUsername(followingUsername);

    if (!followingProfile) {
      return false;
    }

    const follow = await this.prisma.follow.findFirst({
      where: {
        followerId: followerId,
        followingId: followingProfile.userId,
      },
    });

    return !!follow;
  }

  // Profile Stats Aggregation
  async getProfileStats(username: string) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const [followerCount, followingCount, postCount, trackCount] = await Promise.all([
      this.getFollowerCount(username),
      this.getFollowingCount(username),
      this.prisma.post.count({
        where: {
          userId: profile.userId,
          deletedAt: null,
        },
      }),
      this.prisma.marketplaceProduct.count({
        where: {
          artistId: profile.userId,
          status: 'PUBLISHED',
          type: { in: ['DIGITAL_TRACK', 'DIGITAL_ALBUM'] },
        },
      }),
    ]);

    // Get total plays from analytics if available
    const analytics = await this.prisma.artistAnalytics.aggregate({
      where: { artistId: profile.userId },
      _sum: {
        trackPlays: true,
      },
    });

    return {
      followers: followerCount,
      following: followingCount,
      posts: postCount,
      tracks: trackCount,
      totalPlays: analytics._sum.trackPlays || 0,
    };
  }

  // Content Fetching
  async getProfilePosts(username: string, limit: number = 20, offset: number = 0) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.post.findMany({
      where: {
        userId: profile.userId,
        deletedAt: null,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        crate: {
          select: {
            id: true,
            title: true,
            coverImageUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
    });
  }

  async getProfileComments(username: string, limit: number = 20, offset: number = 0) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.comment.findMany({
      where: {
        userId: profile.userId,
        deletedAt: null,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        post: {
          select: {
            id: true,
            type: true,
            content: true,
            user: {
              select: {
                username: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });
  }

  async getProfileTracks(username: string) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.marketplaceProduct.findMany({
      where: {
        artistId: profile.userId,
        status: 'PUBLISHED',
        type: { in: ['DIGITAL_TRACK', 'DIGITAL_ALBUM'] },
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  // Top Fans (from FanEngagement table)
  async getTopFans(username: string, limit: number = 10) {
    const profile = await this.getProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const topFans = await this.prisma.fanEngagement.findMany({
      where: { artistId: profile.userId },
      take: limit,
      orderBy: { totalSpent: 'desc' },
      include: {
        fan: {
          select: {
            id: true,
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

    return topFans.map(engagement => ({
      userId: engagement.fan.id,
      username: engagement.fan.profile?.username,
      displayName: engagement.fan.profile?.displayName,
      avatarUrl: engagement.fan.profile?.avatarUrl,
      totalSpent: engagement.totalSpent,
      totalPurchases: engagement.totalPurchases,
      totalPlays: engagement.totalPlays,
      lastEngagement: engagement.lastEngagement,
    }));
  }
}
