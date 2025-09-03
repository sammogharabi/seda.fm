# SEARCH_STRATEGY.md - Discovery & Search Implementation

## Search Architecture Overview

### Multi-Tier Search Strategy

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Real-time     │    │    Indexed      │    │   External      │
│   Database      │    │    Search       │    │   Provider      │
│   (PostgreSQL)  │    │  (Typesense/    │    │     APIs        │
│                 │    │  Meilisearch)   │    │  (Spotify/etc)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Unified Search Service                       │
│  • Query parsing & intent detection                            │
│  • Result aggregation & deduplication                          │
│  • Relevance scoring & ranking                                 │
│  • Caching & performance optimization                          │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: PostgreSQL Full-Text Search (MVP)

### Database Search Implementation
```sql
-- Full-text search configuration
CREATE TEXT SEARCH CONFIGURATION seda_search (COPY = english);
CREATE TEXT SEARCH DICTIONARY seda_stems (
    TEMPLATE = snowball,
    Language = english
);
ALTER TEXT SEARCH CONFIGURATION seda_search 
    ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part 
    WITH seda_stems;

-- Search indexes
CREATE INDEX idx_users_search ON users USING gin(
    to_tsvector('seda_search', 
        coalesce(username, '') || ' ' || 
        coalesce(display_name, '') || ' ' || 
        coalesce(bio, '')
    )
);

CREATE INDEX idx_playlists_search ON playlists USING gin(
    to_tsvector('seda_search', 
        coalesce(name, '') || ' ' || 
        coalesce(description, '')
    )
);

-- Track search (stored metadata)
CREATE INDEX idx_track_refs_search ON track_refs USING gin(
    to_tsvector('seda_search', 
        coalesce(metadata->>'title', '') || ' ' || 
        coalesce(metadata->>'artist', '') || ' ' || 
        coalesce(metadata->>'album', '')
    )
);
```

### TypeScript Search Service
```typescript
class PostgreSQLSearchService {
  async searchUsers(query: string, limit = 20): Promise<User[]> {
    const searchQuery = this.parseQuery(query)
    
    return this.prisma.$queryRaw`
      SELECT *, 
             ts_rank(
               to_tsvector('seda_search', 
                 coalesce(username, '') || ' ' || 
                 coalesce(display_name, '') || ' ' || 
                 coalesce(bio, '')
               ), 
               plainto_tsquery('seda_search', ${searchQuery})
             ) as rank
      FROM users 
      WHERE to_tsvector('seda_search', 
              coalesce(username, '') || ' ' || 
              coalesce(display_name, '') || ' ' || 
              coalesce(bio, '')
            ) @@ plainto_tsquery('seda_search', ${searchQuery})
      ORDER BY rank DESC, follower_count DESC
      LIMIT ${limit}
    `
  }
  
  async searchPlaylists(query: string, userId?: string, limit = 20): Promise<Playlist[]> {
    // #COMPLETION_DRIVE: Assuming public playlists only for non-authenticated
    // #SUGGEST_VERIFY: Add privacy filtering based on user relationships
    
    const privacyFilter = userId ? '' : 'AND is_public = true'
    
    return this.prisma.$queryRaw`
      SELECT p.*, u.username as owner_username,
             ts_rank(
               to_tsvector('seda_search', p.name || ' ' || coalesce(p.description, '')), 
               plainto_tsquery('seda_search', ${query})
             ) as rank
      FROM playlists p
      JOIN users u ON p.owner_id = u.id
      WHERE to_tsvector('seda_search', p.name || ' ' || coalesce(p.description, '')) 
            @@ plainto_tsquery('seda_search', ${query})
            ${privacyFilter}
      ORDER BY rank DESC, followers_count DESC
      LIMIT ${limit}
    `
  }
  
  private parseQuery(query: string): string {
    // Basic query preprocessing
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .split(/\s+/)
      .filter(word => word.length > 2)
      .join(' & ') // PostgreSQL AND operator
  }
}
```

## Phase 2: Typesense Integration (Enhanced)

