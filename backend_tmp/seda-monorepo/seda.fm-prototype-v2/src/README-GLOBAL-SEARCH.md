# Global Search - README

## Overview
Global Search is sedā.fm's unified search interface that allows users to find tracks, artists, users, crates, rooms, and DJ sessions across the entire platform. It provides real-time results with filtering and keyboard navigation.

## Component Location
- **Main Component**: `/components/GlobalSearch.tsx`
- **Desktop Search**: `/components/DesktopSearch.tsx`
- **Mobile Search**: `/components/MobileSearch.tsx`
- **Search Modal**: `/components/SearchModal.tsx`

## Feature Description
Global Search provides:
- Real-time search across all content types
- Filtered results by category
- Keyboard navigation
- Recent searches
- Trending searches
- Quick actions
- Contextual results

## User Experience

### Accessing Search
- **Desktop**: Click search icon in sidebar or press `/` key
- **Mobile**: Tap search icon in header
- **Keyboard**: Press `/` from anywhere in app

### Search Flow
1. Open search interface
2. Type query
3. View real-time results
4. Filter by category (optional)
5. Navigate with keyboard or click
6. Select result
7. Navigate to destination

## Visual Design

### Desktop Modal
```
┌──────────────────────────────────────┐
│  🔍 Search sedā.fm           [×]     │
├──────────────────────────────────────┤
│  [All] Tracks Artists Users Crates   │
├──────────────────────────────────────┤
│  Results:                             │
│                                       │
│  🎵 Midnight Dreams - Luna Park      │
│  👤 Sarah (@sarahcurates)            │
│  📦 Late Night Vibes (12 tracks)     │
│  🎧 Chill Session (DJ Mode)          │
│                                       │
└──────────────────────────────────────┘
```

### Mobile View
```
┌────────────────────────┐
│  ←  🔍 Search          │
├────────────────────────┤
│  [Recent] [Trending]   │
├────────────────────────┤
│  🎵 Midnight Dreams    │
│  👤 Sarah              │
│  📦 Late Night Vibes   │
└────────────────────────┘
```

## Technical Implementation

### Component Structure
```typescript
export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    tracks: [],
    artists: [],
    users: [],
    crates: [],
    rooms: [],
    sessions: []
  });
  const [activeFilter, setActiveFilter] = useState<'all' | 'tracks' | 'artists' | 'users' | 'crates' | 'rooms'>('all');
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((q: string) => performSearch(q), 300),
    []
  );

  useEffect(() => {
    if (query.length > 0) {
      debouncedSearch(query);
    }
  }, [query]);

  return (
    <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <SearchInput 
        value={query} 
        onChange={setQuery}
        placeholder="Search tracks, artists, users..."
      />
      <FilterTabs 
        active={activeFilter} 
        onChange={setActiveFilter}
      />
      <SearchResults 
        results={results}
        filter={activeFilter}
        query={query}
      />
    </SearchModal>
  );
}
```

### State Management
```typescript
const {
  searchQuery,          // Current search text
  setSearchQuery,       // Update query
  searchResults,        // All search results
  searchHistory,        // Recent searches
  trendingSearches,     // Popular searches
  isSearching           // Loading state
} = useAppState();
```

### Data Structure
```typescript
interface SearchResults {
  tracks: Track[];
  artists: Artist[];
  users: FanUser[];
  crates: Crate[];
  rooms: Room[];
  sessions: DJSession[];
}

interface SearchResultItem {
  id: string;
  type: 'track' | 'artist' | 'user' | 'crate' | 'room' | 'session';
  title: string;
  subtitle?: string;
  image?: string;
  metadata?: Record<string, any>;
}
```

## Search Categories

### 1. Tracks
**Searchable Fields**:
- Track title
- Artist name
- Album name
- Genre
- Tags

**Result Display**:
```tsx
<TrackResult>
  <TrackArtwork src={track.artwork} />
  <TrackInfo>
    <TrackTitle>{track.title}</TrackTitle>
    <ArtistName>{track.artist}</ArtistName>
  </TrackInfo>
  <PlayButton onClick={() => playTrack(track)} />
</TrackResult>
```

