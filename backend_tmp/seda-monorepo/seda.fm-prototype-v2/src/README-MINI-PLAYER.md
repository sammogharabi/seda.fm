# Mini Player - README

## Overview
The Mini Player is sedā.fm's persistent playback interface that remains visible while users navigate through the app. It provides quick access to currently playing content and essential playback controls.

## Component Location
- **Main Component**: `/components/MiniPlayer.tsx`
- **Now Playing**: `/components/NowPlaying.tsx` (full player view)

## Feature Description
The Mini Player:
- Displays current track information
- Provides playback controls
- Shows DJ session status (when active)
- Persists across navigation
- Expands to full player view
- Minimal visual footprint

## User Experience

### Normal Playback Mode
When playing a standalone track:
- Track title and artist name
- Album artwork thumbnail
- Play/Pause button
- Next/Previous buttons
- Progress bar
- Volume control
- Click to expand full player

### DJ Session Mode
When in an active DJ session:
- Session name displayed
- Current DJ indicator
- Voting controls
- Session timer
- Click to return to DJ Mode
- Session-specific styling

## Visual Design

### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Album] Track Title - Artist Name  [⏮][⏯][⏭] [─────] 🔊 │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (Bottom)
```
┌───────────────────────────┐
│ [Album] Track Title       │
│         Artist Name       │
│         [⏯] 0:45 / 3:22   │
└───────────────────────────┘
```

## Technical Implementation

### Component Structure
```typescript
export function MiniPlayer() {
  const { 
    nowPlaying,
    activeSession,
    isPlaying,
    currentTime,
    duration,
    volume
  } = useAppState();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!nowPlaying && !activeSession) return null;

  return (
    <div className="mini-player">
      {activeSession ? (
        <DJSessionMiniPlayer session={activeSession} />
      ) : (
        <TrackMiniPlayer track={nowPlaying} />
      )}
    </div>
  );
}
```

### State Management
```typescript
const {
  nowPlaying,          // Current track
  activeSession,       // Active DJ session
  isPlaying,          // Playback state
  setIsPlaying,       // Toggle play/pause
  currentTime,        // Playback position
  duration,           // Track duration
  volume,             // Volume level
  setVolume,          // Update volume
  nextTrack,          // Skip forward
  previousTrack,      // Skip back
  seekTo              // Seek position
} = useAppState();
```

### Playback State
```typescript
interface PlaybackState {
  nowPlaying: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  history: Track[];
}
```

## Features in Detail

### 1. Track Display
- Album artwork (40x40px thumbnail)
- Track title (truncated if long)
- Artist name
- Genre badge (optional)
- Explicit content indicator

### 2. Playback Controls
- **Play/Pause**: Toggle playback
- **Previous**: Go to previous track or restart current
- **Next**: Skip to next track in queue
- **Shuffle**: Randomize queue order
- **Repeat**: Loop current track or queue

### 3. Progress Bar
- Visual progress indicator
- Clickable for seeking
- Time elapsed / total duration
- Smooth animation
- Touch-friendly on mobile

### 4. Volume Control
- Desktop: Slider with icon
- Mobile: Separate expanded control
- Mute/unmute toggle
- Remembers last volume
- Visual feedback

### 5. Expand/Collapse
- Click anywhere to expand
- Shows full Now Playing view
- Artwork, lyrics, queue
- Close to return to mini
- Smooth transition animation

## Design System

### Colors
- Background: `#0a0a0a` with slight transparency
- Text: `#fafafa`
- Controls: `#fafafa` icons
- Progress: Accent color (coral/blue/mint/yellow)
- Hover: `#ff6b6b` (coral)

### Spacing
- Height: 64px (desktop), 72px (mobile)
- Padding: 12px
- Gap between elements: 16px
- Border: 1px solid `#333` (top only)

### Typography
- Track title: Default size
- Artist: `font-mono text-sm opacity-70`
- Time: `font-mono text-xs`

## Positioning

### Desktop
- Fixed at bottom of viewport
- Above mobile navigation
- Full width
- z-index: 40

### Mobile
- Fixed at bottom
- Above bottom navigation (with offset)
- Full width
- Swipe up to expand

## Integration Points

### DJ Mode Integration
When user is in DJ session:
```typescript
if (activeSession) {
  return (
    <MinimizedDJSession
      session={activeSession}
      onExpand={() => setCurrentView('djMode')}
    />
  );
}
```

### Queue Management
- Add tracks to queue
- Reorder upcoming tracks
- Clear queue
- View queue history

### Social Integration
- Share currently playing track
- Add to crate from mini player
- Like/save track
- View track details

## Mobile Interactions

### Gestures
- **Tap**: Expand to full player
- **Swipe Up**: Expand full player
- **Swipe Down**: (when expanded) Collapse
- **Swipe Left/Right**: Next/previous track
- **Long Press**: Show track options menu

### Touch Targets
- Minimum 44x44px hit area
- Extra padding on controls
- Larger progress bar touch area
- Accessible button spacing

## Audio Playback

### HTML5 Audio API
```typescript
const audioRef = useRef<HTMLAudioElement>(null);

useEffect(() => {
  if (audioRef.current) {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }
}, [isPlaying]);

const handleTimeUpdate = () => {
  if (audioRef.current) {
    setCurrentTime(audioRef.current.currentTime);
  }
};
```

### Audio Events
- `onPlay` - Track starts playing
- `onPause` - Track pauses
- `onEnded` - Track finishes, auto-next
- `onTimeUpdate` - Update progress bar
- `onLoadedMetadata` - Get duration
- `onError` - Handle playback errors

## State Persistence

