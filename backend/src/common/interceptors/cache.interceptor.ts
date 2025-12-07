import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

// Cache key metadata
export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

// Decorator to set cache key
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);

// Decorator to set cache TTL in seconds
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

/**
 * Simple in-memory cache interceptor for frequently accessed endpoints.
 * Use @CacheKey('my-key') and @CacheTTL(60) decorators on controller methods.
 *
 * Note: For production with multiple instances, consider using Redis.
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 60; // 60 seconds default
  private readonly maxCacheSize = 1000; // Prevent memory bloat

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Get cache key from metadata or generate from URL
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    // Skip if no cache key is set
    if (!cacheKey) {
      return next.handle();
    }

    // Create a unique key including query params
    const fullCacheKey = `${cacheKey}:${request.url}`;

    // Check cache
    const cached = this.cache.get(fullCacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return of(cached.data);
    }

    // Get TTL from metadata or use default
    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    ) || this.defaultTTL;

    return next.handle().pipe(
      tap((data) => {
        // Ensure cache doesn't grow indefinitely
        if (this.cache.size >= this.maxCacheSize) {
          this.evictOldEntries();
        }

        this.cache.set(fullCacheKey, {
          data,
          expiresAt: Date.now() + ttl * 1000,
        });
      }),
    );
  }

  private evictOldEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    // First, remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key));

    // If still too large, remove oldest entries
    if (this.cache.size >= this.maxCacheSize) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].expiresAt - b[1].expiresAt);

      // Remove 20% of oldest entries
      const toRemove = Math.floor(entries.length * 0.2);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  // Method to manually invalidate cache
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
