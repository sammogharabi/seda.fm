# Feature: Post and Comment History

## Overview
This feature adds the ability to view a user's post history and comment history on their profile page. It applies to both fan and artist profiles, and is visible when viewing your own profile or someone else's public profile.

## Implementation Date
Completed: November 5, 2024

## Affected Components

### 1. ArtistProfile.tsx
**Location**: `/components/ArtistProfile.tsx`

**Changes Made**:
- Added mock post history data (3 sample posts per artist)
- Added mock comment history data (3 sample comments per artist)
- Added "Posts" and "Comments" tabs to navigation (5 total tabs now)
- Implemented Posts tab content
- Implemented Comments tab content
- Added `formatTimestamp` helper function
- Added `Repeat` icon import from lucide-react

**New Tabs**:
1. Overview (existing)
2. Tracks (existing)
3. Fans (existing)
4. **Posts (NEW)** - Shows artist's post history
5. **Comments (NEW)** - Shows artist's comment history

### 2. UserProfile-fixed.tsx
**Location**: `/components/UserProfile-fixed.tsx`

**Changes Made**:
- Added `createMockPosts` helper function
- Added `createMockCommentHistory` helper function
- Added "Posts" and "Comments" tabs to navigation
- Implemented Posts tab content
- Implemented Comments tab content
- Added `formatTimestamp` helper function
- Added icon imports: `Heart`, `Repeat`, `Play`, `CheckCircle`

**New Tabs**:
Added to existing tab structure:
- **Posts** - Shows user's post history
- **Comments** - Shows user's comment history

## Feature Details

### Posts Tab

**What It Shows**:
- Chronological list of user's posts
- Full post content
- Track previews (if music_share post)
- Link previews (if link_share post)
- Engagement metrics (likes, reposts, comments)
- Timestamp (relative format)

**Post Display Components**:
1. **Post Header**:
   - User's initial badge (accent color)
   - Display name + verification badge
   - Username + timestamp

2. **Post Content**:
   - Full text content
   - Embedded media (tracks, links)

3. **Post Stats**:
   - Like count with heart icon
   - Repost count with repeat icon
   - Comment count with message icon

**Data Structure**:
```typescript
{
  id: string;
  type: 'text_post' | 'music_share' | 'link_share';
  content: string;
  track?: {
    title: string;
    artist: string;
    artwork: string;
    duration: string;
  };
  links?: Array<LinkPreview>;
  timestamp: Date;
  likes: number;
  reposts: number;
  comments: number;
}
```

### Comments Tab

**What It Shows**:
- Chronological list of user's comments
- Original post context (in highlighted box)
- Comment content
- Comment likes
- Timestamp

**Comment Display Components**:
1. **Post Context Box**:
   - Original post author's initial badge
   - "posted:" label
   - Snippet of original post (line-clamp-2)
   - Border-l-4 accent-blue for visual separation
   - Muted background

2. **Comment Section**:
   - User's initial badge
   - Display name + verification
   - Timestamp
   - Comment text
   - Like count

**Data Structure**:
```typescript
{
  id: string;
  content: string;
  timestamp: Date;
  likes: number;
  postContext: {
    id: string;
    author: {
      username: string;
      displayName: string;
      accentColor: string;
    };
    content: string;
    type: string;
  };
}
```

## Styling Implementation

### Design System Compliance

**Colors**:
- Background: `#0a0a0a`
- Foreground: `#fafafa`
- Accent colors: coral, blue, mint, yellow
- Border: `border-foreground/10`
- Hover: `hover:bg-muted/30`

**Typography**:
- No custom font sizes (use defaults)
- `font-mono` for username/timestamp
- `font-black` for emphasis
- `uppercase tracking-wide` for labels

**Component Patterns**:
- Initial badges instead of avatars
- Border-2 for tabs
- Rounded-lg for cards
- Motion animations on render

### Initial Badge Implementation
```tsx
<div 
  className="w-10 h-10 rounded-full flex items-center justify-center font-black border-2"
  style={{
    backgroundColor: `var(--color-accent-${user.accentColor || 'coral'})`,
    borderColor: `var(--color-accent-${user.accentColor || 'coral'})`
  }}
>
  {(user.displayName || user.username)[0]}
</div>
```

