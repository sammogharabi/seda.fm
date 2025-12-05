import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PayPalService } from './paypal.service';
import { PayPalController } from './paypal.controller';
import { PrismaModule } from '../../config/prisma.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule, MarketplaceModule, UserModule],
  controllers: [PayPalController],
  providers: [PayPalService],
  exports: [PayPalService],
})
export class PayPalModule {}
