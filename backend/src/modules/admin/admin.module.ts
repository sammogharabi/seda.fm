import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { VerificationModule } from '../verification/verification.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [VerificationModule, UserModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
