import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(
    hostId: string,
    genre: string,
    roomId?: string,
    sessionName?: string,
    isPrivate?: boolean,
    initialTrack?: any,
    tags?: string[]
  ) {
    // If roomId is provided, validate it and check for existing sessions
    if (roomId) {
      const room = await this.prisma.room.findUnique({ where: { id: roomId } });
      if (!room) throw new NotFoundException('Room not found');

      // Check if there's already an active session in this room
      const existingSession = await this.prisma.dJSession.findFirst({
        where: { roomId, status: 'ACTIVE' },
      });
      if (existingSession) {
        throw new ForbiddenException('Room already has an active session');
      }
    }

    // Create session - standalone (no room) or linked to existing room
    return this.prisma.dJSession.create({
      data: {
        roomId: roomId || null,
        name: sessionName || null,
        isPrivate: isPrivate ?? false,
        hostId,
        currentDJId: hostId,
        status: 'ACTIVE',
        nowPlayingRef: initialTrack || null,
        nowPlayingStart: initialTrack ? new Date() : null,
        genre: genre,
        tags: tags || [],
      },
      include: {
        room: true,
        host: {
          include: {
            profile: true
          }
        },
        _count: { select: { queue: true } },
      },
    });
  }

  async getById(id: string) {
    const session = await this.prisma.dJSession.findUnique({
      where: { id },
      include: {
        room: true,
        queue: {
          orderBy: { position: 'asc' },
          include: {
            _count: { select: { votes: true } },
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getActive(limit: number = 20) {
    return this.prisma.dJSession.findMany({
      where: { status: 'ACTIVE' },
      take: Number(limit) || 20,
      orderBy: { createdAt: 'desc' },
      include: {
        room: { select: { id: true, name: true, description: true } },
        host: {
          include: {
            profile: true
          }
        },
        _count: { select: { queue: true } },
      },
    });
  }

  async getRecentlyEnded(limit: number = 10) {
    return this.prisma.dJSession.findMany({
      where: { status: 'ENDED' },
      take: Number(limit) || 10,
      orderBy: { endedAt: 'desc' },
      include: {
        room: { select: { id: true, name: true, description: true } },
        host: {
          include: {
            profile: true
          }
        },
        _count: { select: { queue: true } },
      },
    });
  }

  async join(sessionId: string, userId: string) {
    const session = await this.prisma.dJSession.findUnique({
      where: { id: sessionId },
      include: { room: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    // Add user to room membership if session has a room
    if (session.roomId) {
      await this.prisma.roomMembership.upsert({
        where: {
          roomId_userId: {
            roomId: session.roomId,
            userId,
          },
        },
        create: {
          roomId: session.roomId,
          userId,
        },
        update: {},
      });
    }

    return { message: 'Joined session', session };
  }

  async leave(sessionId: string, userId: string) {
    const session = await this.prisma.dJSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    // Remove from room membership if session has a room
    if (session.roomId) {
      await this.prisma.roomMembership.deleteMany({
        where: {
          roomId: session.roomId,
          userId,
        },
      });
    }

    return { message: 'Left session' };
  }

  async skipTrack(sessionId: string, userId: string) {
    const session = await this.prisma.dJSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    // Get next track from queue
    const nextTrack = await this.prisma.queueItem.findFirst({
      where: {
        sessionId,
        playedAt: null,
        skipped: false,
      },
      orderBy: [{ upvotes: 'desc' }, { position: 'asc' }],
    });

    if (!nextTrack) {
      return this.prisma.dJSession.update({
        where: { id: sessionId },
        data: { nowPlayingRef: Prisma.JsonNull, nowPlayingStart: null },
      });
    }

    // Mark current track as played/skipped and update session
    return this.prisma.dJSession.update({
      where: { id: sessionId },
      data: {
        nowPlayingRef: nextTrack.trackRef as Prisma.InputJsonValue,
        nowPlayingStart: new Date(),
      },
    });
  }

  async end(sessionId: string, userId: string) {
    const session = await this.prisma.dJSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.hostId !== userId) throw new ForbiddenException('Only host can end session');

    return this.prisma.dJSession.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
      },
    });
  }
}
