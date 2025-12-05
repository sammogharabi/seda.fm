import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Crown, 
  Trophy, 
  Music, 
  Calendar, 
  Star,
  Medal,
  Award,
  Zap,
  TrendingUp,
  Users,
  PlayCircle,
  Settings,
  Radio
} from 'lucide-react';

const MOCK_BADGES = [
  { id: 1, name: 'First Steps', description: 'Joined sedā.fm', icon: '🎵', tier: 'bronze', date: '2024-01-15', rarity: 'common' },
  { id: 2, name: 'DJ Debut', description: 'Hosted first DJ session', icon: '🎧', tier: 'silver', date: '2024-01-20', rarity: 'uncommon' },
  { id: 3, name: 'Crowd Pleaser', description: 'Track got 50+ upvotes', icon: '👍', tier: 'gold', date: '2024-02-01', rarity: 'rare' },
  { id: 4, name: 'Genre Explorer', description: 'Active in 5+ genres', icon: '🌟', tier: 'platinum', date: '2024-02-15', rarity: 'epic' },
  { id: 5, name: 'Night Owl', description: 'DJ session at 3 AM', icon: '🦉', tier: 'diamond', date: '2024-03-01', rarity: 'legendary' },
  { id: 6, name: 'Tastemaker', description: 'Top 10 in genre leaderboard', icon: '👑', tier: 'master', date: '2024-03-10', rarity: 'mythic' }
];

const MOCK_STATS = [
  { label: 'Tracks Played', value: 1247, icon: PlayCircle },
  { label: 'Sessions Hosted', value: 89, icon: Radio },
  { label: 'Total Upvotes', value: 3521, icon: TrendingUp },
  { label: 'Followers', value: 156, icon: Users }
];

const TIER_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  master: '#FF6B6B'
};

const RARITY_GLOWS = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
  mythic: '#EF4444'
};

export function UserProfile({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const currentLevel = Math.floor(user.djPoints / 100) + 1;
  const nextLevelPoints = currentLevel * 100;
  const progressToNext = ((user.djPoints % 100) / 100) * 100;

  const topGenres = user.genres.slice(0, 3);
  const joinDate = new Date(user.joinedDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-2xl">
                {user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl">{user.username}</h1>
                {user.verified && <Crown className="w-6 h-6 text-yellow-500" />}
                {user.isArtist && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black">
                    Artist
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-4">
                {user.bio || 'Music enthusiast and DJ'}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  <span>{user.connectedServices.join(', ')}</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trophies">Trophy Case</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DJ Points & Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#00ff88]" />
                  DJ Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl mb-1">{user.djPoints.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">DJ Points</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level {currentLevel}</span>
                      <span>Level {currentLevel + 1}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {100 - (user.djPoints % 100)} points to next level
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Genres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#00ccff]" />
                  Top Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topGenres.map((genre, index) => (
                    <div key={genre} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-[#00ff88]' : 
                          index === 1 ? 'bg-[#00ccff]' : 
                          'bg-muted-foreground'
                        }`} />
                        <span>{genre}</span>
                      </div>
                      <Badge variant="outline">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {MOCK_BADGES.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-muted-foreground transition-colors cursor-pointer"
                    style={{
                      boxShadow: `0 0 20px ${RARITY_GLOWS[badge.rarity]}20`
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2"
                      style={{ 
                        backgroundColor: TIER_COLORS[badge.tier] + '20',
                        border: `2px solid ${TIER_COLORS[badge.tier]}`
                      }}
                    >
                      {badge.icon}
                    </div>
                    <h4 className="text-xs text-center mb-1">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground text-center">
                      {new Date(badge.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trophies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Trophy Case ({MOCK_BADGES.length} badges)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {MOCK_BADGES.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-muted-foreground transition-all duration-300 cursor-pointer group"
                    style={{
                      boxShadow: `0 0 30px ${RARITY_GLOWS[badge.rarity]}30`
                    }}
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: TIER_COLORS[badge.tier] + '20',
                        border: `3px solid ${TIER_COLORS[badge.tier]}`,
                        boxShadow: `0 0 20px ${RARITY_GLOWS[badge.rarity]}40`
                      }}
                    >
                      {badge.icon}
                    </div>
                    <h4 className="text-sm text-center mb-1">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground text-center mb-2">
                      {badge.description}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: RARITY_GLOWS[badge.rarity] }}
                    >
                      {badge.rarity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(badge.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MOCK_STATS.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl mb-1">{stat.value.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                  <div className="flex-1">
                    <p className="text-sm">Earned "Tastemaker" badge</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-[#00ccff]" />
                  <div className="flex-1">
                    <p className="text-sm">Hosted DJ session in #electronic</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm">Track "Midnight City" got 25 upvotes</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playlists">
          <Card>
            <CardHeader>
              <CardTitle>Your Playlists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No playlists yet</p>
                <Button className="mt-4">Create Your First Playlist</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}