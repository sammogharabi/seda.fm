# PHASE_3_SPEC.md - Music Player & Advanced Features

## Phase 3 Feature Specifications (Implementation TBD)

### Overview
Phase 3 focuses on the core music experience: streaming integration, DJ Mode mechanics, and advanced discovery. These features transform sedā.fm from a social platform into a full music streaming experience.

## Music Player System

### Architecture Requirements
```typescript
interface PlayerService {
  // Provider-agnostic interface
  play(track: Track): Promise<void>
  pause(): void
  seek(position: number): void
  setVolume(level: number): void
  
  // Queue management
  addToQueue(tracks: Track[]): void
  removeFromQueue(trackId: string): void
  skipToNext(): void
  skipToPrevious(): void
  
  // State management
  getCurrentTrack(): Track | null
  getPlaybackState(): PlaybackState
  getCurrentPosition(): number
  getDuration(): number
  
  // Event system
  on(event: PlayerEvent, callback: Function): void
  off(event: PlayerEvent, callback: Function): void
}

interface PlaybackState {
  isPlaying: boolean
  isPaused: boolean
  isBuffering: boolean
  volume: number
  repeat: 'none' | 'one' | 'all'
  shuffle: boolean
}

type PlayerEvent = 'play' | 'pause' | 'ended' | 'error' | 'progress' | 'loaded'
```

### Provider Integration Strategy

#### Spotify Integration
```typescript
class SpotifyPlayerAdapter implements PlayerService {
  private spotifyApi: SpotifyApi
  private webPlaybackSDK: Spotify.Player
  
  constructor(accessToken: string) {
    // #COMPLETION_DRIVE: Spotify requires Premium subscription for playback
    // #SUGGEST_VERIFY: Check user subscription status before enabling
  }
  
  async play(track: Track): Promise<void> {
    if (!track.spotifyId) {
      throw new Error('Track not available on Spotify')
    }
    
    // Use Web Playback SDK for browser playback
    return this.webPlaybackSDK.resume()
  }
}
```

#### Apple Music Integration
```typescript
class AppleMusicPlayerAdapter implements PlayerService {
  private musicKit: MusicKit.MusicKitInstance
  
  constructor() {
    // #COMPLETION_DRIVE: Apple Music requires subscription and Safari/iOS
    // #SUGGEST_VERIFY: Check MusicKit.js browser support
  }
  
  async play(track: Track): Promise<void> {
    if (!track.appleMusicId) {
      throw new Error('Track not available on Apple Music')
    }
    
    return this.musicKit.play()
  }
}
```

#### Fallback Providers
```typescript
// YouTube Music (for tracks not on premium services)
class YouTubePlayerAdapter implements PlayerService {
  // Use YouTube Data API + iframe player
  // Limited by YouTube's terms of service
}

// SoundCloud (for independent artists)
class SoundCloudPlayerAdapter implements PlayerService {
  // Use SoundCloud Widget API
  // Good for independent/unsigned artists
}
```

### Cross-Platform Considerations

#### Mobile App Requirements
- **iOS**: AVAudioSession management, background playback
- **Android**: MediaSession, foreground service for playback
- **PWA**: Media Session API, service worker caching

#### Desktop Requirements
- **Electron**: Native media controls, system tray player
- **Web**: Picture-in-Picture mode, keyboard shortcuts

## DJ Mode System

### Queue Management Architecture
```typescript
interface DJQueue {
  currentTrack: Track | null
  upcomingTracks: QueuedTrack[]
  playHistory: PlayedTrack[]
  preloadBuffer: Track[] // Next 2-3 tracks buffered
  
  // Queue operations
  addTrack(track: Track, userId: string): Promise<QueuedTrack>
  removeTrack(queueId: string, userId: string): Promise<void>
  voteTrack(queueId: string, userId: string, vote: 'up' | 'down'): Promise<void>
  
  // Auto-management
  advanceQueue(): Promise<void>
  checkSkipConditions(): Promise<boolean>
  preloadNextTracks(): Promise<void>
}

interface QueuedTrack {
  id: string
  track: Track
  addedBy: User
  addedAt: Date
  votes: Vote[]
  position: number
  preloaded: boolean
  estimatedStartTime: Date
}

interface Vote {
  userId: string
  type: 'up' | 'down'
  createdAt: Date
}
```

