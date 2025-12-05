# Artist Profiles & Marketplace - Feature README

## Overview
Artist profiles are the artist's home on sedā.fm, combining their music portfolio, fan engagement tools, and marketplace for selling tracks and merch. Artists can showcase their work, connect with fans, and monetize their content directly.

## Location
- **Main Profile**: `/components/ArtistProfile.tsx`
- **Marketplace**: `/components/ArtistMarketplace.tsx`
- **Mobile Marketplace**: `/components/ArtistMarketplaceMobile.tsx`
- **Dashboard**: `/components/ArtistDashboard.tsx`
- **Content Manager**: `/components/ArtistContentManager.tsx`
- **Analytics**: `/components/ArtistAnalytics.tsx`
- **Fan Manager**: `/components/ArtistFansManager.tsx`
- **Profile Customization**: `/components/ArtistProfileCustomization.tsx`

## Key Features

### Profile Sections
1. **Overview Tab** - Bio, stats, recent activity
2. **Tracks Tab** - All released music
3. **Crates Tab** - Curated playlists
4. **Marketplace Tab** - Store for tracks and merch
5. **Posts Tab** - Artist's feed posts
6. **Comments Tab** - Artist's comment history
7. **Analytics Tab** - Performance metrics (artist only)

### Marketplace Features
- **Track Sales**: Sell individual tracks
- **Merch Store**: Physical and digital products
- **Pricing Control**: Artist sets prices
- **Revenue Tracking**: Real-time sales data
- **Fan Support**: Tips and direct support
- **Exclusive Content**: Premium tracks for supporters

### Fan Engagement
- **Follow/Unfollow**: Build fanbase
- **Message Button**: Direct messaging
- **Support Actions**: Tips, purchases, shares
- **Fan Tiers**: Different support levels
- **Exclusive Access**: Content for top supporters

## User Flow

### Viewing Artist Profile (Fan Perspective)
1. Search for artist or click from feed
2. See profile overview with bio and stats
3. Browse tabs (tracks, crates, marketplace)
4. Follow artist
5. Purchase tracks or merch
6. Send message or tip

### Managing Profile (Artist Perspective)
1. Navigate to own profile
2. Click "Edit Profile" button
3. Update bio, profile customization
4. Upload tracks via content manager
5. Set up marketplace items
6. View analytics and fan insights
7. Respond to messages

### Purchasing from Marketplace
1. Browse artist's marketplace tab
2. Click on track or merch item
3. See preview and details
4. Click "Purchase" button
5. Complete payment (mock flow)
6. Access purchased content

## Components

### ArtistProfile.tsx
**Purpose**: Main artist profile view

**Tabs**:
- Overview - Bio, stats, highlights
- Tracks - Discography
- Crates - Artist playlists
- Marketplace - Store
- Posts - Feed content
- Comments - Comment history
- Analytics - Data (artist only)

**Props**:
```typescript
{
  artist: Artist;          // Artist data
  currentUser: User;       // Viewing user
  isOwnProfile: boolean;   // Is viewing own profile
}
```

### ArtistMarketplace.tsx
**Purpose**: Store for tracks and merchandise

**Features**:
- Product grid layout
- Filter by type (tracks, merch, all)
- Price display
- Purchase buttons
- Quick preview
- Revenue stats (artist only)

**State**:
```typescript
const [filter, setFilter] = useState<'all' | 'tracks' | 'merch'>('all');
const [selectedItem, setSelectedItem] = useState(null);
```

### ArtistDashboard.tsx
**Purpose**: Artist control center

**Sections**:
- Quick stats overview
- Recent sales
- Fan growth
- Upload shortcuts
- Notification center
- Quick actions

**Only visible to**: Artist on their own profile

### ArtistAnalytics.tsx
**Purpose**: Performance metrics and insights

**Metrics**:
- Total streams
- Revenue breakdown
- Fan demographics
- Track performance
- Engagement rates
- Growth trends

**Visualizations**:
- Charts using Recharts library
- Time-series data
- Comparison views

### ArtistContentManager.tsx
**Purpose**: Upload and manage content

**Features**:
- Track upload
- Crate creation
- Metadata editing
- Content scheduling
- Delete/archive

### ArtistFansManager.tsx
**Purpose**: Fan relationship management

**Features**:
- Top supporters list
- Fan activity feed
- Message fans
- Create fan-exclusive content
- Fan tier management

## Profile Customization

### Visual Elements
- **Initial Badge**: Artist's first letter with accent color
- **Background**: Customizable header (future)
- **Accent Color**: Personal brand color
- **Bio**: Markdown-supported description
- **Links**: Social media, website, streaming platforms

