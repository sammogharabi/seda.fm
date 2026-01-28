import { Injectable, Logger } from '@nestjs/common';

export interface LinkMetadata {
  type: 'youtube' | 'spotify' | 'soundcloud' | 'bandcamp' | 'apple_music' | 'generic';
  url: string;
  title?: string;
  artist?: string;
  description?: string;
  thumbnail?: string;
  platform: string;
  embedId?: string;
  duration?: string;
  isPlayable?: boolean;
}

@Injectable()
export class UnfurlService {
  private readonly logger = new Logger(UnfurlService.name);

  // Platform detection patterns
  private readonly patterns = {
    youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    spotify: /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|album|artist|playlist)\/([a-zA-Z0-9]+)/,
    soundcloud: /(?:https?:\/\/)?soundcloud\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/,
    bandcamp: /(?:https?:\/\/)?([a-zA-Z0-9_-]+\.bandcamp\.com\/(?:track|album)\/[a-zA-Z0-9_-]+)/,
    appleMusic: /(?:https?:\/\/)?music\.apple\.com\/[a-z]{2}\/(?:album|song)\/[^\/]+\/([0-9]+)/,
  };

  async unfurlLink(url: string): Promise<LinkMetadata | null> {
    try {
      // Detect platform and extract metadata
      if (this.patterns.youtube.test(url)) {
        return this.unfurlYouTube(url);
      }

      if (this.patterns.spotify.test(url)) {
        return this.unfurlSpotify(url);
      }

      if (this.patterns.soundcloud.test(url)) {
        return this.unfurlSoundCloud(url);
      }

      if (this.patterns.bandcamp.test(url)) {
        return this.unfurlBandcamp(url);
      }

      // Generic link - try to fetch OpenGraph metadata
      return this.unfurlGeneric(url);
    } catch (error) {
      this.logger.error(`Failed to unfurl link ${url}:`, error);
      return null;
    }
  }

  private async unfurlYouTube(url: string): Promise<LinkMetadata | null> {
    const match = url.match(this.patterns.youtube);
    if (!match) return null;

    const videoId = match[1];

    try {
      // Use YouTube's oEmbed API (no API key required)
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        this.logger.warn(`YouTube oEmbed failed for ${videoId}: ${response.status}`);
        return this.createBasicYouTubeMetadata(videoId, url);
      }

      const data = await response.json();

      return {
        type: 'youtube',
        url,
        title: data.title,
        artist: data.author_name,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        platform: 'YouTube',
        embedId: videoId,
        isPlayable: true,
      };
    } catch (error) {
      this.logger.error(`YouTube unfurl error:`, error);
      return this.createBasicYouTubeMetadata(videoId, url);
    }
  }

  private createBasicYouTubeMetadata(videoId: string, url: string): LinkMetadata {
    return {
      type: 'youtube',
      url,
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      platform: 'YouTube',
      embedId: videoId,
      isPlayable: true,
    };
  }

  private async unfurlSpotify(url: string): Promise<LinkMetadata | null> {
    const match = url.match(this.patterns.spotify);
    if (!match) return null;

    const [, contentType, spotifyId] = match;

    // Spotify requires OAuth for metadata, so we'll use oEmbed
    try {
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        return {
          type: 'spotify',
          url,
          title: `Spotify ${contentType}`,
          platform: 'Spotify',
          embedId: spotifyId,
          isPlayable: false,
        };
      }

      const data = await response.json();

      return {
        type: 'spotify',
        url,
        title: data.title,
        thumbnail: data.thumbnail_url,
        platform: 'Spotify',
        embedId: spotifyId,
        isPlayable: false, // Spotify requires their app/web player
      };
    } catch (error) {
      this.logger.error(`Spotify unfurl error:`, error);
      return {
        type: 'spotify',
        url,
        title: `Spotify ${contentType}`,
        platform: 'Spotify',
        embedId: spotifyId,
        isPlayable: false,
      };
    }
  }

  private async unfurlSoundCloud(url: string): Promise<LinkMetadata | null> {
    try {
      // SoundCloud oEmbed
      const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        return {
          type: 'soundcloud',
          url,
          title: 'SoundCloud Track',
          platform: 'SoundCloud',
          isPlayable: true,
        };
      }

      const data = await response.json();

      return {
        type: 'soundcloud',
        url,
        title: data.title,
        artist: data.author_name,
        thumbnail: data.thumbnail_url,
        platform: 'SoundCloud',
        isPlayable: true,
      };
    } catch (error) {
      this.logger.error(`SoundCloud unfurl error:`, error);
      return {
        type: 'soundcloud',
        url,
        title: 'SoundCloud Track',
        platform: 'SoundCloud',
        isPlayable: true,
      };
    }
  }

  private async unfurlBandcamp(url: string): Promise<LinkMetadata | null> {
    // Bandcamp doesn't have a public oEmbed, return basic metadata
    const match = url.match(this.patterns.bandcamp);

    return {
      type: 'bandcamp',
      url: url.startsWith('http') ? url : `https://${url}`,
      title: 'Bandcamp Track',
      platform: 'Bandcamp',
      isPlayable: true,
    };
  }

  private async unfurlGeneric(url: string): Promise<LinkMetadata | null> {
    try {
      const domain = new URL(url).hostname;

      return {
        type: 'generic',
        url,
        title: `Link to ${domain}`,
        platform: domain,
        isPlayable: false,
      };
    } catch {
      return null;
    }
  }
}
