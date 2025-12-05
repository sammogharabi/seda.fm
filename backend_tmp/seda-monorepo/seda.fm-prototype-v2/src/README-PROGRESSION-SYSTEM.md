# Progression System - README

## Overview
The Progression System is sedā.fm's gamification layer that rewards users for engagement through XP (experience points), levels, badges, and achievements. It encourages discovery, creation, and community participation.

## Component Location
- **Progression Dashboard**: `/components/ProgressionDashboard.tsx`
- **XP Notification System**: `/components/XPNotificationSystem.tsx`
- **Utility Functions**: `/utils/progression.ts`
- **Service**: `/utils/progressionService.ts`

## Feature Description
The Progression System provides:
- XP earning through activities
- Level advancement
- Badge unlocks
- Achievement tracking
- Leaderboards
- Streak bonuses
- Challenges
- Rewards

## Core Concepts

### Experience Points (XP)
XP is earned through various activities:
- Listening to music
- Creating posts
- Commenting
- Creating crates
- Discovering new artists
- Daily logins
- Completing challenges

### Levels
Users advance through levels by earning XP:
- Level 1-10: Beginner (100 XP per level)
- Level 11-25: Intermediate (250 XP per level)
- Level 26-50: Advanced (500 XP per level)
- Level 51-75: Expert (1000 XP per level)
- Level 76-99: Master (2000 XP per level)
- Level 100: Legend

### Badges
Visual achievements earned by completing specific tasks:
- Activity badges (listening, posting)
- Social badges (followers, engagement)
- Curator badges (crates, quality)
- Discovery badges (exploring, finding)
- Special badges (events, milestones)

## Technical Implementation

### Data Structure
```typescript
interface UserProgression {
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  
  // Badges
  badges: Badge[];
  unlockedBadges: string[];
  badgeProgress: Record<string, number>;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastActivity: string;
  
  // Challenges
  activeChallenges: Challenge[];
  completedChallenges: string[];
  
  // Stats
  totalListeningTime: number;
  tracksPlayed: number;
  postsCreated: number;
  commentsCreated: number;
  cratesCreated: number;
  artistsDiscovered: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'activity' | 'social' | 'curator' | 'discovery' | 'special';
  requirement: BadgeRequirement;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}

interface BadgeRequirement {
  type: string;
  target: number;
  current?: number;
}
```

### XP Calculation
Located in `/utils/progression.ts`:

```typescript
export const XP_VALUES = {
  // Listening
  LISTEN_MINUTE: 1,
  COMPLETE_TRACK: 5,
  DISCOVER_ARTIST: 25,
  
  // Social
  CREATE_POST: 10,
  CREATE_COMMENT: 5,
  GET_LIKE: 2,
  GET_REPOST: 5,
  GET_FOLLOWER: 20,
  
  // Curation
  CREATE_CRATE: 15,
  CRATE_SAVED: 10,
  
  // Special
  DAILY_LOGIN: 10,
  WEEKLY_STREAK: 50,
  MONTHLY_STREAK: 200,
  COMPLETE_CHALLENGE: 100
};

export const calculateXP = (activity: Activity): number => {
  const baseXP = XP_VALUES[activity.type] || 0;
  const multiplier = getMultiplier(activity);
  return Math.floor(baseXP * multiplier);
};

const getMultiplier = (activity: Activity): number => {
  let multiplier = 1.0;
  
  // Streak bonus
  if (activity.streakDay > 7) multiplier += 0.5;
  if (activity.streakDay > 30) multiplier += 1.0;
  
  // Level bonus
  if (activity.userLevel > 50) multiplier += 0.25;
  
  // Time-based bonus (3am-6am)
  const hour = new Date().getHours();
  if (hour >= 3 && hour < 6) multiplier += 0.2;
  
  return multiplier;
};
```

### Level Calculation
```typescript
export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  let xpRequired = 0;
  
  const levelThresholds = [
    { maxLevel: 10, xpPerLevel: 100 },
    { maxLevel: 25, xpPerLevel: 250 },
    { maxLevel: 50, xpPerLevel: 500 },
    { maxLevel: 75, xpPerLevel: 1000 },
    { maxLevel: 99, xpPerLevel: 2000 }
  ];
  
  for (const threshold of levelThresholds) {
    while (level < threshold.maxLevel) {
      xpRequired += threshold.xpPerLevel;
      if (totalXP < xpRequired) return level;
      level++;
    }
  }
  
  return level;
};

export const getXPForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= 100) return 0;
  if (currentLevel < 10) return 100;
  if (currentLevel < 25) return 250;
  if (currentLevel < 50) return 500;
  if (currentLevel < 75) return 1000;
  return 2000;
};
```