### Metadata
- Artist name (username)
- Display name
- Bio text
- Location
- Genres
- Formed date
- External links

## Marketplace System

### Product Types

**Tracks**:
```typescript
{
  id: string;
  title: string;
  artist: string;
  price: number;
  duration: string;
  genre: string;
  artwork: string;
  preview: string;
  exclusive: boolean;
}
```

**Merch**:
```typescript
{
  id: string;
  name: string;
  type: 'physical' | 'digital';
  price: number;
  image: string;
  description: string;
  stock: number;
}
```

### Pricing
- Artist sets prices
- Credits-based system
- Support tipping
- Bundle discounts (future)
- Pay-what-you-want option (future)

### Revenue
- Direct to artist (minus platform fee)
- Real-time tracking
- Withdrawal system (future)
- Transaction history

## Analytics Dashboard

### Key Metrics
- **Streams**: Total plays across platform
- **Revenue**: Total earnings
- **Fans**: Follower count
- **Engagement**: Likes, comments, shares
- **Growth**: Week/month trends

### Charts
- Stream history (line chart)
- Revenue over time (area chart)
- Top tracks (bar chart)
- Fan demographics (pie chart)
- Geographic distribution (map - future)

### Export
- Download reports (future)
- Email summaries (future)
- Integration with analytics platforms (future)

## State Management

### Artist Data
```typescript
const artist = {
  id: 'artist-1',
  username: 'midnight-theory',
  displayName: 'Midnight Theory',
  bio: 'Electronic music producer...',
  accentColor: 'coral',
  stats: {
    followers: 1250,
    tracks: 24,
    crates: 8,
    totalStreams: 45000
  },
  marketplace: {
    tracks: [...],
    merch: [...],
    revenue: 2500
  },
  analytics: {
    streams: [...],
    revenue: [...],
    fans: [...]
  }
};
```

### Profile State
```typescript
const { currentUser } = useAuth();
const isOwnProfile = currentUser?.id === artist.id;
const [activeTab, setActiveTab] = useState('overview');
const [isFollowing, setIsFollowing] = useState(false);
```

## Design Patterns

### Tab Navigation
- Horizontal scroll on mobile
- Fixed navigation on desktop
- Active tab highlighted with coral accent
- Badge counts where applicable

### Initial Badge (No Avatars)
```tsx
<div 
  className="w-24 h-24 rounded-full flex items-center justify-center font-black border-4"
  style={{
    backgroundColor: `var(--color-accent-${artist.accentColor})`,
    borderColor: `var(--color-accent-${artist.accentColor})`
  }}
>
  {artist.displayName[0]}
</div>
```

### Stats Display
```tsx
<div className="flex gap-8">
  <div>
    <div className="font-mono">{followers.toLocaleString()}</div>
    <div className="uppercase tracking-wide text-muted-foreground">Followers</div>
  </div>
  <div>
    <div className="font-mono">{tracks}</div>
    <div className="uppercase tracking-wide text-muted-foreground">Tracks</div>
  </div>
</div>
```

## Mobile Optimization

### Responsive Layout
- Stacked content on mobile
- Collapsible sections
- Bottom sheet for actions
- Swipe between tabs

### Mobile-Specific Components
- `ArtistMarketplaceMobile.tsx` - Optimized store layout
- `ArtistMobileHeader.tsx` - Compact header
- `ArtistMobileNavigation.tsx` - Touch-friendly tabs

### Touch Interactions
- Swipe to navigate tabs
- Pull to refresh
- Long press for actions
- Bottom sheet modals

## Marketplace Integration

### Purchase Flow
```typescript
const handlePurchase = async (item) => {
  // Check credits
  if (currentUser.credits < item.price) {
    toast.error('Insufficient credits');
    return;
  }
  
  // Process purchase
  await purchaseItem(item.id, currentUser.id);
  
  // Update user credits
  updateUserCredits(currentUser.credits - item.price);
  
  // Grant access
  grantAccess(currentUser.id, item.id);
  
  toast.success(`Purchased ${item.title}!`);
};
```

### Revenue Tracking
```typescript
const calculateRevenue = (sales) => {
  return sales.reduce((total, sale) => {
    const platformFee = sale.price * 0.15; // 15% platform fee
    return total + (sale.price - platformFee);
  }, 0);
};
```

## Fan Support System

### Support Actions
- **Follow**: Basic support, free
- **Purchase**: Buy tracks/merch
- **Tip**: Direct financial support
- **Message**: Direct communication
- **Share**: Spread the word

