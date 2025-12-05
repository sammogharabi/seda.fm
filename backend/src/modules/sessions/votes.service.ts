import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VoteType } from '@prisma/client';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async vote(userId: string, queueItemId: string, voteType: VoteType) {
    const queueItem = await this.prisma.queueItem.findUnique({
      where: { id: queueItemId },
    });
    if (!queueItem) throw new NotFoundException('Queue item not found');

    // Upsert vote (update if exists, create if not)
    const vote = await this.prisma.vote.upsert({
      where: {
        queueItemId_userId: {
          queueItemId,
          userId,
        },
      },
      create: {
        queueItemId,
        userId,
        voteType,
      },
      update: {
        voteType,
      },
    });

    // Recalculate upvotes/downvotes count
    const upvoteCount = await this.prisma.vote.count({
      where: { queueItemId, voteType: 'UPVOTE' },
    });
    const downvoteCount = await this.prisma.vote.count({
      where: { queueItemId, voteType: 'DOWNVOTE' },
    });

    await this.prisma.queueItem.update({
      where: { id: queueItemId },
      data: {
        upvotes: upvoteCount,
        downvotes: downvoteCount,
      },
    });

    return vote;
  }
}
