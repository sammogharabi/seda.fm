import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../config/supabase.service';
import { UserService } from '../../modules/user/user.service';

/**
 * Optional Auth Guard - populates req.user if authenticated, but allows unauthenticated access.
 * Use this for endpoints that have different behavior for logged-in vs anonymous users.
 */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // No auth header - allow access but no user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authHeader.substring(7);

    try {
      const supabaseUser = await this.supabaseService.verifyToken(token);

      if (supabaseUser) {
        const user = await this.userService.findOrCreateUser(
          supabaseUser.id,
          supabaseUser.email || '',
        );
        request.user = user;
      } else {
        request.user = null;
      }
    } catch (error) {
      // Token validation failed - allow access but no user
      request.user = null;
    }

    return true;
  }
}
