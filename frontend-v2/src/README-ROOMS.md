# Rooms Feature - README

## Overview
Rooms are community spaces where users gather around shared music interests, discover new tracks, and participate in DJ sessions together. Each room has its own vibe, active sessions, and dedicated community.

## Component Location
- **Main Components**: 
  - `/components/RoomsView.tsx` - Room discovery/listing
  - `/components/RoomView.tsx` - Individual room view
  - `/components/CreateRoomModal.tsx` - Room creation
- **Supporting Components**:
  - `/components/RoomTypeTabs.tsx` - Room filtering
  - `/components/DJMode.tsx` - Session integration

## Feature Description

### What It Does
- Browse and discover music community rooms
- Filter rooms by category (All, Electronic, Hip Hop, Indie, etc.)
- View active DJ sessions in each room
- Join rooms to participate
- Create custom rooms
- See room member counts and activity
- Start DJ sessions within rooms

### User Experience
1. User navigates to Rooms view
2. Browses available rooms or filters by genre
3. Sees active sessions and member counts
4. Clicks to enter a room
5. Inside room: can join active DJ session or start new one
6. Creates custom rooms for specific communities

## Room Types/Categories

### Pre-defined Categories
1. **All Rooms** - Shows all available rooms
2. **Electronic** - Electronic music communities
3. **Hip Hop** - Hip hop & rap communities
4. **Indie** - Indie & alternative music
5. **Rock** - Rock music communities
6. **Jazz** - Jazz & related genres
7. **Pop** - Pop music communities
8. **Experimental** - Avant-garde & experimental

## UI Components

### Room Card (Discovery View)
```tsx
<Card>
  - Room name & description
  - Category badge
  - Member count
  - Active session indicator
  - "Join Room" button
  - Last activity timestamp
</Card>
```

### Room View (Inside Room)
- Room header with name and description
- Active session display (if any)
- Room chat/feed
- Session controls
- Member list
- "Start DJ Session" button

### Create Room Modal
- Room name input
- Description textarea
- Category selector
- Privacy settings (public/private)
- Member limit option

## Technical Implementation

### State Management
```typescript
// From useAppState hook
const {
  currentView,
  activeRoom,
  setActiveRoom,
  activeSession,
  setActiveSession
} = useAppState();

// Room state
const [selectedCategory, setSelectedCategory] = useState('all');
const [rooms, setRooms] = useState([]);
```

### Mock Data Structure
```typescript
interface Room {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  activeSession?: DJSession;
  createdBy: string;
  createdAt: string;
  privacy: 'public' | 'private';
  memberLimit?: number;
}
```

### Key Functions
```typescript
// Join room
const handleJoinRoom = (roomId: string) => {
  const room = rooms.find(r => r.id === roomId);
  setActiveRoom(room);
  setCurrentView('room');
};

// Create room
const handleCreateRoom = async (roomData) => {
  const newRoom = await createRoom(roomData);
  setRooms([...rooms, newRoom]);
};

// Start DJ session in room
const handleStartSession = (room: Room) => {
  const session = createDJSession(room);
  setActiveSession(session);
};
```

## Design System

### Colors
- Background: `#0a0a0a`
- Room cards: `#1a1a1a`
- Category badges: Accent colors (coral, blue, mint, yellow)
- Active indicator: Pulsing coral `#ff6b6b`
- Text: `#fafafa`
- Muted text: `#a0a0a0`

### Typography
- Room names: Default heading size
- Descriptions: Body text, muted
- Category labels: `uppercase tracking-wide`
- Member counts: `font-mono`

### Icons
- Music notes for active sessions
- Users icon for member count
- Lock icon for private rooms
- Plus icon for create room

### Room Card Styling
```tsx
<Card className="bg-[#1a1a1a] border-[#333] hover:border-coral transition-colors">
  {/* Active session indicator */}
  {room.activeSession && (
    <div className="flex items-center gap-2 text-coral">
      <div className="w-2 h-2 bg-coral rounded-full animate-pulse" />
      <span className="uppercase tracking-wide">Live Session</span>
    </div>
  )}
</Card>
```

## User Interactions

### Room Discovery
- **Filter by category** - Click category tab
- **Search rooms** - Type in search bar (future)
- **Sort rooms** - By activity, members, etc. (future)

### Joining Rooms
- **Click "Join Room"** - Enters room view
- **Auto-join session** - If active session, shows join prompt
- **Browse room** - Can view without joining session

### Creating Rooms
- **Click "Create Room"** - Opens modal
- **Fill details** - Name, description, category
- **Set privacy** - Public or private
- **Create** - Room appears in list

### Session Integration
- **Start DJ Session** - Creates session in room context
- **Join Active Session** - Enters DJ Mode
- **Leave Session** - Returns to room view

## Mobile Responsiveness

### Mobile (< 768px)
- Single column room grid
- Full-width cards
- Touch-optimized buttons
- Bottom sheet for room details
- Swipe gestures

### Tablet (768px - 1024px)
- 2-column room grid
- Modal for room details
- Hybrid navigation

### Desktop (> 1024px)
- 3-column room grid
- Sidebar for room details
- Hover states
- Larger cards

## Integration Points

### DJ Mode Integration
```typescript
// Starting session from room
const startSession = () => {
  const session = {
    id: generateId(),
    roomId: room.id,
    host: currentUser,
    queue: [],
    participants: [currentUser]
  };
  setActiveSession(session);
  setCurrentView('dj-mode');
};
```

### Mini Player
- Active session shows mini player
- Persists when navigating away from room
- Click to return to full DJ view

### Social Feed
- Room posts appear in feed
- Can share room links
- Room activity updates

