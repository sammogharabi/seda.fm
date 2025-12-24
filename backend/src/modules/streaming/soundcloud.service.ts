import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * SoundCloud track metadata extracted from links via oEmbed API
 * Since SoundCloud API registration has been closed since 2017,
 * we use link-only mode with the public oEmbed endpoint
 */
export interface SoundCloudTrackInfo {
  id: string;
  provider: 'soundcloud';
  url: string;
  title: string;
  artist?: string;
  artwork?: string;
  duration?: number;
  description?: string;
  embedHtml?: string;
  // Indicates this is link-only (playback via embed only)
  linkOnly: true;
}

export interface SoundCloudOEmbedResponse {
  version: number;
  type: string;
  provider_name: string;
  provider_url: string;
  height: number;
  width: string;
  title: string;
  description: string;
  thumbnail_url: string;
  html: string;
  author_name: string;
  author_url: string;
}

export interface SoundCloudLinkMetadata {
  type: 'track' | 'playlist' | 'user' | 'unknown';
  url: string;
  username?: string;
  slug?: string;
}

@Injectable()
export class SoundCloudService {
  private readonly logger = new Logger(SoundCloudService.name);
  private readonly oEmbedBaseUrl = 'https://soundcloud.com/oembed';

  // URL patterns for SoundCloud
  private readonly urlPatterns = {
    track: /soundcloud\.com\/([^\/]+)\/([^\/\?]+)(?:\?|$)/,
    playlist: /soundcloud\.com\/([^\/]+)\/sets\/([^\/\?]+)/,
    user: /soundcloud\.com\/([^\/]+)\/?$/,
  };

  constructor(private readonly configService: ConfigService) {}

  /**
   * Parse a SoundCloud URL to extract metadata
   */
  parseUrl(url: string): SoundCloudLinkMetadata | null {
    const cleanUrl = url.trim();

    if (!cleanUrl.includes('soundcloud.com')) {
      return null;
    }

    // Check for playlist first (has /sets/ in path)
    const playlistMatch = cleanUrl.match(this.urlPatterns.playlist);
    if (playlistMatch) {
      return {
        type: 'playlist',
        url: cleanUrl,
        username: playlistMatch[1],
        slug: playlistMatch[2],
      };
    }

    // Check for track
    const trackMatch = cleanUrl.match(this.urlPatterns.track);
    if (trackMatch) {
      return {
        type: 'track',
        url: cleanUrl,
        username: trackMatch[1],
        slug: trackMatch[2],
      };
    }

    // Check for user profile
    const userMatch = cleanUrl.match(this.urlPatterns.user);
    if (userMatch) {
      return {
        type: 'user',
        url: cleanUrl,
        username: userMatch[1],
      };
    }

    return {
      type: 'unknown',
      url: cleanUrl,
    };
  }

  /**
   * Validate if a URL is a valid SoundCloud link
   */
  isValidSoundCloudUrl(url: string): boolean {
    return url.includes('soundcloud.com');
  }

  /**
   * Get track info using SoundCloud's public oEmbed API
   * This doesn't require any API keys
   */
  async getTrackInfo(url: string): Promise<SoundCloudTrackInfo | null> {
    const metadata = this.parseUrl(url);

    if (!metadata) {
      return null;
    }

    try {
      const oEmbedUrl = `${this.oEmbedBaseUrl}?format=json&url=${encodeURIComponent(url)}`;

      const response = await fetch(oEmbedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        this.logger.warn(`SoundCloud oEmbed failed for ${url}: ${response.status}`);
        // Fall back to basic info from URL
        return this.extractInfoFromUrl(metadata);
      }

      const data: SoundCloudOEmbedResponse = await response.json();

      // Extract track ID from embed HTML if possible
      const trackIdMatch = data.html?.match(/tracks%2F(\d+)/);
      const trackId = trackIdMatch ? trackIdMatch[1] : this.generateIdFromUrl(url);

      return {
        id: trackId,
        provider: 'soundcloud',
        url: url,
        title: data.title,
        artist: data.author_name,
        artwork: data.thumbnail_url,
        description: data.description,
        embedHtml: data.html,
        linkOnly: true,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch SoundCloud oEmbed: ${error}`);
      // Fall back to basic info from URL
      return this.extractInfoFromUrl(metadata);
    }
  }

  /**
   * Extract basic info from URL when oEmbed fails
   */
  private extractInfoFromUrl(metadata: SoundCloudLinkMetadata): SoundCloudTrackInfo | null {
    if (!metadata.slug) {
      return null;
    }

    // Convert slug to readable title
    const title = metadata.slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      id: this.generateIdFromUrl(metadata.url),
      provider: 'soundcloud',
      url: metadata.url,
      title: title,
      artist: metadata.username,
      linkOnly: true,
    };
  }

  /**
   * Generate a deterministic ID from URL
   */
  private generateIdFromUrl(url: string): string {
    // Simple hash of URL for consistent ID
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `sc_${Math.abs(hash).toString(36)}`;
  }

  /**
   * Get embed HTML for a SoundCloud track
   * This can be used to embed a player in the frontend
   */
  async getEmbedHtml(
    url: string,
    options: { autoPlay?: boolean; showArtwork?: boolean; color?: string } = {},
  ): Promise<string | null> {
    try {
      const params = new URLSearchParams({
        format: 'json',
        url: url,
        auto_play: (options.autoPlay ?? false).toString(),
        show_artwork: (options.showArtwork ?? true).toString(),
      });

      if (options.color) {
        params.append('color', options.color.replace('#', ''));
      }

      const response = await fetch(`${this.oEmbedBaseUrl}?${params.toString()}`);

      if (!response.ok) {
        return null;
      }

      const data: SoundCloudOEmbedResponse = await response.json();
      return data.html;
    } catch {
      return null;
    }
  }

  /**
   * Get widget embed URL for iframe embedding
   * This provides more control than oEmbed HTML
   */
  getWidgetUrl(trackUrl: string, options: { autoPlay?: boolean; color?: string } = {}): string {
    const params = new URLSearchParams({
      url: trackUrl,
      auto_play: (options.autoPlay ?? false).toString(),
      hide_related: 'true',
      show_comments: 'false',
      show_user: 'true',
      show_reposts: 'false',
      show_teaser: 'false',
      visual: 'true',
    });

    if (options.color) {
      params.append('color', options.color.replace('#', ''));
    }

    return `https://w.soundcloud.com/player/?${params.toString()}`;
  }

  /**
   * SoundCloud is always configured in link-only mode
   * No API keys required for oEmbed
   */
  isConfigured(): boolean {
    return true; // Link sharing doesn't require API configuration
  }

  /**
   * Connection status for SoundCloud (always available in link-only mode)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getConnectionStatus(_userId: string) {
    return {
      connected: true, // Always "connected" since we're just sharing links
      linkOnly: true,
      displayName: 'SoundCloud Links',
      message: 'SoundCloud integration uses link-only mode (no user authentication)',
    };
  }

  /**
   * No disconnect needed for link-only mode
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async disconnect(_userId: string) {
    return {
      success: true,
      message: 'SoundCloud uses link-only mode and does not require disconnection',
    };
  }
}