### 2. Artists
**Searchable Fields**:
- Artist name
- Bio
- Genre
- Location

**Result Display**:
```tsx
<ArtistResult>
  <InitialBadge color={artist.accentColor}>
    {artist.name[0]}
  </InitialBadge>
  <ArtistInfo>
    <ArtistName>{artist.name}</ArtistName>
    <FollowerCount>{artist.followerCount} followers</FollowerCount>
  </ArtistInfo>
  <FollowButton />
</ArtistResult>
```

### 3. Users (Fans)
**Searchable Fields**:
- Display name
- Username
- Bio

**Result Display**:
```tsx
<UserResult>
  <InitialBadge color={user.accentColor}>
    {user.displayName[0]}
  </InitialBadge>
  <UserInfo>
    <DisplayName>{user.displayName}</DisplayName>
    <Username>@{user.username}</Username>
  </UserInfo>
  <FollowButton />
</UserResult>
```

### 4. Crates
**Searchable Fields**:
- Crate name
- Description
- Creator name
- Track names in crate

**Result Display**:
```tsx
<CrateResult>
  <CrateCover src={crate.coverImage} />
  <CrateInfo>
    <CrateName>{crate.name}</CrateName>
    <CrateMeta>{crate.trackCount} tracks · {crate.creator}</CrateMeta>
  </CrateInfo>
  <PlayButton />
</CrateResult>
```

### 5. Rooms
**Searchable Fields**:
- Room name
- Description
- Genre
- Tags

**Result Display**:
```tsx
<RoomResult>
  <RoomIcon />
  <RoomInfo>
    <RoomName>{room.name}</RoomName>
    <RoomMeta>{room.memberCount} members · {room.genre}</RoomMeta>
  </RoomInfo>
  <JoinButton />
</RoomResult>
```

### 6. DJ Sessions
**Searchable Fields**:
- Session name
- Host name
- Genre

**Result Display**:
```tsx
<SessionResult>
  <LiveIndicator />
  <SessionInfo>
    <SessionName>{session.name}</SessionName>
    <HostName>Hosted by {session.host.name}</HostName>
  </SessionInfo>
  <JoinButton />
</SessionResult>
```

## Search Features

### Real-Time Search
```typescript
const performSearch = async (query: string) => {
  setIsSearching(true);
  
  const results = await Promise.all([
    searchTracks(query),
    searchArtists(query),
    searchUsers(query),
    searchCrates(query),
    searchRooms(query),
    searchSessions(query)
  ]);
  
  setSearchResults({
    tracks: results[0],
    artists: results[1],
    users: results[2],
    crates: results[3],
    rooms: results[4],
    sessions: results[5]
  });
  
  setIsSearching(false);
};
```

### Debounced Input
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    if (query.length >= 2) {
      performSearch(query);
    }
  }, 300),
  []
);
```

### Recent Searches
```typescript
const saveSearchHistory = (query: string, resultId: string) => {
  const newHistory = [
    { query, resultId, timestamp: Date.now() },
    ...searchHistory.filter(h => h.query !== query).slice(0, 9)
  ];
  
  setSearchHistory(newHistory);
  localStorage.setItem('searchHistory', JSON.stringify(newHistory));
};
```

### Trending Searches
```typescript
const trendingSearches = [
  'electronic',
  'ambient',
  'hip hop',
  'experimental',
  'late night vibes'
];
```

## Keyboard Navigation

### Shortcuts
- `/` - Open search
- `Esc` - Close search
- `↑` / `↓` - Navigate results
- `Enter` - Select result
- `Tab` - Switch category
- `Ctrl+K` / `Cmd+K` - Open search (alternative)

### Implementation
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Open search
    if (e.key === '/' && !isOpen) {
      e.preventDefault();
      setIsOpen(true);
    }
    
    // Close search
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
    
    // Navigate results
    if (isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen, selectedIndex, results]);
```

## Filtering

