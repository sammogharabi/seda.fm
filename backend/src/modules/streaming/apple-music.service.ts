import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { StreamingProvider } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

interface AppleMusicTrack {
  id: string;
  type: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
    previews?: Array<{
      url: string;
    }>;
    url: string;
  };
}

interface AppleMusicSearchResponse {
  results: {
    songs?: {
      data: AppleMusicTrack[];
      next?: string;
    };
  };
}

@Injectable()
export class AppleMusicService {
  private readonly logger = new Logger(AppleMusicService.name);
  private readonly teamId: string;
  private readonly keyId: string;
  private readonly privateKey: string;
  private developerToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.teamId = this.configService.get<string>('APPLE_MUSIC_TEAM_ID') || '';
    this.keyId = this.configService.get<string>('APPLE_MUSIC_KEY_ID') || '';
    // Handle newlines in private key (stored as \n in env)
    const rawKey = this.configService.get<string>('APPLE_MUSIC_PRIVATE_KEY') || '';
    this.privateKey = rawKey.replace(/\\n/g, '\n');
  }

  /**
   * Check if Apple Music is properly configured
   */
  isConfigured(): boolean {
    return !!(this.teamId && this.keyId && this.privateKey);
  }

  /**
   * Generate a developer token for Apple Music API
   * Token is valid for up to 6 months, we'll use 180 days
   */
  private generateDeveloperToken(): string {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 180 * 24 * 60 * 60; // 180 days in seconds

    const token = jwt.sign(
      {
        iss: this.teamId,
        iat: now,
        exp: now + expiresIn,
      },
      this.privateKey,
      {
        algorithm: 'ES256',
        header: {
          alg: 'ES256',
          kid: this.keyId,
        },
      },
    );

    this.developerToken = token;
    this.tokenExpiresAt = (now + expiresIn) * 1000; // Convert to milliseconds

    return token;
  }

  /**
   * Get a valid developer token, generating a new one if needed
   */
  getDeveloperToken(): string {
    if (!this.isConfigured()) {
      throw new Error('Apple Music is not configured');
    }

    // Regenerate if token is expired or will expire in the next hour
    if (!this.developerToken || Date.now() > this.tokenExpiresAt - 60 * 60 * 1000) {
      return this.generateDeveloperToken();
    }

    return this.developerToken;
  }

  /**
   * Get developer token for client-side MusicKit JS initialization
   */
  getDeveloperTokenForClient(): string {
    return this.getDeveloperToken();
  }

  /**
   * Save Apple Music connection for a user
   * Called after user authorizes via MusicKit JS on the frontend
   */
  async saveConnection(
    userId: string,
    musicUserToken: string,
    profile?: { displayName?: string; country?: string },
  ) {
    return this.prisma.streamingConnection.upsert({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.APPLE_MUSIC,
        },
      },
      update: {
        accessToken: musicUserToken,
        displayName: profile?.displayName || 'Apple Music User',
        country: profile?.country,
        isActive: true,
        lastRefreshedAt: new Date(),
      },
      create: {
        userId,
        provider: StreamingProvider.APPLE_MUSIC,
        accessToken: musicUserToken,
        displayName: profile?.displayName || 'Apple Music User',
        country: profile?.country,
        isActive: true,
        lastRefreshedAt: new Date(),
      },
    });
  }

  /**
   * Get user's music user token
   */
  async getMusicUserToken(userId: string): Promise<string | null> {
    const connection = await this.prisma.streamingConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.APPLE_MUSIC,
        },
      },
    });

    if (!connection || !connection.isActive) {
      return null;
    }

    return connection.accessToken;
  }

  /**
   * Search for tracks in Apple Music catalog
   * This uses the developer token (no user auth needed for catalog search)
   */
  async searchTracks(
    query: string,
    limit = 20,
    offset = 0,
  ): Promise<{ tracks: AppleMusicTrack[]; total: number }> {
    if (!this.isConfigured()) {
      throw new Error('Apple Music is not configured');
    }

    const developerToken = this.getDeveloperToken();

    const params = new URLSearchParams({
      term: query,
      types: 'songs',
      limit: Math.min(limit, 25).toString(),
      offset: offset.toString(),
    });

    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/us/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${developerToken}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Apple Music search failed: ${error}`);
      throw new Error('Failed to search Apple Music');
    }

    const data: AppleMusicSearchResponse = await response.json();

    return {
      tracks: data.results.songs?.data || [],
      total: data.results.songs?.data.length || 0,
    };
  }

  /**
   * Get track by Apple Music ID
   */
  async getTrack(trackId: string): Promise<AppleMusicTrack> {
    if (!this.isConfigured()) {
      throw new Error('Apple Music is not configured');
    }

    const developerToken = this.getDeveloperToken();

    const response = await fetch(
      `https://api.music.apple.com/v1/catalog/us/songs/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${developerToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get track from Apple Music');
    }

    const data = await response.json();
    return data.data[0];
  }

  /**
   * Get user's connection status
   */
  async getConnectionStatus(userId: string) {
    const connection = await this.prisma.streamingConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.APPLE_MUSIC,
        },
      },
      select: {
        isActive: true,
        displayName: true,
        country: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    if (!connection) {
      return { connected: false };
    }

    return {
      connected: connection.isActive,
      displayName: connection.displayName,
      country: connection.country,
      lastUsedAt: connection.lastUsedAt,
      connectedAt: connection.createdAt,
    };
  }

  /**
   * Disconnect Apple Music
   */
  async disconnect(userId: string) {
    await this.prisma.streamingConnection.delete({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.APPLE_MUSIC,
        },
      },
    });

    return { success: true };
  }
}
