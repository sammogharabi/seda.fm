import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// Icons removed for cleaner design
import { toast } from 'sonner@2.0.3';

const SUGGESTED_USERS = [
  {
    id: 101,
    username: 'ambient_dreams',
    displayName: 'Ambient Dreams',
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
  onViewFanProfile?: (user: any) => void;
}

export function FollowSuggestions({ 
  onFollowUser, 
  followingList, 
  maxSuggestions = 3, 
  showHeader = true,
  compact = false,
  onViewFanProfile
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

  const handleViewProfile = (user) => {
    onViewFanProfile?.({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      verified: user.verified,
      verificationStatus: 'not-requested',
      points: Math.floor(Math.random() * 2000) + 100,
      accentColor: 'coral',
      bio: `Music lover interested in ${user.topGenres?.join(', ') || 'various genres'}`,
      location: 'Unknown',
      joinedDate: new Date('2024-01-15'),
      genres: user.topGenres || ['Various'],
      connectedServices: ['Spotify'],
      isArtist: false,
      website: ''
    });
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
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Suggested for you</h4>
        )}
        <div className="space-y-3">
          {filteredSuggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-secondary/30 border border-foreground/10 hover:border-foreground/20 transition-all">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleViewProfile(user)}
                      className="font-medium text-sm hover:text-accent-coral transition-colors text-left"
                    >
                      {user.displayName}
                    </button>
                    {user.verified && <span className="text-xs text-accent-yellow font-semibold">VERIFIED</span>}
                  </div>
                  <button 
                    onClick={() => handleViewProfile(user)}
                    className="text-xs text-muted-foreground hover:text-accent-coral transition-colors text-left"
                  >
                    @{user.username}
                  </button>
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
    <div className="w-full">
      {showHeader && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-1">Who to follow</h3>
          <p className="text-sm text-muted-foreground">Discover new artists and fans</p>
        </div>
      )}
      
      <div className="space-y-4">
        {filteredSuggestions.map((user) => (
          <Card key={user.id} className="hover:border-foreground/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button 
                      onClick={() => handleViewProfile(user)}
                      className="font-medium truncate hover:text-accent-coral transition-colors text-left"
                    >
                      {user.displayName}
                    </button>
                    {user.verified && <span className="text-xs text-accent-yellow font-semibold flex-shrink-0">VERIFIED</span>}
                  </div>
                  <button 
                    onClick={() => handleViewProfile(user)}
                    className="text-sm text-muted-foreground mb-2 hover:text-accent-coral transition-colors text-left"
                  >
                    @{user.username}
                  </button>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{user.reason}</p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-muted-foreground">{formatNumber(user.followers)} followers</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{user.mutualFriends} mutual</span>
                  </div>
                  
                  <div className="flex gap-1 mb-3">
                    {user.topGenres.slice(0, 2).map((genre) => (
                      <Badge key={genre} className="bg-accent-blue/10 text-accent-blue border-accent-blue/20 text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="text-xs h-8 px-3 bg-accent-coral text-background hover:bg-accent-coral/90"
                    onClick={() => handleFollow(user)}
                  >
                    Follow
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-8 px-2"
                    onClick={() => handleDismiss(user.id)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}