### Filter Tabs
```tsx
<div className="filter-tabs">
  <FilterTab 
    active={activeFilter === 'all'}
    onClick={() => setActiveFilter('all')}
  >
    All
  </FilterTab>
  <FilterTab 
    active={activeFilter === 'tracks'}
    onClick={() => setActiveFilter('tracks')}
  >
    Tracks
  </FilterTab>
  <FilterTab 
    active={activeFilter === 'artists'}
    onClick={() => setActiveFilter('artists')}
  >
    Artists
  </FilterTab>
  {/* More filters... */}
</div>
```

### Result Filtering
```typescript
const getFilteredResults = () => {
  if (activeFilter === 'all') {
    return [
      ...results.tracks.slice(0, 3),
      ...results.artists.slice(0, 3),
      ...results.users.slice(0, 3),
      ...results.crates.slice(0, 3),
      ...results.rooms.slice(0, 2),
      ...results.sessions.slice(0, 2)
    ];
  }
  
  return results[activeFilter] || [];
};
```

## Search Algorithm

### Fuzzy Matching
```typescript
const fuzzyMatch = (query: string, text: string): number => {
  query = query.toLowerCase();
  text = text.toLowerCase();
  
  // Exact match
  if (text === query) return 100;
  
  // Starts with query
  if (text.startsWith(query)) return 90;
  
  // Contains query
  if (text.includes(query)) return 70;
  
  // Fuzzy score
  let score = 0;
  let lastIndex = -1;
  
  for (const char of query) {
    const index = text.indexOf(char, lastIndex + 1);
    if (index === -1) return 0;
    score += 50 / (index - lastIndex);
    lastIndex = index;
  }
  
  return Math.min(score, 60);
};
```

### Ranking
```typescript
const rankResults = (results: SearchResultItem[], query: string) => {
  return results
    .map(result => ({
      ...result,
      score: fuzzyMatch(query, result.title) + 
             (result.subtitle ? fuzzyMatch(query, result.subtitle) * 0.5 : 0)
    }))
    .filter(result => result.score > 30)
    .sort((a, b) => b.score - a.score);
};
```

## Design System

### Colors
- Background: `#0a0a0a`
- Modal: `#1a1a1a`
- Input: `#0a0a0a` with `#333` border
- Selected: `#333` background
- Text: `#fafafa`
- Placeholder: `#666`

### Typography
- Input: Default size
- Result titles: Default size
- Result subtitles: `font-mono text-sm opacity-70`
- Categories: `uppercase tracking-wide text-xs`

### Spacing
- Modal padding: 24px
- Result padding: 12px
- Gap between results: 8px
- Section spacing: 24px

## Empty States

### No Query
```tsx
<EmptyState>
  <RecentSearches searches={searchHistory} />
  <TrendingSearches searches={trendingSearches} />
</EmptyState>
```

### No Results
```tsx
<EmptyState>
  <Icon icon={SearchX} />
  <Message>No results found for "{query}"</Message>
  <Suggestion>Try different keywords or check your spelling</Suggestion>
</EmptyState>
```

### Loading State
```tsx
<LoadingState>
  <Skeleton count={5} />
</LoadingState>
```

## Mobile Experience

### Touch Optimizations
- Larger touch targets (48px minimum)
- Full-screen modal
- Swipe down to dismiss
- Bottom sheet on smaller screens
- Auto-focus input on open

### Mobile-Specific Features
```tsx
<MobileSearch>
  <SearchHeader>
    <BackButton onClick={onClose} />
    <SearchInput autoFocus />
  </SearchHeader>
  <QuickFilters>
    <FilterChip>Recent</FilterChip>
    <FilterChip>Trending</FilterChip>
  </QuickFilters>
  <SearchResults />
</MobileSearch>
```

## Performance Optimization

### Implemented
- Debounced search (300ms)
- Request deduplication
- Result caching
- Virtual scrolling for long lists
- Lazy load images
- Cancel pending requests on new search

