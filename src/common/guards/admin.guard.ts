import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const adminApiKey = request.headers['x-admin-key'];

    if (!adminApiKey) {
      throw new UnauthorizedException('Admin API key required');
    }

    const expectedKey = this.configService.get<string>('security.adminApiKey');
    
    if (adminApiKey !== expectedKey) {
      throw new ForbiddenException('Invalid admin API key');
    }

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