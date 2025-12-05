import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { GetFeedDto } from './dto/get-feed.dto';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getFeed(userId: string, query: GetFeedDto) {
    const { limit = 20, cursor } = query;

    // Get users that current user follows
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    followingIds.push(userId); // Include own posts

    const posts = await this.prisma.post.findMany({
      where: {
        userId: { in: followingIds },
        deletedAt: null,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: { likes: true, comments: true, reposts: true },
        },
      },
    });

    return {
      data: posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
      hasMore: posts.length === limit,
    };
  }

  async getGlobalFeed(query: GetFeedDto) {
    const { limit = 20, cursor } = query;

    const posts = await this.prisma.post.findMany({
      where: {
        deletedAt: null,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: { likes: true, comments: true, reposts: true },
        },
      },
    });

    return {
      data: posts,
      nextCursor: posts.length === limit ? posts[posts.length - 1].id : null,
      hasMore: posts.length === limit,
    };
  }
}
