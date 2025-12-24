import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { StreamingProvider } from '@prisma/client';

interface TidalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  user?: {
    userId: number;
    email: string;
    countryCode: string;
    username: string;
  };
}

interface TidalUser {
  userId: number;
  email: string;
  countryCode: string;
  username: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

interface TidalTrack {
  id: number;
  title: string;
  duration: number; // seconds
  trackNumber: number;
  volumeNumber: number;
  isrc: string;
  explicit: boolean;
  audioQuality: string;
  artist: {
    id: number;
    name: string;
    picture?: string;
  };
  artists: Array<{
    id: number;
    name: string;
  }>;
  album: {
    id: number;
    title: string;
    cover: string;
  };
  url: string;
}

interface TidalSearchResponse {
  tracks: {
    items: TidalTrack[];
    totalNumberOfItems: number;
    limit: number;
    offset: number;
  };
}

@Injectable()
export class TidalService {
  private readonly logger = new Logger(TidalService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'r_usr',
    'w_usr',
    'w_sub',
  ];

  // Tidal API endpoints
  private readonly authBaseUrl = 'https://auth.tidal.com/v1/oauth2';
  private readonly apiBaseUrl = 'https://openapi.tidal.com/v2';

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.clientId = this.configService.get<string>('TIDAL_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('TIDAL_CLIENT_SECRET') || '';
    this.redirectUri =
      this.configService.get<string>('TIDAL_REDIRECT_URI') ||
      `${this.configService.get<string>('APP_URL')}/api/streaming/tidal/callback`;
  }

  /**
   * Check if Tidal is properly configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  /**
   * Generate the Tidal OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state,
    });

    return `${this.authBaseUrl}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TidalTokenResponse> {
    const response = await fetch(`${this.authBaseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to exchange code for token: ${error}`);
      throw new UnauthorizedException('Failed to authenticate with Tidal');
    }

    return response.json();
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<TidalTokenResponse> {
    const response = await fetch(`${this.authBaseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Failed to refresh token: ${error}`);
      throw new UnauthorizedException('Failed to refresh Tidal token');
    }

    return response.json();
  }

  /**
   * Get Tidal user profile
   */
  async getUserProfile(accessToken: string): Promise<TidalUser> {
    const response = await fetch(`${this.apiBaseUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.tidal.v1+json',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to get Tidal user profile');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Save or update streaming connection for a user
   */
  async saveConnection(
    userId: string,
    tokenData: TidalTokenResponse,
    profile: TidalUser,
  ) {
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    return this.prisma.streamingConnection.upsert({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.TIDAL,
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
        providerUserId: profile.userId.toString(),
        displayName: profile.username || `${profile.firstName} ${profile.lastName}`.trim(),
        profileImageUrl: profile.picture,
        country: profile.countryCode,
        scopes: tokenData.scope ? tokenData.scope.split(' ') : [],
        isActive: true,
        lastRefreshedAt: new Date(),
      },
      create: {
        userId,
        provider: StreamingProvider.TIDAL,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
        providerUserId: profile.userId.toString(),
        displayName: profile.username || `${profile.firstName} ${profile.lastName}`.trim(),
        profileImageUrl: profile.picture,
        country: profile.countryCode,
        scopes: tokenData.scope ? tokenData.scope.split(' ') : [],
        isActive: true,
        lastRefreshedAt: new Date(),
      },
    });
  }

  /**
   * Get a valid access token for a user, refreshing if necessary
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const connection = await this.prisma.streamingConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.TIDAL,
        },
      },
    });

    if (!connection || !connection.isActive) {
      throw new UnauthorizedException('Tidal not connected');
    }

    // Check if token is expired or will expire in the next 5 minutes
    const isExpired =
      connection.tokenExpiresAt &&
      connection.tokenExpiresAt < new Date(Date.now() + 5 * 60 * 1000);

    if (isExpired && connection.refreshToken) {
      try {
        const newTokens = await this.refreshAccessToken(connection.refreshToken);
        const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

        await this.prisma.streamingConnection.update({
          where: { id: connection.id },
          data: {
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || connection.refreshToken,
            tokenExpiresAt: expiresAt,
            lastRefreshedAt: new Date(),
          },
        });

        return newTokens.access_token;
      } catch (error) {
        this.logger.error(`Failed to refresh token for user ${userId}:`, error);
        await this.prisma.streamingConnection.update({
          where: { id: connection.id },
          data: { isActive: false },
        });
        throw new UnauthorizedException('Tidal connection expired, please reconnect');
      }
    }

    // Update last used
    await this.prisma.streamingConnection.update({
      where: { id: connection.id },
      data: { lastUsedAt: new Date() },
    });

    return connection.accessToken;
  }

  /**
   * Search for tracks on Tidal
   */
  async searchTracks(
    userId: string,
    query: string,
    limit = 20,
    offset = 0,
  ): Promise<{ tracks: TidalTrack[]; total: number }> {
    const accessToken = await this.getValidAccessToken(userId);

    const params = new URLSearchParams({
      query,
      limit: Math.min(limit, 50).toString(),
      offset: offset.toString(),
      countryCode: 'US', // Default to US, could get from user profile
    });

    const response = await fetch(
      `${this.apiBaseUrl}/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.tidal.v1+json',
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Tidal search failed: ${error}`);
      throw new Error('Failed to search Tidal');
    }

    const data: TidalSearchResponse = await response.json();

    return {
      tracks: data.tracks?.items || [],
      total: data.tracks?.totalNumberOfItems || 0,
    };
  }

  /**
   * Get track by Tidal ID
   */
  async getTrack(userId: string, trackId: string): Promise<TidalTrack> {
    const accessToken = await this.getValidAccessToken(userId);

    const response = await fetch(
      `${this.apiBaseUrl}/tracks/${trackId}?countryCode=US`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.tidal.v1+json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get track from Tidal');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get album artwork URL
   */
  getArtworkUrl(coverId: string, size = 640): string {
    // Tidal stores cover IDs like "abc123" which need to be formatted
    const formattedId = coverId.replace(/-/g, '/');
    return `https://resources.tidal.com/images/${formattedId}/${size}x${size}.jpg`;
  }

  /**
   * Get user's connection status
   */
  async getConnectionStatus(userId: string) {
    const connection = await this.prisma.streamingConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.TIDAL,
        },
      },
      select: {
        isActive: true,
        displayName: true,
        profileImageUrl: true,
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
      profileImageUrl: connection.profileImageUrl,
      country: connection.country,
      lastUsedAt: connection.lastUsedAt,
      connectedAt: connection.createdAt,
    };
  }

  /**
   * Disconnect Tidal
   */
  async disconnect(userId: string) {
    await this.prisma.streamingConnection.delete({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.TIDAL,
        },
      },
    });

    return { success: true };
  }
}
