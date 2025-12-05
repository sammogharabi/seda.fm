import { SetMetadata } from '@nestjs/common';

export type FeatureFlag =
  | 'PROFILES'
  | 'PLAYLISTS'
  | 'SOCIAL'
  | 'LEADERBOARDS'
  | 'TROPHY_CASE'
  | 'DJ_POINTS'
  | 'FEED'
  | 'DISCOVER'
  | 'PROGRESSION'
  | 'SEARCH'
  | 'SESSIONS';

export const FEATURE_KEY = 'feature';

/**
 * Decorator to mark a controller or handler with required feature flag(s)
 * @param features - One or more feature flags that must be enabled
 * @example
 * @Feature('PROFILES')
 * @Controller('profiles')
 * export class ProfilesController { ... }
 */
export const Feature = (...features: FeatureFlag[]) => SetMetadata(FEATURE_KEY, features);
