import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  roomId?: string;
  messageId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Log the event for now - in production you'd send to analytics service
      this.logger.log(`Analytics Event: ${event.event}`, {
        userId: event.userId,
        roomId: event.roomId,
        messageId: event.messageId,
        properties: event.properties,
        timestamp: event.timestamp || new Date(),
      });

      // In a full implementation, you could:
      // 1. Send to external analytics service (Mixpanel, Segment, etc.)
      // 2. Store in database for custom analytics
      // 3. Send to data pipeline for processing
      
    } catch (error) {
      this.logger.error('Failed to track analytics event', error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  // Chat-specific tracking methods
  async trackMessageSent(userId: string, roomId: string, messageId: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event: 'chat_message_sent',
      userId,
      roomId,
      messageId,
      properties: {
        hasTrackRef: properties?.hasTrackRef || false,
        hasParent: properties?.hasParent || false,
        textLength: properties?.textLength || 0,
        ...properties,
      },
    });
  }

  async trackMessageViewed(userId: string, roomId: string, messageId: string): Promise<void> {
    await this.trackEvent({
      event: 'chat_message_viewed',
      userId,
      roomId,
      messageId,
    });
  }

  async trackTrackUnfurled(userId: string, roomId: string, provider: string, url: string): Promise<void> {
    await this.trackEvent({
      event: 'track_unfurled',
      userId,
      roomId,
      properties: {
        provider,
        url,
      },
    });
  }

  async trackReactionAdded(userId: string, roomId: string, messageId: string, emoji: string): Promise<void> {
    await this.trackEvent({
      event: 'reaction_added',
      userId,
      roomId,
      messageId,
      properties: {
        emoji,
      },
    });
  }

  async trackReactionRemoved(userId: string, roomId: string, messageId: string, emoji: string): Promise<void> {
    await this.trackEvent({
      event: 'reaction_removed',
      userId,
      roomId,
      messageId,
      properties: {
        emoji,
      },
    });
  }

  async trackReplyCreated(userId: string, roomId: string, messageId: string, parentId: string): Promise<void> {
    await this.trackEvent({
      event: 'reply_created',
      userId,
      roomId,
      messageId,
      properties: {
        parentId,
      },
    });
  }

  async trackMentionDelivered(userId: string, roomId: string, messageId: string, mentionedUserId: string): Promise<void> {
    await this.trackEvent({
      event: 'mention_delivered',
      userId,
      roomId,
      messageId,
      properties: {
        mentionedUserId,
      },
    });
  }

  async trackModerationAction(moderatorId: string, roomId: string, action: string, targetId: string): Promise<void> {
    await this.trackEvent({
      event: 'mod_action',
      userId: moderatorId,
      roomId,
      properties: {
        action,
        targetId,
      },
    });
  }

  async trackSpamBlocked(userId: string, roomId: string, reason: string): Promise<void> {
    await this.trackEvent({
      event: 'spam_blocked',
      userId,
      roomId,
      properties: {
        reason,
      },
    });
  }

  async trackRoomJoined(userId: string, roomId: string): Promise<void> {
    await this.trackEvent({
      event: 'room_joined',
      userId,
      roomId,
    });
  }

  async trackRoomLeft(userId: string, roomId: string): Promise<void> {
    await this.trackEvent({
      event: 'room_left',
      userId,
      roomId,
    });
  }

  async trackUserTyping(userId: string, roomId: string, isTyping: boolean): Promise<void> {
    await this.trackEvent({
      event: 'user_typing',
      userId,
      roomId,
      properties: {
        isTyping,
      },
    });
  }

  // Aggregate analytics methods
  async getDailyMessageStats(roomId?: string): Promise<{
    date: string;
    messageCount: number;
    uniqueUsers: number;
    tracksShared: number;
  }[]> {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const messages = await this.prisma.message.findMany({
      where: {
        roomId,
        createdAt: {
          gte: sevenDaysAgo,
        },
        deletedAt: null,
      },
      select: {
        userId: true,
        createdAt: true,
        trackRef: true,
      },
    });

    const dailyStats = new Map();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMessages = messages.filter(m => 
        m.createdAt.toISOString().split('T')[0] === dateStr
      );

      dailyStats.set(dateStr, {
        date: dateStr,
        messageCount: dayMessages.length,
        uniqueUsers: new Set(dayMessages.map(m => m.userId)).size,
        tracksShared: dayMessages.filter(m => m.trackRef).length,
      });
    }

    return Array.from(dailyStats.values()).reverse();
  }
}