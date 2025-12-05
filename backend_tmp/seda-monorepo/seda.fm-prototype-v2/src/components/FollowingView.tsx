import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  UserPlus,
  Users,
  Crown,
  Music,
  Radio,
  Clock,
  UserMinus,
  MessageCircle
} from 'lucide-react';

const FOLLOWING_LIST = [
  {
    id: 1,
    username: 'dj_nova',
    displayName: 'DJ Nova',
    verified: true,
    followers: 15600,
    mutualFriends: 23,
    lastActive: '2h ago',
    isOnline: true,
    currentActivity: 'DJ Session: Late Night Vibes'
  },
  {
    id: 2,
    username: 'beatmaster_99',
    displayName: 'Beat Master',
    verified: false,
    followers: 3200,
    mutualFriends: 8,
    lastActive: '5m ago',
    isOnline: true,
    currentActivity: 'Listening to Ambient Dreams playlist'
  },
  {
    id: 3,
    username: 'vinyl_collector',
    displayName: 'Vinyl Collector',
    verified: false,
    followers: 8900,
    mutualFriends: 15,
    lastActive: '1d ago',
    isOnline: false,
    currentActivity: null
  },
  {
    id: 4,
    username: 'synth_wave',
    displayName: 'Synth Wave',
    verified: false,
    followers: 5400,
    mutualFriends: 12,
    lastActive: '6h ago',
    isOnline: false,
    currentActivity: null
  }
];

const SUGGESTED_FOLLOWS = [
  {
    id: 5,
    username: 'ambient_dreams',
    displayName: 'Ambient Dreams',
    verified: false,
    followers: 12300,
    mutualFriends: 18,
    reason: 'Followed by DJ Nova and 17 others you follow',
    topGenres: ['Ambient', 'Electronic']
  },
  {
    id: 6,
    username: 'house_legends',
    displayName: 'House Legends',
    verified: true,
    followers: 45600,
    mutualFriends: 25,
    reason: 'Popular in your network',
    topGenres: ['House', 'Techno']
  },
  {
    id: 7,
    username: 'indie_vibes',
    displayName: 'Indie Vibes',
    verified: false,
    followers: 8700,
    mutualFriends: 9,
    reason: 'Similar music taste',
    topGenres: ['Indie', 'Alternative']
  }
];

export function FollowingView({ user, followingList: externalFollowingList, onFollowUser, onUnfollowUser }) {
  const [activeTab, setActiveTab] = useState('following');
  const [followingList, setFollowingList] = useState(externalFollowingList || FOLLOWING_LIST);
  const [suggestedList, setSuggestedList] = useState(SUGGESTED_FOLLOWS);

  // Update local state when external following list changes
  React.useEffect(() => {
    if (externalFollowingList) {
      setFollowingList([...externalFollowingList, ...FOLLOWING_LIST.filter(u => !externalFollowingList.find(eu => eu.id === u.id))]);
    }
  }, [externalFollowingList]);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleUnfollow = (userId) => {
    if (onUnfollowUser) {
      onUnfollowUser(userId);
    }
    setFollowingList(prev => prev.filter(user => user.id !== userId));
  };

  const handleFollow = (userId) => {
    const userToFollow = suggestedList.find(user => user.id === userId);
    if (userToFollow) {
      if (onFollowUser) {
        onFollowUser(userToFollow);
      }
      setSuggestedList(prev => prev.filter(user => user.id !== userId));
      setFollowingList(prev => [...prev, { ...userToFollow, isOnline: false, lastActive: 'Just followed', currentActivity: null }]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-primary mb-2">Following</h1>
              <p className="text-muted-foreground">
                Your music network and community
              </p>
            </div>
            <div className="bg-accent-mint/10 text-accent-mint px-4 py-2 border border-accent-mint/20">
              <div className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4" />
                <span>{followingList.length} Following</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-card border border-foreground/10 mb-8">
            <TabsTrigger value="following">
              Following ({followingList.length})
            </TabsTrigger>
            <TabsTrigger value="discover">
              Discover ({suggestedList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-4">
            {followingList.map((followedUser) => (
              <Card key={followedUser.id} className="hover:border-accent-mint/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-accent-mint text-background flex items-center justify-center border border-foreground/20 font-semibold text-xl">
                        {followedUser.displayName[0].toUpperCase()}
                      </div>
                      {followedUser.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-coral border-2 border-card rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{followedUser.displayName}</h4>
                        {followedUser.verified && <Crown className="w-5 h-5 text-accent-yellow" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">@{followedUser.username}</p>
                      
                      {followedUser.currentActivity && (
                        <div className="bg-accent-mint/10 border-l-4 border-accent-mint p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Radio className="w-4 h-4 text-accent-mint" />
                            <span className="text-sm font-medium">{followedUser.currentActivity}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatNumber(followedUser.followers)} followers
                        </div>
                        <div className="flex items-center gap-1">
                          <UserPlus className="w-3 h-3" />
                          {followedUser.mutualFriends} mutual
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {followedUser.lastActive}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleUnfollow(followedUser.id)}
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Unfollow
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            {suggestedList.map((suggestedUser) => (
              <Card key={suggestedUser.id} className="hover:border-accent-coral/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-accent-coral text-background flex items-center justify-center border border-foreground/20 font-semibold text-xl">
                      {suggestedUser.displayName[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{suggestedUser.displayName}</h4>
                        {suggestedUser.verified && <Crown className="w-5 h-5 text-accent-yellow" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">@{suggestedUser.username}</p>
                      
                      <div className="bg-accent-yellow/10 border-l-4 border-accent-yellow p-3 mb-3">
                        <p className="text-sm font-medium">{suggestedUser.reason}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {formatNumber(suggestedUser.followers)} followers
                        </div>
                        <div className="flex items-center gap-1">
                          <UserPlus className="w-3 h-3" />
                          {suggestedUser.mutualFriends} mutual
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {suggestedUser.topGenres.map((genre) => (
                          <Badge key={genre} className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="bg-accent-coral text-background hover:bg-accent-coral/90"
                      onClick={() => handleFollow(suggestedUser.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}