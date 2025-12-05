import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { QueueService } from './queue.service';
import { VotesService } from './votes.service';
import { PrismaModule } from '../../config/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [SessionsController],
  providers: [SessionsService, QueueService, VotesService],
  exports: [SessionsService, QueueService, VotesService],
})
export class SessionsModule {}
