# Crates Feature - README

## Overview
Crates are sedā.fm's version of playlists, renamed to reflect the underground music culture aesthetic. The term "crates" references DJ culture where DJs would dig through crates of vinyl records.

## Component Location
- **Main Component**: `/components/Crates.tsx`
- **Create Modal**: `/components/CreateCrateModal.tsx`

## Feature Description
Crates allow users to:
- Create custom music collections
- Organize tracks by mood, genre, or theme
- Share curated collections with the community
- Build their musical identity

## User Experience

### Creating a Crate
1. Click "New Crate" button
2. Enter crate name
3. Optionally add description
4. Add tracks from library
5. Save crate

### Managing Crates
- View all personal crates
- Edit crate details
- Reorder tracks
- Delete crates
- Share crates with followers

### Browsing Crates
- Discover crates from followed artists/fans
- Filter by genre, mood, or popularity
- Play entire crate as queue
- Add individual tracks to queue

## Technical Implementation

### State Management
```typescript
// Crates are managed in useAppState hook
const { 
  userCrates,        // Current user's crates
  browseCrates,      // Crates to discover
  activeCrate,       // Currently playing crate
  setActiveCrate     // Set active crate
} = useAppState();
```

### Data Structure
```typescript
interface Crate {
  id: string;
  name: string;
  description?: string;
  userId: string;
  tracks: Track[];
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  trackCount: number;
  totalDuration: number;
}
```

### Key Functions
- `createCrate()` - Create new crate
- `addTrackToCrate()` - Add track to existing crate
- `removeTrackFromCrate()` - Remove track
- `updateCrate()` - Edit crate details
- `deleteCrate()` - Delete crate
- `shareCrate()` - Share with community

## Design System

### Visual Style
- Underground music aesthetic
- Vinyl record-inspired UI
- Dark mode with accent colors
- Backstage pass-style badges

### Colors
- Background: `#0a0a0a`
- Text: `#fafafa`
- Accent: Coral, Blue, Mint, Yellow
- Borders: `#333`

### Typography
- Crate names: Default heading style
- Track counts: `font-mono`
- Metadata: `uppercase tracking-wide`

## Integration Points

### DJ Mode Integration
- Crates can be loaded directly into DJ queue
- DJs can mix between crate tracks
- Crate tracks show in session queue

### Social Feed Integration
- Share crate posts to feed
- Crates appear in user profiles
- Engagement metrics (plays, shares, likes)

### Profile Integration
- Crates tab in user profiles
- Display user's public crates
- Showcase favorite/featured crates

## Mobile Experience
- Responsive grid layout
- Swipe gestures for track management
- Bottom sheet for crate details
- Touch-friendly controls

## Mock Data
Located in `/data/mockData.ts`:
```typescript
const mockCrates = [
  {
    id: 'crate-1',
    name: 'Late Night Vibes',
    description: 'Chill beats for 3am coding sessions',
    userId: 'user-1',
    tracks: [...],
    isPublic: true,
    trackCount: 12,
    totalDuration: 2640 // seconds
  }
];
```

## Features in Detail

### Create Crate Modal
- Name input (required)
- Description textarea (optional)
- Privacy toggle (public/private)
- Initial track selection
- Cover image upload (future)

### Crate View
- Cover art display
- Crate metadata (name, creator, track count, duration)
- Track list with drag-to-reorder
- Play all button
- Share button
- Edit/Delete options (if owner)

### Add to Crate
- Available from track menus
- Quick-add to existing crates
- Create new crate option
- Multi-select for bulk add

## Backend Integration (Future)

### API Endpoints (Planned)
```
POST   /api/crates           - Create crate
GET    /api/crates/:id       - Get crate details
PUT    /api/crates/:id       - Update crate
DELETE /api/crates/:id       - Delete crate
POST   /api/crates/:id/tracks - Add track
DELETE /api/crates/:id/tracks/:trackId - Remove track
```

### Database Schema (Planned)
```sql
crates:
  - id (uuid)
  - user_id (uuid, foreign key)
  - name (text)
  - description (text)
  - is_public (boolean)
  - created_at (timestamp)
  - updated_at (timestamp)

crate_tracks:
  - crate_id (uuid, foreign key)
  - track_id (uuid, foreign key)
  - position (integer)
  - added_at (timestamp)
```

## User Flows

### Flow 1: Create and Share Crate
```
User Dashboard
  → Click "New Crate"
  → CreateCrateModal opens
  → Enter name: "Summer Jams 2024"
  → Add 10 tracks from library
  → Toggle "Public"
  → Click "Create"
  → Crate appears in user crates
  → Click "Share"
  → Post to social feed
  → Followers see crate in feed
```

### Flow 2: Discover and Play Crate
```
Discover View
  → Browse community crates
  → Click crate "Midnight Soul"
  → View track list
  → Click "Play All"
  → Tracks added to queue
  → Now Playing shows first track
  → Can navigate away, Mini Player persists
```