## XP Activities

### Listening Activities
```typescript
// Playing a track
export const trackListenXP = (durationMinutes: number) => {
  return Math.floor(durationMinutes * XP_VALUES.LISTEN_MINUTE);
};

// Completing a track (>80% listened)
export const trackCompleteXP = () => {
  return XP_VALUES.COMPLETE_TRACK;
};

// Discovering new artist
export const discoverArtistXP = () => {
  return XP_VALUES.DISCOVER_ARTIST;
};
```

### Social Activities
```typescript
// Creating a post
export const createPostXP = (postType: string) => {
  const baseXP = XP_VALUES.CREATE_POST;
  // Bonus for posts with tracks
  return postType === 'track' ? baseXP * 1.5 : baseXP;
};

// Creating a comment
export const createCommentXP = () => {
  return XP_VALUES.CREATE_COMMENT;
};

// Getting engagement
export const engagementXP = (type: 'like' | 'repost' | 'follower') => {
  return XP_VALUES[`GET_${type.toUpperCase()}`] || 0;
};
```

### Curation Activities
```typescript
// Creating a crate
export const createCrateXP = (trackCount: number) => {
  const baseXP = XP_VALUES.CREATE_CRATE;
  // Bonus for larger crates
  const bonus = Math.floor(trackCount / 10) * 5;
  return baseXP + bonus;
};

// Crate saved by others
export const crateSavedXP = () => {
  return XP_VALUES.CRATE_SAVED;
};
```

### Streak Bonuses
```typescript
export const dailyLoginXP = (streakDay: number) => {
  const baseXP = XP_VALUES.DAILY_LOGIN;
  
  // Weekly streak bonus
  if (streakDay % 7 === 0) {
    return baseXP + XP_VALUES.WEEKLY_STREAK;
  }
  
  // Monthly streak bonus
  if (streakDay % 30 === 0) {
    return baseXP + XP_VALUES.MONTHLY_STREAK;
  }
  
  return baseXP;
};
```

## Badge System

### Badge Definitions
```typescript
export const BADGES: Badge[] = [
  // Listening Badges
  {
    id: 'first-track',
    name: 'First Track',
    description: 'Played your first track',
    icon: 'Music',
    rarity: 'common',
    category: 'activity',
    requirement: { type: 'tracks_played', target: 1 }
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Played 100 tracks',
    icon: 'Trophy',
    rarity: 'rare',
    category: 'activity',
    requirement: { type: 'tracks_played', target: 100 }
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Listened between 3am-6am',
    icon: 'Moon',
    rarity: 'epic',
    category: 'special',
    requirement: { type: 'night_listening', target: 1 }
  },
  
  // Social Badges
  {
    id: 'first-post',
    name: 'First Post',
    description: 'Created your first post',
    icon: 'MessageSquare',
    rarity: 'common',
    category: 'social',
    requirement: { type: 'posts_created', target: 1 }
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Reached 100 followers',
    icon: 'Users',
    rarity: 'epic',
    category: 'social',
    requirement: { type: 'followers', target: 100 }
  },
  
  // Curator Badges
  {
    id: 'curator',
    name: 'Curator',
    description: 'Created your first crate',
    icon: 'Box',
    rarity: 'common',
    category: 'curator',
    requirement: { type: 'crates_created', target: 1 }
  },
  {
    id: 'crate-master',
    name: 'Crate Master',
    description: 'Created 10 crates',
    icon: 'Package',
    rarity: 'rare',
    category: 'curator',
    requirement: { type: 'crates_created', target: 10 }
  },
  
  // Discovery Badges
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Discovered an artist before they hit 100 followers',
    icon: 'Zap',
    rarity: 'legendary',
    category: 'discovery',
    requirement: { type: 'early_discovery', target: 1 }
  },
  {
    id: 'genre-explorer',
    name: 'Genre Explorer',
    description: 'Listened to 10 different genres',
    icon: 'Compass',
    rarity: 'epic',
    category: 'discovery',
    requirement: { type: 'genres_explored', target: 10 }
  }
];
```

### Badge Checking
```typescript
export const checkBadgeUnlock = (
  badge: Badge,
  userStats: UserProgression
): boolean => {
  const { requirement } = badge;
  
  switch (requirement.type) {
    case 'tracks_played':
      return userStats.tracksPlayed >= requirement.target;
    case 'posts_created':
      return userStats.postsCreated >= requirement.target;
    case 'crates_created':
      return userStats.cratesCreated >= requirement.target;
    case 'followers':
      return userStats.followerCount >= requirement.target;
    // ... more checks
    default:
      return false;
  }
};

export const checkAllBadges = (userStats: UserProgression): Badge[] => {
  const newlyUnlocked: Badge[] = [];
  
  BADGES.forEach(badge => {
    if (
      !userStats.unlockedBadges.includes(badge.id) &&
      checkBadgeUnlock(badge, userStats)
    ) {
      newlyUnlocked.push(badge);
    }
  });
  
  return newlyUnlocked;
};
```