### Typesense Schema Configuration
```typescript
const typesenseCollections = {
  users: {
    name: 'users',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'username', type: 'string' },
      { name: 'display_name', type: 'string', optional: true },
      { name: 'bio', type: 'string', optional: true },
      { name: 'is_artist', type: 'bool' },
      { name: 'verified', type: 'bool' },
      { name: 'follower_count', type: 'int32' },
      { name: 'dj_points', type: 'int32' },
      { name: 'genres', type: 'string[]', optional: true },
      { name: 'created_at', type: 'int64' }
    ],
    default_sorting_field: 'follower_count'
  },
  
  playlists: {
    name: 'playlists',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string', optional: true },
      { name: 'owner_username', type: 'string' },
      { name: 'owner_verified', type: 'bool' },
      { name: 'is_public', type: 'bool' },
      { name: 'followers_count', type: 'int32' },
      { name: 'item_count', type: 'int32' },
      { name: 'genres', type: 'string[]', optional: true },
      { name: 'last_updated', type: 'int64' },
      { name: 'created_at', type: 'int64' }
    ],
    default_sorting_field: 'followers_count'
  },
  
  tracks: {
    name: 'tracks',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'artist', type: 'string' },
      { name: 'album', type: 'string', optional: true },
      { name: 'provider', type: 'string' },
      { name: 'provider_id', type: 'string' },
      { name: 'duration', type: 'int32' },
      { name: 'genres', type: 'string[]', optional: true },
      { name: 'play_count', type: 'int32' },
      { name: 'like_count', type: 'int32' },
      { name: 'last_played', type: 'int64', optional: true }
    ],
    default_sorting_field: 'play_count'
  }
}

class TypesenseSearchService {
  private client: Client
  
  async searchMulti(query: string, filters: SearchFilters = {}): Promise<SearchResults> {
    const searches = {
      searches: [
        {
          collection: 'users',
          q: query,
          query_by: 'username,display_name,bio',
          filter_by: this.buildUserFilter(filters),
          sort_by: '_text_match:desc,follower_count:desc',
          limit: filters.userLimit || 10
        },
        {
          collection: 'playlists', 
          q: query,
          query_by: 'name,description,owner_username',
          filter_by: this.buildPlaylistFilter(filters),
          sort_by: '_text_match:desc,followers_count:desc',
          limit: filters.playlistLimit || 10
        },
        {
          collection: 'tracks',
          q: query,
          query_by: 'title,artist,album',
          filter_by: this.buildTrackFilter(filters),
          sort_by: '_text_match:desc,play_count:desc',
          limit: filters.trackLimit || 20
        }
      ]
    }
    
    const response = await this.client.multiSearch.perform(searches)
    
    return {
      users: this.parseUserResults(response.results[0]),
      playlists: this.parsePlaylistResults(response.results[1]),
      tracks: this.parseTrackResults(response.results[2]),
      query,
      took: Math.max(...response.results.map(r => r.search_time_ms))
    }
  }
  
  private buildUserFilter(filters: SearchFilters): string {
    const conditions = []
    
    if (filters.verified !== undefined) {
      conditions.push(`verified:${filters.verified}`)
    }
    
    if (filters.isArtist !== undefined) {
      conditions.push(`is_artist:${filters.isArtist}`)
    }
    
    if (filters.minFollowers) {
      conditions.push(`follower_count:>=${filters.minFollowers}`)
    }
    
    if (filters.genres?.length) {
      conditions.push(`genres:[${filters.genres.join(',')}]`)
    }
    
    return conditions.join(' && ')
  }
}
```

## Phase 3: External Provider Integration

