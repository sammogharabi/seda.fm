# User Profiles (Fans) - README

## Overview
User Profiles (Fans) showcase fan members of the sedā.fm community. Unlike artist profiles which focus on music creation and sales, fan profiles emphasize music discovery, curation, and community engagement with a progression system.

## Component Location
- **Main Component**: `/components/UserProfile-fixed.tsx`

## Feature Description
Fan profiles include:
- User identity and stats
- Post and comment history
- Listening activity and stats
- Created crates
- Followed artists
- Progression system (Level, XP, badges)
- Social engagement metrics
- Achievement showcase

## Profile Sections

### 1. Profile Header
- **Initial Badge**: Letter-based badge with accent color (no avatar)
- **Display Name**: User's chosen name
- **Username**: @username handle
- **Member Since**: Join date
- **Level & XP**: Current level and progress bar
- **Stats Row**: Posts, Followers, Following counts
- **Action Buttons**: Follow/Unfollow, Message, Options

### 2. Navigation Tabs
- **Overview**: Summary and highlights
- **Posts**: User's post history
- **Comments**: Comment activity
- **Crates**: Created playlists
- **Listening**: Play history and stats
- **Badges**: Achievement showcase

## Design Philosophy

### Anti-Big Tech Aesthetic
- No circular avatars - initial badges only
- Underground music collective vibe
- Backstage pass styling
- Dark mode with accent colors
- Professional spacing and typography

### Visual Identity Through Badges
Each user has an accent color (coral/blue/mint/yellow):
```tsx
<div 
  className="w-24 h-24 rounded-full flex items-center justify-center font-black border-2"
  style={{
    backgroundColor: `var(--color-accent-${user.accentColor})`,
    borderColor: `var(--color-accent-${user.accentColor})`
  }}
>
  {user.displayName[0]}
</div>
```

## Technical Implementation

### Component Structure
```typescript
export function UserProfileFixed({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'comments' | 'crates' | 'listening' | 'badges'>('overview');
  const [user, setUser] = useState<FanUser | null>(null);
  const { currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="user-profile">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent activeTab={activeTab} user={user} />
    </div>
  );
}
```

### Data Structure
```typescript
interface FanUser {
  id: string;
  displayName: string;
  username: string;
  bio?: string;
  accentColor: 'coral' | 'blue' | 'mint' | 'yellow';
  memberSince: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  
  // Stats
  postCount: number;
  followerCount: number;
  followingCount: number;
  crateCount: number;
  tracksSaved: number;
  totalListeningTime: number;
  
  // Collections
  posts: Post[];
  comments: Comment[];
  crates: Crate[];
  listeningHistory: Track[];
  badges: Badge[];
  
  // Social
  followers: string[];
  following: string[];
  blockedUsers: string[];
}
```

## Tab Details

### Overview Tab
**Content**:
- Bio/description
- Recent activity feed
- Top crates
- Favorite artists
- Current level & XP
- Featured badges
- Listening stats summary

**Layout**:
```tsx
<div className="overview-tab space-y-6">
  <UserBio text={user.bio} />
  <LevelProgress current={user.xp} next={user.xpToNextLevel} />
  <FeaturedBadges badges={user.badges.slice(0, 4)} />
  <TopCrates crates={user.crates.slice(0, 3)} />
  <ListeningStats user={user} />
  <RecentActivity activities={user.recentActivity} />
</div>
```

### Posts Tab
**Features**:
- Chronological post history
- Post type indicators (text/track/crate)
- Engagement metrics (likes, comments, reposts)
- Track preview cards
- Click to expand full post
- Infinite scroll

**Layout**:
```tsx
<div className="posts-tab">
  {posts.map(post => (
    <PostCard
      key={post.id}
      post={post}
      showTrackPreview
      showEngagement
      compact={false}
    />
  ))}
</div>
```

### Comments Tab
**Features**:
- All user comments
- Parent post context shown
- Comment timestamps
- "View Post" links
- Sort by recent/popular
- Engagement metrics

**Layout**:
```tsx
<div className="comments-tab">
  {comments.map(comment => (
    <CommentWithContext
      key={comment.id}
      comment={comment}
      showPostPreview
      showTimestamp
    />
  ))}
</div>
```

