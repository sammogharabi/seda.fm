import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  UserPlus,
  Crown,
  Users,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const SUGGESTED_USERS = [
  {
    id: 101,
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
    id: 102,
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
    id: 103,
    username: 'indie_vibes',
    displayName: 'Indie Vibes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=indie',
    verified: false,
    followers: 8700,
    mutualFriends: 9,
    reason: 'Similar music taste',
    topGenres: ['Indie', 'Alternative']
  },
  {
    id: 104,
    username: 'techno_master',
    displayName: 'Techno Master',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techno',
    verified: false,
    followers: 19200,
    mutualFriends: 14,
    reason: 'New to sedā.fm',
    topGenres: ['Techno', 'Progressive']
  }
];

interface FollowSuggestionsProps {
  onFollowUser: (user: any) => void;
  followingList: any[];
  maxSuggestions?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export function FollowSuggestions({ 
  onFollowUser, 
  followingList, 
  maxSuggestions = 3, 
  showHeader = true,
  compact = false 
}: FollowSuggestionsProps) {
  const [suggestedUsers, setSuggestedUsers] = useState(SUGGESTED_USERS);
  const [dismissedUsers, setDismissedUsers] = useState([]);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleFollow = (user) => {
    onFollowUser(user);
    setSuggestedUsers(prev => prev.filter(u => u.id !== user.id));
    toast.success(`Now following @${user.username}!`);
  };

  const handleDismiss = (userId) => {
    setDismissedUsers(prev => [...prev, userId]);
  };

  // Filter out already following users and dismissed users
  const filteredSuggestions = suggestedUsers
    .filter(user => !followingList.some(f => f.id === user.id))
    .filter(user => !dismissedUsers.includes(user.id))
    .slice(0, maxSuggestions);

  if (filteredSuggestions.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {showHeader && (
          <h3 className="font-medium text-sm">Suggested for you</h3>
        )}
        <div className="space-y-3">
          {filteredSuggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">{user.displayName}</span>
                    {user.verified && <Crown className="w-3 h-3 text-ring" />}
                  </div>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <Button
                size="sm"
                className="text-xs h-7 px-3"
                onClick={() => handleFollow(user)}
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Who to follow</CardTitle>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-0" : ""}>
        <div className="space-y-4">
          {filteredSuggestions.map((user) => (
            <div key={user.id} className="flex items-start gap-3">
              <Avatar className="w-10 h-10 shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{user.displayName}</h4>
                  {user.verified && <Crown className="w-3 h-3 text-ring flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground mb-2">@{user.username}</p>
                
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{user.reason}</p>
                
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {formatNumber(user.followers)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.mutualFriends} mutual
                  </div>
                </div>
                
                <div className="flex gap-1 mb-3">
                  {user.topGenres.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs px-2 py-0">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  className="text-xs h-7 px-3"
                  onClick={() => handleFollow(user)}
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Follow
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 px-2"
                  onClick={() => handleDismiss(user.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}