### Multi-Provider Search Aggregation
```typescript
class UnifiedSearchService {
  private localSearch: TypesenseSearchService
  private providers: Map<string, MusicProvider>
  private cache: Map<string, CachedSearchResult>
  
  async searchTracks(query: string, options: SearchOptions): Promise<Track[]> {
    const cacheKey = this.getCacheKey(query, options)
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (Date.now() - cached.timestamp < 300000) { // 5 min cache
        return cached.results
      }
    }
    
    // Parallel search across providers
    const searches = [
      this.localSearch.searchTracks(query),
      ...Array.from(this.providers.values()).map(provider => 
        provider.searchTracks(query).catch(() => []) // Don't fail on provider errors
      )
    ]
    
    const results = await Promise.allSettled(searches)
    const allTracks = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value)
    
    // Deduplicate and rank
    const deduplicatedTracks = this.deduplicateTracks(allTracks)
    const rankedTracks = this.rankSearchResults(deduplicatedTracks, query, options)
    
    // Cache results
    this.cache.set(cacheKey, {
      results: rankedTracks,
      timestamp: Date.now()
    })
    
    return rankedTracks.slice(0, options.limit || 50)
  }
  
  private deduplicateTracks(tracks: Track[]): Track[] {
    const seen = new Map<string, Track>()
    
    for (const track of tracks) {
      const key = this.generateTrackKey(track)
      
      if (!seen.has(key)) {
        seen.set(key, track)
      } else {
        // Merge provider information
        const existing = seen.get(key)!
        existing.availableOn = [...(existing.availableOn || []), track.provider]
      }
    }
    
    return Array.from(seen.values())
  }
  
  private generateTrackKey(track: Track): string {
    // Normalize for matching
    const artist = this.normalizeString(track.artist)
    const title = this.normalizeString(track.title)
    
    return `${artist}::${title}`
  }
  
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}
```

## Advanced Search Features

### Intent Detection & Query Parsing
```typescript
class QueryParser {
  private patterns = {
    user: /^@(\w+)$/,
    playlist: /^playlist:(.+)$/i,
    genre: /^genre:(\w+)$/i,
    artist: /^artist:(.+)$/i,
    year: /^year:(\d{4})$/,
    duration: /^duration:([<>])(\d+)$/,
    provider: /^on:(spotify|apple|youtube|soundcloud)$/i
  }
  
  parseQuery(query: string): ParsedQuery {
    const tokens = query.split(/\s+/)
    const filters: QueryFilters = {}
    const searchTerms: string[] = []
    
    for (const token of tokens) {
      let matched = false
      
      for (const [type, pattern] of Object.entries(this.patterns)) {
        const match = token.match(pattern)
        if (match) {
          this.applyFilter(filters, type, match[1])
          matched = true
          break
        }
      }
      
      if (!matched) {
        searchTerms.push(token)
      }
    }
    
    return {
      intent: this.detectIntent(filters, searchTerms),
      filters,
      searchTerms: searchTerms.join(' '),
      originalQuery: query
    }
  }
  
  private detectIntent(filters: QueryFilters, terms: string[]): SearchIntent {
    if (filters.user) return 'user_search'
    if (filters.playlist) return 'playlist_search'
    if (terms.some(term => this.isArtistName(term))) return 'artist_search'
    if (terms.some(term => this.isSongTitle(term))) return 'track_search'
    
    return 'general_search'
  }
}
```

### Personalized Search Ranking
```typescript
class PersonalizedRanking {
  async rankForUser(results: SearchResult[], userId: string): Promise<SearchResult[]> {
    const user = await this.getUserProfile(userId)
    
    return results
      .map(result => ({
        ...result,
        personalizedScore: this.calculatePersonalizedScore(result, user)
      }))
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
  }
  
  private calculatePersonalizedScore(result: SearchResult, user: UserProfile): number {
    let score = result.baseRelevanceScore
    
    // Genre preference boost
    if (result.genres?.some(genre => user.preferredGenres.includes(genre))) {
      score += 20
    }
    
    // Social signals
    if (result.type === 'user' && user.following.includes(result.id)) {
      score += 50 // Boost people you follow
    }
    
    if (result.type === 'playlist' && user.likedPlaylists.includes(result.id)) {
      score += 30 // Boost playlists you've liked
    }
    
    // Listening history similarity
    if (result.type === 'track') {
      const artistSimilarity = this.calculateArtistSimilarity(
        result.artist, 
        user.topArtists
      )
      score += artistSimilarity * 15
    }
    
    // Recency boost for dynamic content
    if (result.lastUpdated) {
      const hoursAgo = (Date.now() - result.lastUpdated.getTime()) / (1000 * 60 * 60)
      score += Math.exp(-hoursAgo / 168) * 10 // Decay over a week
    }
    
    return score
  }
}
```

