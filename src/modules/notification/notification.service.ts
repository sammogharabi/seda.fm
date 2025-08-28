import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum NotificationType {
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_DENIED = 'verification_denied',
  VERIFICATION_EXPIRED = 'verification_expired',
}

@Injectable()
export class NotificationService {
  constructor(private configService: ConfigService) {}

  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>,
  ): Promise<void> {
    const environment = this.configService.get<string>('environment');
    
    console.log(`[${environment}] Notification sent:`, {
      userId,
      type,
      data,
      timestamp: new Date().toISOString(),
    });

    switch (type) {
      case NotificationType.VERIFICATION_APPROVED:
        await this.sendVerificationApproved(userId, data);
        break;
      case NotificationType.VERIFICATION_DENIED:
        await this.sendVerificationDenied(userId, data);
        break;
      case NotificationType.VERIFICATION_EXPIRED:
        await this.sendVerificationExpired(userId, data);
        break;
    }
  }

  private async sendVerificationApproved(userId: string, data: any) {
    console.log(`User ${userId} verification approved`);
  }

  private async sendVerificationDenied(userId: string, data: any) {
    console.log(`User ${userId} verification denied: ${data.reason}`);
  }

  private async sendVerificationExpired(userId: string, data: any) {
    console.log(`User ${userId} verification expired`);
  }
}