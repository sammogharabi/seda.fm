import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Res,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SpotifyService } from './spotify.service';
import { AppleMusicService } from './apple-music.service';
import { TidalService } from './tidal.service';
import { randomBytes } from 'crypto';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('streaming')
export class StreamingController {
  // Store OAuth states temporarily (in production, use Redis)
  private oauthStates: Map<string, { userId: string; expiresAt: number }> = new Map();

  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly appleMusicService: AppleMusicService,
    private readonly tidalService: TidalService,
  ) {
    // Clean up expired states periodically
    setInterval(() => {
      const now = Date.now();
      for (const [state, data] of this.oauthStates) {
        if (data.expiresAt < now) {
          this.oauthStates.delete(state);
        }
      }
    }, 60000);
  }

  // ==================== Debug ====================

  /**
   * Debug endpoint to check streaming service configuration (no auth required)
   */
  @Get('debug/config')
  async getDebugConfig() {
    return {
      spotify: {
        configured: this.spotifyService.isConfigured(),
      },
      appleMusic: {
        configured: this.appleMusicService.isConfigured(),
        ...this.appleMusicService.getConfigDebug(),
      },
      tidal: {
        configured: this.tidalService.isConfigured(),
      },
    };
  }

  /**
   * Debug endpoint to check database table status (no auth required)
   */
  @Get('debug/db')
  async getDebugDb() {
    try {
      const count = await this.appleMusicService.debugCheckTable();
      return {
        tableExists: true,
        connectionCount: count,
        error: null,
      };
    } catch (error: any) {
      return {
        tableExists: false,
        connectionCount: null,
        error: error.message,
        code: error.code,
      };
    }
  }

  // ==================== Connection Status ====================

  /**
   * Get all streaming connection statuses for the current user
   */
  @Get('connections')
  @UseGuards(AuthGuard)
  async getConnections(@Req() req: AuthenticatedRequest) {
    let spotify = { connected: false };
    let appleMusic = { connected: false };
    let tidal = { connected: false };

    try {
      spotify = await this.spotifyService.getConnectionStatus(req.user.id);
    } catch (e) {
      console.error('Spotify connection status error:', e);
    }

    try {
      appleMusic = await this.appleMusicService.getConnectionStatus(req.user.id);
    } catch (e) {
      console.error('Apple Music connection status error:', e);
    }

    try {
      tidal = await this.tidalService.getConnectionStatus(req.user.id);
    } catch (e) {
      console.error('Tidal connection status error:', e);
    }

    return {
      spotify,
      appleMusic,
      tidal,
      configured: {
        spotify: this.spotifyService.isConfigured(),
        appleMusic: this.appleMusicService.isConfigured(),
        tidal: this.tidalService.isConfigured(),
      },
    };
  }

  // ==================== Spotify OAuth ====================

  /**
   * Start Spotify OAuth flow
   */
  @Get('spotify/connect')
  @UseGuards(AuthGuard)
  async connectSpotify(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    if (!this.spotifyService.isConfigured()) {
      throw new BadRequestException('Spotify integration not configured');
    }

    // Generate state for CSRF protection
    const state = randomBytes(16).toString('hex');
    this.oauthStates.set(state, {
      userId: req.user.id,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const authUrl = this.spotifyService.getAuthorizationUrl(state);
    res.redirect(authUrl);
  }

  /**
   * Spotify OAuth callback
   */
  @Get('spotify/callback')
  async spotifyCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://seda.fm' : 'http://localhost:3000');

    if (error) {
      return res.redirect(`${frontendUrl}/?view=settings&spotify_error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/?view=settings&spotify_error=missing_params`);
    }

    // Verify state
    const stateData = this.oauthStates.get(state);
    if (!stateData || stateData.expiresAt < Date.now()) {
      this.oauthStates.delete(state);
      return res.redirect(`${frontendUrl}/?view=settings&spotify_error=invalid_state`);
    }

    const userId = stateData.userId;
    this.oauthStates.delete(state);

    try {
      // Exchange code for tokens
      const tokenData = await this.spotifyService.exchangeCodeForToken(code);

      // Get user profile
      const profile = await this.spotifyService.getUserProfile(tokenData.access_token);

      // Save connection
      await this.spotifyService.saveConnection(userId, tokenData, profile);

      return res.redirect(`${frontendUrl}/?view=settings&spotify_connected=true`);
    } catch (err) {
      console.error('Spotify callback error:', err);
      return res.redirect(`${frontendUrl}/?view=settings&spotify_error=auth_failed`);
    }
  }

  /**
   * Disconnect Spotify
   */
  @Delete('spotify/disconnect')
  @UseGuards(AuthGuard)
  async disconnectSpotify(@Req() req: AuthenticatedRequest) {
    return this.spotifyService.disconnect(req.user.id);
  }

  /**
   * Get Spotify connection status
   */
  @Get('spotify/status')
  @UseGuards(AuthGuard)
  async getSpotifyStatus(@Req() req: AuthenticatedRequest) {
    return this.spotifyService.getConnectionStatus(req.user.id);
  }

  // ==================== Apple Music ====================

  /**
   * Get Apple Music developer token for MusicKit JS initialization
   */
  @Get('apple-music/developer-token')
  async getAppleMusicDeveloperToken() {
    if (!this.appleMusicService.isConfigured()) {
      throw new BadRequestException('Apple Music integration not configured');
    }

    return {
      developerToken: this.appleMusicService.getDeveloperTokenForClient(),
    };
  }

  /**
   * Save Apple Music connection (called after MusicKit JS authorization)
   */
  @Post('apple-music/connect')
  @UseGuards(AuthGuard)
  async connectAppleMusic(
    @Req() req: AuthenticatedRequest,
    @Body() body: { musicUserToken: string; displayName?: string; country?: string },
  ) {
    if (!body.musicUserToken) {
      throw new BadRequestException('Music user token is required');
    }

    try {
      await this.appleMusicService.saveConnection(req.user.id, body.musicUserToken, {
        displayName: body.displayName,
        country: body.country,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Apple Music connect error:', error);
      // Return detailed error for debugging (remove in production)
      throw new BadRequestException({
        message: 'Failed to save Apple Music connection',
        error: error.message,
        code: error.code,
        meta: error.meta,
      });
    }
  }

  /**
   * Disconnect Apple Music
   */
  @Delete('apple-music/disconnect')
  @UseGuards(AuthGuard)
  async disconnectAppleMusic(@Req() req: AuthenticatedRequest) {
    return this.appleMusicService.disconnect(req.user.id);
  }

  /**
   * Get Apple Music connection status
   */
  @Get('apple-music/status')
  @UseGuards(AuthGuard)
  async getAppleMusicStatus(@Req() req: AuthenticatedRequest) {
    return this.appleMusicService.getConnectionStatus(req.user.id);
  }

  // ==================== Tidal OAuth ====================

  /**
   * Start Tidal OAuth flow
   */
  @Get('tidal/connect')
  @UseGuards(AuthGuard)
  async connectTidal(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    if (!this.tidalService.isConfigured()) {
      throw new BadRequestException('Tidal integration not configured');
    }

    // Generate state for CSRF protection
    const state = randomBytes(16).toString('hex');
    this.oauthStates.set(state, {
      userId: req.user.id,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const authUrl = this.tidalService.getAuthorizationUrl(state);
    res.redirect(authUrl);
  }

  /**
   * Tidal OAuth callback
   */
  @Get('tidal/callback')
  async tidalCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://seda.fm' : 'http://localhost:3000');

    if (error) {
      return res.redirect(`${frontendUrl}/settings?tidal_error=${error}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendUrl}/settings?tidal_error=missing_params`);
    }

    // Verify state
    const stateData = this.oauthStates.get(state);
    if (!stateData || stateData.expiresAt < Date.now()) {
      this.oauthStates.delete(state);
      return res.redirect(`${frontendUrl}/settings?tidal_error=invalid_state`);
    }

    const userId = stateData.userId;
    this.oauthStates.delete(state);

    try {
      // Exchange code for tokens
      const tokenData = await this.tidalService.exchangeCodeForToken(code);

      // Get user profile
      const profile = await this.tidalService.getUserProfile(tokenData.access_token);

      // Save connection
      await this.tidalService.saveConnection(userId, tokenData, profile);

      return res.redirect(`${frontendUrl}/settings?tidal_connected=true`);
    } catch (err) {
      console.error('Tidal callback error:', err);
      return res.redirect(`${frontendUrl}/settings?tidal_error=auth_failed`);
    }
  }

  /**
   * Disconnect Tidal
   */
  @Delete('tidal/disconnect')
  @UseGuards(AuthGuard)
  async disconnectTidal(@Req() req: AuthenticatedRequest) {
    return this.tidalService.disconnect(req.user.id);
  }

  /**
   * Get Tidal connection status
   */
  @Get('tidal/status')
  @UseGuards(AuthGuard)
  async getTidalStatus(@Req() req: AuthenticatedRequest) {
    return this.tidalService.getConnectionStatus(req.user.id);
  }

  // ==================== Search ====================

  /**
   * Search for tracks across connected streaming services
   */
  @Get('search')
  @UseGuards(AuthGuard)
  async searchTracks(
    @Req() req: AuthenticatedRequest,
    @Query('q') query: string,
    @Query('provider') provider?: 'spotify' | 'apple-music' | 'tidal' | 'all',
    @Query('limit') limit = '20',
    @Query('offset') offset = '0',
  ) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Query must be at least 2 characters');
    }

    const limitNum = Math.min(parseInt(limit, 10) || 20, 50);
    const offsetNum = parseInt(offset, 10) || 0;
    const results: any = { spotify: null, appleMusic: null, tidal: null };

    // Search Spotify
    if (provider === 'spotify' || provider === 'all' || !provider) {
      try {
        const spotifyResults = await this.spotifyService.searchTracks(
          req.user.id,
          query,
          limitNum,
          offsetNum,
        );
        results.spotify = {
          tracks: spotifyResults.tracks.map((track) => ({
            id: track.id,
            provider: 'spotify',
            name: track.name,
            artist: track.artists.map((a) => a.name).join(', '),
            album: track.album.name,
            duration: Math.floor(track.duration_ms / 1000),
            artwork: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            externalUrl: track.external_urls.spotify,
            uri: track.uri,
          })),
          total: spotifyResults.total,
        };
      } catch (err) {
        results.spotify = { error: 'Not connected or token expired' };
      }
    }

    // Search Apple Music (doesn't require user auth for catalog search)
    if (provider === 'apple-music' || provider === 'all' || !provider) {
      try {
        const appleMusicResults = await this.appleMusicService.searchTracks(
          query,
          limitNum,
          offsetNum,
        );
        results.appleMusic = {
          tracks: appleMusicResults.tracks.map((track) => ({
            id: track.id,
            provider: 'apple-music',
            name: track.attributes.name,
            artist: track.attributes.artistName,
            album: track.attributes.albumName,
            duration: Math.floor(track.attributes.durationInMillis / 1000),
            artwork: track.attributes.artwork?.url
              ?.replace('{w}', '300')
              .replace('{h}', '300'),
            previewUrl: track.attributes.previews?.[0]?.url,
            externalUrl: track.attributes.url,
          })),
          total: appleMusicResults.total,
        };
      } catch (err) {
        results.appleMusic = { error: 'Apple Music search failed' };
      }
    }

    // Search Tidal
    if (provider === 'tidal' || provider === 'all' || !provider) {
      try {
        const tidalResults = await this.tidalService.searchTracks(
          req.user.id,
          query,
          limitNum,
          offsetNum,
        );
        results.tidal = {
          tracks: tidalResults.tracks.map((track) => ({
            id: track.id.toString(),
            provider: 'tidal',
            name: track.title,
            artist: track.artists.map((a) => a.name).join(', '),
            album: track.album.title,
            duration: track.duration,
            artwork: this.tidalService.getArtworkUrl(track.album.cover),
            previewUrl: null, // Tidal doesn't provide preview URLs in search
            externalUrl: track.url,
          })),
          total: tidalResults.total,
        };
      } catch (err) {
        results.tidal = { error: 'Not connected or token expired' };
      }
    }

    return results;
  }

  /**
   * Get track details by provider and ID
   */
  @Get('track/:provider/:trackId')
  @UseGuards(AuthGuard)
  async getTrack(
    @Req() req: AuthenticatedRequest,
    @Query('provider') provider: 'spotify' | 'apple-music' | 'tidal',
    @Query('trackId') trackId: string,
  ) {
    if (provider === 'spotify') {
      const track = await this.spotifyService.getTrack(req.user.id, trackId);
      return {
        id: track.id,
        provider: 'spotify',
        name: track.name,
        artist: track.artists.map((a) => a.name).join(', '),
        album: track.album.name,
        duration: Math.floor(track.duration_ms / 1000),
        artwork: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
        uri: track.uri,
      };
    }

    if (provider === 'apple-music') {
      const track = await this.appleMusicService.getTrack(trackId);
      return {
        id: track.id,
        provider: 'apple-music',
        name: track.attributes.name,
        artist: track.attributes.artistName,
        album: track.attributes.albumName,
        duration: Math.floor(track.attributes.durationInMillis / 1000),
        artwork: track.attributes.artwork?.url
          ?.replace('{w}', '300')
          .replace('{h}', '300'),
        previewUrl: track.attributes.previews?.[0]?.url,
        externalUrl: track.attributes.url,
      };
    }

    if (provider === 'tidal') {
      const track = await this.tidalService.getTrack(req.user.id, trackId);
      return {
        id: track.id.toString(),
        provider: 'tidal',
        name: track.title,
        artist: track.artists.map((a) => a.name).join(', '),
        album: track.album.title,
        duration: track.duration,
        artwork: this.tidalService.getArtworkUrl(track.album.cover),
        previewUrl: null,
        externalUrl: track.url,
      };
    }

    throw new BadRequestException('Invalid provider');
  }
}