### Timestamp Formatting
```typescript
const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 2592000)}mo`;
};
```

## Responsive Design

### Mobile (< 768px)
- Tabs shown in 2-column grid for ArtistProfile
- Full-width post/comment cards
- Stacked layout for post headers
- Touch-friendly hit targets

### Tablet (768px - 1024px)
- Tabs shown in responsive grid
- Optimized card spacing
- Comfortable reading width

### Desktop (> 1024px)
- 5-column tab grid for ArtistProfile
- Max-width container for readability
- Hover states on cards
- Comfortable spacing

## Animation

**Entry Animations**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
>
```

**Staggered List**:
Each post/comment animates in with a 0.1s delay multiplied by its index.

## User Experience

### Navigation
1. User navigates to a profile (own or public)
2. Clicks "Posts" or "Comments" tab
3. Sees chronological list of content
4. Can scroll through history

### Empty States
Currently not implemented (mock data always present).

**Future Enhancement**:
```tsx
{posts.length === 0 && (
  <div className="text-center py-12 text-muted-foreground">
    <p>No posts yet</p>
  </div>
)}
```

### Loading States
Currently not implemented (instant render with mock data).

**Future Enhancement**:
```tsx
{loading ? <Skeleton /> : <PostsList />}
```

## Data Integration

### Current: Mock Data
Both components use mock data generators:
- `mockPosts` array in ArtistProfile
- `createMockPosts(user)` function in UserProfile
- `mockCommentHistory` array in ArtistProfile
- `createMockCommentHistory(user)` function in UserProfile

### Future: Real Data

**API Endpoints Needed**:
```
GET /api/users/:userId/posts
GET /api/users/:userId/comments
```

**Response Format**:
```typescript
{
  posts: Post[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
}
```

**Integration Pattern**:
```typescript
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchPosts() {
    const response = await fetch(`/api/users/${user.id}/posts`);
    const data = await response.json();
    setPosts(data.posts);
    setLoading(false);
  }
  fetchPosts();
}, [user.id]);
```

## Accessibility

### Semantic HTML
- Uses proper heading hierarchy
- Semantic button elements
- ARIA labels where needed

### Keyboard Navigation
- All interactive elements keyboard accessible
- Tab order follows visual order
- Focus indicators visible

### Screen Readers
- Meaningful alt text
- ARIA labels for icons
- Descriptive button text

## Performance Considerations

### Current Optimizations
- Motion animations use stagger for smoother render
- useCallback for stable function references
- Conditional rendering based on activeTab

### Future Optimizations
1. **Pagination**: Load posts in batches
2. **Virtual Scrolling**: For very long lists
3. **Image Lazy Loading**: Defer loading artwork
4. **Caching**: Cache fetched data
5. **Optimistic Updates**: Update UI before server response

## Testing Checklist

### Functionality
- [ ] Posts tab displays correctly
- [ ] Comments tab displays correctly
- [ ] Timestamps format properly
- [ ] Initial badges render with correct colors
- [ ] Music shares show track preview
- [ ] Link shares show preview (if applicable)
- [ ] Engagement stats display
- [ ] Animations work smoothly

### Visual
- [ ] Desktop layout (1440px+)
- [ ] Tablet layout (768px - 1024px)
- [ ] Mobile layout (375px - 768px)
- [ ] Dark mode colors
- [ ] All accent colors (coral, blue, mint, yellow)
- [ ] Verified badges show correctly
- [ ] Post context box distinct from comment

### Edge Cases
- [ ] Very long post content
- [ ] Very long comment
- [ ] Missing track artwork
- [ ] Missing user data
- [ ] Zero engagement (0 likes/comments)
- [ ] Very old timestamps

## Known Limitations

