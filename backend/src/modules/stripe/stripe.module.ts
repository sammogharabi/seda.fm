import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaModule } from '../../config/prisma.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule, MarketplaceModule, UserModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
