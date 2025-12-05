import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    const environment = configService.get<string>('environment');
    const logLevel = environment === 'production' ? ['error'] : ['query', 'info', 'warn', 'error'];

    super({
      log: logLevel as any,
      errorFormat: environment === 'production' ? 'minimal' : 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