### Crates Tab
**Features**:
- User's created crates
- Crate cover art
- Track counts and duration
- Public/private indicator
- Play entire crate button
- Edit/delete (if own profile)

**Grid Layout**:
```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {crates.map(crate => (
    <CrateCard
      key={crate.id}
      crate={crate}
      showTrackCount
      showDuration
      onPlay={() => playEntireCrate(crate)}
    />
  ))}
</div>
```

### Listening Tab
**Features**:
- Recently played tracks
- All-time top tracks
- Listening time stats
- Favorite genres chart
- Discovery stats
- Listening streaks

**Stats Display**:
```tsx
<div className="listening-stats">
  <StatCard label="Total Time" value={formatTime(user.totalListeningTime)} />
  <StatCard label="Tracks Played" value={user.tracksPlayed} />
  <StatCard label="Top Genre" value={user.topGenre} />
  <StatCard label="Discovery Score" value={user.discoveryScore} />
</div>
```

### Badges Tab
**Features**:
- All earned badges
- Badge descriptions
- Unlock dates
- Progress on locked badges
- Badge categories
- Rarity indicators

**Grid Layout**:
```tsx
<div className="badges-grid">
  {badges.map(badge => (
    <BadgeCard
      key={badge.id}
      badge={badge}
      isUnlocked={badge.unlocked}
      progress={badge.progress}
      showUnlockDate
    />
  ))}
</div>
```

## Progression System

### Leveling
Users gain XP through:
- Listening to tracks (1 XP per minute)
- Creating posts (10 XP)
- Commenting (5 XP)
- Creating crates (15 XP)
- Getting followers (20 XP)
- Discovering new artists (25 XP)
- Daily login streaks (10 XP/day)
- Completing challenges (varies)

### Level Benefits
Each level unlocks:
- New badges
- Increased upload limits
- Custom profile features
- Exclusive content access
- Community perks

### XP Calculation
```typescript
const calculateXP = (activity: Activity): number => {
  const xpMap = {
    listen_minute: 1,
    create_post: 10,
    create_comment: 5,
    create_crate: 15,
    gain_follower: 20,
    discover_artist: 25,
    daily_login: 10,
    complete_challenge: 50
  };
  
  return xpMap[activity.type] || 0;
};
```

## Badge System

### Badge Categories
1. **Listener Badges**
   - First Track
   - 100 Tracks
   - 1,000 Tracks
   - 10,000 Tracks
   - Night Owl (3am listening)
   - Early Bird (6am listening)

2. **Social Badges**
   - First Post
   - 100 Posts
   - First Follower
   - 100 Followers
   - Community Leader

3. **Curator Badges**
   - First Crate
   - 10 Crates
   - Crate Master
   - Diverse Taste
   - Genre Explorer

4. **Discovery Badges**
   - Early Adopter
   - Trend Setter
   - Underground Hero
   - Global Listener

5. **Engagement Badges**
   - Commenter
   - Conversation Starter
   - Helpful
   - Popular Post

### Badge Design
```tsx
<div className="badge">
  <div className="badge-icon" style={{ background: badge.color }}>
    <badge.icon />
  </div>
  <h3>{badge.name}</h3>
  <p>{badge.description}</p>
  {badge.unlocked && (
    <span className="unlock-date">
      Unlocked {formatDate(badge.unlockedAt)}
    </span>
  )}
</div>
```

## Social Features

### Following System
```typescript
const handleFollow = async (userId: string) => {
  await followUser(userId);
  setUser({
    ...user,
    followerCount: user.followerCount + 1
  });
  toast.success(`Following ${user.displayName}`);
};
```

### Messaging
- Direct message button
- Opens message modal
- Shows online status
- Message notifications

### Privacy Controls
- Block/unblock users
- Report functionality
- Privacy settings
- Content visibility toggles

## Mobile Experience

### Responsive Design
- Single column layout
- Sticky tab navigation
- Swipeable tabs
- Touch-optimized buttons
- Collapsible sections

### Mobile Header
```tsx
<MobileHeader>
  <BackButton />
  <ProfileTitle>{user.displayName}</ProfileTitle>
  <OptionsMenu />
</MobileHeader>
```