### Current Implementation
1. Mock data only (not connected to backend)
2. No pagination (all posts/comments load at once)
3. No empty states
4. No loading states
5. No error handling
6. No post interaction (can't like/comment from history)
7. No filtering/sorting options

### Future Enhancements

**Phase 1 - Backend Integration**:
- Connect to real API endpoints
- Implement pagination
- Add loading and error states
- Add empty states

**Phase 2 - Interactivity**:
- Allow liking posts from history
- Allow replying to comments
- Add post/comment actions (edit, delete)
- Link to original post/comment thread

**Phase 3 - Advanced Features**:
- Filter by post type
- Search within history
- Date range filtering
- Export history
- Archive/hide posts

## Code Snippets

### Adding Posts Tab to a Profile Component
```tsx
// 1. Add to tab navigation
<Button
  variant={activeTab === 'posts' ? 'default' : 'outline'}
  onClick={() => setActiveTab('posts')}
  className={activeTab === 'posts' ? 'bg-accent-coral ...' : '...'}
>
  <Edit3 className="w-4 h-4 mr-2" />
  Posts
</Button>

// 2. Add tab content
{activeTab === 'posts' && (
  <div className="space-y-6 mt-6">
    <h3 className="text-lg font-medium">Post History</h3>
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  </div>
)}
```

### PostCard Component Pattern
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
  className="border border-foreground/10 rounded-lg p-4 hover:bg-muted/30 transition-colors"
>
  {/* Header */}
  <div className="flex items-center gap-3 mb-3">
    <InitialBadge user={user} />
    <div className="flex-1">
      <UserInfo user={user} timestamp={post.timestamp} />
    </div>
  </div>

  {/* Content */}
  <p className="text-foreground mb-3">{post.content}</p>

  {/* Track/Link Preview */}
  {post.track && <TrackPreview track={post.track} />}

  {/* Stats */}
  <EngagementStats post={post} />
</motion.div>
```

## Migration Guide

### Adding to New Profile Component

**Step 1**: Import dependencies
```typescript
import { Heart, Repeat, Play, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
```

**Step 2**: Add formatTimestamp helper
```typescript
const formatTimestamp = (timestamp: Date) => {
  // ... implementation
};
```

**Step 3**: Add mock data
```typescript
const mockPosts = [ /* ... */ ];
const mockCommentHistory = [ /* ... */ ];
```

**Step 4**: Add tabs to navigation
```typescript
<Button
  variant={activeTab === 'posts' ? 'default' : 'outline'}
  onClick={() => setActiveTab('posts')}
>
  Posts
</Button>
```

**Step 5**: Add tab content
```typescript
{activeTab === 'posts' && (
  // ... posts content
)}
```

## Maintenance Notes

### Updating Mock Data
Mock data is defined directly in component files:
- `ArtistProfile.tsx`: Lines ~101-220
- `UserProfile-fixed.tsx`: Lines ~110-210

To update:
1. Modify the array structure
2. Ensure data matches expected types
3. Test across all accent colors
4. Verify timestamps render correctly

### Styling Updates
If design system changes:
1. Update accent color variables in `globals.css`
2. No component changes needed (uses CSS variables)
3. Test all accent color variations

## Related Files
- `/components/ArtistProfile.tsx`
- `/components/UserProfile-fixed.tsx`
- `/components/Comments.tsx`
- `/components/SocialFeed.tsx`
- `/styles/globals.css`

## Questions & Support

### Common Questions

**Q: Can users edit their post history?**
A: Not currently. Future enhancement.

**Q: How far back does history go?**
A: Currently mock data shows ~1-10 days. Real implementation would be unlimited with pagination.

**Q: Can you filter by post type?**
A: Not currently. Future enhancement.

**Q: Do deleted posts show in history?**
A: Not applicable (no deletion in current implementation).

## Changelog

### v1.0.0 (November 5, 2024)
- Initial implementation
- Added Posts tab to ArtistProfile
- Added Comments tab to ArtistProfile
- Added Posts tab to UserProfile-fixed
- Added Comments tab to UserProfile-fixed
- Added formatTimestamp helper
- Added mock data generators
- Implemented initial badge rendering
- Added motion animations
- Full mobile responsive support