### Voting & Skip Logic
```typescript
class DJModeService {
  private skipThreshold = 0.5 // 50% downvotes
  private minimumVotes = 5    // Need at least 5 votes
  
  async checkAutoSkip(track: QueuedTrack): Promise<boolean> {
    const { upvotes, downvotes } = this.countVotes(track.votes)
    const totalVotes = upvotes + downvotes
    
    if (totalVotes < this.minimumVotes) return false
    
    const downvoteRatio = downvotes / totalVotes
    
    // #COMPLETION_DRIVE: Using simple majority, may need weighting
    // #SUGGEST_VERIFY: Consider user reputation weighting
    
    return downvoteRatio >= this.skipThreshold
  }
  
  async handleTrackEnd(track: Track, channel: string): Promise<void> {
    // Record play statistics
    await this.recordPlay(track, channel)
    
    // Award DJ points to track submitter
    await this.awardDJPoints(track.addedBy, track.votes)
    
    // Advance to next track
    await this.advanceQueue(channel)
  }
}
```

### Preloading Strategy
```typescript
class TrackPreloader {
  private bufferSize = 3 // Preload next 3 tracks
  private providers = new Map<string, PlayerService>()
  
  async preloadQueue(queue: QueuedTrack[]): Promise<void> {
    const nextTracks = queue.slice(0, this.bufferSize)
    
    for (const queuedTrack of nextTracks) {
      try {
        await this.preloadTrack(queuedTrack.track)
        queuedTrack.preloaded = true
      } catch (error) {
        // #COMPLETION_DRIVE: Preload failures should not stop the queue
        // #SUGGEST_VERIFY: Have fallback tracks ready
        console.error('Preload failed:', error)
      }
    }
  }
  
  private async preloadTrack(track: Track): Promise<void> {
    const provider = this.providers.get(track.provider)
    if (!provider) throw new Error(`No provider for ${track.provider}`)
    
    // Preload without starting playback
    await provider.load(track)
  }
}
```

## Discovery & Search System

### Search Architecture
```typescript
interface SearchService {
  searchTracks(query: string, filters?: SearchFilters): Promise<Track[]>
  searchUsers(query: string, filters?: UserFilters): Promise<User[]>
  searchPlaylists(query: string, filters?: PlaylistFilters): Promise<Playlist[]>
  
  // Advanced search
  findSimilar(track: Track): Promise<Track[]>
  getRecommendations(user: User): Promise<Track[]>
  getTrending(genre?: string, timeframe?: string): Promise<Track[]>
}

interface SearchFilters {
  genres?: string[]
  year?: { min: number, max: number }
  duration?: { min: number, max: number }
  providers?: string[]
  explicit?: boolean
}
```

### Multi-Provider Search
```typescript
class UnifiedSearchService implements SearchService {
  private providers: Map<string, MusicProvider> = new Map()
  
  async searchTracks(query: string, filters?: SearchFilters): Promise<Track[]> {
    const searches = Array.from(this.providers.values()).map(provider => 
      provider.search(query, filters).catch(() => []) // Don't fail on single provider error
    )
    
    const results = await Promise.allSettled(searches)
    const allTracks = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value)
    
    // #COMPLETION_DRIVE: Simple concatenation, may need deduplication
    // #SUGGEST_VERIFY: Implement track matching algorithm
    
    return this.rankResults(allTracks, query)
  }
  
  private rankResults(tracks: Track[], query: string): Track[] {
    // Ranking algorithm considering:
    // - Query relevance
    // - Platform popularity
    // - User's listening history
    // - Community ratings
    
    return tracks.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, query)
      const scoreB = this.calculateRelevanceScore(b, query)
      return scoreB - scoreA
    })
  }
}
```