### Fan Tiers (Future)
- **Casual**: Followed, occasional purchase
- **Supporter**: Regular purchases, engagement
- **Patron**: Monthly support, exclusive access
- **Superfan**: Highest tier, all benefits

## Testing Checklist

### Profile Viewing
- [ ] Load artist profile
- [ ] See bio and stats
- [ ] Navigate between tabs
- [ ] Follow/unfollow works
- [ ] Message button opens modal
- [ ] View posts history
- [ ] View comments history

### Marketplace
- [ ] Browse marketplace items
- [ ] Filter by type (tracks/merch)
- [ ] Click to view details
- [ ] Purchase flow works
- [ ] Revenue displayed (artist view)

### Analytics (Artist Only)
- [ ] View analytics tab
- [ ] See stream charts
- [ ] See revenue data
- [ ] Fan insights display
- [ ] Metrics update

### Content Management (Artist Only)
- [ ] Upload track
- [ ] Create crate
- [ ] Edit content
- [ ] Delete content
- [ ] Schedule posts (future)

### Mobile
- [ ] Profile loads on mobile
- [ ] Tabs scroll horizontally
- [ ] Marketplace mobile view
- [ ] Touch interactions work
- [ ] Bottom sheets functional

## Common Issues

### Profile Not Loading
- Check artist ID in route
- Verify artist exists in mock data
- Check `ArtistProfile` component mount

### Marketplace Items Missing
- Verify `marketplace` data structure
- Check filter state
- Ensure items have required fields

### Analytics Not Showing
- Verify user is viewing own profile
- Check `isOwnProfile` boolean
- Ensure analytics data exists

### Follow Button Not Working
- Check `handleFollow` function
- Verify state update
- Check optimistic UI update

## Future Enhancements

### Planned Features
1. **Verified Badge**: For established artists
2. **Collaboration Tools**: Co-releases
3. **Tour Dates**: Live show management
4. **Presave Campaigns**: Pre-release features
5. **Fan Clubs**: Exclusive communities
6. **Livestreaming**: Live performances
7. **NFT Integration**: Digital collectibles
8. **Advanced Analytics**: ML-powered insights

### Backend Integration Needs
- Real artist profiles from database
- File upload for tracks/artwork
- Payment processing (Stripe)
- Revenue payout system
- Analytics data collection
- Fan messaging system

## Code Examples

### Load Artist Profile
```typescript
const loadArtistProfile = async (username) => {
  try {
    const response = await fetch(`/api/artists/${username}`);
    const artist = await response.json();
    return artist;
  } catch (error) {
    toast.error('Failed to load artist profile');
    console.error(error);
  }
};
```

### Follow Artist
```typescript
const handleFollow = async () => {
  setIsFollowing(!isFollowing);
  
  try {
    await fetch('/api/artists/follow', {
      method: 'POST',
      body: JSON.stringify({
        artistId: artist.id,
        userId: currentUser.id,
        action: isFollowing ? 'unfollow' : 'follow'
      })
    });
    
    toast.success(isFollowing ? 'Unfollowed' : 'Following!');
  } catch (error) {
    setIsFollowing(isFollowing); // Revert on error
    toast.error('Failed to update follow status');
  }
};
```

### Track Purchase
```typescript
const handleTrackPurchase = async (track) => {
  // Open purchase modal
  setSelectedTrack(track);
  setShowPurchaseModal(true);
};

const completePurchase = async () => {
  try {
    const response = await fetch('/api/marketplace/purchase', {
      method: 'POST',
      body: JSON.stringify({
        itemId: selectedTrack.id,
        userId: currentUser.id,
        price: selectedTrack.price
      })
    });
    
    if (response.ok) {
      toast.success('Track purchased!');
      updateUserLibrary(selectedTrack);
      setShowPurchaseModal(false);
    }
  } catch (error) {
    toast.error('Purchase failed');
  }
};
```

## Related Files
- `/data/mockData.ts` - Mock artist data
- `/hooks/useAuth.ts` - Current user state
- `/hooks/useDataHandlers.ts` - Follow/purchase handlers
- `/components/TrackPurchaseModal.tsx` - Purchase interface
- `/components/FanSupportActions.tsx` - Support buttons
- `/components/TrackUploadModal.tsx` - Upload interface

## Documentation
- See `ARCHITECTURE.md` for system design
- See `COMPONENT-GUIDE.md` for component details
- See `STATE-MANAGEMENT.md` for state patterns
- See `README-MARKETPLACE.md` for marketplace details (to be created)
