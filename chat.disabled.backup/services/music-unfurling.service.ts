import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../config/prisma.service';
import axios from 'axios';
import { TrackRefDto } from '../dto/send-message.dto';

@Injectable()
export class MusicUnfurlingService {
  private readonly logger = new Logger(MusicUnfurlingService.name);

  constructor(private prisma: PrismaService) {}

  async unfurlMusicLink(url: string): Promise<TrackRefDto | null> {
    try {
      const existingTrack = await this.prisma.trackRef.findUnique({
        where: { url },
      });

      if (existingTrack) {
        return {
          provider: existingTrack.provider,
          providerId: existingTrack.providerId,
          url: existingTrack.url,
          title: existingTrack.title,
          artist: existingTrack.artist,
          artwork: existingTrack.artwork || undefined,
          duration: existingTrack.duration || undefined,
        };
      }

      const trackData = await this.extractTrackData(url);
      if (!trackData) return null;

      const savedTrack = await this.prisma.trackRef.create({
        data: trackData,
      });

      return {
        provider: savedTrack.provider,
        providerId: savedTrack.providerId,
        url: savedTrack.url,
        title: savedTrack.title,
        artist: savedTrack.artist,
        artwork: savedTrack.artwork || undefined,
        duration: savedTrack.duration || undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to unfurl music link: ${url}`, error);
      return null;
    }
  }

  private async extractTrackData(url: string): Promise<any | null> {
    if (this.isSpotifyUrl(url)) {
      return this.extractSpotifyData(url);
    } else if (this.isYouTubeUrl(url)) {
      return this.extractYouTubeData(url);
    } else if (this.isAppleMusicUrl(url)) {
      return this.extractAppleMusicData(url);
    } else if (this.isBandcampUrl(url)) {
      return this.extractBandcampData(url);
    } else if (this.isBeatportUrl(url)) {
      return this.extractBeatportData(url);
    }
    return null;
  }

  private isSpotifyUrl(url: string): boolean {
    return url.includes('open.spotify.com') || url.includes('spotify.com');
  }

  private isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  private isAppleMusicUrl(url: string): boolean {
    return url.includes('music.apple.com');
  }

  private isBandcampUrl(url: string): boolean {
    return url.includes('bandcamp.com');
  }

  private isBeatportUrl(url: string): boolean {
    return url.includes('beatport.com');
  }

  private async extractSpotifyData(url: string): Promise<any | null> {
    try {
      const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
      if (!trackIdMatch) return null;

      const trackId = trackIdMatch[1];

      // For MVP, we'll extract basic info from the URL structure
      // In production, you'd use Spotify Web API
      const response = await axios.get(`https://open.spotify.com/embed/track/${trackId}`, {
        timeout: 5000,
      });

      // Parse HTML to extract track info (simplified for MVP)
      const title = this.extractMetaContent(response.data, 'twitter:title') || 'Unknown Track';
      const artist = this.extractMetaContent(response.data, 'twitter:description')?.split(' · ')[0] || 'Unknown Artist';
      const artwork = this.extractMetaContent(response.data, 'twitter:image') || null;

      return {
        provider: 'spotify',
        providerId: trackId,
        url,
        title: title.replace(' - song and lyrics by', '').replace(' | Spotify', ''),
        artist,
        artwork,
        duration: null, // Would get from API
      };
    } catch (error) {
      this.logger.error('Failed to extract Spotify data', error);
      return null;
    }
  }

  private async extractYouTubeData(url: string): Promise<any | null> {
    try {
      let videoId: string | null = null;
      
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/watch')) {
        const match = url.match(/v=([^&]+)/);
        videoId = match ? match[1] : null;
      }

      if (!videoId) return null;

      const response = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
        timeout: 5000,
      });

      const title = this.extractMetaContent(response.data, 'og:title') || 'Unknown Video';
      const artist = this.extractMetaContent(response.data, 'og:site_name') || 'YouTube';
      const artwork = this.extractMetaContent(response.data, 'og:image') || null;

      return {
        provider: 'youtube',
        providerId: videoId,
        url,
        title,
        artist: artist.replace(' - YouTube', ''),
        artwork,
        duration: null, // Would extract from page data
      };
    } catch (error) {
      this.logger.error('Failed to extract YouTube data', error);
      return null;
    }
  }

  private async extractAppleMusicData(url: string): Promise<any | null> {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      
      const title = this.extractMetaContent(response.data, 'twitter:title') || 'Unknown Track';
      const artist = this.extractMetaContent(response.data, 'twitter:description') || 'Unknown Artist';
      const artwork = this.extractMetaContent(response.data, 'twitter:image') || null;
      
      const idMatch = url.match(/\/(\d+)/);
      const providerId = idMatch ? idMatch[1] : url;

      return {
        provider: 'apple',
        providerId,
        url,
        title: title.replace(' - Single', '').replace(' - EP', '').replace(' - Album', ''),
        artist,
        artwork,
        duration: null,
      };
    } catch (error) {
      this.logger.error('Failed to extract Apple Music data', error);
      return null;
    }
  }

  private async extractBandcampData(url: string): Promise<any | null> {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      
      const title = this.extractMetaContent(response.data, 'og:title') || 'Unknown Track';
      const artist = this.extractMetaContent(response.data, 'og:site_name') || 'Unknown Artist';
      const artwork = this.extractMetaContent(response.data, 'og:image') || null;

      return {
        provider: 'bandcamp',
        providerId: url,
        url,
        title,
        artist,
        artwork,
        duration: null,
      };
    } catch (error) {
      this.logger.error('Failed to extract Bandcamp data', error);
      return null;
    }
  }

  private async extractBeatportData(url: string): Promise<any | null> {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      
      const title = this.extractMetaContent(response.data, 'og:title') || 'Unknown Track';
      const description = this.extractMetaContent(response.data, 'og:description') || '';
      const artist = description.split(' by ')[1]?.split(' on ')[0] || 'Unknown Artist';
      const artwork = this.extractMetaContent(response.data, 'og:image') || null;
      
      const idMatch = url.match(/track\/([^\/]+)\/(\d+)/);
      const providerId = idMatch ? idMatch[2] : url;

      return {
        provider: 'beatport',
        providerId,
        url,
        title,
        artist,
        artwork,
        duration: null,
      };
    } catch (error) {
      this.logger.error('Failed to extract Beatport data', error);
      return null;
    }
  }

  private extractMetaContent(html: string, property: string): string | null {
    const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i');
    const match = html.match(regex);
    return match ? match[1] : null;
  }

  detectMusicLinks(text: string): string[] {
    const musicUrlPatterns = [
      /https?:\/\/(?:open\.)?spotify\.com\/(?:track|album|playlist)\/[a-zA-Z0-9]+/g,
      /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/g,
      /https?:\/\/youtu\.be\/[a-zA-Z0-9_-]+/g,
      /https?:\/\/music\.apple\.com\/[^\/]+\/(?:album|song)\/[^\/]+\/\d+/g,
      /https?:\/\/[^.]+\.bandcamp\.com\/(?:track|album)\/[^\/\s]+/g,
      /https?:\/\/(?:www\.)?beatport\.com\/track\/[^\/\s]+\/\d+/g,
    ];

    const links: string[] = [];
    musicUrlPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        links.push(...matches);
      }
    });

    return links;
  }
}