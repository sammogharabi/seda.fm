import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { VerificationStatus } from '@prisma/client';
import * as puppeteer from 'puppeteer';

@Injectable()
export class CrawlerService {
  private readonly userAgent: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.userAgent = this.configService.get<string>(
      'crawler.userAgent',
      'Mozilla/5.0 (compatible; SedaBot/1.0)',
    );
    this.timeoutMs = this.configService.get<number>('crawler.timeoutMs', 30000);
    this.maxRetries = this.configService.get<number>('crawler.maxRetries', 3);
  }

  async verifyClaim(requestId: string, targetUrl: string, claimCode: string): Promise<boolean> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < this.maxRetries) {
      attempts++;
      try {
        const found = await this.crawlPage(targetUrl, claimCode);
        
        if (found) {
          await this.markAsVerified(requestId);
          return true;
        }
        
        break;
      } catch (error) {
        lastError = error as Error;
        console.error(`Crawl attempt ${attempts} failed:`, error);
        
        if (attempts < this.maxRetries) {
          await this.delay(Math.pow(2, attempts) * 1000);
        }
      }
    }

    await this.markAsAwaitingAdmin(requestId, lastError);
    return false;
  }

  private async crawlPage(url: string, claimCode: string): Promise<boolean> {
    const cachedResult = await this.checkCache(url);
    if (cachedResult !== null) {
      return cachedResult.includes(claimCode);
    }

    let browser: puppeteer.Browser | null = null;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.timeoutMs,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const pageContent = await page.content();
      const textContent = await page.evaluate(() => document.body?.innerText || '');

      await this.saveToCache(url, textContent);

      const found = textContent.includes(claimCode) || pageContent.includes(claimCode);
      
      return found;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async checkCache(url: string): Promise<string | null> {
    const cached = await this.prisma.crawlerCache.findFirst({
      where: {
        url,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return cached?.content || null;
  }

  private async saveToCache(url: string, content: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.prisma.crawlerCache.upsert({
      where: { url },
      update: {
        content,
        crawledAt: new Date(),
        expiresAt,
      },
      create: {
        url,
        content,
        expiresAt,
      },
    });
  }

  private async markAsVerified(requestId: string) {
    const verification = await this.prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: VerificationStatus.APPROVED,
        crawledAt: new Date(),
        reviewedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    await this.prisma.artistProfile.upsert({
      where: { userId: verification.userId },
      update: {
        verified: true,
        verifiedAt: new Date(),
      },
      create: {
        userId: verification.userId,
        artistName: verification.user.email.split('@')[0],
        verified: true,
        verifiedAt: new Date(),
      },
    });
  }

  private async markAsAwaitingAdmin(requestId: string, error: Error | null) {
    await this.prisma.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: VerificationStatus.AWAITING_ADMIN,
        crawledAt: new Date(),
        crawlerResponse: error ? { error: error.message } : undefined,
      },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}