import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { EmailService } from './email.service';
import { emailTemplates } from './email-templates';

export enum NotificationType {
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_DENIED = 'verification_denied',
  VERIFICATION_EXPIRED = 'verification_expired',
  WELCOME = 'welcome',
  NEW_FOLLOWER = 'new_follower',
  NEW_MESSAGE = 'new_message',
  PURCHASE_CONFIRMATION = 'purchase_confirmation',
  NEW_SALE = 'new_sale',
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly frontendUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    this.frontendUrl = this.configService.get<string>('app.frontendUrl') || 'https://seda.fm';
  }

  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>,
  ): Promise<void> {
    const environment = this.configService.get<string>('environment');

    this.logger.log(`[${environment}] Sending notification:`, {
      userId,
      type,
      timestamp: new Date().toISOString(),
    });

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          select: { displayName: true, username: true },
        },
      },
    });

    if (!user) {
      this.logger.warn(`User ${userId} not found, skipping notification`);
      return;
    }

    const displayName = user.profile?.displayName || user.profile?.username || 'there';

    switch (type) {
      case NotificationType.VERIFICATION_APPROVED:
        await this.sendVerificationApproved(user.email, displayName);
        break;
      case NotificationType.VERIFICATION_DENIED:
        await this.sendVerificationDenied(user.email, displayName, data.reason);
        break;
      case NotificationType.VERIFICATION_EXPIRED:
        await this.sendVerificationExpired(user.email, displayName);
        break;
      case NotificationType.WELCOME:
        await this.sendWelcome(user.email, displayName);
        break;
      case NotificationType.NEW_FOLLOWER:
        await this.sendNewFollower(user.email, displayName, data.followerName, data.followerUrl);
        break;
      case NotificationType.NEW_MESSAGE:
        await this.sendNewMessage(user.email, displayName, data.senderName, data.messagePreview);
        break;
      case NotificationType.PURCHASE_CONFIRMATION:
        await this.sendPurchaseConfirmation(
          user.email,
          displayName,
          data.itemName,
          data.itemType,
          data.price,
          data.downloadUrl,
        );
        break;
      case NotificationType.NEW_SALE:
        await this.sendNewSale(
          user.email,
          displayName,
          data.itemName,
          data.buyerName,
          data.amount,
        );
        break;
    }
  }

  private async sendVerificationApproved(email: string, displayName: string) {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Your Artist Verification is Approved! 🎉',
      html: emailTemplates.verificationApproved(displayName, this.frontendUrl),
    });
  }

  private async sendVerificationDenied(email: string, displayName: string, reason: string) {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Update on Your Artist Verification Request',
      html: emailTemplates.verificationDenied(displayName, reason, this.frontendUrl),
    });
  }

  private async sendVerificationExpired(email: string, displayName: string) {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Your Verification Request Has Expired',
      html: emailTemplates.verificationExpired(displayName, this.frontendUrl),
    });
  }

  private async sendWelcome(email: string, displayName: string) {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Welcome to sedā! 🎵',
      html: emailTemplates.welcome(displayName, this.frontendUrl),
    });
  }

  private async sendNewFollower(
    email: string,
    displayName: string,
    followerName: string,
    followerUrl: string,
  ) {
    await this.emailService.sendEmail({
      to: email,
      subject: `${followerName} is now following you on sedā`,
      html: emailTemplates.newFollower(displayName, followerName, followerUrl),
    });
  }

  private async sendNewMessage(
    email: string,
    displayName: string,
    senderName: string,
    messagePreview: string,
  ) {
    await this.emailService.sendEmail({
      to: email,
      subject: `New message from ${senderName}`,
      html: emailTemplates.newMessage(
        displayName,
        senderName,
        messagePreview,
        `${this.frontendUrl}/messages`,
      ),
    });
  }

  private async sendPurchaseConfirmation(
    email: string,
    displayName: string,
    itemName: string,
    itemType: string,
    price: string,
    downloadUrl: string,
  ) {
    await this.emailService.sendEmail({
      to: email,
      subject: `Your purchase of "${itemName}" is confirmed!`,
      html: emailTemplates.purchaseConfirmation(
        displayName,
        itemName,
        itemType,
        price,
        downloadUrl,
      ),
    });
  }

  private async sendNewSale(
    email: string,
    artistName: string,
    itemName: string,
    buyerName: string,
    amount: string,
  ) {
    await this.emailService.sendEmail({
      to: email,
      subject: `You made a sale! 💰`,
      html: emailTemplates.newSale(
        artistName,
        itemName,
        buyerName,
        amount,
        `${this.frontendUrl}/dashboard/revenue`,
      ),
    });
  }
}
