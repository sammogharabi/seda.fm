import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { StreamingProvider } from '@prisma/client';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyUserProfile {
  id: string;
  email: string;
  display_name: string;
  images: { url: string }[];
  country: string;
  product: string; // 'premium', 'free', etc.
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  uri: string;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes = [
    'user-read-email',
    'user-read-private',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-library-read',
    'playlist-read-private',
    'playlist-read-collaborative',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET') || '';
    this.redirectUri = this.configService.get<string>('SPOTIFY_REDIRECT_URI') ||
      `${this.configService.get<string>('APP_URL')}/api/streaming/spotify/callback`;
  }

  /**
   * Generate the Spotify OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state,
      show_dialog: 'true',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
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
      throw new UnauthorizedException('Failed to authenticate with Spotify');
    }

    return response.json();
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<SpotifyTokenResponse> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
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
      throw new UnauthorizedException('Failed to refresh Spotify token');
    }

    return response.json();
  }

  /**
   * Get Spotify user profile
   */
  async getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to get Spotify user profile');
    }

    return response.json();
  }

  /**
   * Save or update streaming connection for a user
   */
  async saveConnection(
    userId: string,
    tokenData: SpotifyTokenResponse,
    profile: SpotifyUserProfile,
  ) {
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    return this.prisma.streamingConnection.upsert({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.SPOTIFY,
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
        providerUserId: profile.id,
        providerEmail: profile.email,
        displayName: profile.display_name,
        profileImageUrl: profile.images?.[0]?.url,
        country: profile.country,
        productType: profile.product,
        scopes: tokenData.scope.split(' '),
        isActive: true,
        lastRefreshedAt: new Date(),
      },
      create: {
        userId,
        provider: StreamingProvider.SPOTIFY,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
        providerUserId: profile.id,
        providerEmail: profile.email,
        displayName: profile.display_name,
        profileImageUrl: profile.images?.[0]?.url,
        country: profile.country,
        productType: profile.product,
        scopes: tokenData.scope.split(' '),
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
          provider: StreamingProvider.SPOTIFY,
        },
      },
    });

    if (!connection || !connection.isActive) {
      throw new UnauthorizedException('Spotify not connected');
    }

    // Check if token is expired or will expire in the next 5 minutes
    const isExpired = connection.tokenExpiresAt &&
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
        // Mark connection as inactive
        await this.prisma.streamingConnection.update({
          where: { id: connection.id },
          data: { isActive: false },
        });
        throw new UnauthorizedException('Spotify connection expired, please reconnect');
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
   * Search for tracks on Spotify
   */
  async searchTracks(
    userId: string,
    query: string,
    limit = 20,
    offset = 0,
  ): Promise<{ tracks: SpotifyTrack[]; total: number }> {
    const accessToken = await this.getValidAccessToken(userId);

    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(
      `https://api.spotify.com/v1/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Spotify search failed: ${error}`);
      throw new Error('Failed to search Spotify');
    }

    const data: SpotifySearchResponse = await response.json();
    return {
      tracks: data.tracks.items,
      total: data.tracks.total,
    };
  }

  /**
   * Get track by Spotify ID
   */
  async getTrack(userId: string, trackId: string): Promise<SpotifyTrack> {
    const accessToken = await this.getValidAccessToken(userId);

    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to get track from Spotify');
    }

    return response.json();
  }

  /**
   * Get user's connection status
   */
  async getConnectionStatus(userId: string) {
    const connection = await this.prisma.streamingConnection.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.SPOTIFY,
        },
      },
      select: {
        isActive: true,
        displayName: true,
        profileImageUrl: true,
        productType: true,
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
      isPremium: connection.productType === 'premium',
      country: connection.country,
      lastUsedAt: connection.lastUsedAt,
      connectedAt: connection.createdAt,
    };
  }

  /**
   * Disconnect Spotify
   */
  async disconnect(userId: string) {
    await this.prisma.streamingConnection.delete({
      where: {
        userId_provider: {
          userId,
          provider: StreamingProvider.SPOTIFY,
        },
      },
    });

    return { success: true };
  }

  /**
   * Check if Spotify is configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}
