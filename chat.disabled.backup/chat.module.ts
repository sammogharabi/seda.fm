import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './services/chat.service';
import { MusicUnfurlingService } from './services/music-unfurling.service';
import { MentionsService } from './services/mentions.service';
import { SafetyService } from './services/safety.service';
import { AnalyticsService } from './services/analytics.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../../config/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [ChatController],
  providers: [ChatService, MusicUnfurlingService, MentionsService, SafetyService, AnalyticsService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}