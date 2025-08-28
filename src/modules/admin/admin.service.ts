import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { VerificationStatus, UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getVerifications(status?: VerificationStatus, limit = 50, offset = 0) {
    const where = status ? { status } : {};
    
    const [verifications, total] = await Promise.all([
      this.prisma.verificationRequest.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              artistProfile: {
                select: {
                  artistName: true,
                  verified: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.verificationRequest.count({ where }),
    ]);

    return {
      data: verifications,
      total,
      limit,
      offset,
    };
  }

  async getVerificationDetails(id: string) {
    const verification = await this.prisma.verificationRequest.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            artistProfile: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!verification) {
      throw new NotFoundException('Verification request not found');
    }

    return verification;
  }

  async approveVerification(requestId: string, adminId: string, notes?: string) {
    const verification = await this.prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!verification) {
      throw new NotFoundException('Verification request not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: VerificationStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          metadata: notes ? { adminNotes: notes } : undefined,
        },
      });

      await tx.artistProfile.upsert({
        where: { userId: verification.userId },
        update: {
          verified: true,
          verifiedAt: new Date(),
        },
        create: {
          userId: verification.userId,
          artistName: 'Artist',
          verified: true,
          verifiedAt: new Date(),
        },
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'APPROVE_VERIFICATION',
          targetId: requestId,
          targetType: 'VerificationRequest',
          details: { notes },
        },
      });
    });

    return { message: 'Verification approved successfully' };
  }

  async denyVerification(requestId: string, adminId: string, reason: string) {
    const verification = await this.prisma.verificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!verification) {
      throw new NotFoundException('Verification request not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: VerificationStatus.DENIED,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          denialReason: reason,
        },
      });

      await tx.adminAction.create({
        data: {
          adminId,
          action: 'DENY_VERIFICATION',
          targetId: requestId,
          targetType: 'VerificationRequest',
          details: { reason },
        },
      });
    });

    return { message: 'Verification denied' };
  }

  async getVerificationStats() {
    const [total, pending, approved, denied, expired] = await Promise.all([
      this.prisma.verificationRequest.count(),
      this.prisma.verificationRequest.count({
        where: { status: VerificationStatus.PENDING },
      }),
      this.prisma.verificationRequest.count({
        where: { status: VerificationStatus.APPROVED },
      }),
      this.prisma.verificationRequest.count({
        where: { status: VerificationStatus.DENIED },
      }),
      this.prisma.verificationRequest.count({
        where: { status: VerificationStatus.EXPIRED },
      }),
    ]);

    const verifiedArtists = await this.prisma.artistProfile.count({
      where: { verified: true },
    });

    return {
      total,
      pending,
      approved,
      denied,
      expired,
      verifiedArtists,
    };
  }
}