import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { FollowSuggestions } from './FollowSuggestions';
import { SessionsView } from './SessionsView';
import { ShoppingBag, MapPin, Calendar, Users, Music, Palette, Radio, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { discoverApi, DiscoverArtist, TrendingRoom } from '../lib/api/discover';

export function DiscoverView({
  user,
  onNowPlaying,
  onFollowUser,
  onUnfollowUser,
  isFollowing,
  followingList = [],
  onRoomSelect,
  onViewArtistProfile,
  onViewFanProfile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const [apiArtists, setApiArtists] = useState<DiscoverArtist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [trendingRooms, setTrendingRooms] = useState<TrendingRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Fetch artists from API when artists tab is selected
  useEffect(() => {
    const fetchArtists = async () => {
      if (activeTab !== 'artists') return;

      try {
        setLoadingArtists(true);
        const artists = await discoverApi.getArtists(20);
        setApiArtists(Array.isArray(artists) ? artists : []);
      } catch (error) {
        console.error('[DiscoverView] Failed to load artists:', error);
        setApiArtists([]);
      } finally {
        setLoadingArtists(false);
      }
    };

    fetchArtists();
  }, [activeTab]);

  // Fetch rooms from API when rooms tab is selected
  useEffect(() => {
    const fetchRooms = async () => {
      if (activeTab !== 'rooms') return;

      try {
        setLoadingRooms(true);
        const rooms = await discoverApi.getRooms(20);
        setTrendingRooms(Array.isArray(rooms) ? rooms : []);
      } catch (error) {
        console.error('[DiscoverView] Failed to load rooms:', error);
        setTrendingRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [activeTab]);

  // Use only API artists - no mock data
  const allArtists = Array.isArray(apiArtists) ? apiArtists : [];

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-primary mb-2">Discover</h1>
              <p className="text-muted-foreground">
                Explore trending music, artists, and rooms
              </p>
            </div>

          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
              SEARCH
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks, artists, rooms..."
              className="pl-20 h-12"
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-8">
          <Button
            variant={activeTab === 'people' ? 'default' : 'outline'}
            onClick={() => setActiveTab('people')}
            className={activeTab === 'people' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Users className="w-4 h-4 mr-2" />
            People
          </Button>
          <Button
            variant={activeTab === 'tracks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tracks')}
            className={activeTab === 'tracks' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Music className="w-4 h-4 mr-2" />
            Tracks
          </Button>
          <Button
            variant={activeTab === 'artists' ? 'default' : 'outline'}
            onClick={() => setActiveTab('artists')}
            className={activeTab === 'artists' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Palette className="w-4 h-4 mr-2" />
            Artists
          </Button>
          <Button
            variant={activeTab === 'rooms' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rooms')}
            className={activeTab === 'rooms' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Radio className="w-4 h-4 mr-2" />
            Rooms
          </Button>
          <Button
            variant={activeTab === 'merch' ? 'default' : 'outline'}
            onClick={() => setActiveTab('merch')}
            className={activeTab === 'merch' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Merch
          </Button>
          <Button
            variant={activeTab === 'shows' ? 'default' : 'outline'}
            onClick={() => setActiveTab('shows')}
            className={activeTab === 'shows' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Shows
          </Button>
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sessions')}
            className={activeTab === 'sessions' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background' : ''}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Sessions
          </Button>
        </div>

        {/* People Section */}
        {activeTab === 'people' && (
          <div>
            <FollowSuggestions
              onFollowUser={onFollowUser}
              followingList={followingList}
              maxSuggestions={6}
              showHeader={true}
              compact={false}
              onViewFanProfile={onViewFanProfile}
            />
            
            {followingList.length > 0 && (
              <div className="mt-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Recently followed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {followingList.slice(0, 6).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-secondary/30 border border-foreground/10 hover:border-foreground/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => onViewFanProfile?.({
                                    id: user.id || `fan-${user.username}`,
                                    username: user.username,
                                    displayName: user.displayName || user.username,
                                    verified: user.verified || false,
                                    verificationStatus: 'not-requested',
                                    points: Math.floor(Math.random() * 2000) + 100,
                                    accentColor: user.accentColor || 'coral',
                                    bio: `Music lover and community member`,
                                    location: 'Unknown',
                                    joinedDate: new Date('2024-01-15'),
                                    genres: ['Various'],
                                    connectedServices: ['Spotify'],
                                    isArtist: false,
                                    website: ''
                                  })}
                                  className="font-medium hover:text-accent-coral transition-colors cursor-pointer text-left"
                                >
                                  {user.displayName || user.username}
                                </button>
                                {user.verified && <span className="text-xs text-accent-yellow font-semibold">VERIFIED</span>}
                              </div>
                              <button 
                                onClick={() => onViewFanProfile?.({
                                  id: user.id || `fan-${user.username}`,
                                  username: user.username,
                                  displayName: user.displayName || user.username,
                                  verified: user.verified || false,
                                  verificationStatus: 'not-requested',
                                  points: Math.floor(Math.random() * 2000) + 100,
                                  accentColor: user.accentColor || 'coral',
                                  bio: `Music lover and community member`,
                                  location: 'Unknown',
                                  joinedDate: new Date('2024-01-15'),
                                  genres: ['Various'],
                                  connectedServices: ['Spotify'],
                                  isArtist: false,
                                  website: ''
                                })}
                                className="text-sm text-muted-foreground hover:text-accent-coral transition-colors cursor-pointer text-left"
                              >
                                @{user.username}
                              </button>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onUnfollowUser(user.id);
                              toast.success(`Unfollowed @${user.username}`);
                            }}
                          >
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
        )}

        {/* Tracks Section */}
        {activeTab === 'tracks' && (
          <div>
            <Card>
              <CardContent className="p-12 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Trending Tracks Coming Soon</h3>
                <p className="text-muted-foreground">
                  Discover trending tracks from your favorite artists and rooms.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Artists Section */}
        {activeTab === 'artists' && (
          <div>
            {loadingArtists ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-coral" />
              </div>
            ) : allArtists.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No Artists Yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to join as an artist and share your music!
                  </p>
                </CardContent>
              </Card>
            ) : (
            <div className="space-y-4">
              {allArtists.map((artist) => (
                <Card key={artist.id} className="hover:border-accent-blue/50 transition-colors">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      {/* Artist Info Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => onViewArtistProfile?.(artist)}
                            className="font-semibold text-base md:text-lg truncate hover:text-accent-coral transition-colors text-left"
                          >
                            {artist.displayName}
                          </button>
                          {artist.verified && <span className="text-xs text-accent-blue font-semibold flex-shrink-0">✓ VERIFIED</span>}
                        </div>
                        <button
                          onClick={() => onViewArtistProfile?.(artist)}
                          className="text-sm text-muted-foreground truncate mb-2 hover:text-accent-coral transition-colors text-left"
                        >
                          @{artist.username}
                        </button>
                        
                        {/* Stats - Always Visible */}
                        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-muted-foreground">
                          <span>{formatNumber(artist.followers || 15000)} followers</span>
                          <span>•</span>
                          <span>{formatNumber(artist.monthlyListeners || 85000)} monthly</span>
                        </div>
                      </div>
                      
                      {/* Room & Follow */}
                      <div className="flex flex-row md:flex-col gap-3 items-start md:items-end w-full md:w-auto">
                        <Badge className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20 text-xs">
                          {artist.topRoom || (artist.genres && artist.genres[0]) || 'Music'}
                        </Badge>
                        <div className="flex flex-row gap-2 w-full md:w-auto">
                          {/* View Profile Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewArtistProfile?.(artist)}
                            className="flex-1 md:flex-none border-foreground/20 hover:border-accent-coral hover:text-accent-coral min-h-[44px] md:min-h-0"
                          >
                            <span className="truncate">View Profile</span>
                          </Button>
                          
                          {/* Follow Button */}
                          {onFollowUser && onUnfollowUser && isFollowing && (
                            <div className="flex-1 md:flex-none">
                              {isFollowing(artist.id) ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="w-full md:w-auto min-h-[44px] md:min-h-0"
                                  onClick={() => {
                                    onUnfollowUser(artist.id);
                                    toast.success(`Unfollowed @${artist.username}`);
                                  }}
                                >
                                  <span className="truncate">Unfollow</span>
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="bg-accent-coral text-background hover:bg-accent-coral/90 w-full md:w-auto min-h-[44px] md:min-h-0"
                                  onClick={() => {
                                    onFollowUser(artist);
                                    toast.success(`Now following @${artist.username}!`);
                                  }}
                                >
                                  <span className="truncate">Follow</span>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Rooms Section */}
        {activeTab === 'rooms' && (
          <div>
            {loadingRooms ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-coral" />
              </div>
            ) : trendingRooms.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No Rooms Yet</h3>
                  <p className="text-muted-foreground">
                    Be the first to create a room and start the conversation!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="cursor-pointer hover:border-accent-mint/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                    onClick={() => onRoomSelect && onRoomSelect(room.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        {room.genre && (
                          <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">
                            {room.genre}
                          </Badge>
                        )}
                        {room.recentActivity > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {room.recentActivity} posts this week
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-xl mb-2">{room.name}</h3>
                      {room.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(room.memberCount)} members
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(room.messageCount)} messages
                        </p>
                      </div>
                      {room.creator && (
                        <p className="text-xs text-muted-foreground">
                          Created by @{room.creator.username}
                          {room.creator.verified && ' ✓'}
                        </p>
                      )}
                      <p className="text-xs text-accent-mint font-medium mt-3">
                        Click to enter room →
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Merch Section */}
        {activeTab === 'merch' && (
          <div>
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Artist Merch Coming Soon</h3>
                <p className="text-muted-foreground">
                  Shop exclusive merchandise from your favorite artists.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Shows Section */}
        {activeTab === 'shows' && (
          <div>
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">Upcoming Shows Coming Soon</h3>
                <p className="text-muted-foreground">
                  Find live shows and events from artists you follow.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions Section */}
        {activeTab === 'sessions' && (
          <div>
            <SessionsView 
              user={user}
              onNowPlaying={onNowPlaying}
              onJoinSession={(session) => {
                toast.success('Joining session...', {
                  description: `${session.artist} is live now!`
                });
              }}
              onStartDJ={() => {
                toast.info('Start DJ feature', {
                  description: 'Navigate to Sessions page to start a DJ session'
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}