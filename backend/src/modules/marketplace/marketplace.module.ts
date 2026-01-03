import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { ShopifyController } from './shopify.controller';
import { ShopifyService } from './shopify.service';
import { DropsController } from './drops.controller';
import { DropsService } from './drops.service';
import { NativeProvider } from './providers/native.provider';
import { ShopifyProvider } from './providers/shopify.provider';
import { PrismaModule } from '../../config/prisma.module';
import { SendGridService } from '../../config/sendgrid.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ConfigModule, PrismaModule, UserModule],
  controllers: [MarketplaceController, ShopifyController, DropsController],
  providers: [
    MarketplaceService,
    SendGridService,
    // Multi-provider support
    NativeProvider,
    ShopifyProvider,
    ShopifyService,
    // Drops
    DropsService,
  ],
  exports: [MarketplaceService, NativeProvider, ShopifyProvider, DropsService],
})
export class MarketplaceModule {}
