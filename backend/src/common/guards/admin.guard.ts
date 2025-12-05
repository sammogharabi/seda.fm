import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { UserRole } from '@prisma/client';
import { createHash, timingSafeEqual } from 'crypto';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const adminApiKey = request.headers['x-admin-key'];
    const requestId = request.headers['x-request-id'] || 'unknown';
    const clientIp = request.ip || request.connection.remoteAddress || 'unknown';

    if (!adminApiKey) {
      this.logger.warn(`Admin access attempt without API key from ${clientIp} [${requestId}]`);
      throw new UnauthorizedException('Admin API key required');
    }

    const expectedKey = this.configService.get<string>('ADMIN_API_KEY');

    if (!expectedKey) {
      this.logger.error('ADMIN_API_KEY not configured');
      throw new ForbiddenException('Admin access not configured');
    }

    // Use timing-safe comparison to prevent timing attacks
    const providedKeyHash = createHash('sha256').update(adminApiKey).digest();
    const expectedKeyHash = createHash('sha256').update(expectedKey).digest();

    if (!timingSafeEqual(providedKeyHash, expectedKeyHash)) {
      this.logger.warn(`Invalid admin API key attempt from ${clientIp} [${requestId}]`);
      throw new ForbiddenException('Invalid admin API key');
    }

    this.logger.log(`Valid admin access from ${clientIp} [${requestId}]`);

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      const user = await this.prisma.user.findFirst({
        where: {
          role: {
            in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
          },
        },
      });

      if (user) {
        request.admin = user;
      }
    }

    return true;
  }
}
