import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './config/prisma.module';
import { SupabaseModule } from './config/supabase.module';
import { VerificationModule } from './modules/verification/verification.module';
import { AdminModule } from './modules/admin/admin.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { configuration } from './config/configuration';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    SupabaseModule,
    UserModule,
    VerificationModule,
    CrawlerModule,
    AdminModule,
    ChatModule,
    ProfilesModule, // #COMPLETION_DRIVE: Feature flag FEATURE_PROFILES should gate this
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