### Recommendation Engine
```typescript
class RecommendationEngine {
  async getUserRecommendations(userId: string): Promise<Track[]> {
    const user = await this.getUserWithHistory(userId)
    
    // Collaborative filtering
    const similarUsers = await this.findSimilarUsers(user)
    const collaborativeRecs = await this.getCollaborativeRecommendations(similarUsers)
    
    // Content-based filtering  
    const contentRecs = await this.getContentBasedRecommendations(user.listeningHistory)
    
    // Trending/popular content
    const trendingRecs = await this.getTrendingForUser(user)
    
    // #COMPLETION_DRIVE: Simple weight mixing, could use ML
    // #SUGGEST_VERIFY: A/B test different recommendation strategies
    
    return this.mergeRecommendations([
      { tracks: collaborativeRecs, weight: 0.4 },
      { tracks: contentRecs, weight: 0.4 },
      { tracks: trendingRecs, weight: 0.2 }
    ])
  }
}
```

## Advanced Social Features

### Activity Feed Algorithm
```typescript
class ActivityFeedService {
  async generateFeed(userId: string): Promise<Activity[]> {
    const user = await this.getUser(userId)
    const following = await this.getUserFollowing(userId)
    
    // Get raw activities
    const activities = await this.getRawActivities(following, user.preferences)
    
    // Apply relevance scoring
    const scoredActivities = activities.map(activity => ({
      ...activity,
      score: this.calculateRelevanceScore(activity, user)
    }))
    
    // #COMPLETION_DRIVE: Linear scoring, could use ML ranking
    // #SUGGEST_VERIFY: Track engagement metrics to improve algorithm
    
    return scoredActivities
      .sort((a, b) => b.score - a.score)
      .slice(0, 50) // Paginate
  }
  
  private calculateRelevanceScore(activity: Activity, user: User): number {
    let score = 0
    
    // Recency boost (exponential decay)
    const hoursAgo = (Date.now() - activity.createdAt.getTime()) / (1000 * 60 * 60)
    score += Math.exp(-hoursAgo / 24) * 100 // Decay over 24 hours
    
    // User interaction history
    if (user.frequentInteractions.includes(activity.userId)) {
      score += 50
    }
    
    // Content relevance
    if (this.matchesUserInterests(activity, user.interests)) {
      score += 30
    }
    
    // Engagement boost
    score += activity.likes * 2 + activity.comments * 5
    
    return score
  }
}
```

### Comments & Discussions
```typescript
interface CommentSystem {
  addComment(targetType: string, targetId: string, content: string): Promise<Comment>
  getComments(targetType: string, targetId: string, pagination: Pagination): Promise<Comment[]>
  likeComment(commentId: string): Promise<void>
  reportComment(commentId: string, reason: string): Promise<void>
  
  // Threading
  addReply(parentCommentId: string, content: string): Promise<Comment>
  getThread(commentId: string): Promise<Comment[]>
}

interface Comment {
  id: string
  content: string
  author: User
  createdAt: Date
  likes: number
  replies: Comment[]
  isEdited: boolean
  
  // Moderation
  isHidden: boolean
  reportCount: number
}
```

## Technical Challenges & Solutions

### Provider SDK Limitations
```typescript
// Different providers have different capabilities
const providerCapabilities = {
  spotify: {
    playback: 'premium-only',
    search: 'full',
    playlists: 'read-write',
    offline: false
  },
  apple: {
    playback: 'subscription-only', 
    search: 'limited',
    playlists: 'read-only',
    offline: 'limited'
  },
  youtube: {
    playback: 'limited', // Terms of service restrictions
    search: 'full',
    playlists: 'none',
    offline: false
  }
}
```

