import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { discoverApi, PeopleSuggestion } from '../lib/api/discover';

interface FollowSuggestionsProps {
  onFollowUser?: (user: any) => void;
  followingList?: any[];
  maxSuggestions?: number;
  showHeader?: boolean;
  compact?: boolean;
  onViewFanProfile?: (user: any) => void;
}

export function FollowSuggestions({
  onFollowUser,
  followingList = [],
  maxSuggestions = 6,
  showHeader = true,
  compact = false,
  onViewFanProfile,
}: FollowSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<PeopleSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const data = await discoverApi.getPeople(maxSuggestions + 5); // Fetch extra for filtering
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('[FollowSuggestions] Failed to load suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [maxSuggestions]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleFollow = (user: PeopleSuggestion) => {
    if (onFollowUser) {
      onFollowUser({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        verified: user.verified,
      });
      toast.success(`Now following @${user.username}!`);
    }
  };

  const handleDismiss = (userId: string) => {
    setDismissedIds((prev) => [...prev, userId]);
  };

  const handleViewProfile = (user: PeopleSuggestion) => {
    if (onViewFanProfile) {
      onViewFanProfile({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        verified: user.verified,
        verificationStatus: 'not-requested',
        points: 0,
        accentColor: 'coral',
        bio: user.bio || '',
        location: 'Unknown',
        joinedDate: new Date(),
        genres: user.genres || [],
        connectedServices: [],
        isArtist: user.isArtist,
        website: '',
      });
    }
  };

  // Filter out already following and dismissed users
  const safeFollowingList = Array.isArray(followingList) ? followingList : [];
  const filteredSuggestions = suggestions
    .filter((user) => !safeFollowingList.some((f) => f.id === user.id))
    .filter((user) => !dismissedIds.includes(user.id))
    .slice(0, maxSuggestions);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent-coral" />
      </div>
    );
  }

  if (filteredSuggestions.length === 0) {
    if (compact) {
      return (
        <div className="p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No suggestions available
          </p>
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

        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No Suggestions Yet</h3>
            <p className="text-muted-foreground">
              Follow some artists or complete your profile to get personalized suggestions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
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
                      {user.displayName || user.username}
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
                      {user.displayName || user.username}
                    </button>
                    {user.verified && <span className="text-xs text-accent-yellow font-semibold flex-shrink-0">VERIFIED</span>}
                    {user.isArtist && <Badge variant="outline" className="text-xs">Artist</Badge>}
                  </div>
                  <button
                    onClick={() => handleViewProfile(user)}
                    className="text-sm text-muted-foreground mb-2 hover:text-accent-coral transition-colors text-left block"
                  >
                    @{user.username}
                  </button>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{user.reason}</p>

                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-sm text-muted-foreground">{formatNumber(user.followers)} followers</span>
                    {user.mutualFollowers > 0 && (
                      <>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{user.mutualFollowers} mutual</span>
                      </>
                    )}
                  </div>

                  {user.genres && user.genres.length > 0 && (
                    <div className="flex gap-1 mb-3">
                      {user.genres.slice(0, 2).map((genre) => (
                        <Badge key={genre} className="bg-accent-blue/10 text-accent-blue border-accent-blue/20 text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
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
