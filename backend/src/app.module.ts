import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './config/prisma.module';
import { SupabaseModule } from './config/supabase.module';
import { VerificationModule } from './modules/verification/verification.module';
import { AdminModule } from './modules/admin/admin.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
// import { ChatModule } from './modules/chat/chat.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { FeedModule } from './modules/feed/feed.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ProgressionModule } from './modules/progression/progression.module';
import { SearchModule } from './modules/search/search.module';
import { DiscoverModule } from './modules/discover/discover.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { PayPalModule } from './modules/paypal/paypal.module';
import { configuration } from './config/configuration';
import { HealthModule } from './modules/health/health.module';
import { GatewayModule } from './modules/gateway/gateway.module';
import { DirectMessagesModule } from './modules/direct-messages/direct-messages.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 60,
      },
    ]),
    PrismaModule,
    SupabaseModule,
    UserModule,
    AuthModule,
    VerificationModule,
    CrawlerModule,
    AdminModule,
    // ChatModule,
    ProfilesModule,
    PlaylistsModule,
    FeedModule,
    SessionsModule,
    ProgressionModule,
    SearchModule,
    DiscoverModule,
    RoomsModule,
    MarketplaceModule,
    AnalyticsModule,
    StripeModule,
    PayPalModule,
    HealthModule,
    GatewayModule,
    DirectMessagesModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
