import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        userId,
        type: dto.type,
        content: dto.content,
        trackRef: dto.trackRef,
        crateId: dto.crateId,
        mediaUrls: dto.mediaUrls || [],
      },
      include: {
        user: { select: { userId: true, username: true, displayName: true } },
      },
    });
  }

  async getById(id: string, requestingUserId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: { select: { userId: true, username: true, displayName: true } },
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Post not found');
    }

    // Check if requesting user liked this post
    const liked = await this.prisma.like.findFirst({
      where: {
        userId: requestingUserId,
        type: 'POST',
        postId: id,
      },
    });

    return { ...post, isLiked: !!liked };
  }

  async delete(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized');

    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async repost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.repost.create({
      data: { userId, postId },
    });
  }

  async unrepost(userId: string, postId: string) {
    await this.prisma.repost.delete({
      where: { userId_postId: { userId, postId } },
    });
  }
}
