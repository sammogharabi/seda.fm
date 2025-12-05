import { Track } from './audioEngine';
import { SAMPLE_TRACKS } from '../data/sampleTracks';

// Mock search results from multiple providers
export interface SearchResult extends Track {
  provider: string;
  isExplicit: boolean;
  popularity: number;
  previewUrl?: string;
  streamingUrls?: {
    spotify?: string;
    apple?: string;
    youtube?: string;
    soundcloud?: string;
  };
}

export interface SearchFilters {
  genres?: string[];
  year?: { min: number; max: number };
  duration?: { min: number; max: number };
  providers?: string[];
  explicit?: boolean;
  sortBy?: 'relevance' | 'popularity' | 'recent' | 'duration';
}

export interface SearchResponse {
  tracks: SearchResult[];
  totalResults: number;
  query: string;
  filters: SearchFilters;
  providers: string[];
  searchTime: number;
}

// Mock provider data - in real implementation, this would call actual APIs
const MOCK_SEARCH_RESULTS: SearchResult[] = [
  ...SAMPLE_TRACKS.map((track, index) => ({
    ...track,
    provider: ['Spotify', 'Apple Music', 'YouTube Music', 'SoundCloud'][index % 4],
    isExplicit: index % 3 === 0,
    popularity: Math.floor(Math.random() * 100) + 1,
    previewUrl: track.url,
    streamingUrls: {
      spotify: index % 4 === 0 ? `https://open.spotify.com/track/${track.id}` : undefined,
      apple: index % 4 === 1 ? `https://music.apple.com/track/${track.id}` : undefined,
      youtube: index % 4 === 2 ? `https://music.youtube.com/watch?v=${track.id}` : undefined,
      soundcloud: index % 4 === 3 ? `https://soundcloud.com/track/${track.id}` : undefined,
    }
  })),
  // Additional mock results for better search experience
  {
    id: 'search-1',
    title: 'Neon Lights',
    artist: 'Electric Dreams',
    artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    duration: 195,
    provider: 'Spotify',
    isExplicit: false,
    popularity: 85,
    previewUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    streamingUrls: {
      spotify: 'https://open.spotify.com/track/search-1',
      youtube: 'https://music.youtube.com/watch?v=search-1'
    },
    metadata: {
      album: 'Digital Nights',
      genre: 'Electronic',
      year: 2024,
      bitrate: 320
    }
  },
  {
    id: 'search-2',
    title: 'Midnight Drive',
    artist: 'Synthwave Collective',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    duration: 268,
    provider: 'Apple Music',
    isExplicit: true,
    popularity: 72,
    previewUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    streamingUrls: {
      apple: 'https://music.apple.com/track/search-2',
      soundcloud: 'https://soundcloud.com/track/search-2'
    },
    metadata: {
      album: 'Retro Future',
      genre: 'Synthwave',
      year: 2024,
      bitrate: 320
    }
  },
  {
    id: 'search-3',
    title: 'Coffee Shop Jazz',
    artist: 'Urban Quartet',
    artwork: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    duration: 284,
    provider: 'YouTube Music',
    isExplicit: false,
    popularity: 91,
    previewUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    streamingUrls: {
      youtube: 'https://music.youtube.com/watch?v=search-3',
      spotify: 'https://open.spotify.com/track/search-3'
    },
    metadata: {
      album: 'City Sounds',
      genre: 'Jazz',
      year: 2024,
      bitrate: 320
    }
  },
  {
    id: 'search-4',
    title: 'Digital Rainfall',
    artist: 'Ambient Creator',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    duration: 320,
    provider: 'SoundCloud',
    isExplicit: false,
    popularity: 64,
    previewUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    streamingUrls: {
      soundcloud: 'https://soundcloud.com/track/search-4'
    },
    metadata: {
      album: 'Natural Sounds',
      genre: 'Ambient',
      year: 2024,
      bitrate: 192
    }
  }
];

export class SearchService {
  private cache = new Map<string, SearchResult[]>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps = new Map<string, number>();

  async searchTracks(
    query: string, 
    filters: SearchFilters = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    
    // Simulate API delay
    await this.delay(Math.random() * 300 + 100);

    // Check cache
    const cacheKey = this.getCacheKey(query, filters, limit, offset);
    const cached = this.getCachedResults(cacheKey);
    
    if (cached) {
      return {
        tracks: cached,
        totalResults: cached.length,
        query,
        filters,
        providers: this.getActiveProviders(filters),
        searchTime: Date.now() - startTime
      };
    }

    // Perform search
    let results = this.filterAndSortResults(query, filters);
    
    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);
    
    // Cache results
    this.cacheResults(cacheKey, paginatedResults);
    