### Cross-Device Synchronization
```typescript
class CrossDeviceSync {
  async syncPlaybackState(userId: string, state: PlaybackState): Promise<void> {
    // Use WebSocket for real-time sync
    await this.broadcastToUserDevices(userId, {
      type: 'playback_state_update',
      state,
      timestamp: Date.now()
    })
    
    // Store in database for offline sync
    await this.updateUserPlaybackState(userId, state)
  }
  
  // Handle conflicts when multiple devices are active
  private async resolvePlaybackConflict(
    userId: string, 
    states: PlaybackState[]
  ): Promise<PlaybackState> {
    // Last-active device wins
    return states.sort((a, b) => b.lastActivity - a.lastActivity)[0]
  }
}
```

### Offline Functionality
```typescript
class OfflineManager {
  async cacheForOffline(tracks: Track[]): Promise<void> {
    // Only cache preview clips due to licensing
    for (const track of tracks) {
      if (track.previewUrl) {
        await this.cacheAudio(track.previewUrl, track.id)
        await this.cacheMetadata(track)
      }
    }
  }
  
  async getOfflineCapabilities(): Promise<OfflineCapabilities> {
    return {
      canCacheFullTracks: false, // Licensing restrictions
      canCachePreviews: true,
      canCacheMetadata: true,
      canQueueOffline: true,
      canSyncPlaylists: true
    }
  }
}
```

## Performance & Scalability

### Audio Streaming Optimization
```typescript
class StreamingOptimizer {
  private adaptiveBitrate = true
  private bufferTarget = 30 // seconds
  
  async optimizeStream(track: Track, connection: NetworkInfo): Promise<StreamConfig> {
    const bitrate = this.calculateOptimalBitrate(connection)
    const format = this.selectAudioFormat(connection.device)
    
    return {
      bitrate,
      format,
      bufferSize: this.bufferTarget,
      preloadNext: connection.speed > 'slow'
    }
  }
  
  private calculateOptimalBitrate(connection: NetworkInfo): number {
    // Adaptive bitrate based on connection
    const bitrateMap = {
      'slow-2g': 64,   // kbps
      '2g': 128,
      '3g': 192,
      '4g': 256,
      'wifi': 320
    }
    
    return bitrateMap[connection.speed] || 128
  }
}
```

### Search Performance
```typescript
class SearchOptimizer {
  private searchCache = new Map<string, CachedResult>()
  private readonly CACHE_TTL = 300000 // 5 minutes
  
  async optimizeSearch(query: string): Promise<Track[]> {
    // Check cache first
    const cached = this.searchCache.get(query)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.results
    }
    
    // Use debouncing for real-time search
    await this.debounce(500)
    
    // Parallel provider search with timeout
    const results = await this.searchWithTimeout(query, 3000)
    
    // Cache results
    this.searchCache.set(query, {
      results,
      timestamp: Date.now()
    })
    
    return results
  }
}
```

## Next Steps for Phase 3

### Research Phase (1-2 weeks)
1. **Provider API Analysis**
   - Study Spotify Web API limitations
   - Research Apple MusicKit.js capabilities  
   - Investigate YouTube Music API options
   - Analyze SoundCloud integration possibilities

2. **Legal & Licensing Review**
   - Music streaming rights requirements
   - Preview vs full-track playback rules
   - Geographic restrictions handling
   - DMCA compliance requirements

3. **Technical Feasibility**
   - Cross-platform audio streaming
   - Offline playback capabilities
   - Real-time synchronization architecture
   - Performance benchmarking

### Prototype Phase (2-3 weeks)
1. **Basic Player Integration**
   - Single-provider playback (likely Spotify)
   - Simple queue management
   - Web-only implementation

2. **Search MVP**
   - Single-provider search
   - Basic result ranking
   - Search result caching

3. **DJ Mode Prototype**
   - Queue visualization
   - Basic voting mechanism
   - Manual track advancement

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Spotify API restrictions | High | High | Multi-provider fallback |
| Licensing complexities | High | High | Legal consultation, preview-only mode |
| Cross-platform playback | Medium | High | Progressive enhancement |
| Performance at scale | Medium | Medium | CDN, aggressive caching |
| User adoption | Low | High | Beta testing, gradual rollout |