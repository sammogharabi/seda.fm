import { Injectable, CanActivate, ExecutionContext, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { FEATURE_KEY, FeatureFlag } from '../decorators/feature.decorator';
import { IS_PUBLIC_KEY } from './auth.guard';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required features from decorator metadata
    const requiredFeatures = this.reflector.getAllAndOverride<FeatureFlag[]>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no feature requirements, allow access
    if (!requiredFeatures || requiredFeatures.length === 0) {
      return true;
    }

    // Check if all required features are enabled
    const allFeaturesEnabled = requiredFeatures.every((feature) => {
      const envKey = `FEATURE_${feature}`;
      const isEnabled = this.configService.get<string>(envKey) === 'true';

      if (!isEnabled) {
        console.log(`Feature ${feature} is disabled (${envKey}=${this.configService.get(envKey)})`);
      }

      return isEnabled;
    });

    // If any required feature is disabled, throw NotFoundException
    // (returning 404 instead of 403 to avoid revealing feature existence)
    if (!allFeaturesEnabled) {
      throw new NotFoundException('Resource not found');
    }

    return true;
  }
}