## XP Notification System

### Toast Notifications
```typescript
export function XPNotificationSystem() {
  const [notifications, setNotifications] = useState<XPNotification[]>([]);

  const addXPNotification = (xp: number, activity: string) => {
    const notification: XPNotification = {
      id: generateId(),
      xp,
      activity,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(n => n.id !== notification.id)
      );
    }, 3000);
  };

  return (
    <div className="xp-notifications fixed top-20 right-4 space-y-2 z-50">
      {notifications.map(notification => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="bg-[#1a1a1a] border border-[#ff6b6b] rounded-lg p-3 flex items-center gap-3"
        >
          <div className="text-[#ff6b6b] font-black">+{notification.xp} XP</div>
          <div className="text-sm opacity-70">{notification.activity}</div>
        </motion.div>
      ))}
    </div>
  );
}
```

### Level Up Animation
```tsx
<AnimatePresence>
  {showLevelUp && (
    <motion.div
      className="level-up-modal"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
    >
      <Sparkles />
      <h2>Level Up!</h2>
      <LevelBadge level={newLevel} />
      <p>You've reached Level {newLevel}</p>
      <RewardsList rewards={levelRewards} />
    </motion.div>
  )}
</AnimatePresence>
```

## Progression Dashboard

### Dashboard Layout
```tsx
<ProgressionDashboard user={user}>
  <LevelSection>
    <CurrentLevel level={user.level} />
    <XPProgress 
      current={user.xp}
      target={user.xpToNextLevel}
    />
  </LevelSection>
  
  <BadgesSection>
    <BadgeGrid badges={user.badges} />
    <BadgeProgress inProgress={nearlyUnlockedBadges} />
  </BadgesSection>
  
  <StreakSection>
    <CurrentStreak days={user.currentStreak} />
    <StreakCalendar activities={user.recentActivity} />
  </StreakSection>
  
  <ChallengesSection>
    <ActiveChallenges challenges={user.activeChallenges} />
    <CompletedCount count={user.completedChallenges.length} />
  </ChallengesSection>
  
  <StatsSection>
    <StatCard label="Total XP" value={user.totalXP} />
    <StatCard label="Badges" value={user.badges.length} />
    <StatCard label="Current Streak" value={user.currentStreak} />
  </StatsSection>
</ProgressionDashboard>
```

## Streak System

### Tracking Streaks
```typescript
export const updateStreak = (
  lastActivity: string,
  currentStreak: number
): { newStreak: number; maintained: boolean } => {
  const lastDate = new Date(lastActivity);
  const today = new Date();
  
  // Reset time to midnight for comparison
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysDiff === 0) {
    // Same day, maintain streak
    return { newStreak: currentStreak, maintained: true };
  } else if (daysDiff === 1) {
    // Next day, increment streak
    return { newStreak: currentStreak + 1, maintained: true };
  } else {
    // Streak broken
    return { newStreak: 1, maintained: false };
  }
};
```

### Streak Rewards
```typescript
export const getStreakRewards = (streakDay: number): Reward[] => {
  const rewards: Reward[] = [];
  
  // Weekly rewards
  if (streakDay % 7 === 0) {
    rewards.push({
      type: 'xp',
      value: XP_VALUES.WEEKLY_STREAK,
      label: 'Weekly Streak Bonus'
    });
  }
  
  // Monthly rewards
  if (streakDay % 30 === 0) {
    rewards.push({
      type: 'xp',
      value: XP_VALUES.MONTHLY_STREAK,
      label: 'Monthly Streak Bonus'
    });
    rewards.push({
      type: 'badge',
      value: 'streak-master',
      label: 'Streak Master Badge'
    });
  }
  
  return rewards;
};
```

## Challenges

### Challenge Types
```typescript
interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  tasks: Task[];
  reward: Reward;
  expiresAt: string;
  progress: number;
}

interface Task {
  id: string;
  description: string;
  requirement: {
    type: string;
    target: number;
  };
  completed: boolean;
  progress: number;
}

// Example challenges
const dailyChallenges = [
  {
    name: 'Music Marathon',
    description: 'Listen to 10 tracks today',
    tasks: [{
      description: 'Play 10 tracks',
      requirement: { type: 'tracks_played', target: 10 }
    }],
    reward: { type: 'xp', value: 50 }
  },
  {
    name: 'Social Butterfly',
    description: 'Create 3 posts or comments',
    tasks: [{
      description: 'Post or comment 3 times',
      requirement: { type: 'social_actions', target: 3 }
    }],
    reward: { type: 'xp', value: 30 }
  }
];
```

