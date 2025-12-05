import { Module } from '@nestjs/common';
import { DirectMessagesController } from './direct-messages.controller';
import { DirectMessagesService } from './direct-messages.service';
import { PrismaModule } from '../../config/prisma.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [DirectMessagesController],
  providers: [DirectMessagesService],
  exports: [DirectMessagesService],
})
export class DirectMessagesModule {}
