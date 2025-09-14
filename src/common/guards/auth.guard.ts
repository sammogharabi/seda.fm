import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../config/supabase.service';
import { UserService } from '../../modules/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip auth in development mode
    const skipAuth = this.configService.get<string>('DEV_SKIP_AUTH') === 'true';
    if (skipAuth) {
      const request = context.switchToHttp().getRequest();
      // Create a mock user for development
      request.user = {
        id: 'dev-user-123',
        email: 'dev@seda.fm',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    try {
      const supabaseUser = await this.supabaseService.verifyToken(token);
      
      if (!supabaseUser) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.userService.findOrCreateUser(
        supabaseUser.id,
        supabaseUser.email || '',
      );

      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}