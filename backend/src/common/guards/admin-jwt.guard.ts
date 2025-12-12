import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AdminAuthService, AdminJwtPayload } from '../../modules/admin-auth/admin-auth.service';

@Injectable()
export class AdminJwtGuard implements CanActivate {
  private readonly logger = new Logger(AdminJwtGuard.name);

  constructor(private adminAuthService: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const requestId = request.headers['x-request-id'] || 'unknown';
    const clientIp = request.ip || request.connection?.remoteAddress || 'unknown';

    if (!authHeader) {
      this.logger.warn(`Admin access attempt without auth header from ${clientIp} [${requestId}]`);
      throw new UnauthorizedException('Authorization header required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      this.logger.warn(`Admin access with invalid auth format from ${clientIp} [${requestId}]`);
      throw new UnauthorizedException('Invalid authorization format');
    }

    const token = authHeader.substring(7);

    try {
      const payload: AdminJwtPayload = await this.adminAuthService.verifyToken(token);
      request.adminUser = payload;
      this.logger.debug(`Admin access granted: ${payload.email} [${requestId}]`);
      return true;
    } catch (error) {
      this.logger.warn(`Admin token verification failed from ${clientIp} [${requestId}]: ${error.message}`);
      throw error;
    }
  }
}
