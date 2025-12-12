import { Module, Global } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';

@Global()
@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminJwtGuard],
  exports: [AdminAuthService, AdminJwtGuard],
})
export class AdminAuthModule {}
