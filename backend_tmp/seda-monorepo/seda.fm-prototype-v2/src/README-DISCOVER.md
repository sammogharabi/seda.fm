# Discover View - README

## Overview
The Discover View is sedā.fm's music discovery hub where users explore new artists, tracks, crates, and rooms. It's designed to surface both trending content and personalized recommendations.

## Component Location
- **Main Component**: `/components/DiscoverView.tsx`

## Feature Description
Discover View provides:
- Curated music recommendations
- Trending tracks and artists
- Genre-based exploration
- Community crates and rooms
- Personalized discovery based on listening habits

## User Experience

### Navigation
Users can discover content through:
1. **Trending Section** - Hot tracks and artists
2. **For You** - Personalized recommendations
3. **Genres** - Browse by musical style
4. **New Releases** - Latest uploads
5. **Community Picks** - Staff/community curated

### Interaction Patterns
- Horizontal scrolling carousels
- Tap to preview
- Long press for options
- Pull to refresh
- Infinite scroll

## Layout Structure

### Desktop Layout
```
┌─────────────────────────────────────┐
│  Discover Header                    │
├─────────────────────────────────────┤
│  Trending Now                       │
│  [Track] [Track] [Track] [Track]    │
├─────────────────────────────────────┤
│  New Releases                       │
│  [Album] [Album] [Album] [Album]    │
├─────────────────────────────────────┤
│  Featured Crates                    │
│  [Crate] [Crate] [Crate] [Crate]   │
├─────────────────────────────────────┤
│  Artists to Follow                  │
│  [Artist] [Artist] [Artist]         │
└─────────────────────────────────────┘
```

### Mobile Layout
```
┌────────────────────┐
│  Discover Header   │
├────────────────────┤
│  Trending Now      │
│  ← Scroll →        │
├────────────────────┤
│  New Releases      │
│  ← Scroll →        │
├────────────────────┤
│  Featured Crates   │
│  ← Scroll →        │
└────────────────────┘
```

## Technical Implementation

### Component Structure
```typescript
export function DiscoverView() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [featuredCrates, setFeaturedCrates] = useState<Crate[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<Artist[]>([]);

  return (
    <div className="space-y-8">
      <DiscoverHeader />
      <GenreFilter selected={selectedGenre} onChange={setSelectedGenre} />
      <TrendingSection tracks={trendingTracks} />
      <NewReleasesSection tracks={newReleases} />
      <FeaturedCratesSection crates={featuredCrates} />
      <ArtistsToFollowSection artists={featuredArtists} />
    </div>
  );
}
```

### State Management
```typescript
const {
  discoverContent,      // All discover data
  selectedGenre,        // Current genre filter
  setSelectedGenre,     // Update genre
  refreshDiscover       // Reload content
} = useAppState();
```

### Data Structure
```typescript
interface DiscoverContent {
  trending: {
    tracks: Track[];
    artists: Artist[];
    crates: Crate[];
  };
  newReleases: Track[];
  forYou: Track[];
  genres: {
    name: string;
    tracks: Track[];
  }[];
  featuredCrates: Crate[];
  featuredArtists: Artist[];
  communityPicks: Track[];
}
```

## Content Sections

### 1. Trending Now
- Top tracks by play count
- Rising artists
- Viral content
- Updates every hour
- Shows past 24h activity

### 2. For You
- Personalized recommendations
- Based on listening history
- Similar to liked tracks
- Artist connections
- Genre preferences

### 3. Genre Browser
Available genres:
- Electronic
- Hip-Hop
- R&B
- Indie
- Rock
- Jazz
- Experimental
- Ambient

### 4. New Releases
- Latest 50 uploads
- Sorted by upload date
- Artist subscriber notifications
- Filter by following

### 5. Featured Crates
- Staff curated
- Community highlights
- Themed collections
- Seasonal selections

### 6. Artists to Follow
- Rising artists
- Active community members
- Genre-based suggestions
- Similar artist recommendations

## Design System

### Visual Style
- Grid/carousel hybrid layout
- Large album artwork
- Minimal text overlay
- Underground aesthetic
- Dark mode optimized

