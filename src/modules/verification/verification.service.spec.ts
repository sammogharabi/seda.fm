import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { VerificationService } from './verification.service';
import { PrismaService } from '../../config/prisma.service';
import { CrawlerService } from '../crawler/crawler.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { VerificationStatus } from '@prisma/client';

describe('VerificationService', () => {
  let service: VerificationService;
  let prismaService: PrismaService;
  let crawlerService: CrawlerService;

  const mockPrismaService = {
    verificationRequest: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    artistProfile: {
      upsert: jest.fn(),
    },
  };

  const mockCrawlerService = {
    verifyClaim: jest.fn().mockResolvedValue(true),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        'verification.codeLength': 8,
        'verification.codeExpiryDays': 7,
        'rateLimit.verificationPerDay': 3,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CrawlerService, useValue: mockCrawlerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
    prismaService = module.get<PrismaService>(PrismaService);
    crawlerService = module.get<CrawlerService>(CrawlerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestVerification', () => {
    it('should create a new verification request', async () => {
      const userId = 'user-123';
      const mockRequest = {
        id: 'req-123',
        claimCode: 'SEDA-ABCD1234',
        expiresAt: new Date(),
      };

      mockPrismaService.verificationRequest.count.mockResolvedValue(0);
      mockPrismaService.verificationRequest.findFirst.mockResolvedValue(null);
      mockPrismaService.verificationRequest.create.mockResolvedValue(mockRequest);

      const result = await service.requestVerification(userId);

      expect(result).toHaveProperty('claimCode');
      expect(result.claimCode).toMatch(/^SEDA-/);
      expect(mockPrismaService.verificationRequest.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if pending request exists', async () => {
      const userId = 'user-123';
      
      mockPrismaService.verificationRequest.count.mockResolvedValue(0);
      mockPrismaService.verificationRequest.findFirst.mockResolvedValue({
        id: 'existing-req',
        status: VerificationStatus.PENDING,
      });

      await expect(service.requestVerification(userId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should enforce rate limit', async () => {
      const userId = 'user-123';
      
      mockPrismaService.verificationRequest.count.mockResolvedValue(3);

      await expect(service.requestVerification(userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('submitVerification', () => {
    it('should submit verification and trigger crawling', async () => {
      const userId = 'user-123';
      const dto = {
        claimCode: 'SEDA-ABCD1234',
        targetUrl: 'https://artist.bandcamp.com',
      };

      const mockRequest = {
        id: 'req-123',
        userId,
        claimCode: dto.claimCode,
        status: VerificationStatus.PENDING,
        expiresAt: new Date(Date.now() + 86400000),
      };

      mockPrismaService.verificationRequest.findFirst.mockResolvedValue(mockRequest);
      mockPrismaService.verificationRequest.update.mockResolvedValue({
        ...mockRequest,
        status: VerificationStatus.CRAWLING,
      });

      const result = await service.submitVerification(userId, dto);

      expect(result.status).toBe('processing');
      expect(mockPrismaService.verificationRequest.update).toHaveBeenCalled();
      expect(crawlerService.verifyClaim).toHaveBeenCalledWith(
        mockRequest.id,
        dto.targetUrl,
        dto.claimCode,
      );
    });

    it('should reject expired verification codes', async () => {
      const userId = 'user-123';
      const dto = {
        claimCode: 'SEDA-ABCD1234',
        targetUrl: 'https://artist.bandcamp.com',
      };

      const mockRequest = {
        id: 'req-123',
        userId,
        claimCode: dto.claimCode,
        status: VerificationStatus.PENDING,
        expiresAt: new Date(Date.now() - 86400000),
      };

      mockPrismaService.verificationRequest.findFirst.mockResolvedValue(mockRequest);

      await expect(service.submitVerification(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});