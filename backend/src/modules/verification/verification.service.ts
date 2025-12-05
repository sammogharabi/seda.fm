import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { CrawlerService } from '../crawler/crawler.service';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { nanoid } from 'nanoid';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class VerificationService {
  private readonly codeLength: number;
  private readonly codeExpiryDays: number;
  private readonly rateLimitPerDay: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private crawlerService: CrawlerService,
  ) {
    this.codeLength = this.configService.get<number>('verification.codeLength', 8);
    this.codeExpiryDays = this.configService.get<number>('verification.codeExpiryDays', 7);
    this.rateLimitPerDay = this.configService.get<number>('rateLimit.verificationPerDay', 3);
  }

  async requestVerification(userId: string) {
    await this.checkRateLimit(userId);

    const existingRequest = await this.prisma.verificationRequest.findFirst({
      where: {
        userId,
        status: {
          in: [
            VerificationStatus.PENDING,
            VerificationStatus.CRAWLING,
            VerificationStatus.AWAITING_ADMIN,
          ],
        },
      },
    });

    if (existingRequest) {
      throw new ConflictException('You already have a pending verification request');
    }

    const claimCode = this.generateClaimCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.codeExpiryDays);

    const verificationRequest = await this.prisma.verificationRequest.create({
      data: {
        userId,
        claimCode,
        expiresAt,
        status: VerificationStatus.PENDING,
      },
    });

    return {
      id: verificationRequest.id,
      claimCode: verificationRequest.claimCode,
      expiresAt: verificationRequest.expiresAt,
      instructions: this.getVerificationInstructions(claimCode),
    };
  }

  async submitVerification(userId: string, dto: SubmitVerificationDto) {
    const verificationRequest = await this.prisma.verificationRequest.findFirst({
      where: {
        userId,
        claimCode: dto.claimCode,
        status: VerificationStatus.PENDING,
      },
    });

    if (!verificationRequest) {
      throw new NotFoundException('Verification request not found or invalid claim code');
    }

    if (new Date() > verificationRequest.expiresAt) {
      await this.prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: { status: VerificationStatus.EXPIRED },
      });
      throw new BadRequestException('Verification code has expired');
    }

    this.validateUrl(dto.targetUrl);

    await this.prisma.verificationRequest.update({
      where: { id: verificationRequest.id },
      data: {
        targetUrl: dto.targetUrl,
        status: VerificationStatus.CRAWLING,
      },
    });

    this.crawlerService
      .verifyClaim(verificationRequest.id, dto.targetUrl, dto.claimCode)
      .catch((error) => {
        console.error('Crawler verification failed:', error);
        this.prisma.verificationRequest.update({
          where: { id: verificationRequest.id },
          data: {
            status: VerificationStatus.AWAITING_ADMIN,
            crawlerResponse: { error: error.message },
          },
        });
      });

    return {
      message: 'Verification submitted. We will check your claim code placement.',
      status: 'processing',
    };
  }

  async getVerificationStatus(userId: string, requestId: string) {
    const verificationRequest = await this.prisma.verificationRequest.findFirst({
      where: {
        id: requestId,
        userId,
      },
    });

    if (!verificationRequest) {
      throw new NotFoundException('Verification request not found');
    }

    return {
      id: verificationRequest.id,
      status: verificationRequest.status,
      submittedAt: verificationRequest.submittedAt,
      reviewedAt: verificationRequest.reviewedAt,
      denialReason: verificationRequest.denialReason,
    };
  }

  async getUserVerifications(userId: string) {
    const verifications = await this.prisma.verificationRequest.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        expiresAt: true,
      },
    });

    return verifications;
  }

  private generateClaimCode(): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `SEDA-${nanoid(this.codeLength)}`;
  }

  private async checkRateLimit(userId: string) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentRequests = await this.prisma.verificationRequest.count({
      where: {
        userId,
        submittedAt: {
          gte: oneDayAgo,
        },
      },
    });

    if (recentRequests >= this.rateLimitPerDay) {
      throw new BadRequestException(
        `Rate limit exceeded. You can only request ${this.rateLimitPerDay} verifications per day.`,
      );
    }
  }

  private validateUrl(url: string) {
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        'bandcamp.com',
        'soundcloud.com',
        'spotify.com',
        'youtube.com',
        'instagram.com',
        'twitter.com',
        'x.com',
        'facebook.com',
        'tiktok.com',
      ];

      const isPersonalWebsite = !allowedDomains.some((domain) =>
        parsedUrl.hostname.includes(domain),
      );

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new BadRequestException('Invalid URL protocol. Only HTTP(S) URLs are allowed.');
      }
    } catch (error) {
      throw new BadRequestException('Invalid URL format');
    }
  }

  private getVerificationInstructions(claimCode: string) {
    return {
      step1: 'Copy your unique claim code',
      step2: 'Paste it on a public channel you control',
      step3: 'Submit the URL where you placed the code',
      examples: [
        'Your Bandcamp artist description',
        'Your personal website bio or about page',
        'Your SoundCloud profile description',
        'A public social media post (Twitter, Instagram)',
      ],
      claimCode,
      note: 'The code must be publicly visible and remain in place until verification is complete.',
    };
  }
}
