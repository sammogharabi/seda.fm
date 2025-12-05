# Add to Queue Feature - Multi-Source Track Integration

## Overview
The Add to Queue feature allows users to add tracks to their DJ session queue from multiple sources, supporting the streaming-agnostic approach of sedā.fm.

## Supported Sources

### 1. **Local Upload**
- Upload audio files directly from computer
- Supported formats: MP3, WAV, OGG, FLAC
- Maximum file size: 50MB
- Validates file type and size before upload

### 2. **Spotify**
- Import via URL or search
- URL pattern: `https://open.spotify.com/track/...`
- Search functionality with results preview
- Real-time search with debouncing

### 3. **Apple Music**
- Import via URL or search
- URL pattern: `https://music.apple.com/us/album/...`
- Search functionality with results preview

### 4. **Bandcamp**
- Import via URL
- URL pattern: `https://artist.bandcamp.com/track/...`
- Direct URL import only (no search)

### 5. **Tidal**
- Import via URL
- URL pattern: `https://tidal.com/browse/track/...`
- Direct URL import only (no search)

### 6. **Beatport**
- Import via URL
- URL pattern: `https://www.beatport.com/track/...`
- Direct URL import only (no search)

## Component Architecture

### AddToQueueModal Component
**Location:** `/components/AddToQueueModal.tsx`

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal closes
- `onAddTrack: (track: any) => void` - Callback when track is added
- `sessionTitle?: string` - Optional session title for context

**Features:**
- Tab-based interface for different sources
- File upload with drag-and-drop support
- URL validation for streaming services
- Search functionality for Spotify and Apple Music
- Loading states and error handling
- Toast notifications for user feedback

### Integration Points

#### 1. DJMode Component
The modal is integrated into the active DJ session:
- Clicking the "Add" button opens the modal
- Added tracks are appended to the current queue
- Respects session permissions (host-only, cooldowns)
- Updates session state in real-time

#### 2. SessionsView Component
The modal is available before starting a session:
- Build a pre-session queue
- "Start Session" button shows track count
- Pre-loaded queue is passed to DJ session on start
- Allows users to prepare their set in advance

## User Flow

### Adding a Track During DJ Session

1. User clicks "Add Track" button in queue section
2. Modal opens with 6 tab options (Upload, Spotify, Apple, Bandcamp, Tidal, Beatport)
3. User selects preferred source
4. For uploads:
   - Click "Choose File" or drag & drop
   - File is validated
   - Preview shows file name and size
   - Click "Add to Queue"
5. For streaming services:
   - Paste URL in input field
   - OR use search (Spotify/Apple Music only)
   - Select track from results
   - Click "Add" or "Import"
6. Track is added to queue with source metadata
7. Toast notification confirms addition
8. Modal closes automatically

### Pre-Loading Tracks Before Session

1. User navigates to Sessions page
2. Clicks "Add Track" button (next to "Start Session")
3. Adds tracks using any available source
4. Each track is added to pre-session queue
5. "Start Session" button updates to show track count
6. When starting session, pre-loaded tracks are included in initial queue

## Track Object Structure

```typescript
{
  id: string,           // Unique identifier
  track: {
    title: string,      // Track title
    artist: string,     // Artist name
    artwork: string,    // Cover art URL
    duration: string    // Duration (e.g., "3:45")
  },
  addedBy: User,        // User who added the track
  status: 'ready' | 'buffering' | 'error',
  votes: {
    up: number,         // Upvote count
    down: number        // Downvote count
  },
  addedAt: Date,        // Timestamp
  source: 'upload' | 'spotify' | 'apple' | 'bandcamp' | 'tidal' | 'beatport'
}
```

## Platform-Specific Notes

### Spotify & Apple Music
- Full search functionality with real-time results
- Results show: artwork, title, artist, duration
- Maximum 50 results per search
- Debounced search (800ms delay)