## Statistics & Analytics

### Displayed Stats
- Total listening time
- Tracks played
- Crates created
- Posts published
- Comments made
- Followers gained
- Current streak
- Discovery score

### Charts & Visualizations
- Genre distribution pie chart
- Listening time graph
- Activity heatmap
- Top artists list
- Recent discoveries timeline

## Mock Data
Located in `/data/mockData.ts`:
```typescript
export const mockFans: FanUser[] = [
  {
    id: 'fan-1',
    displayName: 'Sarah',
    username: 'sarahcurates',
    accentColor: 'coral',
    bio: 'Underground electronic & experimental',
    memberSince: '2024-01-15',
    level: 12,
    xp: 2450,
    xpToNextLevel: 3000,
    postCount: 87,
    followerCount: 234,
    followingCount: 156,
    crateCount: 23,
    posts: [...],
    comments: [...],
    crates: [...],
    badges: [...]
  }
];
```

## Backend Integration (Future)

### API Endpoints (Planned)
```
GET    /api/users/:id           - Get user profile
PUT    /api/users/:id           - Update profile
GET    /api/users/:id/posts     - Get user posts
GET    /api/users/:id/comments  - Get user comments
GET    /api/users/:id/crates    - Get user crates
GET    /api/users/:id/listening - Get listening stats
GET    /api/users/:id/badges    - Get user badges
POST   /api/users/:id/follow    - Follow user
DELETE /api/users/:id/follow    - Unfollow user
POST   /api/users/:id/message   - Send message
```

## Testing Checklist

### Functionality
- [ ] Profile loads correctly
- [ ] All tabs work
- [ ] Follow/unfollow works
- [ ] XP displays correctly
- [ ] Badges show properly
- [ ] Stats are accurate
- [ ] Own profile editable
- [ ] Other profiles read-only

### UI/UX
- [ ] Responsive on all devices
- [ ] Initial badges display
- [ ] Accent colors apply
- [ ] Tabs navigate smoothly
- [ ] Loading states show
- [ ] Empty states handled

### Performance
- [ ] Fast initial load
- [ ] Efficient tab switching
- [ ] Optimized image loading
- [ ] Smooth scrolling
- [ ] No layout shifts

## Customization Options

### Profile Settings
- Change display name
- Update username
- Edit bio
- Select accent color
- Privacy settings
- Notification preferences
- Blocked users list

### Privacy Settings
- Profile visibility (public/private)
- Show listening activity
- Show followers/following
- Allow messages from anyone
- Show badges
- Show level/XP

## Future Enhancements

### Planned Features
1. **Profile Themes**
   - Custom color schemes
   - Background patterns
   - Typography options

2. **Achievements**
   - Weekly challenges
   - Community events
   - Seasonal achievements

3. **Social Graph**
   - Mutual followers
   - Connection suggestions
   - Network visualization

4. **Profile Insights**
   - Audience analytics
   - Engagement metrics
   - Growth trends

5. **Verification**
   - Verified fan badge
   - Power user status
   - Community leader

## Related Features
- **Artist Profiles**: Creator-focused profiles
- **Social Feed**: User posts and activity
- **Progression System**: XP and leveling
- **Crates**: User playlists
- **Badges**: Achievement system

## Related Documentation
- `ARCHITECTURE.md` - System design
- `COMPONENT-GUIDE.md` - Components
- `STATE-MANAGEMENT.md` - State patterns
- `FEATURE-POST-COMMENT-HISTORY.md` - History feature
- `README-ARTIST-PROFILES.md` - Artist profiles

## Quick Reference

### Load User Profile
```typescript
const loadUserProfile = async (userId: string) => {
  setLoading(true);
  const userData = await fetchUserProfile(userId);
  setUser(userData);
  setLoading(false);
};
```

### Calculate Level Progress
```typescript
const getLevelProgress = (xp: number, nextLevel: number) => {
  const progress = (xp / nextLevel) * 100;
  return Math.min(progress, 100);
};
```

## Status
✅ **Current**: Working with mock data  
✅ **Recent**: Added Posts & Comments tabs  
⏳ **Next**: Backend integration  
🚀 **Future**: Profile themes, achievements, insights
