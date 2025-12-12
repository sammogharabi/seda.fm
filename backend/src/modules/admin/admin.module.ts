import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ContentModerationController } from './content-moderation.controller';
import { ContentModerationService } from './content-moderation.service';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AdminAnalyticsService } from './admin-analytics.service';
import { VerificationModule } from '../verification/verification.module';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../../config/prisma.module';

@Module({
  imports: [VerificationModule, UserModule, PrismaModule],
  controllers: [AdminController, ContentModerationController, AdminAnalyticsController],
  providers: [AdminService, ContentModerationService, AdminAnalyticsService],
})
export class AdminModule {}
