# Social Feed Feature - README

## Overview
The Social Feed is the central hub of sedā.fm, providing a chronological, Bluesky-like feed experience where users discover content, engage with posts, and connect with the music community.

## Component Location
- **Main Component**: `/components/SocialFeed.tsx`
- **Supporting Components**: 
  - `/components/CreatePostModal.tsx` - Post creation
  - `/components/Comments.tsx` - Comment threads
  - `/components/LinkPreview.tsx` - Link previews
  - `/components/PostTypeTabs.tsx` - Post filtering

## Feature Description

### What It Does
- Displays chronological feed of posts from followed users
- Shows posts with tracks, text, and media
- Supports engagement (likes, reposts, comments)
- Filter posts by type (All, Tracks, Text, Media)
- Inline track playback
- Comment threads
- Link previews for external URLs

### User Experience
1. User opens app to Social Feed by default
2. Scrolls through chronological posts
3. Can filter by post type using tabs
4. Clicks play button to hear tracks
5. Likes, reposts, or comments on content
6. Creates new posts via floating compose button

## UI Components

### Post Card
- User initial badge (no avatars)
- Username and display name
- Timestamp
- Post content (text, track info, media)
- Engagement buttons (like, repost, comment, share)
- Engagement counts
- Track player if applicable

### Post Types
1. **Track Posts** - Featured track with play button and metadata
2. **Text Posts** - Text-only updates
3. **Media Posts** - Images/media with captions
4. **Link Posts** - URLs with preview cards

### Post Filtering
- **All Posts** - Shows all content types
- **Tracks** - Music posts only
- **Text** - Text-only posts
- **Media** - Image/media posts

## Technical Implementation

### State Management
```typescript
// From useAppState hook
const { 
  currentView,      // Navigation state
  nowPlaying,       // Currently playing track
  setNowPlaying     // Update playing track
} = useAppState();

// From useDataHandlers hook
const {
  handleLikePost,
  handleRepost,
  handleComment
} = useDataHandlers();
```

### Mock Data
```typescript
// Located in /data/mockData.ts
const mockPosts = [
  {
    id: string,
    userId: string,
    content: string,
    type: 'track' | 'text' | 'media',
    track?: Track,
    media?: string[],
    likes: number,
    reposts: number,
    comments: number,
    timestamp: string
  }
];
```

### Key Functions
```typescript
// Handle track playback
const handlePlayTrack = (track: Track) => {
  setNowPlaying(track);
};

// Handle post engagement
const handleLike = (postId: string) => {
  handleLikePost(postId);
};

// Open comments
const handleShowComments = (postId: string) => {
  setActivePost(postId);
  setShowComments(true);
};
```

## Design System

### Colors
- Background: `#0a0a0a`
- Post cards: `#1a1a1a` (elevated surface)
- Text: `#fafafa`
- Muted text: `#a0a0a0`
- Borders: `#333`
- Like button (active): Coral `#ff6b6b`

### Typography
- Usernames: `font-mono` (monospace)
- Display names: Default font
- Timestamps: Muted, smaller text
- Post content: Default body text

### Spacing
- Post cards: `p-4` padding
- Between posts: `space-y-4`
- Engagement buttons: `gap-6`

### Initial Badges
```tsx
<div 
  className="w-10 h-10 rounded-full flex items-center justify-center font-black border-2"
  style={{
    backgroundColor: `var(--color-accent-${user.accentColor})`,
    borderColor: `var(--color-accent-${user.accentColor})`
  }}
>
  {user.displayName[0]}
</div>
```

## User Interactions

### Post Actions
- **Like** - Click heart icon, count increments
- **Repost** - Click repost icon, shows in follower feeds
- **Comment** - Opens comment thread modal
- **Share** - Shows share options

### Track Actions
- **Play** - Starts track playback, shows in mini player
- **Add to Queue** - Adds track to DJ session queue
- **Add to Crate** - Saves track to user's crate

### Navigation
- **Click username/badge** - Navigate to user profile
- **Click track** - Shows track details
- **Click comment count** - Opens comment thread

## Mobile Responsiveness

### Mobile View (< 768px)
- Full-width post cards
- Stacked engagement buttons
- Touch-optimized tap targets
- Bottom navigation visible
- Compact spacing

### Tablet View (768px - 1024px)
- Centered feed with max width
- Side padding
- Hybrid navigation

### Desktop View (> 1024px)
- Max width centered feed
- Sidebar navigation
- Larger spacing
- Hover states

## Integration Points

### Navigation
- Default landing view when user opens app
- Accessible via home icon in sidebar/bottom nav
- Returns to feed when clicking logo

### Now Playing
- Playing track shows in mini player
- Persists across navigation
- Continues in background

