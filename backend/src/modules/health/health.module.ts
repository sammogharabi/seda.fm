import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

@Module({
  imports: [AdminAuthModule],
  controllers: [HealthController],
})
export class HealthModule {}