### Colors
- Background: `#0a0a0a`
- Cards: `#1a1a1a`
- Accent: Contextual (coral/blue/mint/yellow)
- Text: `#fafafa`

### Card Patterns
```tsx
<Card className="bg-[#1a1a1a] border-[#333] hover:border-[#ff6b6b] transition-colors">
  <div className="aspect-square relative">
    <img src={track.artwork} alt={track.title} />
    <PlayButton className="absolute inset-0" />
  </div>
  <div className="p-4">
    <h3>{track.title}</h3>
    <p className="font-mono text-sm opacity-70">{artist.name}</p>
  </div>
</Card>
```

## User Interactions

### Play Track
1. Click/tap track card
2. Track preview plays
3. Add to queue option appears
4. Play full track option
5. Navigate to track detail

### Follow Artist
1. Click artist card
2. Quick follow button
3. Or navigate to full profile
4. Follow confirmation toast
5. Artist added to following

### Save to Crate
1. Click track options (•••)
2. Select "Add to Crate"
3. Choose existing or create new
4. Confirmation toast
5. Track saved

## Filtering & Sorting

### Available Filters
- **Genre**: All genres + subgenres
- **Mood**: Energetic, Chill, Dark, Uplifting
- **Era**: New, Recent, Classic
- **Length**: Short (<3min), Medium, Long (>6min)

### Sort Options
- Most Recent
- Most Popular
- Trending (velocity)
- Recommended (personalized)
- Alphabetical

## Mobile Experience

### Touch Gestures
- Swipe to scroll carousels
- Long press for quick actions
- Pull down to refresh
- Double tap to like
- Swipe up for more details

### Performance
- Lazy load images
- Virtualized lists
- Intersection observer for carousels
- Debounced scroll handlers
- Optimistic UI updates

## Mock Data
Located in `/data/mockData.ts`:
```typescript
const mockDiscoverContent = {
  trending: {
    tracks: [...topTracks],
    artists: [...topArtists],
    crates: [...popularCrates]
  },
  newReleases: [...recentTracks],
  forYou: [...personalizedTracks],
  genres: [
    {
      name: 'Electronic',
      tracks: [...]
    }
  ],
  featuredCrates: [...staffPicks],
  featuredArtists: [...featuredArtists]
};
```

## Backend Integration (Future)

### API Endpoints (Planned)
```
GET /api/discover/trending      - Trending content
GET /api/discover/for-you       - Personalized recommendations
GET /api/discover/new-releases  - Latest uploads
GET /api/discover/genre/:genre  - Genre-specific content
GET /api/discover/featured      - Staff curated content
```

### Recommendation Algorithm (Planned)
```typescript
interface RecommendationFactors {
  listeningHistory: Track[];
  followedArtists: Artist[];
  savedCrates: Crate[];
  genrePreferences: string[];
  timeOfDay: string;
  location?: string;
  similarUsers: User[];
}
```

## Analytics Integration

### Tracking Events
```typescript
// Track user interactions
trackEvent('discover_view', {
  section: 'trending',
  action: 'play_track',
  trackId: track.id
});

trackEvent('discover_view', {
  section: 'for_you',
  action: 'follow_artist',
  artistId: artist.id
});
```

### Metrics
- Section engagement rates
- Click-through rates
- Average session duration
- Conversion to follows/plays
- Genre preferences

## Integration Points

### Social Feed
- Share discovered tracks
- Post about new finds
- Comment on recommendations
- Engage with community picks

### Profile
- Discovered artists in following
- Saved tracks in library
- Crates from discovery
- Listening history

### DJ Mode
- Queue tracks from discover
- Create sets from sections
- Mix trending content
- Showcase new releases

## Personalization Algorithm

### How It Works
1. **Initial State**: Generic trending content
2. **Learning Phase**: Track user interactions
3. **Personalized**: Custom "For You" section
4. **Refinement**: Continuous improvement

### Factors Considered
- Play duration (skipped vs. completed)
- Explicit saves/likes
- Artist follows
- Genre exploration
- Time-based patterns
- Similar user behavior

