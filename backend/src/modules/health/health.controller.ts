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

  @Get('debug-schema')
  async debugSchema() {
    try {
      const columns = await this.prisma.$queryRawUnsafe<
        { column_name: string; data_type: string }[]
      >(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public' ORDER BY column_name`,
      );
      return {
        status: 'ok',
        columns,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: 'error',
        error: message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
