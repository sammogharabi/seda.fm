import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FollowSuggestions } from './FollowSuggestions';
import { 
  Search,
  TrendingUp,
  Music,
  Users,
  Crown,
  Play,
  Heart,
  UserPlus,
  UserMinus,
  Hash
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const TRENDING_TRACKS = [
  {
    id: 1,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
    plays: 45200,
    likes: 3200,
    genre: 'Pop'
  },
  {
    id: 2,
    title: 'Levitating',
    artist: 'Dua Lipa',
    artwork: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
    plays: 38900,
    likes: 2800,
    genre: 'Pop'
  },
  {
    id: 3,
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    artwork: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
    plays: 42100,
    likes: 3500,
    genre: 'Hip Hop'
  }
];

const TRENDING_ARTISTS = [
  {
    id: 1,
    username: 'theweeknd',
    displayName: 'The Weeknd',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=weeknd',
    verified: true,
    followers: 2400000,
    monthlyListeners: 85600000,
    topGenre: 'R&B'
  },
  {
    id: 2,
    username: 'dualipa',
    displayName: 'Dua Lipa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dua',
    verified: true,
    followers: 1800000,
    monthlyListeners: 72300000,
    topGenre: 'Pop'
  },
  {
    id: 3,
    username: 'kidlaroi',
    displayName: 'The Kid LAROI',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laroi',
    verified: true,
    followers: 950000,
    monthlyListeners: 45200000,
    topGenre: 'Hip Hop'
  }
];

const TRENDING_GENRES = [
  { name: 'Hip Hop', posts: 12400, growth: '+15%', color: 'var(--chart-1)' },
  { name: 'Electronic', posts: 8900, growth: '+12%', color: 'var(--chart-2)' },
  { name: 'Pop', posts: 21000, growth: '+8%', color: 'var(--chart-3)' },
  { name: 'R&B', posts: 6700, growth: '+22%', color: 'var(--chart-4)' },
  { name: 'Rock', posts: 14500, growth: '+5%', color: 'var(--chart-5)' },
  { name: 'Jazz', posts: 3200, growth: '+18%', color: 'var(--chart-1)' }
];

export function DiscoverView({ user, onNowPlaying, onFollowUser, onUnfollowUser, isFollowing, followingList = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('people');

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-medium">Discover</h1>
            <p className="text-sm text-muted-foreground mt-1">Explore trending music and artists</p>
          </div>
          <TrendingUp className="w-6 h-6 text-ring" />
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for tracks, artists, or genres..."
            className="pl-10 bg-input-background border-border focus:border-ring transition-colors duration-200"
          />
        </div>
      </div>

      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4 bg-secondary">
              <TabsTrigger value="people" className="text-sm">People</TabsTrigger>
              <TabsTrigger value="tracks" className="text-sm">Tracks</TabsTrigger>
              <TabsTrigger value="artists" className="text-sm">Artists</TabsTrigger>
              <TabsTrigger value="genres" className="text-sm">Genres</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="people" className="mt-0">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <FollowSuggestions
                      onFollowUser={onFollowUser}
                      followingList={followingList}
                      maxSuggestions={6}
                      showHeader={true}
                      compact={false}
                    />
                  </div>
                  {followingList.length > 0 && (
                    <div>
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-base mb-4">Recently followed</h3>
                          <div className="space-y-3">
                            {followingList.slice(0, 4).map((user) => (
                              <div key={user.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.displayName?.[0] || user.username[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className="font-medium text-sm">{user.displayName || user.username}</span>
                                      {user.verified && <Crown className="w-3 h-3 text-ring" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 px-3"
                                  onClick={() => {
                                    onUnfollowUser(user.id);
                                    toast.success(`Unfollowed @${user.username}`);
                                  }}
                                >
                                  <UserMinus className="w-3 h-3 mr-1" />
                                  Unfollow
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tracks" className="mt-0 space-y-4">
                {TRENDING_TRACKS.map((track, index) => (
                  <Card key={track.id} className="border border-border hover:border-border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ring/10 text-ring font-medium text-sm">
                          #{index + 1}
                        </div>
                        
                        {/* Artwork */}
                        <div className="relative group">
                          <img 
                            src={track.artwork}
                            alt={track.title}
                            className="w-16 h-16 rounded-lg object-cover shadow-sm"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute inset-0 bg-black/50 hover:bg-black/70 border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => onNowPlaying({ ...track, addedBy: { username: 'discover', displayName: 'Discover' } })}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Track Info */}
                        <div className="flex-1">
                          <h4 className="font-medium">{track.title}</h4>
                          <p className="text-sm text-muted-foreground">{track.artist}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Play className="w-3 h-3" />
                              {formatNumber(track.plays)} plays
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Heart className="w-3 h-3" />
                              {formatNumber(track.likes)} likes
                            </div>
                          </div>
                        </div>
                        
                        {/* Genre */}
                        <Badge variant="secondary">{track.genre}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="artists" className="mt-0 space-y-4">
                {TRENDING_ARTISTS.map((artist, index) => (
                  <Card key={artist.id} className="border border-border hover:border-border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ring/10 text-ring font-medium text-sm">
                          #{index + 1}
                        </div>
                        
                        {/* Avatar */}
                        <Avatar className="w-16 h-16 shadow-sm">
                          <AvatarImage src={artist.avatar} />
                          <AvatarFallback>{artist.displayName[0]}</AvatarFallback>
                        </Avatar>
                        
                        {/* Artist Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{artist.displayName}</h4>
                            {artist.verified && <Crown className="w-4 h-4 text-ring" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">@{artist.username}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {formatNumber(artist.followers)} followers
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Music className="w-3 h-3" />
                              {formatNumber(artist.monthlyListeners)} monthly listeners
                            </div>
                          </div>
                        </div>
                        
                        {/* Genre & Follow */}
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant="secondary">{artist.topGenre}</Badge>
                          {onFollowUser && onUnfollowUser && isFollowing && (
                            <div>
                              {isFollowing(artist.id) ? (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs"
                                  onClick={() => {
                                    onUnfollowUser(artist.id);
                                    toast.success(`Unfollowed @${artist.username}`);
                                  }}
                                >
                                  <UserMinus className="w-3 h-3 mr-1" />
                                  Unfollow
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="text-xs"
                                  onClick={() => {
                                    onFollowUser(artist);
                                    toast.success(`Now following @${artist.username}!`);
                                  }}
                                >
                                  <UserPlus className="w-3 h-3 mr-1" />
                                  Follow
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="genres" className="mt-0">
                <div className="grid grid-cols-2 gap-4">
                  {TRENDING_GENRES.map((genre) => (
                    <Card key={genre.name} className="border border-border hover:border-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: genre.color }}
                          >
                            <Hash className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="outline" className="text-chart-2 border-chart-2">{genre.growth}</Badge>
                        </div>
                        <h3 className="font-medium mb-2">{genre.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(genre.posts)} posts this week
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}