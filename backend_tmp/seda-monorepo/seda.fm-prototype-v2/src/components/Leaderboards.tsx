import React, { useState, useCallback, useEffect } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Star,
  TrendingUp,
  Users,
  Music,
  Flame,
  Zap,
  Target,
  Timer,
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Heart,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { progressionService } from '../utils/progressionService';
import { formatXP, getBadgeColor } from '../utils/progression';
import { ProgressBar } from './ProgressBar';

const GLOBAL_LEADERBOARD = [
  { rank: 1, username: 'dj_apex', points: 15420, verified: true, badge: '👑' },
  { rank: 2, username: 'beat_architect', points: 12890, verified: true, badge: '🥇' },
  { rank: 3, username: 'sound_weaver', points: 11245, verified: false, badge: '🥈' },
  { rank: 4, username: 'melody_master', points: 9876, verified: true, badge: '🥉' },
  { rank: 5, username: 'rhythm_king', points: 8654, verified: false, badge: '🔥' },
  { rank: 6, username: 'bass_hunter', points: 7432, verified: false, badge: '🔥' },
  { rank: 7, username: 'synth_lord', points: 6789, verified: true, badge: '🔥' },
  { rank: 8, username: 'drop_master', points: 6234, verified: false, badge: '🔥' },
  { rank: 9, username: 'wave_rider', points: 5890, verified: false, badge: '🔥' },
  { rank: 10, username: 'beat_boxer', points: 5456, verified: false, badge: '🔥' }
];

const GENRE_LEADERBOARDS = {
  'Hip Hop': [
    { rank: 1, username: 'rap_god_2024', points: 8945, verified: true, badge: '👑' },
    { rank: 2, username: 'freestyle_king', points: 7234, verified: false, badge: '🥇' },
    { rank: 3, username: 'boom_bap_legend', points: 6789, verified: true, badge: '🥈' }
  ],
  'Electronic': [
    { rank: 1, username: 'techno_wizard', points: 9876, verified: true, badge: '👑' },
    { rank: 2, username: 'house_master', points: 8234, verified: false, badge: '🥇' },
    { rank: 3, username: 'edm_prophet', points: 7890, verified: true, badge: '🥈' }
  ],
  'Rock': [
    { rank: 1, username: 'guitar_hero_x', points: 7654, verified: false, badge: '👑' },
    { rank: 2, username: 'metal_head', points: 6543, verified: true, badge: '🥇' },
    { rank: 3, username: 'indie_rocker', points: 5432, verified: false, badge: '🥈' }
  ]
};

const ROOM_LEADERBOARDS = {
  '#hiphop': [
    { rank: 1, username: 'hip_hop_head', points: 3456, verified: false, badge: '👑' },
    { rank: 2, username: 'trap_master', points: 2890, verified: true, badge: '🥇' },
    { rank: 3, username: 'old_school_fan', points: 2345, verified: false, badge: '🥈' }
  ],
  '#electronic': [
    { rank: 1, username: 'rave_enthusiast', points: 4123, verified: true, badge: '👑' },
    { rank: 2, username: 'bass_dropper', points: 3456, verified: false, badge: '🥇' },
    { rank: 3, username: 'festival_goer', points: 2789, verified: false, badge: '🥈' }
  ]
};

const ARTIST_FAN_LEADERBOARDS = {
  '@diplo': [
    { rank: 1, username: 'diplo_stan', points: 2345, verified: false, badge: '👑' },
    { rank: 2, username: 'major_lazer_fan', points: 1890, verified: false, badge: '🥇' },
    { rank: 3, username: 'jack_u_lover', points: 1567, verified: false, badge: '🥈' }
  ]
};

