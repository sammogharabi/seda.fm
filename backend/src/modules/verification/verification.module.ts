import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { CrawlerModule } from '../crawler/crawler.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [CrawlerModule, UserModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