### Flow 3: Add Track to Crate
```
Browsing tracks
  → Click track menu (•••)
  → Select "Add to Crate"
  → Modal shows existing crates
  → Select "Late Night Vibes"
  → Track added
  → Toast: "Added to Late Night Vibes"
```

## Best Practices

### Naming Crates
- Descriptive names that reflect mood/genre
- Avoid generic names like "Playlist 1"
- Use personality and creativity
- Example: "4am Feelings" not "Sad Songs"

### Organizing Crates
- Keep focused themes
- Optimal length: 10-25 tracks
- Consider flow and transitions
- Update regularly with new discoveries

### Sharing Crates
- Add descriptions to help discovery
- Make public if you want engagement
- Share to feed with context
- Engage with feedback/comments

## Testing Checklist

### Functionality
- [ ] Create new crate
- [ ] Add tracks to crate
- [ ] Reorder tracks
- [ ] Edit crate details
- [ ] Delete crate
- [ ] Share crate to feed
- [ ] Play entire crate
- [ ] Add individual tracks from crate to queue

### UI/UX
- [ ] Responsive on mobile
- [ ] Drag-and-drop works smoothly
- [ ] Loading states display
- [ ] Empty states show helpful messages
- [ ] Error handling works
- [ ] Toast notifications appear

### Edge Cases
- [ ] Empty crate handling
- [ ] Maximum track limit (if any)
- [ ] Duplicate track prevention
- [ ] Long crate names truncate properly
- [ ] Special characters in names

## Future Enhancements

### Planned Features
1. **Collaborative Crates**
   - Multiple users can contribute
   - Real-time updates
   - Contributor management

2. **Smart Crates**
   - Auto-generated based on listening habits
   - AI-powered suggestions
   - Dynamic updating

3. **Crate Templates**
   - Pre-made structures
   - Genre-specific templates
   - Mood-based templates

4. **Cover Art Customization**
   - Upload custom images
   - Choose from library
   - AI-generated artwork

5. **Advanced Sharing**
   - Export to other platforms
   - Embed codes for websites
   - QR codes for physical promotion

6. **Crate Analytics**
   - Play counts
   - Most popular tracks
   - Listener demographics
   - Engagement metrics

7. **Crate Radio**
   - Endless play mode
   - Similar tracks added automatically
   - Discovery algorithm

## Terminology

### Why "Crates"?
The term connects to DJ culture where physical records were stored in milk crates. DJs would "dig through crates" to find the perfect tracks. This terminology:
- Reflects underground music culture
- Avoids corporate "playlist" language
- Resonates with music enthusiasts
- Creates unique brand identity

### Usage in App
- Always use "Crates" (capitalized)
- Never use "playlists"
- Verb: "Create a crate", "Add to crate"
- Collective: "Your crates", "Community crates"

## Related Features
- **DJ Mode**: Load crates into DJ sessions
- **Social Feed**: Share crates as posts
- **Discover**: Browse community crates
- **Profile**: Display user's crates
- **Add to Queue**: Individual track actions

## Component Dependencies
```
Crates.tsx
  ├── CreateCrateModal.tsx
  ├── Card (UI component)
  ├── Button (UI component)
  ├── Dialog (UI component)
  ├── useAppState (state hook)
  ├── useDataHandlers (mutation hook)
  └── mockData.ts (data source)
```

## Accessibility
- Keyboard navigation support
- Screen reader friendly
- Focus management in modals
- ARIA labels on interactive elements
- Color contrast compliance

## Performance Considerations
- Lazy load crate lists
- Virtualize long track lists
- Debounce search/filter
- Optimize re-renders
- Cache crate data

## Error Handling
- Network errors: Show retry option
- Validation errors: Inline feedback
- Permission errors: Clear messaging
- Data conflicts: Auto-resolve or prompt user

## Related Documentation
- `ARCHITECTURE.md` - System architecture
- `COMPONENT-GUIDE.md` - Component patterns
- `STATE-MANAGEMENT.md` - State patterns
- `README-DJ-MODE.md` - DJ Mode integration
- `README-SOCIAL-FEED.md` - Social sharing

## Quick Reference

### Creating a Crate
```typescript
const handleCreateCrate = async (name: string, tracks: Track[]) => {
  const newCrate = {
    id: generateId(),
    name,
    userId: currentUser.id,
    tracks,
    isPublic: true,
    createdAt: new Date().toISOString()
  };
  
  await createCrate(newCrate);
  toast.success('Crate created!');
};
```

### Adding Track to Crate
```typescript
const handleAddToCrate = async (crateId: string, track: Track) => {
  await addTrackToCrate(crateId, track);
  toast.success(`Added to ${crateName}`);
};
```

## Status
✅ **Current**: Working with mock data  
⏳ **Next**: Backend integration  
🚀 **Future**: Collaborative crates, smart crates, analytics
