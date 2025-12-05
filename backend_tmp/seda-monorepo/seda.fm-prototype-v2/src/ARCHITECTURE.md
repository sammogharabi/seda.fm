# sedā.fm Architecture Documentation

## Overview
sedā.fm is a real-time music-centric social platform (PWA → mobile) that lets fans and artists share, discover, and DJ music together in real time with streaming-agnostic in-app playback, turn-based DJ Mode, crowd voting, and auto-skip functionality.

## Design Philosophy
- **Anti-Big Tech positioning**: Underground music collective aesthetic
- **No avatars**: Professional backstage pass-style initial badges throughout
- **Dark mode first**: #0a0a0a background, #fafafa text
- **Accent colors**: Coral, blue, mint, yellow
- **Typography**: Publication-quality layouts with authentic music memorabilia aesthetics
- **Terminology**: "Crates" instead of "playlists" to reflect underground music culture

## Core Architecture

### Application Structure
```
sedā.fm/
├── App.tsx                 # Main application entry
├── Router.tsx              # Route management
├── components/             # All UI components
├── hooks/                  # Custom React hooks for state & logic
├── data/                   # Mock data and data models
├── utils/                  # Utility functions and services
├── styles/                 # Global styles and design tokens
└── supabase/              # Backend server functions
```

### State Management
State is managed through custom hooks in the `/hooks` directory:

- **useAppState.ts**: Central application state (navigation, modals, data)
- **useAuth.ts**: Authentication state and user management
- **useDJSession.ts**: DJ Mode session state and controls
- **useDataHandlers.ts**: Data mutation handlers (posts, rooms, crates)
- **useModals.ts**: Modal visibility state

## Key Features

### 1. Social Feed (Bluesky-like)
- Chronological feed of posts from followed users
- Post types: text, music share, link share
- Comments with threading
- Like, repost, and share functionality
- Link previews for Bandcamp, YouTube, Spotify, etc.

### 2. DJ Mode
- Turn-based DJ sessions with voting
- Real-time playback synchronization
- Queue management with crowd voting
- Auto-skip based on negative votes
- Mini player for persistent session access

### 3. Rooms (Communities)
- Public and private music communities
- Real-time chat
- Shared music discovery
- Room-specific activity feeds

### 4. Crates (Playlists)
- User-curated music collections
- Public/private visibility
- Collaborative crating (future)

### 5. Artist Features
- Artist profiles with customization
- Marketplace (music, merch, tickets)
- Fan analytics and management
- Revenue tracking
- Content management

### 6. Fan Progression System
- XP-based leveling
- Badges and achievements
- Credits wallet (redeemable for Premium)
- Leaderboards

### 7. Profile System
- User profiles (fans and artists)
- Post history viewing
- Comment history viewing
- Following/followers
- Activity analytics

## Component Organization

### Core Layout Components
- **Sidebar**: Desktop navigation
- **MobileNavigation**: Mobile bottom nav
- **MobileHeader**: Mobile top header
- **ComposeButton**: Floating action button

### View Components (Main Screens)
- **SocialFeed**: Main feed view
- **DiscoverView**: Music discovery
- **FollowingView**: Following activity
- **RoomsView**: Community rooms list
- **SessionsView**: Live DJ sessions
- **MessagesView**: Direct messages
- **ListeningView**: Now playing screen
- **UserProfile-fixed**: User profile page
- **ArtistProfile**: Artist profile page

### Feature Components
- **DJMode**: DJ session interface
- **MinimizedDJSession**: Minimized DJ controls
- **MiniPlayer**: Persistent playback
- **CreatePostModal**: Post creation
- **CreateRoomModal**: Room creation
- **GlobalSearch**: Unified search
- **Comments**: Comment threads

### Shared Components
- **NowPlaying**: Current track display
- **Crates**: Playlist management
- **ProgressBar**: Progress indicators
- **LinkPreview**: Rich link previews

## Data Flow

### State Flow
```
useAppState (Central State)
    ↓
App.tsx (State Provider)
    ↓
View Components (Consume State)
    ↓
useDataHandlers (Mutations)
    ↓
Update useAppState
```

### User Actions Flow
```
User Interaction
    ↓
Event Handler in Component
    ↓
Call Handler from useDataHandlers
    ↓
Update State in useAppState
    ↓
UI Re-renders
```

## Backend Integration

### Supabase Setup
- **Edge Functions**: Hono server at `/supabase/functions/server/`
- **KV Store**: Key-value storage for data persistence
- **Authentication**: User auth and session management
- **Storage**: File storage for uploads (future)

### API Structure
```
Server Routes:
/make-server-2cdc6b38/*
```

## Navigation Structure

