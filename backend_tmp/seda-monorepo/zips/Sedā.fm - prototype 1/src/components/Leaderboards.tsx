import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
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
  Zap
} from 'lucide-react';

const GLOBAL_LEADERBOARD = [
  { rank: 1, username: 'dj_apex', djPoints: 15420, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=apex', verified: true, badge: '👑' },
  { rank: 2, username: 'beat_architect', djPoints: 12890, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=architect', verified: true, badge: '🥇' },
  { rank: 3, username: 'sound_weaver', djPoints: 11245, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=weaver', verified: false, badge: '🥈' },
  { rank: 4, username: 'melody_master', djPoints: 9876, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=melody', verified: true, badge: '🥉' },
  { rank: 5, username: 'rhythm_king', djPoints: 8654, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rhythm', verified: false, badge: '🔥' },
  { rank: 6, username: 'bass_hunter', djPoints: 7432, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bass', verified: false, badge: '🔥' },
  { rank: 7, username: 'synth_lord', djPoints: 6789, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=synth', verified: true, badge: '🔥' },
  { rank: 8, username: 'drop_master', djPoints: 6234, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=drop', verified: false, badge: '🔥' },
  { rank: 9, username: 'wave_rider', djPoints: 5890, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wave', verified: false, badge: '🔥' },
  { rank: 10, username: 'beat_boxer', djPoints: 5456, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boxer', verified: false, badge: '🔥' }
];

const GENRE_LEADERBOARDS = {
  'Hip Hop': [
    { rank: 1, username: 'rap_god_2024', djPoints: 8945, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rap', verified: true, badge: '👑' },
    { rank: 2, username: 'freestyle_king', djPoints: 7234, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=freestyle', verified: false, badge: '🥇' },
    { rank: 3, username: 'boom_bap_legend', djPoints: 6789, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boom', verified: true, badge: '🥈' }
  ],
  'Electronic': [
    { rank: 1, username: 'techno_wizard', djPoints: 9876, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techno', verified: true, badge: '👑' },
    { rank: 2, username: 'house_master', djPoints: 8234, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=house', verified: false, badge: '🥇' },
    { rank: 3, username: 'edm_prophet', djPoints: 7890, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=edm', verified: true, badge: '🥈' }
  ],
  'Rock': [
    { rank: 1, username: 'guitar_hero_x', djPoints: 7654, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guitar', verified: false, badge: '👑' },
    { rank: 2, username: 'metal_head', djPoints: 6543, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=metal', verified: true, badge: '🥇' },
    { rank: 3, username: 'indie_rocker', djPoints: 5432, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=indie', verified: false, badge: '🥈' }
  ]
};

const CHANNEL_LEADERBOARDS = {
  '#hiphop': [
    { rank: 1, username: 'hip_hop_head', djPoints: 3456, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hiphop', verified: false, badge: '👑' },
    { rank: 2, username: 'trap_master', djPoints: 2890, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=trap', verified: true, badge: '🥇' },
    { rank: 3, username: 'old_school_fan', djPoints: 2345, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=oldschool', verified: false, badge: '🥈' }
  ],
  '#electronic': [
    { rank: 1, username: 'rave_enthusiast', djPoints: 4123, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rave', verified: true, badge: '👑' },
    { rank: 2, username: 'bass_dropper', djPoints: 3456, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bassdrop', verified: false, badge: '🥇' },
    { rank: 3, username: 'festival_goer', djPoints: 2789, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=festival', verified: false, badge: '🥈' }
  ]
};

const ARTIST_FAN_LEADERBOARDS = {
  '@diplo': [
    { rank: 1, username: 'diplo_stan', djPoints: 2345, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diplostan', verified: false, badge: '👑' },
    { rank: 2, username: 'major_lazer_fan', djPoints: 1890, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=majorlazer', verified: false, badge: '🥇' },
    { rank: 3, username: 'jack_u_lover', djPoints: 1567, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jacku', verified: false, badge: '🥈' }
  ]
};

export function Leaderboards({ user }) {
  const [activeTab, setActiveTab] = useState('global');
  const [selectedGenre, setSelectedGenre] = useState('Hip Hop');
  const [selectedChannel, setSelectedChannel] = useState('#hiphop');
  const [selectedArtist, setSelectedArtist] = useState('@diplo');

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank <= 3) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank <= 10) return 'bg-gradient-to-r from-orange-400 to-red-500';
    if (rank <= 50) return 'bg-gradient-to-r from-blue-400 to-purple-500';
    return 'bg-muted';
  };

  const renderLeaderboardItem = (item, showPoints = true) => (
    <div key={`${item.rank}-${item.username}`} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getRankBadgeColor(item.rank)}`}
        >
          {item.rank <= 10 ? item.badge : `#${item.rank}`}
        </div>
        
        <Avatar className="w-10 h-10">
          <AvatarImage src={item.avatar} />
          <AvatarFallback>{item.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-sm">{item.username}</h4>
          {item.verified && <Crown className="w-4 h-4 text-yellow-500" />}
          {item.username === user.username && (
            <Badge variant="secondary" className="text-xs">You</Badge>
          )}
        </div>
        {showPoints && (
          <p className="text-xs text-muted-foreground">{item.djPoints.toLocaleString()} DJ Points</p>
        )}
      </div>
      
      <div className="text-right">
        <div className="text-sm">#{item.rank}</div>
        {item.rank === 1 && <Crown className="w-4 h-4 text-yellow-500 mx-auto" />}
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl">Leaderboards</h1>
          <p className="text-muted-foreground">See where you rank among the community</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="genre">Genre</TabsTrigger>
          <TabsTrigger value="channel">Channel</TabsTrigger>
          <TabsTrigger value="artist">Artist</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Global Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* User's Current Position */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#00ff88]/20 to-[#00ccff]/20 border border-[#00ff88]/30 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm">{user.username}</h4>
                      <p className="text-xs text-muted-foreground">{user.djPoints} DJ Points</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-[#00ff88] text-black">#247</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Your Rank</p>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {GLOBAL_LEADERBOARD.map(item => renderLeaderboardItem(item))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genre" className="space-y-6">
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
                <Music className="w-5 h-5 text-[#00ccff]" />
                {selectedGenre} Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {GENRE_LEADERBOARDS[selectedGenre]?.map(item => renderLeaderboardItem(item)) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No rankings available for this genre yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channel" className="space-y-6">
          <div className="flex gap-4 flex-wrap">
            {Object.keys(CHANNEL_LEADERBOARDS).map(channel => (
              <Button
                key={channel}
                variant={selectedChannel === channel ? 'default' : 'outline'}
                onClick={() => setSelectedChannel(channel)}
                size="sm"
              >
                {channel}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ff6b6b]" />
                {selectedChannel} Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {CHANNEL_LEADERBOARDS[selectedChannel]?.map(item => renderLeaderboardItem(item)) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No rankings available for this channel yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artist" className="space-y-6">
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
                <Star className="w-5 h-5 text-yellow-500" />
                {selectedArtist} Top Fans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {ARTIST_FAN_LEADERBOARDS[selectedArtist]?.map(item => renderLeaderboardItem(item, false)) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No fan rankings available for this artist yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Achievement Tiers Info */}
      <Card>
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
                <p className="text-sm">#1</p>
                <p className="text-xs text-muted-foreground">Champion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xl">🥇</div>
              <div>
                <p className="text-sm">Top 3</p>
                <p className="text-xs text-muted-foreground">Elite</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xl">🔥</div>
              <div>
                <p className="text-sm">Top 10</p>
                <p className="text-xs text-muted-foreground">Rising Star</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xl">🎶</div>
              <div>
                <p className="text-sm">Top 50</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}