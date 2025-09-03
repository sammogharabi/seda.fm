import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    let db = 'unknown';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch {
      db = 'error';
    }

    return {
      status: 'ok',
      service: 'seda-auth-service',
      db,
      timestamp: new Date().toISOString(),
    };
  }
}