## Room Features

### Current Features
- Browse rooms by category
- View active sessions
- See member counts
- Join rooms
- Create new rooms
- Filter by category

### Future Features
- Room chat/feed
- Room moderators
- Member management
- Room settings
- Scheduled sessions
- Room playlists/crates
- Room analytics
- Verified rooms
- Featured rooms
- Room discovery algorithm

## Data Flow

### Loading Rooms
```typescript
// Currently uses mock data
const rooms = mockRooms;

// Future: API call
const { data: rooms, loading } = await fetchRooms({
  category: selectedCategory,
  limit: 50
});
```

### Creating Rooms
```typescript
const handleCreateRoom = async (roomData) => {
  // API call
  const newRoom = await api.post('/rooms', roomData);
  
  // Update local state
  setRooms([...rooms, newRoom]);
  
  // Navigate to new room
  setActiveRoom(newRoom);
  setCurrentView('room');
};
```

### Real-time Updates
```typescript
// Future: WebSocket for live updates
useEffect(() => {
  const subscription = subscribeToRooms((update) => {
    if (update.type === 'session_started') {
      updateRoomWithSession(update.roomId, update.session);
    }
  });
  
  return () => subscription.unsubscribe();
}, []);
```

## Room Privacy

### Public Rooms
- Visible to all users
- Anyone can join
- Appears in discovery
- Searchable

### Private Rooms
- Invite-only
- Not visible in public list
- Requires room code/link
- Member approval (future)

## Room Moderation

### Current
- Creator has basic controls
- Can delete room

### Future
- Assign moderators
- Ban/kick members
- Content moderation
- Auto-moderation rules
- Report system

## Performance Considerations

### Optimization Strategies
1. Lazy load room list
2. Paginate results
3. Cache room data
4. Debounce search
5. Virtual scrolling for large lists

### Loading States
```tsx
{loading && <RoomsSkeleton />}
{error && <ErrorMessage />}
{rooms.length === 0 && <EmptyState />}
{rooms.map(room => <RoomCard key={room.id} room={room} />)}
```

## Testing Checklist

### Functionality
- [ ] Rooms load and display
- [ ] Category filtering works
- [ ] Join room navigates correctly
- [ ] Create room modal opens
- [ ] New room appears in list
- [ ] Active session indicator shows
- [ ] Member count accurate
- [ ] Category badges correct

### Responsive Design
- [ ] Mobile grid (1 column)
- [ ] Tablet grid (2 columns)
- [ ] Desktop grid (3 columns)
- [ ] Touch targets on mobile
- [ ] Modal/drawer behavior

### Visual Design
- [ ] Dark theme colors
- [ ] Active indicators pulse
- [ ] Hover states work
- [ ] Category colors correct
- [ ] Underground aesthetic

## Known Limitations

### Current Implementation
- Uses mock data
- No real-time updates
- No room chat
- No member management
- Limited moderation
- No search functionality
- No room analytics

## Related Documentation
- `README-DJ-MODE.md` - DJ session integration
- `ARCHITECTURE.md` - System architecture
- `COMPONENT-GUIDE.md` - Component details
- `STATE-MANAGEMENT.md` - State patterns

## API Endpoints (Future)

### Get Rooms
```
GET /api/rooms
Query: ?category=electronic&limit=50&offset=0
Response: { rooms: Room[], hasMore: boolean }
```

### Get Room
```
GET /api/rooms/:id
Response: { room: Room, members: User[], sessions: Session[] }
```

### Create Room
```
POST /api/rooms
Body: { name, description, category, privacy }
Response: { room: Room }
```

### Join Room
```
POST /api/rooms/:id/join
Response: { success: boolean, room: Room }
```

### Leave Room
```
POST /api/rooms/:id/leave
Response: { success: boolean }
```

## Accessibility

### Keyboard Navigation
- Tab through room cards
- Enter to join room
- Escape to close modals
- Arrow keys to navigate

### Screen Readers
- Room names announced
- Member counts read
- Active session status
- Category labels

### Focus Management
- Focus trap in modals
- Clear focus indicators
- Logical tab order

## Code Example

### Basic Room View
```tsx
import { RoomsView } from './components/RoomsView';

function App() {
  return <RoomsView />;
}
```

### With Category Filter
```tsx
const [category, setCategory] = useState('all');

<RoomsView 
  category={category}
  onCategoryChange={setCategory}
/>
```

### Room Card Component
```tsx
<Card className="bg-[#1a1a1a] border-[#333]">
  <div className="p-4">
    <h3>{room.name}</h3>
    <p className="text-muted-foreground">{room.description}</p>
    
    <div className="flex items-center gap-4 mt-4">
      <span className="font-mono">{room.members} members</span>
      {room.activeSession && (
        <div className="flex items-center gap-2 text-coral">
          <div className="w-2 h-2 bg-coral rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      )}
    </div>
    
    <Button onClick={() => handleJoinRoom(room.id)}>
      Join Room
    </Button>
  </div>
</Card>
```

## Troubleshooting

### Rooms not loading
- Check mock data import
- Verify component renders
- Check console for errors

### Category filter not working
- Check state updates
- Verify filter logic
- Check tab selection

### Can't join room
- Check activeRoom state
- Verify navigation logic
- Check room permissions

## Summary

Rooms provide community spaces for music lovers to gather, discover tracks, and participate in DJ sessions together. Each room has its own identity, active sessions, and dedicated community, supporting sedā.fm's vision of collaborative music discovery.

**Status**: ✅ Fully implemented with mock data
**Ready for**: Real-time updates, chat, advanced moderation, backend integration