    return {
      tracks: paginatedResults,
      totalResults: results.length,
      query,
      filters,
      providers: this.getActiveProviders(filters),
      searchTime: Date.now() - startTime
    };
  }

  private filterAndSortResults(query: string, filters: SearchFilters): SearchResult[] {
    let results = [...MOCK_SEARCH_RESULTS];

    // Text search - search in title, artist, and album
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      results = results.filter(track => {
        const searchableText = [
          track.title,
          track.artist,
          track.metadata?.album || '',
          track.metadata?.genre || ''
        ].join(' ').toLowerCase();
        
        return searchTerms.some(term => searchableText.includes(term));
      });
    }

    // Apply filters
    if (filters.genres && filters.genres.length > 0) {
      results = results.filter(track => 
        filters.genres!.some(genre => 
          track.metadata?.genre?.toLowerCase().includes(genre.toLowerCase())
        )
      );
    }

    if (filters.year) {
      results = results.filter(track => {
        const year = track.metadata?.year || 2024;
        return year >= filters.year!.min && year <= filters.year!.max;
      });
    }

    if (filters.duration) {
      results = results.filter(track => 
        track.duration >= filters.duration!.min && 
        track.duration <= filters.duration!.max
      );
    }

    if (filters.providers && filters.providers.length > 0) {
      results = results.filter(track => 
        filters.providers!.includes(track.provider)
      );
    }

    if (filters.explicit !== undefined) {
      results = results.filter(track => track.isExplicit === filters.explicit);
    }

    // Sort results
    results = this.sortResults(results, filters.sortBy || 'relevance', query);

    return results;
  }

  private sortResults(results: SearchResult[], sortBy: string, query: string): SearchResult[] {
    return results.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'recent':
          return (b.metadata?.year || 0) - (a.metadata?.year || 0);
        case 'duration':
          return a.duration - b.duration;
        case 'relevance':
        default:
          // Simple relevance scoring based on exact matches in title/artist
          const scoreA = this.calculateRelevanceScore(a, query);
          const scoreB = this.calculateRelevanceScore(b, query);
          return scoreB - scoreA;
      }
    });
  }

  private calculateRelevanceScore(track: SearchResult, query: string): number {
    if (!query.trim()) return track.popularity;
    
    const queryLower = query.toLowerCase();
    const titleLower = track.title.toLowerCase();
    const artistLower = track.artist.toLowerCase();
    
    let score = 0;
    
    // Exact title match (highest score)
    if (titleLower === queryLower) score += 100;
    // Title starts with query
    else if (titleLower.startsWith(queryLower)) score += 50;
    // Title contains query
    else if (titleLower.includes(queryLower)) score += 25;
    
    // Artist matches
    if (artistLower === queryLower) score += 75;
    else if (artistLower.includes(queryLower)) score += 15;
    
    // Add popularity bonus (scaled down)
    score += track.popularity * 0.2;
    
    return score;
  }

  private getCacheKey(query: string, filters: SearchFilters, limit: number, offset: number): string {
    return JSON.stringify({ query, filters, limit, offset });
  }

  private getCachedResults(cacheKey: string): SearchResult[] | null {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp || Date.now() - timestamp > this.CACHE_TTL) {
      // Remove expired cache
      this.cache.delete(cacheKey);
      this.cacheTimestamps.delete(cacheKey);
      return null;
    }
    
    return this.cache.get(cacheKey) || null;
  }

  private cacheResults(cacheKey: string, results: SearchResult[]): void {
    this.cache.set(cacheKey, results);
    this.cacheTimestamps.set(cacheKey, Date.now());
    
    // Cleanup old cache entries (keep last 50)
    if (this.cache.size > 50) {
      const oldestKey = Array.from(this.cacheTimestamps.entries())
        .sort(([,a], [,b]) => a - b)[0][0];
      this.cache.delete(oldestKey);
      this.cacheTimestamps.delete(oldestKey);
    }
  }

  private getActiveProviders(filters: SearchFilters): string[] {
    if (filters.providers && filters.providers.length > 0) {
      return filters.providers;
    }
    return ['Spotify', 'Apple Music', 'YouTube Music', 'SoundCloud'];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get popular tracks for discovery
  async getPopularTracks(genre?: string, limit: number = 20): Promise<SearchResult[]> {
    await this.delay(200); // Simulate API delay
    
    let results = [...MOCK_SEARCH_RESULTS];
    
    if (genre) {
      results = results.filter(track => 
        track.metadata?.genre?.toLowerCase().includes(genre.toLowerCase())
      );
    }
    
    return results
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }

  // Get trending tracks
  async getTrendingTracks(timeframe: 'day' | 'week' | 'month' = 'week', limit: number = 20): Promise<SearchResult[]> {
    await this.delay(200);
    
    // Mock trending algorithm - mix of popularity and recency
    const results = [...MOCK_SEARCH_RESULTS]
      .map(track => ({
        ...track,
        trendingScore: track.popularity + Math.random() * 20 // Add some randomness
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);
    
    return results;
  }

  // Convert SearchResult to Track for audio engine
  searchResultToTrack(searchResult: SearchResult): Track {
    return {
      id: searchResult.id,
      title: searchResult.title,
      artist: searchResult.artist,
      artwork: searchResult.artwork,
      url: searchResult.url,
      duration: searchResult.duration,
      metadata: searchResult.metadata
    };
  }
}

// Export singleton instance
export const searchService = new SearchService();