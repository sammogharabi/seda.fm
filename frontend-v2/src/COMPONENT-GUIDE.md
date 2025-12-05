# Component Guide - sedā.fm

This document provides detailed information about each component in the application, including props, usage, and implementation details.

## Table of Contents
- [Core Layout Components](#core-layout-components)
- [View Components](#view-components)
- [Feature Components](#feature-components)
- [Profile Components](#profile-components)
- [Modal Components](#modal-components)
- [Shared Components](#shared-components)

---

## Core Layout Components

### Sidebar
**Location**: `/components/Sidebar.tsx`

Desktop navigation sidebar with route links and user controls.

**Props**: None (uses context/hooks)

**State Dependencies**:
- `currentView` from useAppState
- `currentUser` from useAppState

**Key Features**:
- Route navigation
- Active view highlighting
- User profile access
- Create post shortcut
- Accent color theming

---

### MobileNavigation
**Location**: `/components/MobileNavigation.tsx`

Bottom navigation bar for mobile devices.

**Props**: None

**State Dependencies**:
- `currentView` from useAppState
- Navigation handlers from useAppState

**Key Features**:
- Fixed bottom positioning
- Icon-based navigation
- Active state indicators
- Responsive to view changes

---

### MobileHeader
**Location**: `/components/MobileHeader.tsx`

Top header for mobile views.

**Props**:
```typescript
{
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
}
```

**Key Features**:
- Dynamic title
- Optional back button
- Custom action buttons
- View-specific content

---

### ComposeButton
**Location**: `/components/ComposeButton.tsx`

Floating action button for creating content.

**Props**: None

**State Dependencies**:
- `setShowCreatePost` from useModals

**Key Features**:
- Fixed positioning
- Opens create post modal
- Accent coral styling
- Mobile-optimized

---

## View Components

### SocialFeed
**Location**: `/components/SocialFeed.tsx`

Main social feed displaying posts from followed users.

**Props**:
```typescript
{
  currentUser: User;
  onNowPlaying: (track: Track) => void;
  onViewUserProfile: (user: User) => void;
  onViewArtistProfile: (artist: Artist) => void;
}
```

**State Dependencies**:
- `posts` from useAppState
- Post interaction handlers from useDataHandlers

**Key Features**:
- Chronological feed
- Post types: text, music_share, link_share
- Inline comments
- Like/repost/share actions
- Link previews
- Track playback
- Infinite scroll (future)

**Post Types**:
1. **text_post**: Simple text content
2. **music_share**: Text + embedded track
3. **link_share**: Text + link preview

---

### DiscoverView
**Location**: `/components/DiscoverView.tsx`

Music discovery interface with curated content.

**Props**:
```typescript
{
  currentUser: User;
  onNowPlaying: (track: Track) => void;
  onViewArtistProfile: (artist: Artist) => void;
}
```

**Key Features**:
- Featured artists
- Trending tracks
- Genre-based discovery
- New releases
- Recommended for you

---

### RoomsView
**Location**: `/components/RoomsView.tsx`

Community rooms listing and management.

**Props**:
```typescript
{
  currentUser: User;
  onJoinRoom: (room: Room) => void;
  onViewRoom: (room: Room) => void;
  userRooms: Room[];
  joinedRooms: Room[];
}
```

**State Dependencies**:
- `userRooms` from useAppState
- `joinedRooms` from useAppState
- `showCreateRoom` from useModals

**Key Features**:
- Your rooms section
- Joined rooms section
- Public rooms discovery
- Room creation
- Active status indicators
- Member counts

---

### SessionsView
**Location**: `/components/SessionsView.tsx`

Live DJ sessions listing and access.

**Props**:
```typescript
{
  currentUser: User;
  onJoinSession: (session: Session) => void;
  onViewSession: (session: Session) => void;
}
```

**State Dependencies**:
- `activeSession` from useAppState
- `setActiveSession` from useAppState

**Key Features**:
- Active sessions list
- Session info (DJ, listeners, track)
- Join/leave functionality
- Sets active session for mini player
- Live indicators

**Recent Updates**:
- Now sets `activeSession` when joining a session
- Clears `activeSession` when leaving
- Integrates with MiniPlayer for persistent playback

---

### UserProfile-fixed
**Location**: `/components/UserProfile-fixed.tsx`

Fan/user profile page with activity and stats.

**Props**:
```typescript
{
  user: User;
  onUpdateUser?: (user: User) => void;
  viewingUser?: User | null;
  isOwnProfile?: boolean;
  defaultTab?: string;
  onBack?: () => void;
  onFollowToggle?: (user: User) => void;
  isFollowing?: boolean;
  onSendMessage?: (user: User, message: string, type: string) => void;
  onFollowUser?: (user: User) => void;
  isFollowingUser?: (userId: string) => boolean;
  onViewChange?: (view: string) => void;
  onBlockUser?: (userId: string) => void;
  onUnblockUser?: (userId: string) => void;
  isBlocked?: (userId: string) => boolean;
  getBlockedUsers?: () => User[];
}
```

**Tabs**:
1. **Activity**: User stats and recent activity
2. **Stats**: Platform statistics
3. **Crates**: Public/private playlists
4. **Rooms**: Joined rooms
5. **Posts**: Post history (NEW)
6. **Comments**: Comment history (NEW)
7. **Progression**: XP and leveling (own profile only)
8. **Credits**: Credits wallet (own profile only)
9. **Followers**: Follower/following lists (public profile only)

**Key Features**:
- Profile editing (own profile)
- Follow/unfollow (public profile)
- Message user (public profile)
- Block/unblock (public profile)
- Post history with full post display
- Comment history with post context
- Activity analytics for artists
- Progression system for fans

**Recent Updates (Post & Comment History)**:
- Added Posts tab showing user's post history
- Added Comments tab showing user's comment history
- Posts display full content, tracks, and engagement stats
- Comments show original post context + user's comment
- Available for both own profile and public viewing

---

### ArtistProfile
**Location**: `/components/ArtistProfile.tsx`

Artist profile page with music, fans, and marketplace.

**Props**:
```typescript
{
  artist: Artist;
  currentUser: User;
  onNowPlaying: (track: Track) => void;
  onBack: () => void;
  isFollowing?: boolean;
  onFollowToggle?: (artistId: string) => void;
  onViewMarketplace?: (artist: Artist) => void;
  onJoinRoom?: (room: Room) => void;
  onPreviewRoom?: (room: Room) => void;
  userRooms?: Room[];
  joinedRooms?: Room[];
  onViewFanProfile?: (fan: User) => void;
  onViewArtistProfile?: (artist: Artist) => void;
  mockArtists?: Artist[];
  mockFans?: User[];
  onFollowUser?: (user: User) => void;
  onUnfollowUser?: (userId: string) => void;
  isFollowingUser?: (userId: string) => boolean;
  onSendMessage?: (fan: User, message: string, type: string) => void;
  onBlockUser?: (userId: string) => void;
  isBlocked?: (userId: string) => boolean;
  editMode?: boolean;
  onUpdateUser?: (user: User) => void;
}
```

**Tabs**:
1. **Overview**: Top supporters, highlighted merch, concerts
2. **Tracks**: Music catalog with play/purchase
3. **Fans**: Follower list with sorting
4. **Posts**: Post history (NEW)
5. **Comments**: Comment history (NEW)

**Key Features**:
- Artist branding (cover image, bio, links)
- Follow/unfollow
- Tip artist
- Message artist
- Block artist
- Visit marketplace
- Artist community room
- Track playback
- Fan analytics
- Post history with music shares
- Comment history with context

**Recent Updates (Post & Comment History)**:
- Added Posts tab (5 total tabs now)
- Added Comments tab
- Posts show music shares, links, and engagement
- Comments display with original post context
- Helper function `formatTimestamp` for relative times

---

## Feature Components

### DJMode
**Location**: `/components/DJMode.tsx`

Turn-based DJ session interface.

**Props**:
```typescript
{
  currentUser: User;
  onNowPlaying: (track: Track) => void;
  onClose: () => void;
}
```

**State Dependencies**:
- DJ session state from useDJSession
- Queue management
- Voting system

**Key Features**:
- Turn-based DJ rotation
- Queue with voting
- Auto-skip on negative votes
- Real-time sync (future)
- Session chat
- Listener list
- Track history

---

### MinimizedDJSession
**Location**: `/components/MinimizedDJSession.tsx`

Minimized DJ controls when session is active but not focused.

**Props**:
```typescript
{
  session: Session;
  onExpand: () => void;
  onLeave: () => void;
}
```

**Key Features**:
- Current track display
- DJ info
- Listener count
- Expand to full view
- Leave session

---

### MiniPlayer
**Location**: `/components/MiniPlayer.tsx`

Persistent playback control for active sessions.

**Props**:
```typescript
{
  session: Session;
  onExpand: () => void;
}
```

**State Dependencies**:
- `activeSession` from useAppState
- `currentView` from useAppState

**Key Features**:
- Shows when navigating away from Sessions view
- Displays session info and listener count
- Click to return to full session view
- "LIVE DJ SESSION" indicator
- Auto-hides when on Sessions view

**Display Conditions**:
- Shows when `activeSession` exists
- AND `currentView` is NOT 'sessions'
- Positioned above mobile navigation

---

### GlobalSearch
**Location**: `/components/GlobalSearch.tsx`

Unified search across all content types.

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}
```

**Search Categories**:
- Artists
- Tracks
- Users
- Rooms
- Posts

**Key Features**:
- Real-time search
- Category filters
- Recent searches
- Keyboard navigation
- Mobile-optimized

---

### Comments
**Location**: `/components/Comments.tsx`

Comment thread system with replies.

**Props**:
```typescript
{
  comments: Comment[];
  currentUser: User;
  onAddComment: (content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onUserClick?: (user: User) => void;
  maxDepth?: number;
}
```

**Key Features**:
- Nested replies (up to maxDepth)
- Like comments
- Reply to comments
- User mentions
- Timestamp formatting
- Collapse threads
- Initial badge user indicators

---

### CreatePostModal
**Location**: `/components/CreatePostModal.tsx`

Modal for creating new posts.

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (post: Post) => void;
  currentUser: User;
}
```

**Post Types**:
- Text post
- Music share
- Link share

**Key Features**:
- Rich text input
- Track attachment
- Link preview
- Character count
- Draft saving (future)

---

## Modal Components

### CreateRoomModal
**Location**: `/components/CreateRoomModal.tsx`

Modal for creating community rooms.

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: Room) => void;
}
```

**Fields**:
- Room name
- Description
- Privacy (public/private)
- Genre tags

---

### AddToQueueModal
**Location**: `/components/AddToQueueModal.tsx`

Modal for adding tracks to DJ queue.

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (track: Track) => void;
}
```

**Key Features**:
- Track search
- Recent tracks
- User's crates
- Quick add

---

### TrackPurchaseModal
**Location**: `/components/TrackPurchaseModal.tsx`

Modal for purchasing tracks.

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  track: Track;
  artist: Artist;
  onPurchase: (track: Track) => void;
}
```

---

## Shared Components

### NowPlaying
**Location**: `/components/NowPlaying.tsx`

Current track display and controls.

**Props**:
```typescript
{
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}
```

---

### Crates
**Location**: `/components/Crates.tsx`

Playlist management interface.

**Props**:
```typescript
{
  currentUser: User;
  onNowPlaying: (track: Track) => void;
}
```

**Key Features**:
- Create crates
- Add/remove tracks
- Public/private toggle
- Collaborative editing (future)

---

### LinkPreview
**Location**: `/components/LinkPreview.tsx`

Rich preview for external links.

**Props**:
```typescript
{
  url: string;
  platform: 'bandcamp' | 'youtube' | 'spotify' | 'soundcloud';
  metadata: LinkMetadata;
  onPlay?: () => void;
}
```

**Supported Platforms**:
- Bandcamp
- YouTube
- Spotify
- SoundCloud
- Apple Music
- Generic links

---

## UI Components (Shadcn)

All UI components are located in `/components/ui/` and are based on shadcn/ui:

- **Button**: Primary interaction element
- **Card**: Content container
- **Dialog**: Modal dialogs
- **Input**: Text input fields
- **Badge**: Status indicators
- **Tabs**: Tab navigation
- **Select**: Dropdown selection
- **ScrollArea**: Scrollable content
- **Skeleton**: Loading states
- **And more...**

See individual component files for detailed usage.

---

## Styling Patterns

### Initial Badges (No Avatars)
```tsx
<div className={`w-10 h-10 ${getInitialBadgeColor(user.accentColor)} flex items-center justify-center font-black`}>
  {user.displayName[0]}
</div>
```

### Accent Color Helper
```typescript
const getInitialBadgeColor = (accentColor: string) => {
  switch (accentColor) {
    case 'coral': return 'bg-accent-coral text-background';
    case 'blue': return 'bg-accent-blue text-background';
    case 'mint': return 'bg-accent-mint text-background';
    case 'yellow': return 'bg-accent-yellow text-background';
    default: return 'bg-foreground text-background';
  }
};
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

---

## Component Creation Guidelines

### 1. File Structure
```typescript
import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Icon } from 'lucide-react';

interface ComponentProps {
  // Props definition
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### 2. Naming Conventions
- PascalCase for components
- camelCase for functions/variables
- SCREAMING_SNAKE_CASE for constants
- Prefix handlers with `handle` (e.g., `handleClick`)
- Prefix boolean props with `is`, `has`, `should` (e.g., `isOpen`)

### 3. Props Interface
Always define TypeScript interface for props:
```typescript
interface MyComponentProps {
  requiredProp: string;
  optionalProp?: number;
  onAction: (data: Data) => void;
}
```

### 4. State Management
Use hooks for state:
```typescript
const [localState, setLocalState] = useState(initialValue);
const globalState = useAppState();
```

### 5. Event Handlers
Use useCallback for handlers:
```typescript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### 6. Styling
- Use Tailwind classes
- Follow design system tokens
- No font size/weight classes (use defaults)
- Use `font-mono` for metadata
- Use `uppercase tracking-wide` for labels

---

## Testing Components

### Manual Test Checklist
- [ ] Desktop rendering (1440px+)
- [ ] Tablet rendering (768px - 1024px)
- [ ] Mobile rendering (375px - 768px)
- [ ] All interactive elements work
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Dark mode rendering
- [ ] All accent colors render correctly

---

## Common Patterns

### Conditional Rendering
```tsx
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

### List Rendering
```tsx
{items.map((item) => (
  <ItemComponent key={item.id} item={item} />
))}
```

### Loading States
```tsx
{loading ? <Skeleton /> : <Content />}
```

### Error Boundaries
Wrap components in ErrorBoundary for graceful failure handling.

---

## Performance Tips

1. **Memoize expensive computations**: Use `useMemo`
2. **Memoize callbacks**: Use `useCallback`
3. **Avoid inline functions in JSX**: Define handlers outside render
4. **Use keys in lists**: Always provide unique keys
5. **Lazy load heavy components**: Use `React.lazy`
6. **Optimize images**: Use ImageWithFallback component

---

## Next Steps

For implementing new features or components:
1. Review `ARCHITECTURE.md` for overall structure
2. Check `FEATURE-IMPLEMENTATION.md` for feature-specific guides
3. Follow patterns in existing similar components
4. Test thoroughly across devices
5. Document changes in relevant .md files