### Memoization
```typescript
const filteredResults = useMemo(
  () => getFilteredResults(results, activeFilter),
  [results, activeFilter]
);

const sortedResults = useMemo(
  () => rankResults(filteredResults, query),
  [filteredResults, query]
);
```

## Analytics

### Track Events
```typescript
// Search performed
trackEvent('search_performed', {
  query,
  resultCount: results.length,
  filter: activeFilter
});

// Result selected
trackEvent('search_result_selected', {
  query,
  resultType: result.type,
  resultId: result.id,
  position: index
});

// Search abandoned
trackEvent('search_abandoned', {
  query,
  timeOpen: Date.now() - openTime
});
```

## Backend Integration (Future)

### API Endpoints (Planned)
```
GET /api/search?q={query}&type={type}    - Universal search
GET /api/search/tracks?q={query}         - Track search
GET /api/search/artists?q={query}        - Artist search
GET /api/search/users?q={query}          - User search
GET /api/search/crates?q={query}         - Crate search
GET /api/search/trending                  - Trending searches
POST /api/search/history                  - Save search
```

### Search Index (Planned)
- Elasticsearch or Algolia
- Full-text search
- Typo tolerance
- Synonyms
- Weighted fields
- Faceted search

## Accessibility

### Features
- Keyboard navigation
- Screen reader announcements
- ARIA labels
- Focus management
- Keyboard shortcuts help

### Implementation
```tsx
<SearchModal
  role="dialog"
  aria-label="Global search"
  aria-modal="true"
>
  <SearchInput
    aria-label="Search sedā.fm"
    aria-autocomplete="list"
    aria-controls="search-results"
    aria-activedescendant={selectedId}
  />
  <SearchResults
    id="search-results"
    role="listbox"
    aria-label="Search results"
  >
    {results.map((result, i) => (
      <SearchResult
        key={result.id}
        id={`result-${i}`}
        role="option"
        aria-selected={i === selectedIndex}
      >
        {result.title}
      </SearchResult>
    ))}
  </SearchResults>
</SearchModal>
```

## Testing Checklist

### Functionality
- [ ] Search executes on typing
- [ ] Results update in real-time
- [ ] Filters work correctly
- [ ] Keyboard navigation works
- [ ] Recent searches saved
- [ ] Trending searches display
- [ ] Result selection navigates correctly

### UI/UX
- [ ] Modal opens/closes smoothly
- [ ] Input is auto-focused
- [ ] Results display properly
- [ ] Loading states show
- [ ] Empty states handled
- [ ] Mobile responsive

### Performance
- [ ] Search is debounced
- [ ] No unnecessary re-renders
- [ ] Results cache
- [ ] Fast initial load
- [ ] Smooth scrolling

## Future Enhancements

### Planned Features
1. **Voice Search**
   - Speech recognition
   - Voice commands
   - Audio feedback

2. **Advanced Filters**
   - Date range
   - Play count
   - Genre combinations
   - BPM range

3. **Search Suggestions**
   - Auto-complete
   - Did you mean...
   - Related searches

4. **Visual Search**
   - Search by album art
   - Image recognition
   - Similar artwork

5. **Context-Aware**
   - Location-based
   - Time-based
   - Mood-based

## Related Features
- **Social Feed**: Search posts
- **Discover**: Find new content
- **Crates**: Search collections
- **Rooms**: Find communities
- **DJ Mode**: Search sessions

## Related Documentation
- `PRD-Global-Search.md` - Product requirements
- `ARCHITECTURE.md` - System design
- `COMPONENT-GUIDE.md` - Components
- `STATE-MANAGEMENT.md` - State patterns

## Quick Reference

### Open Search Programmatically
```typescript
const { setShowGlobalSearch } = useModals();
setShowGlobalSearch(true);
```

### Perform Search
```typescript
const handleSearch = async (query: string) => {
  const results = await searchAll(query);
  setSearchResults(results);
};
```

## Status
✅ **Current**: Working with mock data  
⏳ **Next**: Backend search API  
🚀 **Future**: Voice search, advanced filters, AI suggestions