## Leaderboards

### Leaderboard Types
```typescript
interface Leaderboard {
  type: 'xp' | 'level' | 'streak' | 'badges' | 'listening';
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  accentColor: string;
  value: number;
  change: number; // Rank change from previous period
}
```

### Leaderboard Component
Located in `/components/Leaderboards.tsx`:
```tsx
<Leaderboards>
  <LeaderboardTabs>
    <Tab active={type === 'xp'}>XP</Tab>
    <Tab active={type === 'level'}>Level</Tab>
    <Tab active={type === 'streak'}>Streak</Tab>
  </LeaderboardTabs>
  
  <PeriodSelector>
    <Option>Daily</Option>
    <Option>Weekly</Option>
    <Option>All-Time</Option>
  </PeriodSelector>
  
  <LeaderboardList>
    {entries.map((entry, index) => (
      <LeaderboardEntry key={entry.userId}>
        <Rank>{entry.rank}</Rank>
        <UserBadge user={entry} />
        <Value>{entry.value.toLocaleString()}</Value>
        {entry.change !== 0 && (
          <Change positive={entry.change > 0}>
            {entry.change > 0 ? '↑' : '↓'}{Math.abs(entry.change)}
          </Change>
        )}
      </LeaderboardEntry>
    ))}
  </LeaderboardList>
</Leaderboards>
```

## Level Rewards

### Rewards by Level
```typescript
export const LEVEL_REWARDS: Record<number, Reward[]> = {
  5: [{ type: 'badge', value: 'level-5' }],
  10: [
    { type: 'badge', value: 'level-10' },
    { type: 'feature', value: 'custom_accent_color' }
  ],
  25: [
    { type: 'badge', value: 'level-25' },
    { type: 'feature', value: 'profile_customization' }
  ],
  50: [
    { type: 'badge', value: 'level-50' },
    { type: 'feature', value: 'verified_badge' }
  ],
  75: [
    { type: 'badge', value: 'level-75' },
    { type: 'feature', value: 'priority_support' }
  ],
  100: [
    { type: 'badge', value: 'legend' },
    { type: 'feature', value: 'all_features' },
    { type: 'title', value: 'Legend' }
  ]
};
```

## Testing Checklist

### Functionality
- [ ] XP calculated correctly
- [ ] Level ups at correct thresholds
- [ ] Badges unlock properly
- [ ] Streaks track accurately
- [ ] Challenges complete
- [ ] Leaderboards update
- [ ] Notifications display

### UI/UX
- [ ] Progress bars animate smoothly
- [ ] Level up animation plays
- [ ] XP toasts appear and disappear
- [ ] Badge icons display
- [ ] Mobile responsive
- [ ] Loading states

## Future Enhancements

### Planned Features
1. **Seasonal Events**
   - Limited-time challenges
   - Exclusive seasonal badges
   - Event leaderboards

2. **Teams/Guilds**
   - Group progression
   - Team challenges
   - Collaborative goals

3. **Prestige System**
   - Reset to Level 1 with bonuses
   - Prestige badges
   - Increased XP multipliers

4. **Achievement Sharing**
   - Share level ups to feed
   - Badge showcase posts
   - Progress updates

5. **Mentorship Program**
   - High-level users mentor new users
   - Bonus XP for both
   - Exclusive mentor badges

## Related Features
- **User Profiles**: Display level and badges
- **Social Feed**: Share achievements
- **Leaderboards**: Competitive rankings

## Related Documentation
- `ARCHITECTURE.md` - System design
- `README-USER-PROFILES.md` - Profile integration
- `COMPONENT-GUIDE.md` - Components

## Quick Reference

### Award XP
```typescript
const awardXP = async (userId: string, xp: number, activity: string) => {
  const user = await getUserProgression(userId);
  const newXP = user.xp + xp;
  const newLevel = calculateLevel(user.totalXP + xp);
  
  await updateUserProgression(userId, {
    xp: newXP,
    totalXP: user.totalXP + xp,
    level: newLevel
  });
  
  showXPNotification(xp, activity);
  
  if (newLevel > user.level) {
    showLevelUpAnimation(newLevel);
  }
};
```

## Status
✅ **Current**: Working with mock data  
⏳ **Next**: Backend integration  
🚀 **Future**: Seasons, teams, prestige system
