import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from '../../config/prisma.module';
import { SupabaseModule } from '../../config/supabase.module';

@Module({
  imports: [PrismaModule, SupabaseModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class GatewayModule {}