## Performance Optimization

### Search Caching Strategy
```typescript
class SearchCache {
  private redis: Redis
  private localCache = new Map<string, CachedResult>()
  
  async get(query: string, filters: SearchFilters): Promise<SearchResult[] | null> {
    const key = this.getCacheKey(query, filters)
    
    // L1: Memory cache (fastest)
    if (this.localCache.has(key)) {
      const cached = this.localCache.get(key)!
      if (Date.now() - cached.timestamp < 60000) { // 1 minute
        return cached.results
      }
    }
    
    // L2: Redis cache (shared across instances)
    const cached = await this.redis.get(key)
    if (cached) {
      const parsed = JSON.parse(cached) as CachedResult
      if (Date.now() - parsed.timestamp < 300000) { // 5 minutes
        this.localCache.set(key, parsed)
        return parsed.results
      }
    }
    
    return null
  }
  
  async set(query: string, filters: SearchFilters, results: SearchResult[]): Promise<void> {
    const key = this.getCacheKey(query, filters)
    const cached: CachedResult = {
      results,
      timestamp: Date.now()
    }
    
    // Store in both caches
    this.localCache.set(key, cached)
    await this.redis.setex(key, 300, JSON.stringify(cached)) // 5 min TTL
  }
}
```

### Search Analytics & Optimization
```typescript
class SearchAnalytics {
  async trackSearch(query: string, results: SearchResult[], userId?: string): Promise<void> {
    const searchEvent = {
      query,
      userId,
      resultCount: results.length,
      hasResults: results.length > 0,
      queryType: this.classifyQuery(query),
      timestamp: new Date()
    }
    
    // Track to analytics service (PostHog)
    await this.analytics.track('search_performed', searchEvent, userId)
    
    // Store for search optimization
    await this.storeSearchLog(searchEvent)
  }
  
  async getSearchInsights(): Promise<SearchInsights> {
    const [
      popularQueries,
      zeroResultQueries,
      queryTypes,
      performanceMetrics
    ] = await Promise.all([
      this.getPopularQueries(),
      this.getZeroResultQueries(),
      this.getQueryTypeDistribution(),
      this.getPerformanceMetrics()
    ])
    
    return {
      popularQueries,
      zeroResultQueries,
      queryTypes,
      performanceMetrics,
      recommendations: this.generateOptimizationRecommendations()
    }
  }
  
  private generateOptimizationRecommendations(): string[] {
    // Analyze search patterns and suggest improvements
    // - Missing content areas
    // - Slow query patterns
    // - Common zero-result queries
    
    return [
      'Consider adding synonyms for music genres',
      'Improve artist name normalization',
      'Add auto-complete for common searches'
    ]
  }
}
```

## Migration Strategy

### Phase 1 → Phase 2 Migration
```typescript
class SearchMigration {
  async migrateToTypesense(): Promise<void> {
    // 1. Set up Typesense collections
    await this.setupTypesenseSchema()
    
    // 2. Bulk index existing data
    await this.bulkIndexUsers()
    await this.bulkIndexPlaylists() 
    await this.bulkIndexTracks()
    
    // 3. Set up real-time sync
    await this.setupRealTimeSync()
    
    // 4. Feature flag rollout
    await this.enableTypesenseSearch()
  }
  
  private async setupRealTimeSync(): Promise<void> {
    // Listen to database changes and update search index
    this.prisma.$use(async (params, next) => {
      const result = await next(params)
      
      // Update search index on data changes
      if (params.action === 'create' || params.action === 'update') {
        await this.updateSearchIndex(params.model, result)
      }
      
      return result
    })
  }
}
```

This search strategy provides a clear evolution path from basic PostgreSQL search to a sophisticated multi-provider system with personalization and real-time updates. The modular approach allows for incremental implementation and testing at each phase.