# State Management - sedā.fm

## Overview
sedā.fm uses a custom hook-based state management system built on React's Context API and hooks. State is organized into several focused hooks that manage different aspects of the application.

## State Architecture

### Hook Hierarchy
```
useAppState (Central State Hub)
    ├── useAuth (Authentication)
    ├── useDJSession (DJ Mode)
    ├── useDataHandlers (Data Mutations)
    └── useModals (Modal Visibility)
```

---

## useAppState

**Location**: `/hooks/useAppState.ts`

Central application state hook that manages navigation, data, and UI state.

### State Categories

#### 1. Navigation State
```typescript
{
  currentView: string;                    // Current active view
  setCurrentView: (view: string) => void;
  
  activeProfile: User | Artist | null;    // Currently viewed profile
  setActiveProfile: (profile) => void;
  
  isMobileNavOpen: boolean;               // Mobile nav visibility
  setIsMobileNavOpen: (open: boolean) => void;
}
```

**Views**:
- 'feed' - Social feed
- 'discover' - Music discovery
- 'following' - Following activity
- 'rooms' - Community rooms
- 'sessions' - DJ sessions
- 'messages' - Direct messages
- 'listening' - Now playing
- 'profile' - User profile

#### 2. Now Playing State
```typescript
{
  nowPlaying: Track | null;               // Currently playing track
  setNowPlaying: (track: Track) => void;
  
  isPlaying: boolean;                     // Playback state
  setIsPlaying: (playing: boolean) => void;
}
```

#### 3. DJ Session State
```typescript
{
  isDJMode: boolean;                      // DJ Mode active
  setIsDJMode: (active: boolean) => void;
  
  djQueue: Track[];                       // DJ queue
  setDJQueue: (queue: Track[]) => void;
  
  isDJMinimized: boolean;                 // DJ minimized
  setIsDJMinimized: (minimized: boolean) => void;
  
  activeSession: Session | null;          // Active session for mini player
  setActiveSession: (session: Session) => void;
}
```

**Active Session Usage**:
- Set when joining a DJ session
- Powers the MiniPlayer component
- Cleared when leaving session
- Persists across navigation

#### 4. Data State
```typescript
{
  posts: Post[];                          // Social feed posts
  setPosts: (posts: Post[]) => void;
  
  followingList: User[];                  // Following users/artists
  setFollowingList: (following: User[]) => void;
  
  userRooms: Room[];                      // Owned rooms
  setUserRooms: (rooms: Room[]) => void;
  
  joinedRooms: Room[];                    // Joined rooms
  setJoinedRooms: (rooms: Room[]) => void;
  
  userCrates: Crate[];                    // User's crates
  setUserCrates: (crates: Crate[]) => void;
  
  blockedUsers: string[];                 // Blocked user IDs
  setBlockedUsers: (users: string[]) => void;
}
```

### Usage Example
```typescript
import { useAppState } from './hooks/useAppState';

function MyComponent() {
  const {
    currentView,
    setCurrentView,
    nowPlaying,
    setNowPlaying
  } = useAppState();

  const handleViewChange = () => {
    setCurrentView('discover');
  };

  return (
    <div>
      Current View: {currentView}
      {nowPlaying && <p>Now Playing: {nowPlaying.title}</p>}
    </div>
  );
}
```

---

## useAuth

**Location**: `/hooks/useAuth.ts`

Manages authentication state and user session.

### State
```typescript
{
  currentUser: User | null;               // Logged in user
  setCurrentUser: (user: User) => void;
  
  isAuthenticated: boolean;               // Auth status
  isLoading: boolean;                     // Loading state
}
```

### Methods
```typescript
{
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}
```

### Usage Example
```typescript
import { useAuth } from './hooks/useAuth';

function AuthComponent() {
  const { currentUser, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login({ email, password });
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {currentUser.displayName}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

---

## useDJSession

**Location**: `/hooks/useDJSession.ts`

Manages DJ Mode session state and interactions.

### State
```typescript
{
  currentDJ: User | null;                 // Current DJ
  queue: Track[];                         // Session queue
  listeners: User[];                      // Active listeners
  currentTrack: Track | null;             // Now playing
  votes: Map<string, Vote>;               // Track votes
  chatMessages: Message[];                // Session chat
}
```

### Methods
```typescript
{
  addToQueue: (track: Track) => void;
  voteTrack: (trackId: string, vote: 'up' | 'down') => void;
  skipTrack: () => void;
  sendMessage: (message: string) => void;
  joinSession: () => void;
  leaveSession: () => void;
}
```

### Auto-Skip Logic
```typescript
// Track skips if downvotes > upvotes
const shouldSkip = (votes: Votes) => {
  const downvotes = votes.filter(v => v.type === 'down').length;
  const upvotes = votes.filter(v => v.type === 'up').length;
  return downvotes > upvotes;
};
```

### Usage Example
```typescript
import { useDJSession } from './hooks/useDJSession';