## Testing Checklist

### Functionality
- [ ] All sections load correctly
- [ ] Genre filter works
- [ ] Track playback functional
- [ ] Follow artist works
- [ ] Add to crate works
- [ ] Refresh updates content
- [ ] Infinite scroll loads more

### UI/UX
- [ ] Responsive on all devices
- [ ] Carousels scroll smoothly
- [ ] Images load progressively
- [ ] Loading states display
- [ ] Empty states handled
- [ ] Error states show retry

### Performance
- [ ] Initial load < 2s
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Efficient re-renders
- [ ] Memory usage optimized

## Content Curation Strategy

### Staff Picks Process
1. Team reviews new uploads weekly
2. Select standout tracks/artists
3. Create themed collections
4. Update featured sections
5. Rotate regularly

### Community Picks
- User submissions
- Voting system
- Curator program
- Quality standards
- Regular rotation

## Accessibility

### Features
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- Skip navigation links
- Alt text for images

### Keyboard Shortcuts
- `Tab` - Navigate cards
- `Enter` - Play/open
- `Space` - Quick preview
- `F` - Follow artist
- `S` - Save to crate

## Error Handling

### Network Errors
```typescript
if (fetchError) {
  return (
    <ErrorState
      message="Unable to load discover content"
      action={() => refreshDiscover()}
      actionLabel="Try Again"
    />
  );
}
```

### Empty States
```typescript
if (trendingTracks.length === 0) {
  return (
    <EmptyState
      icon={Music}
      message="No trending tracks right now"
      description="Check back soon for new discoveries"
    />
  );
}
```

## Future Enhancements

### Planned Features
1. **AI Recommendations**
   - Advanced ML models
   - Mood detection
   - Context-aware suggestions

2. **Social Discovery**
   - See what friends are listening to
   - Collaborative discovery sessions
   - Shared crates

3. **Live Discovery**
   - Real-time trending updates
   - Live DJ sets
   - Premieres and releases

4. **Discovery Radio**
   - Continuous play mode
   - Genre-based stations
   - Artist radio

5. **Advanced Filters**
   - BPM range
   - Key/scale
   - Vocal/instrumental
   - Release year

6. **Discovery Challenges**
   - Genre exploration badges
   - Discovery streaks
   - Community challenges

## Related Features
- **Social Feed**: Share discoveries
- **Crates**: Save discovered tracks
- **DJ Mode**: Use discovered tracks
- **Profile**: Show discovery stats
- **Global Search**: Find specific content

## Performance Optimization

### Implemented
- React.memo on card components
- Virtual scrolling for long lists
- Image lazy loading
- Debounced search/filter
- Request deduplication

### TODO
- Service worker caching
- Prefetch on hover
- Progressive image loading
- CDN for media
- Edge caching

## SEO Considerations

### Metadata
- Dynamic page titles
- Meta descriptions
- Open Graph tags
- Schema.org markup
- Canonical URLs

### Crawlability
- Server-side rendering (future)
- Sitemap generation
- Robots.txt
- Structured data

## Related Documentation
- `ARCHITECTURE.md` - System design
- `COMPONENT-GUIDE.md` - Component patterns
- `STATE-MANAGEMENT.md` - State handling
- `README-CRATES.md` - Crate integration
- `README-SOCIAL-FEED.md` - Social features

## Quick Reference

### Load Discover Content
```typescript
useEffect(() => {
  const loadDiscover = async () => {
    setLoading(true);
    const content = await fetchDiscoverContent(selectedGenre);
    setDiscoverContent(content);
    setLoading(false);
  };
  
  loadDiscover();
}, [selectedGenre]);
```

### Handle Track Play
```typescript
const handlePlayTrack = (track: Track) => {
  setNowPlaying(track);
  addToQueue(track);
  trackEvent('discover_play', { trackId: track.id });
  toast.success(`Playing ${track.title}`);
};
```

## Status
✅ **Current**: Working with mock data  
⏳ **Next**: Personalization algorithm  
🚀 **Future**: AI recommendations, social discovery