### Bandcamp, Tidal, Beatport
- URL import only (no search)
- Pattern validation before import
- Direct track metadata extraction

### Local Upload
- Client-side validation
- File size limit prevents server overload
- Supports common audio formats
- Generates placeholder metadata for unknown tracks

## Design Patterns

### Streaming-Agnostic Philosophy
- No preference shown for any streaming service
- All services presented equally in UI
- Users choose their preferred platform
- Maintains sedā.fm's anti-Big Tech stance

### User Experience
- Tabbed interface for easy source switching
- Clear visual feedback for loading states
- Error messages with actionable guidance
- Toast notifications for success/error states
- Accessible design with ARIA labels

### Performance
- Mock search results for demo (replace with real API)
- Debounced search to reduce API calls
- File validation before upload
- Loading states prevent duplicate submissions

## Future Enhancements

1. **Real API Integration**
   - Connect to actual streaming service APIs
   - Implement authentication for services requiring it
   - Add rate limiting and caching

2. **Advanced Features**
   - Drag-and-drop file upload
   - Bulk track import from playlists
   - Track preview before adding
   - Auto-complete for search
   - Recently added tracks history

3. **Additional Sources**
   - SoundCloud integration
   - YouTube Music support
   - Discogs integration for vinyl collectors
   - Direct audio file URLs

4. **Queue Management**
   - Reorder tracks in pre-session queue
   - Remove tracks from pre-session queue
   - Save pre-session queue as template
   - Import from existing crates

## Implementation Notes

### Session Permissions
The add to queue functionality respects session configuration:
- `queuePermissions: 'host-only'` - Only host can add tracks
- `queuePermissions: 'all'` - Anyone can add tracks
- `trackCooldown` - Minimum time between adds per user

### State Management
- Modal state managed locally in each component
- Queue state managed at session level
- Pre-session queue state in SessionsView component
- Track metadata preserved across components

### Accessibility
- Full keyboard navigation support
- ARIA labels for screen readers
- DialogDescription for modal context
- Focus management on open/close
- High contrast for visibility

## Testing Checklist

- [ ] Upload MP3 file successfully
- [ ] Upload unsupported file type (shows error)
- [ ] Upload file >50MB (shows error)
- [ ] Import Spotify track via URL
- [ ] Search Spotify and add track
- [ ] Import Apple Music track via URL
- [ ] Search Apple Music and add track
- [ ] Import Bandcamp track via URL
- [ ] Import Tidal track via URL
- [ ] Import Beatport track via URL
- [ ] Invalid URL shows error message
- [ ] Track appears in queue after adding
- [ ] Modal closes after successful add
- [ ] Toast notification appears
- [ ] Pre-session queue persists
- [ ] Start session with pre-loaded tracks
- [ ] Host-only permissions work
- [ ] Track cooldown is enforced
- [ ] Mobile responsive layout
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly

## Dependencies

- React (hooks: useState, useRef)
- Lucide React (icons)
- Sonner (toast notifications)
- ShadCN UI components:
  - Dialog
  - Button
  - Input
  - Label
  - Badge
  - Tabs
  - ScrollArea

## File Changes

### New Files
- `/components/AddToQueueModal.tsx` - Main modal component

### Modified Files
- `/components/DJMode.tsx` - Added modal integration to active DJ sessions
- `/components/SessionsView.tsx` - Added modal integration for pre-session queue
- `/App.tsx` - No changes needed (modal is self-contained)

## Visual Design

The modal follows sedā.fm's underground music aesthetic:
- Dark mode first design (#0a0a0a background, #fafafa text)
- Accent colors for platform branding
- Clean, minimal interface
- Professional spacing
- Publication-quality layouts
- Backstage pass-style badges for users

## Notes

- This is the initial implementation with mock data
- Real streaming API integration requires additional setup
- File upload currently client-side only
- Consider backend storage for uploaded files in production
- Rate limiting should be implemented for search APIs
- Authentication may be required for some streaming services
