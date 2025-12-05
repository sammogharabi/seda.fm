import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    return this.prisma.like.create({
      data: {
        userId,
        type: 'POST',
        postId,
      },
    });
  }

  async unlikePost(userId: string, postId: string) {
    await this.prisma.like.deleteMany({
      where: {
        userId,
        type: 'POST',
        postId,
      },
    });
  }

  async likeComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    return this.prisma.like.create({
      data: {
        userId,
        type: 'COMMENT',
        commentId,
      },
    });
  }

  async unlikeComment(userId: string, commentId: string) {
    await this.prisma.like.deleteMany({
      where: {
        userId,
        type: 'COMMENT',
        commentId,
      },
    });
  }

  async likeCrate(userId: string, crateId: string) {
    const crate = await this.prisma.playlist.findUnique({ where: { id: crateId } });
    if (!crate) throw new NotFoundException('Crate not found');

    return this.prisma.like.create({
      data: {
        userId,
        type: 'CRATE',
        crateId,
      },
    });
  }

  async unlikeCrate(userId: string, crateId: string) {
    await this.prisma.like.deleteMany({
      where: {
        userId,
        type: 'CRATE',
        crateId,
      },
    });
  }
}
