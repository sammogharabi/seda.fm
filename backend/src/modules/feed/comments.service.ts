import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetFeedDto } from './dto/get-feed.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.comment.create({
      data: {
        postId,
        userId,
        content: dto.content,
        parentId: dto.parentId,
      },
      include: {
        user: { select: { userId: true, username: true, displayName: true } },
      },
    });
  }

  async getByPost(postId: string, query: GetFeedDto) {
    const { limit = 20, cursor } = query;

    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // Only top-level comments
        deletedAt: null,
        ...(cursor && { id: { lt: cursor } }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { userId: true, username: true, displayName: true } },
        _count: { select: { likes: true, replies: true } },
      },
    });

    return {
      data: comments,
      nextCursor: comments.length === limit ? comments[comments.length - 1].id : null,
      hasMore: comments.length === limit,
    };
  }

  async delete(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new ForbiddenException('Not authorized');

    await this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