### Main Views
1. **Feed** - Social feed (default)
2. **Discover** - Music discovery
3. **Following** - Following activity
4. **Rooms** - Community rooms
5. **Sessions** - Live DJ sessions
6. **Messages** - Direct messages
7. **Listening** - Now playing
8. **Profile** - User profile

### Modal Views
- Create Post
- Create Room
- Add to Queue
- Track Purchase
- Track Upload
- Artist Marketplace
- Global Search

## Styling System

### Design Tokens (globals.css)
```css
--color-accent-coral: #ff6b6b
--color-accent-blue: #4ecdc4
--color-accent-mint: #95e1d3
--color-accent-yellow: #f9ca24
--background: #0a0a0a
--foreground: #fafafa
```

### Tailwind Configuration
- Tailwind v4.0 (no config file)
- Custom tokens in globals.css
- No text size/weight classes (use defaults)

### Component Patterns
- Initial badges instead of avatars
- Border-2 for emphasis
- font-mono for metadata
- uppercase tracking-wide for labels
- Motion animations for interactions

## Mobile-First Approach

### Responsive Breakpoints
- Mobile: Default
- Tablet: md: (768px)
- Desktop: lg: (1024px)

### Mobile Optimizations
- Bottom navigation
- Swipe gestures
- Touch-friendly targets
- Optimized modals/sheets

## Feature Flags & Conditions

### User Type Conditionals
```typescript
if (user.isArtist) {
  // Artist-only features
  // - Marketplace
  // - Analytics
  // - Fan management
}

if (user.userType === 'fan') {
  // Fan-only features
  // - Progression system
  // - Credits wallet
  // - XP tracking
}
```

### Profile View Conditionals
```typescript
if (isOwnProfile) {
  // Own profile features
  // - Edit profile
  // - Settings
  // - Private data
} else {
  // Public profile features
  // - Follow/unfollow
  // - Message
  // - Block
}
```

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Components loaded on demand
2. **Memoization**: useMemo for expensive computations
3. **Virtual Scrolling**: For long lists (future)
4. **Image Optimization**: ImageWithFallback component
5. **Code Splitting**: Route-based splitting

### State Management Best Practices
- Keep state as close to usage as possible
- Lift state only when needed for sharing
- Use callbacks to prevent unnecessary re-renders
- Memoize expensive computations

## Security Considerations

### Authentication
- Supabase auth integration
- Protected routes
- Session management
- API key security

### Content Moderation
- AI detection system
- User reporting
- Block/mute functionality
- Content flagging

## Future Architecture Considerations

### Planned Features
1. Real-time subscriptions
2. WebSocket integration for DJ Mode
3. File upload to Supabase Storage
4. Advanced search with filters
5. Recommendation engine
6. Analytics dashboard improvements

### Scalability Considerations
- Database indexing strategy
- CDN for static assets
- Caching layer
- Rate limiting
- Load balancing

## Development Workflow

### Component Creation Checklist
1. Create component in `/components`
2. Add to appropriate view or layout
3. Connect to state via hooks
4. Add styling with Tailwind
5. Test mobile responsiveness
6. Add error handling
7. Document in relevant .md file

### State Update Pattern
```typescript
// 1. Define handler in useDataHandlers
const handleAction = useCallback((data) => {
  // Update state
  setState(newState);
  // Show feedback
  toast.success('Action completed');
}, [dependencies]);

// 2. Pass to component
<Component onAction={handleAction} />

// 3. Use in component
onClick={() => onAction(data)}
```

## Testing Guidelines

### Manual Testing Checklist
- [ ] Desktop view (1440px+)
- [ ] Tablet view (768px - 1024px)
- [ ] Mobile view (375px - 768px)
- [ ] Dark mode rendering
- [ ] Accent color variations
- [ ] Navigation flow
- [ ] State persistence
- [ ] Error states

### User Flows to Test
1. Sign up → Profile setup → Post creation → Feed interaction
2. Artist → Marketplace setup → Track upload → Analytics view
3. Fan → Follow artists → Join rooms → DJ session participation
4. Search → Discover content → Follow → Engage

## Deployment

See `DEPLOY.md` for detailed deployment instructions.

### Build Process
```bash
npm run build        # Production build
npm run preview      # Preview build locally
```

### Environment Variables
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Troubleshooting

### Common Issues
1. **State not updating**: Check dependencies in useCallback/useMemo
2. **Styling not applied**: Verify Tailwind class names, check globals.css
3. **Mobile nav not showing**: Check z-index and positioning
4. **Profile data missing**: Verify mock data structure matches expected format

### Debug Tools
- DebugState component (development only)
- React DevTools
- Browser console
- Network tab for API calls

## Additional Resources
- `COMPONENT-GUIDE.md` - Detailed component documentation
- `FEATURE-IMPLEMENTATION.md` - Feature-specific guides
- `DESIGN-SYSTEM.md` - Design system reference
- `STATE-MANAGEMENT.md` - State management patterns
