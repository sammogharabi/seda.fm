import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class QueueService {
  constructor(private prisma: PrismaService) {}

  async addTrack(sessionId: string, userId: string, trackRef: any) {
    const session = await this.prisma.dJSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    // Get current max position
    const maxPosition = await this.prisma.queueItem.findFirst({
      where: { sessionId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = (maxPosition?.position || 0) + 1;

    return this.prisma.queueItem.create({
      data: {
        sessionId,
        addedBy: userId,
        trackRef,
        position,
      },
    });
  }

  async getQueue(sessionId: string) {
    return this.prisma.queueItem.findMany({
      where: { sessionId, playedAt: null, skipped: false },
      orderBy: [{ upvotes: 'desc' }, { position: 'asc' }],
      include: {
        _count: { select: { votes: true } },
      },
    });
  }
}
