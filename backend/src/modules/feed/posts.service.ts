import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

// Standard include for product data in posts
const productInclude = {
  include: {
    artist: {
      include: { artistProfile: true },
    },
  },
};

// Standard include for user data in posts
const userInclude = {
  select: {
    userId: true,
    username: true,
    displayName: true,
    avatarUrl: true,
  },
};

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostDto) {
    // Validate product exists and is published for PRODUCT posts
    if (dto.productId) {
      const product = await this.prisma.marketplaceProduct.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new BadRequestException('Product not found');
      }
      if (product.status !== 'PUBLISHED') {
        throw new BadRequestException('Cannot share unpublished products');
      }
    }

    return this.prisma.post.create({
      data: {
        userId,
        type: dto.type,
        content: dto.content,
        trackRef: dto.trackRef as object | undefined,
        crateId: dto.crateId,
        mediaUrls: dto.mediaUrls || [],
        productId: dto.productId,
      },
      include: {
        user: userInclude,
        product: productInclude,
      },
    });
  }

  async getById(id: string, requestingUserId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        user: userInclude,
        product: productInclude,
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

  async update(id: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.deletedAt) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized to edit this post');

    return this.prisma.post.update({
      where: { id },
      data: {
        content: dto.content,
        trackRef: dto.trackRef as object | undefined,
        mediaUrls: dto.mediaUrls,
        updatedAt: new Date(),
      },
      include: {
        user: userInclude,
        product: productInclude,
        _count: { select: { likes: true, comments: true, reposts: true } },
      },
    });
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
