import { Injectable, Logger } from '@nestjs/common';

/**
 * Beatport track metadata extracted from links
 * Since Beatport doesn't have a public API, we extract metadata from URLs
 * and allow users to share links without playback integration
 */
export interface BeatportTrackInfo {
  id: string;
  provider: 'beatport';
  url: string;
  title?: string;
  artist?: string;
  label?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  releaseDate?: string;
  artwork?: string;
  // Indicates this is link-only (no playback)
  linkOnly: true;
}

export interface BeatportLinkMetadata {
  type: 'track' | 'release' | 'artist' | 'label' | 'chart' | 'unknown';
  id: string;
  slug?: string;
  url: string;
}

@Injectable()
export class BeatportService {
  private readonly logger = new Logger(BeatportService.name);

  // Beatport URL patterns
  private readonly urlPatterns = {
    track: /beatport\.com\/track\/([^\/]+)\/(\d+)/,
    release: /beatport\.com\/release\/([^\/]+)\/(\d+)/,
    artist: /beatport\.com\/artist\/([^\/]+)\/(\d+)/,
    label: /beatport\.com\/label\/([^\/]+)\/(\d+)/,
    chart: /beatport\.com\/chart\/([^\/]+)\/(\d+)/,
  };

  /**
   * Parse a Beatport URL to extract metadata
   */
  parseUrl(url: string): BeatportLinkMetadata | null {
    // Clean up URL
    const cleanUrl = url.trim().toLowerCase();

    if (!cleanUrl.includes('beatport.com')) {
      return null;
    }

    for (const [type, pattern] of Object.entries(this.urlPatterns)) {
      const match = url.match(pattern);
      if (match) {
        return {
          type: type as BeatportLinkMetadata['type'],
          slug: match[1],
          id: match[2],
          url: url,
        };
      }
    }

    // Generic Beatport URL
    return {
      type: 'unknown',
      id: '',
      url: url,
    };
  }

  /**
   * Validate if a URL is a valid Beatport link
   */
  isValidBeatportUrl(url: string): boolean {
    return url.includes('beatport.com');
  }

  /**
   * Extract track info from URL slug (best effort without API)
   * The slug typically contains the track name with hyphens
   */
  extractInfoFromSlug(metadata: BeatportLinkMetadata): Partial<BeatportTrackInfo> {
    if (!metadata.slug) {
      return {
        id: metadata.id,
        provider: 'beatport',
        url: metadata.url,
        linkOnly: true,
      };
    }

    // Convert slug to readable title (replace hyphens with spaces, title case)
    const title = metadata.slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      id: metadata.id,
      provider: 'beatport',
      url: metadata.url,
      title,
      linkOnly: true,
    };
  }

  /**
   * Create a shareable track reference from a Beatport URL
   * This allows users to share Beatport links in sessions/crates
   * without playback capability
   */
  async createTrackReference(url: string): Promise<BeatportTrackInfo | null> {
    const metadata = this.parseUrl(url);

    if (!metadata || metadata.type !== 'track') {
      return null;
    }

    const info = this.extractInfoFromSlug(metadata);

    return {
      id: metadata.id,
      provider: 'beatport',
      url: metadata.url,
      title: info.title,
      linkOnly: true,
    };
  }

  /**
   * Attempt to scrape basic metadata from Beatport page
   * Note: This is best-effort and may break if Beatport changes their HTML
   */
  async scrapeMetadata(url: string): Promise<Partial<BeatportTrackInfo> | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();

      // Extract Open Graph metadata (more reliable than parsing HTML)
      const ogTitle = this.extractMetaContent(html, 'og:title');
      const ogImage = this.extractMetaContent(html, 'og:image');
      const ogDescription = this.extractMetaContent(html, 'og:description');

      // Try to extract structured data
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      );
      let structuredData: any = null;
      if (jsonLdMatch) {
        try {
          structuredData = JSON.parse(jsonLdMatch[1]);
        } catch {
          // Ignore JSON parse errors
        }
      }

      const metadata = this.parseUrl(url);

      return {
        id: metadata?.id || '',
        provider: 'beatport',
        url,
        title: ogTitle || undefined,
        artwork: ogImage || undefined,
        artist: structuredData?.byArtist?.name || this.extractArtistFromTitle(ogTitle),
        linkOnly: true,
      };
    } catch (error) {
      this.logger.warn(`Failed to scrape Beatport metadata: ${error}`);
      return null;
    }
  }

  /**
   * Extract meta content from HTML
   */
  private extractMetaContent(html: string, property: string): string | null {
    const regex = new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
      'i',
    );
    const match = html.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Try to extract artist name from title (format: "Track Name - Artist Name")
   */
  private extractArtistFromTitle(title: string | null): string | undefined {
    if (!title) return undefined;
    const parts = title.split(' - ');
    return parts.length > 1 ? parts[1] : undefined;
  }

  /**
   * Get track info - combines URL parsing with optional metadata scraping
   */
  async getTrackInfo(url: string, scrape = false): Promise<BeatportTrackInfo | null> {
    const metadata = this.parseUrl(url);

    if (!metadata || metadata.type !== 'track') {
      return null;
    }

    const basicInfo = this.extractInfoFromSlug(metadata);

    if (scrape) {
      const scraped = await this.scrapeMetadata(url);
      if (scraped) {
        return {
          ...basicInfo,
          ...scraped,
          linkOnly: true,
        } as BeatportTrackInfo;
      }
    }

    return {
      id: metadata.id,
      provider: 'beatport',
      url: metadata.url,
      title: basicInfo.title,
      linkOnly: true,
    };
  }

  /**
   * Beatport doesn't require user authentication for link sharing
   * This always returns configured: true since we don't need API keys
   */
  isConfigured(): boolean {
    return true; // Link sharing doesn't require API configuration
  }

  /**
   * Connection status for Beatport (always available since it's link-only)
   */
  getConnectionStatus() {
    return {
      connected: true, // Always "connected" since we're just sharing links
      linkOnly: true,
      displayName: 'Beatport Links',
    };
  }
}