function DJModeComponent() {
  const {
    currentTrack,
    queue,
    addToQueue,
    voteTrack
  } = useDJSession();

  return (
    <div>
      <h3>Now Playing: {currentTrack?.title}</h3>
      <div>Queue: {queue.length} tracks</div>
      <button onClick={() => voteTrack(currentTrack.id, 'up')}>
        Upvote
      </button>
    </div>
  );
}
```

---

## useDataHandlers

**Location**: `/hooks/useDataHandlers.ts`

Provides mutation handlers for data operations.

### Handlers

#### Post Handlers
```typescript
{
  handleCreatePost: (post: CreatePostData) => void;
  handleLikePost: (postId: string) => void;
  handleRepost: (postId: string) => void;
  handleAddComment: (postId: string, comment: string) => void;
}
```

#### Room Handlers
```typescript
{
  handleCreateRoom: (room: CreateRoomData) => void;
  handleJoinRoom: (roomId: string) => void;
  handleLeaveRoom: (roomId: string) => void;
}
```

#### Crate Handlers
```typescript
{
  handleCreateCrate: (crate: CreateCrateData) => void;
  handleAddToCrate: (crateId: string, trackId: string) => void;
  handleRemoveFromCrate: (crateId: string, trackId: string) => void;
}
```

#### User Handlers
```typescript
{
  handleFollowUser: (userId: string) => void;
  handleUnfollowUser: (userId: string) => void;
  handleBlockUser: (userId: string) => void;
  handleUnblockUser: (userId: string) => void;
}
```

### Usage Example
```typescript
import { useDataHandlers } from './hooks/useDataHandlers';

function CreatePostComponent() {
  const { handleCreatePost } = useDataHandlers();

  const onSubmit = (content: string) => {
    handleCreatePost({
      type: 'text_post',
      content,
      timestamp: new Date()
    });
  };

  return <PostForm onSubmit={onSubmit} />;
}
```

---

## useModals

**Location**: `/hooks/useModals.ts`

Manages modal visibility state.

### State
```typescript
{
  showCreatePost: boolean;
  setShowCreatePost: (show: boolean) => void;
  
  showCreateRoom: boolean;
  setShowCreateRoom: (show: boolean) => void;
  
  showAddToQueue: boolean;
  setShowAddToQueue: (show: boolean) => void;
  
  showTrackPurchase: boolean;
  setShowTrackPurchase: (show: boolean) => void;
  
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
}
```

### Usage Example
```typescript
import { useModals } from './hooks/useModals';

function Header() {
  const { showSearch, setShowSearch } = useModals();

  return (
    <div>
      <button onClick={() => setShowSearch(true)}>
        Search
      </button>
      {showSearch && (
        <SearchModal onClose={() => setShowSearch(false)} />
      )}
    </div>
  );
}
```

---

## State Flow Patterns

### 1. Navigation Flow
```
User clicks nav item
    ↓
setCurrentView called
    ↓
App re-renders
    ↓
View component mounts
    ↓
Data loads (if needed)
```

### 2. Data Mutation Flow
```
User action (e.g., create post)
    ↓
Event handler calls data handler
    ↓
Data handler updates state
    ↓
Toast notification shown
    ↓
UI updates with new data
```

### 3. DJ Session Flow
```
User joins session
    ↓
setActiveSession called
    ↓
Session state initialized
    ↓
MiniPlayer appears
    ↓
User navigates away
    ↓
MiniPlayer persists
    ↓
User clicks expand
    ↓
Returns to sessions view
```

---

## Best Practices

### 1. State Location
**Guideline**: Keep state as close to usage as possible.

```typescript
// ❌ Bad: Lifting state too high
function App() {
  const [modalOpen, setModalOpen] = useState(false);
  return <DeepNestedComponent modalOpen={modalOpen} />;
}

// ✅ Good: State where it's used
function MyComponent() {
  const [modalOpen, setModalOpen] = useState(false);
  return <Modal open={modalOpen} />;
}
```

### 2. Shared State
**Guideline**: Use central state only when multiple components need access.

```typescript
// ✅ Good: Shared navigation state
const { currentView, setCurrentView } = useAppState();
```

### 3. Derived State
**Guideline**: Compute derived values instead of storing them.

```typescript
// ❌ Bad: Storing derived state
const [posts, setPosts] = useState([]);
const [postCount, setPostCount] = useState(0);

// ✅ Good: Computing derived state
const [posts, setPosts] = useState([]);
const postCount = posts.length;

// ✅ Better: Memoize expensive computations
const sortedPosts = useMemo(
  () => posts.sort((a, b) => b.timestamp - a.timestamp),
  [posts]
);
```

### 4. Handler Stability
**Guideline**: Use useCallback for handlers passed as props.

```typescript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### 5. State Updates
**Guideline**: Use functional updates when new state depends on old state.

```typescript
// ❌ Bad
setPosts([newPost, ...posts]);

// ✅ Good
setPosts(prevPosts => [newPost, ...prevPosts]);
```

---

## State Persistence

