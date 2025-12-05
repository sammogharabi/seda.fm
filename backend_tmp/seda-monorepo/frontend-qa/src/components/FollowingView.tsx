import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
import { motion } from 'framer-motion';
import { motionTokens } from '../styles/motion';

const FOLLOWING_LIST = [
  {
    id: 1,
    username: 'dj_nova',
    displayName: 'DJ Nova',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaster',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinyl',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=synth',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ambient',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=house',
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
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=indie',
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
    <div className="flex-1 flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium">Following</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect with your music community</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
            <Users className="w-4 h-4" />
            <span>{followingList.length} following</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger value="following" className="text-sm">Following ({followingList.length})</TabsTrigger>
              <TabsTrigger value="discover" className="text-sm">Discover ({suggestedList.length})</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="following" className="mt-0 space-y-4">
              {followingList.map((followedUser, i) => (
                <motion.div key={followedUser.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionTokens.cardEnter.duration, ease: motionTokens.cardEnter.easing, delay: i * 0.03 }}>
                <Card className="border border-border hover:border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar className="w-12 h-12 shadow-sm">
                            <AvatarImage src={followedUser.avatar} />
                            <AvatarFallback>{followedUser.displayName[0]}</AvatarFallback>
                          </Avatar>
                          {followedUser.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-chart-2 border-2 border-card rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{followedUser.displayName}</h4>
                            {followedUser.verified && <Crown className="w-4 h-4 text-ring" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">@{followedUser.username}</p>
                          
                          {followedUser.currentActivity && (
                            <div className="flex items-center gap-2 mb-2 p-2 bg-ring/10 rounded-lg">
                              <Radio className="w-3 h-3 text-ring" />
                              <span className="text-xs text-ring font-medium">{followedUser.currentActivity}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                          <motion.div whileTap={{ scale: 0.97 }}>
                          <Button size="sm" variant="outline" className="text-xs">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                          </motion.div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => handleUnfollow(followedUser.id)}
                          >
                            <UserMinus className="w-3 h-3 mr-1" />
                            Unfollow
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

              <TabsContent value="discover" className="mt-0 space-y-4">
                {suggestedList.map((suggestedUser, i) => (
                  <motion.div key={suggestedUser.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionTokens.cardEnter.duration, ease: motionTokens.cardEnter.easing, delay: i * 0.03 }}>
                  <Card className="border border-border hover:border-border shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12 shadow-sm">
                          <AvatarImage src={suggestedUser.avatar} />
                          <AvatarFallback>{suggestedUser.displayName[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{suggestedUser.displayName}</h4>
                            {suggestedUser.verified && <Crown className="w-4 h-4 text-ring" />}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">@{suggestedUser.username}</p>
                          
                          <p className="text-xs text-muted-foreground mb-3">{suggestedUser.reason}</p>
                          
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {formatNumber(suggestedUser.followers)} followers
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <UserPlus className="w-3 h-3" />
                              {suggestedUser.mutualFriends} mutual
                            </div>
                          </div>
                          
                          <div className="flex gap-1">
                            {suggestedUser.topGenres.map((genre) => (
                              <Badge key={genre} variant="secondary" className="text-xs">{genre}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <motion.div whileTap={{ scale: 0.97 }}>
                        <Button 
                          size="sm" 
                          className="bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
                          onClick={() => handleFollow(suggestedUser.id)}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Follow
                        </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
