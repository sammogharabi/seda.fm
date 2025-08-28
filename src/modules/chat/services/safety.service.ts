import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';

@Injectable()
export class SafetyService {
  private readonly logger = new Logger(SafetyService.name);
  private readonly profanityWords = [
    // Basic profanity filter - in production you'd use a more comprehensive list
    'spam', 'scam', 'fake', 'fraud',
  ];

  constructor(private prisma: PrismaService) {}

  async checkRateLimit(userId: string, roomId: string): Promise<boolean> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const recentMessages = await this.prisma.message.count({
      where: {
        userId,
        roomId,
        createdAt: {
          gte: oneMinuteAgo,
        },
      },
    });

    // Allow max 10 messages per minute per user per room
    return recentMessages < 10;
  }

  containsProfanity(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.profanityWords.some(word => lowerText.includes(word));
  }

  isSpamLink(text: string): boolean {
    // Check for suspicious patterns
    const urlCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
    const suspiciousPatterns = [
      /click here/i,
      /free money/i,
      /earn \$\d+/i,
      /guaranteed/i,
      /limited time/i,
    ];

    // Multiple URLs or spam patterns
    if (urlCount > 2) return true;
    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  async filterMessage(text: string, userId: string, roomId: string): Promise<{
    allowed: boolean;
    filtered: boolean;
    filteredText?: string;
    reason?: string;
  }> {
    // Check rate limit
    const rateLimitOk = await this.checkRateLimit(userId, roomId);
    if (!rateLimitOk) {
      return {
        allowed: false,
        filtered: false,
        reason: 'Rate limit exceeded',
      };
    }

    // Check for spam links
    if (this.isSpamLink(text)) {
      this.logger.warn(`Spam link detected from user ${userId}: ${text}`);
      return {
        allowed: false,
        filtered: false,
        reason: 'Spam link detected',
      };
    }

    // Check for profanity and filter
    if (this.containsProfanity(text)) {
      const filteredText = this.filterProfanity(text);
      this.logger.log(`Profanity filtered for user ${userId}`);
      
      return {
        allowed: true,
        filtered: true,
        filteredText,
      };
    }

    return {
      allowed: true,
      filtered: false,
    };
  }

  private filterProfanity(text: string): string {
    let filteredText = text;
    
    this.profanityWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });

    return filteredText;
  }

  async reportSpam(reporterId: string, messageId: string, reason: string): Promise<void> {
    // Log spam report for admin review
    this.logger.warn(`Spam reported by ${reporterId} for message ${messageId}: ${reason}`);
    
    // In a full implementation, you'd store these reports in a database
    // and potentially auto-moderate based on report patterns
  }

  isMessageTooLong(text: string): boolean {
    // Max 2000 characters per message
    return text.length > 2000;
  }

  containsExcessiveCapitals(text: string): boolean {
    if (text.length < 10) return false;
    
    const capitalCount = (text.match(/[A-Z]/g) || []).length;
    const ratio = capitalCount / text.length;
    
    // Flag if more than 70% capitals
    return ratio > 0.7;
  }
}