### Local Storage
Currently, state is not persisted. Future enhancement:

```typescript
// Save to localStorage
useEffect(() => {
  localStorage.setItem('appState', JSON.stringify(state));
}, [state]);

// Load from localStorage
useEffect(() => {
  const saved = localStorage.getItem('appState');
  if (saved) {
    setState(JSON.parse(saved));
  }
}, []);
```

### Session Storage
For temporary state (e.g., form drafts):

```typescript
const [draft, setDraft] = useState(() => {
  const saved = sessionStorage.getItem('postDraft');
  return saved ? JSON.parse(saved) : '';
});

useEffect(() => {
  sessionStorage.setItem('postDraft', JSON.stringify(draft));
}, [draft]);
```

---

## Performance Optimization

### 1. Selective Subscriptions
Only subscribe to needed state:

```typescript
// ❌ Bad: Full state
const state = useAppState();

// ✅ Good: Only what you need
const { currentView, setCurrentView } = useAppState();
```

### 2. Memoization
Memoize expensive computations:

```typescript
const filteredPosts = useMemo(() => {
  return posts.filter(p => p.userId === currentUser.id);
}, [posts, currentUser.id]);
```

### 3. Callback Stability
Prevent unnecessary re-renders:

```typescript
const handleAction = useCallback((id: string) => {
  // Handler logic
}, []);  // Empty deps if handler doesn't depend on state
```

---

## Testing State

### Unit Tests
```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useAppState } from './useAppState';

test('changes view', () => {
  const { result } = renderHook(() => useAppState());
  
  act(() => {
    result.current.setCurrentView('discover');
  });
  
  expect(result.current.currentView).toBe('discover');
});
```

### Integration Tests
```typescript
import { render, screen } from '@testing-library/react';
import App from './App';

test('navigates between views', () => {
  render(<App />);
  
  const discoverButton = screen.getByText('Discover');
  fireEvent.click(discoverButton);
  
  expect(screen.getByText('Discover View')).toBeInTheDocument();
});
```

---

## Migration to Backend

### Current: Mock Data
All data is currently mocked in the hooks.

### Future: API Integration

**Pattern**:
```typescript
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(false);

const fetchPosts = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/posts');
    const data = await response.json();
    setPosts(data);
  } catch (error) {
    console.error('Failed to fetch posts', error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchPosts();
}, []);
```

**Mutations**:
```typescript
const handleCreatePost = async (post: CreatePostData) => {
  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    
    if (response.ok) {
      const newPost = await response.json();
      setPosts(prev => [newPost, ...prev]);
      toast.success('Post created!');
    }
  } catch (error) {
    toast.error('Failed to create post');
  }
};
```

---

## Common Patterns

### 1. Optimistic Updates
```typescript
const handleLike = async (postId: string) => {
  // Update UI immediately
  setPosts(posts.map(p => 
    p.id === postId 
      ? { ...p, likes: p.likes + 1, isLiked: true }
      : p
  ));
  
  // Then sync with server
  try {
    await api.likePost(postId);
  } catch (error) {
    // Revert on error
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, likes: p.likes - 1, isLiked: false }
        : p
    ));
    toast.error('Failed to like post');
  }
};
```

### 2. Debounced Updates
```typescript
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    // Perform search
    searchAPI(query);
  }, 300),
  []
);
```

### 3. Polling
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchNewPosts();
  }, 30000); // Poll every 30s

  return () => clearInterval(interval);
}, []);
```

---

## Troubleshooting

### State Not Updating
**Problem**: Component not re-rendering
**Solution**: Check if you're mutating state directly

```typescript
// ❌ Bad
posts.push(newPost);
setPosts(posts);

// ✅ Good
setPosts([...posts, newPost]);
```

### Stale Closures
**Problem**: Handler uses old state
**Solution**: Use functional updates

```typescript
// ❌ Bad
setCount(count + 1);

// ✅ Good
setCount(prev => prev + 1);
```

### Infinite Loops
**Problem**: useEffect triggers itself
**Solution**: Fix dependencies

```typescript
// ❌ Bad
useEffect(() => {
  setData(processData(data));
}, [data]);

// ✅ Good
useEffect(() => {
  setData(processData(initialData));
}, []);  // Run once
```

---

## Future Enhancements

### 1. React Query Integration
For server state management:
```typescript
import { useQuery } from 'react-query';

const { data: posts } = useQuery('posts', fetchPosts);
```

### 2. Zustand
For simpler state management:
```typescript
import create from 'zustand';

const useStore = create(set => ({
  currentView: 'feed',
  setCurrentView: (view) => set({ currentView: view })
}));
```

### 3. Redux Toolkit
For complex state requirements:
```typescript
import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: [],
  reducers: {
    addPost: (state, action) => {
      state.push(action.payload);
    }
  }
});
```

---

## Related Documentation
- `ARCHITECTURE.md` - Overall system architecture
- `COMPONENT-GUIDE.md` - Component-specific state usage
- `API-INTEGRATION.md` - Backend integration patterns
