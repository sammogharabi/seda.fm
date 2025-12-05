import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SendGridService } from '../../config/sendgrid.service';
import { PrismaModule } from '../../config/prisma.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, PrismaModule, SupabaseModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, SendGridService],
  exports: [AuthService],
})
export class AuthModule {}