### Local Storage
```typescript
// Save playback state
localStorage.setItem('playback', JSON.stringify({
  trackId: nowPlaying?.id,
  currentTime,
  volume,
  queue
}));

// Restore on load
const savedState = localStorage.getItem('playback');
if (savedState) {
  const { trackId, currentTime, volume } = JSON.parse(savedState);
  // Restore playback state
}
```

### Session Storage
- Queue order
- Current position in queue
- Playback history
- Volume preference

## Performance Optimization

### Rendering
- React.memo for mini player
- Throttle progress updates (200ms)
- Debounce seek operations
- Optimize re-renders

### Audio Loading
- Preload next track in queue
- Progressive loading for large files
- Cache frequently played tracks
- Buffer management

## Accessibility

### Keyboard Controls
- `Space` - Play/Pause
- `→` - Seek forward 5s
- `←` - Seek backward 5s
- `↑` - Volume up
- `↓` - Volume down
- `N` - Next track
- `P` - Previous track

### Screen Reader Support
```tsx
<button
  aria-label={isPlaying ? 'Pause' : 'Play'}
  aria-pressed={isPlaying}
>
  {isPlaying ? <Pause /> : <Play />}
</button>

<input
  type="range"
  aria-label="Playback progress"
  aria-valuemin={0}
  aria-valuemax={duration}
  aria-valuenow={currentTime}
  aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
/>
```

### Focus Management
- Visible focus indicators
- Logical tab order
- Keyboard trap when expanded
- Focus restoration on collapse

## DJ Session Mini Player

### Additional Features
- Session name and host
- Current DJ indicator
- Vote count display
- Queue position
- Auto-skip timer
- "Return to Session" button

### Visual Differences
```tsx
<div className="mini-player dj-mode">
  <div className="session-info">
    <span className="session-name">{session.name}</span>
    <span className="current-dj">DJ: {currentDJ.name}</span>
  </div>
  <div className="track-info">
    <span>{nowPlaying.title}</span>
    <span>{nowPlaying.artist}</span>
  </div>
  <div className="vote-controls">
    <button>👍 {upvotes}</button>
    <button>👎 {downvotes}</button>
  </div>
</div>
```

## Error Handling

### Playback Errors
```typescript
const handleError = (error: MediaError) => {
  switch (error.code) {
    case error.MEDIA_ERR_ABORTED:
      toast.error('Playback was aborted');
      break;
    case error.MEDIA_ERR_NETWORK:
      toast.error('Network error occurred');
      break;
    case error.MEDIA_ERR_DECODE:
      toast.error('Unable to decode audio file');
      break;
    case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      toast.error('Audio format not supported');
      break;
  }
  
  // Skip to next track
  nextTrack();
};
```

### Network Issues
- Show buffering indicator
- Auto-retry on failure
- Fallback to lower quality
- Offline mode support

## Testing Checklist

### Functionality
- [ ] Play/pause works
- [ ] Next/previous works
- [ ] Progress bar updates
- [ ] Seek functionality works
- [ ] Volume control works
- [ ] Expand/collapse works
- [ ] Queue management works
- [ ] Auto-advance to next track

### UI/UX
- [ ] Responsive on all devices
- [ ] Smooth animations
- [ ] No layout shifts
- [ ] Loading states display
- [ ] Error states handled
- [ ] Touch targets adequate

### Performance
- [ ] No audio stuttering
- [ ] Smooth progress updates
- [ ] Fast expand/collapse
- [ ] Efficient re-renders
- [ ] No memory leaks

## Future Enhancements

### Planned Features
1. **Lyrics Display**
   - Synced lyrics in mini player
   - Scroll to current line
   - Click line to seek

2. **Visualizer**
   - Audio frequency visualization
   - Animated waveform
   - Color-matched to track

3. **Crossfade**
   - Smooth transitions between tracks
   - Configurable fade duration
   - Beat-matched mixing

4. **Picture-in-Picture**
   - Browser PiP API
   - Floating player window
   - Works across tabs

5. **Chromecast Support**
   - Cast to devices
   - Control from phone
   - Multi-room audio

6. **Enhanced Queue**
   - AI-powered auto-queue
   - Smooth transitions
   - Genre blending

## Related Features
- **Now Playing**: Full player view
- **DJ Mode**: Session playback
- **Queue**: Track management
- **Crates**: Play entire crates
- **Social Feed**: Share tracks

## Component Dependencies
```
MiniPlayer.tsx
  ├── NowPlaying.tsx (expanded view)
  ├── MinimizedDJSession.tsx (DJ mode)
  ├── ProgressBar.tsx (UI component)
  ├── Button (UI component)
  ├── Slider (UI component)
  ├── useAppState (state hook)
  └── Audio API (browser)
```

## Related Documentation
- `ARCHITECTURE.md` - System design
- `COMPONENT-GUIDE.md` - Components
- `STATE-MANAGEMENT.md` - State patterns
- `README-DJ-MODE.md` - DJ integration
- `README-SOCIAL-FEED.md` - Social features

## Quick Reference

### Play Track
```typescript
const playTrack = (track: Track) => {
  setNowPlaying(track);
  setIsPlaying(true);
  addToHistory(track);
  trackEvent('play_track', { trackId: track.id });
};
```

### Update Progress
```typescript
const handleSeek = (position: number) => {
  if (audioRef.current) {
    audioRef.current.currentTime = position;
    setCurrentTime(position);
  }
};
```

## Status
✅ **Current**: Working with mock audio URLs  
⏳ **Next**: Real audio streaming  
🚀 **Future**: Lyrics, visualizer, crossfade, casting
