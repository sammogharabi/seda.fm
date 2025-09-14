import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MusicUnfurlService } from './music-unfurl.service';
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MusicUnfurlService', () => {
  let service: MusicUnfurlService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        'spotify.clientId': 'test-spotify-client',
        'spotify.clientSecret': 'test-spotify-secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusicUnfurlService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MusicUnfurlService>(MusicUnfurlService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('unfurlTrack', () => {
    it('should unfurl a Spotify track URL', async () => {
      const spotifyUrl = 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC';
      const mockTokenResponse = {
        data: { access_token: 'test-token' },
      };
      const mockTrackResponse = {
        data: {
          name: 'Never Gonna Give You Up',
          artists: [{ name: 'Rick Astley' }],
          album: {
            images: [{ url: 'https://example.com/cover.jpg' }],
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockTokenResponse);
      mockedAxios.get.mockResolvedValue(mockTrackResponse);

      const result = await service.unfurlTrack(spotifyUrl);

      expect(result).toEqual({
        platform: 'spotify',
        title: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        url: spotifyUrl,
        thumbnailUrl: 'https://example.com/cover.jpg',
      });
    });

    it('should unfurl a YouTube URL', async () => {
      const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const mockResponse = {
        data: {
          items: [
            {
              snippet: {
                title: 'Rick Astley - Never Gonna Give You Up',
                channelTitle: 'Rick Astley',
                thumbnails: {
                  high: { url: 'https://example.com/thumb.jpg' },
                },
              },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.unfurlTrack(youtubeUrl);

      expect(result).toEqual({
        platform: 'youtube',
        title: 'Rick Astley - Never Gonna Give You Up',
        artist: 'Rick Astley',
        url: youtubeUrl,
        thumbnailUrl: 'https://example.com/thumb.jpg',
      });
    });

    it('should unfurl an Apple Music URL', async () => {
      const appleMusicUrl =
        'https://music.apple.com/us/album/never-gonna-give-you-up/1560761731?i=1560761735';

      const result = await service.unfurlTrack(appleMusicUrl);

      expect(result).toEqual({
        platform: 'apple_music',
        title: 'Apple Music Track',
        artist: 'Unknown Artist',
        url: appleMusicUrl,
        thumbnailUrl: null,
      });
    });

    it('should unfurl a Bandcamp URL', async () => {
      const bandcampUrl = 'https://rickastley.bandcamp.com/track/never-gonna-give-you-up';
      const mockHtmlResponse = {
        data: `
          <html>
            <head>
              <meta property="og:title" content="Never Gonna Give You Up by Rick Astley">
              <meta property="og:image" content="https://example.com/bandcamp.jpg">
            </head>
          </html>
        `,
      };

      mockedAxios.get.mockResolvedValue(mockHtmlResponse);

      const result = await service.unfurlTrack(bandcampUrl);

      expect(result).toEqual({
        platform: 'bandcamp',
        title: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        url: bandcampUrl,
        thumbnailUrl: 'https://example.com/bandcamp.jpg',
      });
    });

    it('should unfurl a Beatport URL', async () => {
      const beatportUrl = 'https://www.beatport.com/track/never-gonna-give-you-up/123456';
      const mockHtmlResponse = {
        data: `
          <html>
            <head>
              <meta property="og:title" content="Never Gonna Give You Up">
              <meta name="description" content="Never Gonna Give You Up by Rick Astley">
              <meta property="og:image" content="https://example.com/beatport.jpg">
            </head>
          </html>
        `,
      };

      mockedAxios.get.mockResolvedValue(mockHtmlResponse);

      const result = await service.unfurlTrack(beatportUrl);

      expect(result).toEqual({
        platform: 'beatport',
        title: 'Never Gonna Give You Up',
        artist: 'Rick Astley',
        url: beatportUrl,
        thumbnailUrl: 'https://example.com/beatport.jpg',
      });
    });

    it('should throw BadRequestException for unsupported URLs', async () => {
      const unsupportedUrl = 'https://example.com/track/123';

      await expect(service.unfurlTrack(unsupportedUrl)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle Spotify API errors gracefully', async () => {
      const spotifyUrl = 'https://open.spotify.com/track/invalid-id';

      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.unfurlTrack(spotifyUrl)).rejects.toThrow(
        'Failed to unfurl Spotify track',
      );
    });

    it('should handle YouTube API errors gracefully', async () => {
      const youtubeUrl = 'https://www.youtube.com/watch?v=invalid';

      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.unfurlTrack(youtubeUrl)).rejects.toThrow(
        'Failed to unfurl YouTube video',
      );
    });
  });

  describe('extractTrackId', () => {
    it('should extract track ID from various Spotify URL formats', async () => {
      const testCases = [
        {
          url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC',
          expected: '4uLU6hMCjMI75M1A2tKUQC',
        },
        {
          url: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=abc123',
          expected: '4uLU6hMCjMI75M1A2tKUQC',
        },
        {
          url: 'spotify:track:4uLU6hMCjMI75M1A2tKUQC',
          expected: '4uLU6hMCjMI75M1A2tKUQC',
        },
      ];

      for (const testCase of testCases) {
        const result = service['extractSpotifyTrackId'](testCase.url);
        expect(result).toBe(testCase.expected);
      }
    });

    it('should extract video ID from various YouTube URL formats', async () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://youtu.be/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
        {
          url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
          expected: 'dQw4w9WgXcQ',
        },
      ];

      for (const testCase of testCases) {
        const result = service['extractYouTubeVideoId'](testCase.url);
        expect(result).toBe(testCase.expected);
      }
    });
  });

  describe('detectPlatform', () => {
    it('should correctly detect music platforms', () => {
      const testCases = [
        { url: 'https://open.spotify.com/track/123', expected: 'spotify' },
        { url: 'https://www.youtube.com/watch?v=123', expected: 'youtube' },
        { url: 'https://youtu.be/123', expected: 'youtube' },
        { url: 'https://music.apple.com/us/album/123', expected: 'apple_music' },
        { url: 'https://artist.bandcamp.com/track/song', expected: 'bandcamp' },
        { url: 'https://www.beatport.com/track/song/123', expected: 'beatport' },
        { url: 'https://example.com/track/123', expected: null },
      ];

      for (const testCase of testCases) {
        const result = service['detectPlatform'](testCase.url);
        expect(result).toBe(testCase.expected);
      }
    });
  });
});