### Post Creation
- Floating compose button opens CreatePostModal
- New posts appear at top of feed
- Optimistic updates

### Comments
- Opens Comments component in modal/drawer
- Shows full thread
- Nested replies supported

## Data Flow

### Loading Posts
```typescript
// Currently uses mock data
const posts = mockPosts;

// Future: API call
const { data: posts, loading, error } = await fetchPosts();
```

### Creating Posts
```typescript
// Handled by CreatePostModal
const handleCreatePost = async (postData) => {
  // API call to create post
  const newPost = await createPost(postData);
  
  // Optimistic update
  setPosts([newPost, ...posts]);
};
```

### Real-time Updates
```typescript
// Future: WebSocket subscription
useEffect(() => {
  const subscription = subscribeToFeed((newPost) => {
    setPosts([newPost, ...posts]);
  });
  
  return () => subscription.unsubscribe();
}, []);
```

## Performance Optimizations

### Virtualization (Future)
- Implement virtual scrolling for long feeds
- Load posts in batches
- Unload posts outside viewport

### Image Loading
- Lazy load images
- Use ImageWithFallback component
- Responsive image sizes

### Caching
- Cache loaded posts
- Invalidate on new content
- Persist scroll position

## Testing Checklist

### Functionality
- [ ] Posts load and display correctly
- [ ] Post filtering works (All, Tracks, Text, Media)
- [ ] Like/unlike toggles correctly
- [ ] Repost increments count
- [ ] Comments open in modal
- [ ] Track playback starts on click
- [ ] Share button works
- [ ] Links show previews

### Responsive Design
- [ ] Mobile view (375px)
- [ ] Tablet view (768px)
- [ ] Desktop view (1440px)
- [ ] Touch targets adequate on mobile
- [ ] Scrolling smooth on all devices

### Visual Design
- [ ] Initial badges display with correct colors
- [ ] Dark theme colors throughout
- [ ] Proper contrast ratios
- [ ] Consistent spacing
- [ ] Underground aesthetic maintained

## Known Issues / Limitations

### Current Implementation
- Uses mock data (no API integration)
- No pagination (all posts loaded at once)
- No infinite scroll
- No real-time updates
- No post editing
- No post deletion

### Future Enhancements
1. Backend integration with real API
2. Infinite scroll with pagination
3. Real-time updates via WebSocket
4. Post editing/deletion
5. Advanced filtering (by date, popularity)
6. Bookmarking posts
7. Muting/blocking users
8. Content warnings
9. Alt text for images
10. Accessibility improvements

## Related Documentation
- `ARCHITECTURE.md` - System architecture
- `COMPONENT-GUIDE.md` - Component details
- `STATE-MANAGEMENT.md` - State patterns
- `README-DJ-MODE.md` - DJ Mode integration
- `FEATURE-POST-COMMENT-HISTORY.md` - Post history

## API Endpoints (Future)

### Get Feed
```
GET /api/feed
Query params: ?limit=20&offset=0&filter=all
Response: { posts: Post[], hasMore: boolean }
```

### Create Post
```
POST /api/posts
Body: { content, type, trackId?, media? }
Response: { post: Post }
```

### Like Post
```
POST /api/posts/:id/like
Response: { liked: boolean, likeCount: number }
```

### Repost
```
POST /api/posts/:id/repost
Response: { reposted: boolean, repostCount: number }
```

## Accessibility

### Keyboard Navigation
- Tab through posts
- Enter to activate buttons
- Space to play/pause tracks
- Arrow keys to navigate feed

### Screen Readers
- Proper ARIA labels on buttons
- Alt text on images
- Semantic HTML structure
- Announcement of state changes

### Color Contrast
- All text meets WCAG AA standards
- Focus indicators visible
- Color not sole indicator of state

## Code Example

### Basic Usage
```tsx
import { SocialFeed } from './components/SocialFeed';

function App() {
  return (
    <div className="app">
      <SocialFeed />
    </div>
  );
}
```

### With Filtering
```tsx
const [postFilter, setPostFilter] = useState('all');

<SocialFeed filter={postFilter} />
```

## Troubleshooting

### Posts not showing
- Check mock data is imported
- Verify component renders
- Check console for errors

### Track won't play
- Verify nowPlaying state updates
- Check MiniPlayer component
- Check track URL is valid

### Engagement not working
- Check useDataHandlers hook
- Verify event handlers connected
- Check state updates

## Summary

The Social Feed is the core content discovery and engagement hub of sedā.fm. It provides a clean, chronological feed experience that prioritizes content over algorithms, supporting the platform's anti-Big Tech positioning while maintaining an underground music collective aesthetic.

**Status**: ✅ Fully implemented with mock data
**Ready for**: Backend integration, real-time updates, advanced features
