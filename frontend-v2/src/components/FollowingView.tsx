import React, { useState, useEffect } from 'react';
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
  MessageCircle,
  Loader2
} from 'lucide-react';
import { profilesApi } from '../lib/api/profiles';
import { discoverApi, PeopleSuggestion } from '../lib/api/discover';
import { toast } from 'sonner';

export function FollowingView({ user, followingList: externalFollowingList, onFollowUser, onUnfollowUser }) {
  const [activeTab, setActiveTab] = useState('following');
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [suggestedList, setSuggestedList] = useState<PeopleSuggestion[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  // Fetch following list from API
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!user?.username) {
        setLoadingFollowing(false);
        return;
      }
      try {
        setLoadingFollowing(true);
        const data = await profilesApi.getFollowing(user.username, 50);
        // Transform API data to match component's expected format
        const transformed = (Array.isArray(data) ? data : []).map((f: any) => ({
          id: f.userId || f.id,
          username: f.username,
          displayName: f.displayName || f.username,
          verified: f.verified || false,
          followers: f._count?.followers || f.followers || 0,
          mutualFriends: f.mutualFollowers || 0,
          lastActive: 'Recently',
          isOnline: false,
          currentActivity: null,
          genres: f.genres || []
        }));
        setFollowingList(transformed);
      } catch (error) {
        console.error('[FollowingView] Failed to fetch following:', error);
        setFollowingList([]);
      } finally {
        setLoadingFollowing(false);
      }
    };

    fetchFollowing();
  }, [user?.username]);

  // Fetch suggestions from API
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        const data = await discoverApi.getPeople(10);
        setSuggestedList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('[FollowingView] Failed to fetch suggestions:', error);
        setSuggestedList([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleUnfollow = async (followedUser: any) => {
    try {
      await profilesApi.unfollow(followedUser.username);
      if (onUnfollowUser) {
        onUnfollowUser(followedUser.id);
      }
      setFollowingList(prev => prev.filter(u => u.id !== followedUser.id));
      toast.success(`Unfollowed @${followedUser.username}`);
    } catch (error) {
      console.error('[FollowingView] Failed to unfollow:', error);
      toast.error('Failed to unfollow user');
    }
  };

  const handleFollow = async (userToFollow: PeopleSuggestion) => {
    try {
      await profilesApi.follow(userToFollow.username);
      if (onFollowUser) {
        onFollowUser(userToFollow);
      }
      setSuggestedList(prev => prev.filter(u => u.id !== userToFollow.id));
      setFollowingList(prev => [...prev, {
        id: userToFollow.id,
        username: userToFollow.username,
        displayName: userToFollow.displayName || userToFollow.username,
        verified: userToFollow.verified,
        followers: userToFollow.followers,
        mutualFriends: userToFollow.mutualFollowers,
        lastActive: 'Just followed',
        isOnline: false,
        currentActivity: null,
        genres: userToFollow.genres
      }]);
      toast.success(`Now following @${userToFollow.username}!`);
    } catch (error) {
      console.error('[FollowingView] Failed to follow:', error);
      toast.error('Failed to follow user');
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
            {loadingFollowing ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-mint" />
              </div>
            ) : followingList.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Not Following Anyone Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Discover artists and fans to follow in the Discover tab!
                </p>
              </Card>
            ) : (
              followingList.map((followedUser) => (
                <Card key={followedUser.id} className="hover:border-accent-mint/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-accent-mint text-background flex items-center justify-center border border-foreground/20 font-semibold text-xl">
                          {(followedUser.displayName || followedUser.username || '?')[0].toUpperCase()}
                        </div>
                        {followedUser.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-coral border-2 border-card rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{followedUser.displayName || followedUser.username}</h4>
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
                            {formatNumber(followedUser.followers || 0)} followers
                          </div>
                          {followedUser.mutualFriends > 0 && (
                            <div className="flex items-center gap-1">
                              <UserPlus className="w-3 h-3" />
                              {followedUser.mutualFriends} mutual
                            </div>
                          )}
                          {followedUser.genres && followedUser.genres.length > 0 && (
                            <div className="flex gap-1">
                              {followedUser.genres.slice(0, 2).map((genre: string) => (
                                <Badge key={genre} variant="outline" className="text-xs">
                                  {genre}
                                </Badge>
                              ))}
                            </div>
                          )}
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
                          onClick={() => handleUnfollow(followedUser)}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfollow
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-coral" />
              </div>
            ) : suggestedList.length === 0 ? (
              <Card className="p-8 text-center">
                <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Complete your profile and add music genres to get personalized suggestions!
                </p>
              </Card>
            ) : (
              suggestedList.map((suggestedUser) => (
                <Card key={suggestedUser.id} className="hover:border-accent-coral/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-accent-coral text-background flex items-center justify-center border border-foreground/20 font-semibold text-xl">
                        {(suggestedUser.displayName || suggestedUser.username || '?')[0].toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{suggestedUser.displayName || suggestedUser.username}</h4>
                          {suggestedUser.verified && <Crown className="w-5 h-5 text-accent-yellow" />}
                          {suggestedUser.isArtist && (
                            <Badge variant="outline" className="text-xs">Artist</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">@{suggestedUser.username}</p>

                        {suggestedUser.reason && (
                          <div className="bg-accent-yellow/10 border-l-4 border-accent-yellow p-3 mb-3">
                            <p className="text-sm font-medium">{suggestedUser.reason}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {formatNumber(suggestedUser.followers)} followers
                          </div>
                          {suggestedUser.mutualFollowers > 0 && (
                            <div className="flex items-center gap-1">
                              <UserPlus className="w-3 h-3" />
                              {suggestedUser.mutualFollowers} mutual
                            </div>
                          )}
                        </div>

                        {suggestedUser.genres && suggestedUser.genres.length > 0 && (
                          <div className="flex gap-2">
                            {suggestedUser.genres.slice(0, 3).map((genre) => (
                              <Badge key={genre} className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="bg-accent-coral text-background hover:bg-accent-coral/90"
                        onClick={() => handleFollow(suggestedUser)}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}