export function Leaderboards({ user, onViewArtistProfile, onViewFanProfile, mockArtists = [] }) {
  const [activeTab, setActiveTab] = useState('combined');
  const [selectedGenre, setSelectedGenre] = useState('Hip Hop');
  const [selectedRoom, setSelectedRoom] = useState('#hiphop');
  const [selectedArtist, setSelectedArtist] = useState('@diplo');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [userProgression, setUserProgression] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState({
    combined: [],
    dj: [],
    fan: []
  });

  // Helper function to handle user click
  const handleUserClick = useCallback((leaderboardUser) => {
    // Check if user is an artist by looking at verified status or checking mockArtists
    const isArtist = leaderboardUser.verified || mockArtists.some(artist => 
      artist.username === leaderboardUser.username || artist.id === leaderboardUser.id
    );
    
    if (isArtist && onViewArtistProfile) {
      // Create a complete artist object if needed
      const artistData = mockArtists.find(artist => 
        artist.username === leaderboardUser.username || artist.id === leaderboardUser.id
      ) || {
        id: leaderboardUser.id || `artist-${leaderboardUser.username}`,
        username: leaderboardUser.username,
        displayName: leaderboardUser.displayName || leaderboardUser.username,
        verified: leaderboardUser.verified || false,
        accentColor: leaderboardUser.accentColor || 'coral',
        bio: `Music creator and artist`,
        location: 'Unknown',
        genres: ['Electronic', 'Indie'],
        website: '',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
        socialLinks: {}
      };
      onViewArtistProfile(artistData);
    } else if (onViewFanProfile) {
      // Create a fan profile object
      const fanData = {
        id: leaderboardUser.id || `fan-${leaderboardUser.username}`,
        username: leaderboardUser.username,
        displayName: leaderboardUser.displayName || leaderboardUser.username,
        verified: leaderboardUser.verified || false,
        verificationStatus: 'not-requested',
        points: leaderboardUser.points || Math.floor(Math.random() * 2000) + 100,
        accentColor: leaderboardUser.accentColor || 'coral',
        bio: `Music lover and community member`,
        location: 'Unknown',
        joinedDate: new Date('2024-01-15'),
        genres: ['Various'],
        connectedServices: ['Spotify'],
        isArtist: false,
        website: ''
      };
      onViewFanProfile(fanData);
    }
  }, [mockArtists, onViewArtistProfile, onViewFanProfile]);

  useEffect(() => {
    // Get user's progression data
    const progression = progressionService.getProgression(user.id);
    setUserProgression(progression);

    // Get leaderboard data
    setLeaderboardData({
      combined: progressionService.getLeaderboard('combined'),
      dj: progressionService.getLeaderboard('dj'),
      fan: progressionService.getLeaderboard('fan')
    });
  }, [user.id]);
  
  // Mock user ranking data - now based on progression system
  const userRankData = {
    global: { 
      rank: 247, 
      change: +12, 
      points: userProgression?.totalXP || user.points,
      level: userProgression?.level || 1,
      badge: userProgression?.currentBadge || 'Bronze Note'
    },
    dj: { 
      rank: 89, 
      change: +5, 
      points: userProgression?.djPoints || 0,
      level: userProgression?.level || 1,
      badge: userProgression?.currentBadge || 'Bronze Note'
    },
    fan: { 
      rank: 156, 
      change: -2, 
      points: userProgression?.fanSupportXP || 0,
      level: userProgression?.level || 1,
      badge: userProgression?.currentBadge || 'Bronze Note'
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: 'bg-accent-yellow', text: 'text-background' };
    if (rank <= 3) return { bg: 'bg-accent-coral', text: 'text-background' };
    if (rank <= 10) return { bg: 'bg-accent-blue', text: 'text-background' };
    return { bg: 'bg-muted', text: 'text-foreground' };
  };

  const renderLeaderboardItem = useCallback((item, showPoints = true, index = 0) => {
    const isUser = item.username === user.username;
    const change = Math.floor(Math.random() * 20) - 10; // Mock rank change
    const rankBadge = getRankBadge(item.rank);
    
    return (
      <div
        key={`${item.rank}-${item.username}`}
        className={`flex items-center gap-4 p-4 transition-all duration-300 ${
          isUser 
            ? 'bg-accent-coral/10 border border-accent-coral/20' 
            : 'hover:bg-secondary/50 border border-transparent hover:border-border'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center font-semibold ${rankBadge.bg} ${rankBadge.text}`}>
            {item.rank <= 10 ? (
              <span className="text-lg">{item.badge}</span>
            ) : (
              <span className="text-sm">#{item.rank}</span>
            )}
          </div>
          
          <div className={`w-10 h-10 bg-accent-coral text-background flex items-center justify-center border border-foreground/20 font-semibold ${isUser ? 'ring-2 ring-accent-coral ring-offset-2 ring-offset-background' : ''}`}>
            {item.username[0].toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <button 
              onClick={() => handleUserClick(item)}
              className={`font-medium hover:text-accent-coral transition-colors cursor-pointer text-left ${isUser ? 'text-accent-coral' : ''}`}
            >
              {item.displayName || item.username}
            </button>
            {item.verified && (
              <Crown className="w-4 h-4 text-accent-yellow" />
            )}
            {isUser && (
              <Badge className="bg-accent-coral/20 text-accent-coral border-accent-coral/30 text-xs">
                YOU
              </Badge>
            )}
          </div>
          {showPoints && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {item.points.toLocaleString()} pts
              </p>
              {change !== 0 && (
                <div className={`flex items-center gap-1 text-xs ${
                  change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {change > 0 ? <ArrowUp className="w-3 h-3" /> : 
                   change < 0 ? <ArrowDown className="w-3 h-3" /> : 
                   <Minus className="w-3 h-3" />}
                  <span>{Math.abs(change)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className={`font-medium ${isUser ? 'text-accent-coral' : ''}`}>
            #{item.rank}
          </div>
          {item.rank === 1 && (
            <Crown className="w-4 h-4 text-accent-yellow mx-auto mt-1" />
          )}
        </div>
      </div>
    );
  }, [user.username, handleUserClick]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        {/* Professional Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Trophy className="w-8 h-8 text-accent-yellow" />
            <div>
              <h1 className="text-3xl font-semibold text-primary">
                Leaderboards
              </h1>
              <p className="text-muted-foreground">See where you rank among the community</p>
            </div>
          </div>
          
          {/* Time Filter */}
          <div className="flex gap-2">
            {['all-time', 'monthly', 'weekly'].map((filter) => (
              <Button
                key={filter}
                size="sm"
                variant={timeFilter === filter ? 'default' : 'outline'}
                onClick={() => setTimeFilter(filter)}
                className="text-xs capitalize"
              >
                {filter.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 bg-card border border-foreground/10">
            <TabsTrigger value="combined">Combined</TabsTrigger>
            <TabsTrigger value="dj">DJ Points</TabsTrigger>
            <TabsTrigger value="fan">Fan Support</TabsTrigger>
            <TabsTrigger value="genre">Genre</TabsTrigger>
            <TabsTrigger value="room">Room</TabsTrigger>
            <TabsTrigger value="artist">Artist</TabsTrigger>
          </TabsList>

          {/* Combined XP Leaderboard */}
          <TabsContent value="combined" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent-yellow" />
                  Combined XP Leaderboard
                  <Badge variant="outline" className="ml-auto">DJ + Fan Support</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* User's Current Position */}
                {userProgression && (
                  <div className="mb-6">
                    <ProgressBar
                      totalXP={userProgression.totalXP}
                      level={userProgression.level}
                      currentLevelXP={0} // Will be calculated in component
                      nextLevelXP={0} // Will be calculated in component
                      progress={0} // Will be calculated in component
                      badge={userProgression.currentBadge}
                      className="bg-accent-mint/10 border-accent-mint/20"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-accent-mint text-background">#{userRankData.global.rank}</Badge>
                        <span className="text-sm text-muted-foreground">Your Global Rank</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        DJ: {formatXP(userProgression.djPoints)} • Fan: {formatXP(userProgression.fanSupportXP)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {GLOBAL_LEADERBOARD.map((item, index) => renderLeaderboardItem(item, true, index))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DJ Points Leaderboard */}
          <TabsContent value="dj" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-accent-coral" />
                  DJ Points Leaderboard
                  <Badge variant="outline" className="ml-auto">Public Sessions Only</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* DJ-specific user position */}
                {userProgression && (
                  <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${getBadgeColor(userProgression.level)} text-background flex items-center justify-center border border-foreground/20 font-semibold`}>
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold">{user.username}</h4>
                          <p className="text-sm text-muted-foreground">{formatXP(userProgression.djPoints)} DJ Points</p>
                          <p className="text-xs text-muted-foreground">Level {userProgression.level} • {userProgression.currentBadge}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-accent-coral text-background">#{userRankData.dj.rank}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">DJ Rank</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {GLOBAL_LEADERBOARD.map((item, index) => renderLeaderboardItem({
                    ...item,
                    points: Math.floor(item.points * 0.7) // Mock DJ-only points
                  }, true, index))}
                </div>

                {/* DJ Points Info */}
                <div className="mt-6 p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-lg">
                  <h4 className="font-medium text-accent-coral mb-2">How to Earn DJ Points</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• +1 XP per track played in public sessions</li>
                    <li>• +1 XP per audience upvote</li>
                    <li>• -1 XP per audience downvote</li>
                    <li>• Private sessions don't award XP</li>
                    <li>• Need 3+ listeners for session eligibility</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fan Support Leaderboard */}
          <TabsContent value="fan" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-accent-mint" />
                  Fan Support Leaderboard
                  <Badge variant="outline" className="ml-auto">Artist Support</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Fan-specific user position */}
                {userProgression && (
                  <div className="p-4 bg-accent-mint/10 border border-accent-mint/20 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-${getBadgeColor(userProgression.level)} text-background flex items-center justify-center border border-foreground/20 font-semibold`}>
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold">{user.username}</h4>
                          <p className="text-sm text-muted-foreground">{formatXP(userProgression.fanSupportXP)} Support XP</p>
                          <p className="text-xs text-muted-foreground">Level {userProgression.level} • {userProgression.currentBadge}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-accent-mint text-background">#{userRankData.fan.rank}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Fan Rank</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {GLOBAL_LEADERBOARD.map((item, index) => renderLeaderboardItem({
                    ...item,
                    points: Math.floor(item.points * 0.4) // Mock fan support points
                  }, true, index))}
                </div>

                {/* Fan Support Info */}
                <div className="mt-6 p-4 bg-accent-mint/10 border border-accent-mint/20 rounded-lg">
                  <h4 className="font-medium text-accent-mint mb-2">How to Earn Fan Support XP</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• +5 XP per $1 tipped to artists</li>
                    <li>• +10 XP per track purchase</li>
                    <li>• +20 XP per merchandise purchase</li>
                    <li>• +25 XP per event ticket purchase</li>
                    <li>• +10 XP bonus when artists reply to your support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="genre" className="space-y-6 mt-6">
            <div className="flex gap-4 flex-wrap">
              {Object.keys(GENRE_LEADERBOARDS).map(genre => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? 'default' : 'outline'}
                  onClick={() => setSelectedGenre(genre)}
                  size="sm"
                >
                  {genre}
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-accent-blue" />
                  {selectedGenre} Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {GENRE_LEADERBOARDS[selectedGenre]?.map((item, index) => renderLeaderboardItem(item, true, index)) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No rankings available for this genre yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="room" className="space-y-6 mt-6">
            <div className="flex gap-4 flex-wrap">
              {Object.keys(ROOM_LEADERBOARDS).map(room => (
                <Button
                  key={room}
                  variant={selectedRoom === room ? 'default' : 'outline'}
                  onClick={() => setSelectedRoom(room)}
                  size="sm"
                >
                  {room}
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent-coral" />
                  {selectedRoom} Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ROOM_LEADERBOARDS[selectedRoom]?.map((item, index) => renderLeaderboardItem(item, true, index)) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No rankings available for this room yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="artist" className="space-y-6 mt-6">
            <div className="flex gap-4 flex-wrap">
              {Object.keys(ARTIST_FAN_LEADERBOARDS).map(artist => (
                <Button
                  key={artist}
                  variant={selectedArtist === artist ? 'default' : 'outline'}
                  onClick={() => setSelectedArtist(artist)}
                  size="sm"
                >
                  {artist}
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent-yellow" />
                  {selectedArtist} Top Fans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ARTIST_FAN_LEADERBOARDS[selectedArtist]?.map((item, index) => renderLeaderboardItem(item, false, index)) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No fan rankings available for this artist yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Achievement Tiers Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Ranking Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="text-xl">👑</div>
                <div>
                  <p className="text-sm font-medium">#1</p>
                  <p className="text-xs text-muted-foreground">Champion</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl">🥇</div>
                <div>
                  <p className="text-sm font-medium">Top 3</p>
                  <p className="text-xs text-muted-foreground">Elite</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl">🔥</div>
                <div>
                  <p className="text-sm font-medium">Top 10</p>
                  <p className="text-xs text-muted-foreground">Rising Star</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xl">🎶</div>
                <div>
                  <p className="text-sm font-medium">Top 50</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}