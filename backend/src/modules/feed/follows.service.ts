import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { GetFeedDto } from './dto/get-feed.dto';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: string, username: string) {
    const targetProfile = await this.prisma.profile.findUnique({
      where: { username },
      select: { userId: true },
    });

    if (!targetProfile) {
      throw new NotFoundException('User not found');
    }

    if (followerId === targetProfile.userId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    return this.prisma.follow.create({
      data: {
        followerId,
        followingId: targetProfile.userId,
      },
    });
  }

  async unfollow(followerId: string, username: string) {
    const targetProfile = await this.prisma.profile.findUnique({
      where: { username },
      select: { userId: true },
    });

    if (!targetProfile) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        followingId: targetProfile.userId,
      },
    });
  }

  async getFollowers(username: string, query: GetFeedDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      select: { userId: true },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const { limit = 20, cursor } = query;

    const followers = await this.prisma.follow.findMany({
      where: {
        followingId: profile.userId,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
          select: {
            userId: true,
            username: true,
            displayName: true,
            bio: true,
          },
        },
      },
    });

    return {
      data: followers.map((f) => f.follower),
      nextCursor: followers.length === limit ? followers[followers.length - 1].id : null,
      hasMore: followers.length === limit,
    };
  }

  async getFollowing(username: string, query: GetFeedDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { username },
      select: { userId: true },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const { limit = 20, cursor } = query;

    const following = await this.prisma.follow.findMany({
      where: {
        followerId: profile.userId,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            userId: true,
            username: true,
            displayName: true,
            bio: true,
          },
        },
      },
    });

    return {
      data: following.map((f) => f.following),
      nextCursor: following.length === limit ? following[following.length - 1].id : null,
      hasMore: following.length === limit,
    };
  }
}
