import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import {
  Search,
  Music,
  User,
  Users,
  Hash,
  Play,
  Crown,
  Mic,
  ArrowRight,
  Clock,
  Heart,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useSearch } from '../hooks/useSearch';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onViewArtistProfile?: (artist: any) => void;
  onViewFanProfile?: (fan: any) => void;
  onPlayTrack?: (track: any) => void;
  onFollowUser?: (user: any) => void;
  onUnfollowUser?: (userId: string) => void;
  onJoinRoom?: (room: any) => void;
  onViewCrate?: (crate: any) => void;
  currentUser?: any;
  mockArtists?: any[];
  mockFans?: any[];
  isMobile?: boolean;
}

export function GlobalSearch({
  isOpen,
  onClose,
  onViewArtistProfile,
  onViewFanProfile,
  onPlayTrack,
  onFollowUser,
  onUnfollowUser,
  onJoinRoom,
  onViewCrate,
  currentUser,
  mockArtists = [],
  mockFans = [],
  isMobile = false
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'artists' | 'tracks' | 'users' | 'rooms' | 'crates'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Use the search hook with debouncing and API integration
  const { results: searchResults, isLoading, error } = useSearch(query, activeTab);

  const handleClose = useCallback(() => {
    setQuery('');
    setActiveTab('all');
    onClose();
  }, [onClose]);

  const handleSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    
    if (searchTerm && !recentSearches.includes(searchTerm)) {
      setRecentSearches(prev => [searchTerm, ...prev.slice(0, 3)]);
    }
  }, [recentSearches]);

  const getInitialBadgeColor = (accentColor: string) => {
    const colors = {
      coral: 'bg-accent-coral text-background',
      blue: 'bg-accent-blue text-background', 
      mint: 'bg-accent-mint text-background',
      yellow: 'bg-accent-yellow text-background'
    };
    return colors[accentColor] || 'bg-foreground text-background';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredResults = useMemo(() => {
    if (!searchResults || Object.keys(searchResults).length === 0) return null;

    if (activeTab === 'all') return searchResults;
    return { [activeTab]: searchResults[activeTab] };
  }, [searchResults, activeTab]);

  const getTotalResults = useCallback(() => {
    if (!searchResults) return 0;
    return Object.values(searchResults).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  }, [searchResults]);

  // Reset search when modal opens and add escape key handler
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveTab('all');
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="global-search-modal max-w-3xl w-[calc(100vw-2rem)] md:w-[85vw] max-h-[85vh] md:max-h-[80vh] p-0 gap-0 flex flex-col overflow-hidden m-4 md:m-auto"
        aria-describedby="global-search-description"
      >
        <DialogHeader className="px-4 md:px-6 py-3 md:py-4 border-b border-border shrink-0">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <DialogDescription id="global-search-description" className="sr-only">
            Search for artists, tracks, users, rooms, and crates
          </DialogDescription>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isMobile ? "Search..." : "Search artists, tracks, users, rooms, and crates..."}
              className="pl-10 pr-4 py-2 md:py-3 text-base border-0 focus:ring-2 focus:ring-accent-coral/20 bg-muted/30 rounded-lg"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {!query ? (
            /* Empty State */
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 md:px-6 py-2 md:py-3 space-y-3 md:space-y-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3 md:mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                      Recent
                    </h3>
                    <div className="space-y-1 md:space-y-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={`recent-${index}-${search}`}
                          onClick={() => handleSearch(search)}
                          className="flex items-center gap-2 md:gap-3 w-full text-left p-2 md:p-3 hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          <Clock className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                          <span className="truncate text-sm md:text-base">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium mb-3 md:mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                    Trending
                  </h3>
                  <div className="space-y-1 md:space-y-2">
                    <button
                      onClick={() => handleSearch('electronic')}
                      className="flex items-center gap-2 md:gap-3 w-full text-left p-2 md:p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-accent-coral shrink-0" />
                      <span className="text-sm md:text-base">electronic</span>
                      <Badge variant="secondary" className="ml-auto text-xs">Hot</Badge>
                    </button>
                    <button
                      onClick={() => handleSearch('underground beats')}
                      className="flex items-center gap-2 md:gap-3 w-full text-left p-2 md:p-3 hover:bg-muted/50 rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-accent-mint shrink-0" />
                      <span className="text-sm md:text-base">underground beats</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <>
              {/* Results Tabs */}
              <div className="flex items-center gap-1 px-4 md:px-6 py-2 md:py-3 border-b border-border overflow-x-auto shrink-0 scrollbar-hide">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('all')}
                  className="shrink-0"
                >
                  All ({getTotalResults()})
                </Button>
                {searchResults?.artists?.length > 0 && (
                  <Button
                    variant={activeTab === 'artists' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('artists')}
                    className="shrink-0"
                  >
                    <Mic className="w-4 h-4 mr-1" />
                    Artists ({searchResults.artists.length})
                  </Button>
                )}
                {searchResults?.tracks?.length > 0 && (
                  <Button
                    variant={activeTab === 'tracks' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('tracks')}
                    className="shrink-0"
                  >
                    <Music className="w-4 h-4 mr-1" />
                    Tracks ({searchResults.tracks.length})
                  </Button>
                )}
                {searchResults?.users?.length > 0 && (
                  <Button
                    variant={activeTab === 'users' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('users')}
                    className="shrink-0"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Users ({searchResults.users.length})
                  </Button>
                )}
                {searchResults?.rooms?.length > 0 && (
                  <Button
                    variant={activeTab === 'rooms' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('rooms')}
                    className="shrink-0"
                  >
                    <Hash className="w-4 h-4 mr-1" />
                    Rooms ({searchResults.rooms.length})
                  </Button>
                )}
                {searchResults?.crates?.length > 0 && (
                  <Button
                    variant={activeTab === 'crates' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('crates')}
                    className="shrink-0"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Crates ({searchResults.crates.length})
                  </Button>
                )}
              </div>

              {/* Results Content */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="px-4 md:px-6 py-2 md:py-3 space-y-3 md:space-y-4">
                <AnimatePresence mode="wait">
                  {/* Loading State */}
                  {isLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-12"
                    >
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Searching...</span>
                    </motion.div>
                  )}

                  {/* Error State */}
                  {error && !isLoading && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center py-12"
                    >
                      <Search className="w-8 h-8 mx-auto mb-4 text-red-500" />
                      <p className="text-red-500 mb-2">Search failed</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </motion.div>
                  )}

                  {/* Artists */}
                  {!isLoading && !error && filteredResults?.artists?.length > 0 && (
                    <motion.div
                      key="artists-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {activeTab === 'all' && (
                        <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <Mic className="w-4 h-4" />
                          Artists
                        </h3>
                      )}
                      <div className="space-y-2">
                        {filteredResults.artists.map((artist, index) => (
                          <div
                            key={`artist-${artist.id}-${index}`}
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                            onClick={() => {
                              onViewArtistProfile?.(artist);
                              handleClose();
                            }}
                          >
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${getInitialBadgeColor(artist.accentColor)} font-black text-xs md:text-sm`}>
                              {artist.displayName?.[0] || artist.username?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="font-medium truncate text-sm md:text-base">{artist.displayName || artist.username}</span>
                                {artist.verified && <Crown className="w-3 h-3 md:w-4 md:h-4 text-accent-blue shrink-0" />}
                              </div>
                              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                                <span>{formatNumber(artist.followers || 0)} followers</span>
                                {artist.genres && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{artist.genres[0]}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Tracks */}
                  {!isLoading && !error && filteredResults?.tracks?.length > 0 && (
                    <motion.div
                      key="tracks-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {activeTab === 'all' && (
                        <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Tracks
                        </h3>
                      )}
                      <div className="space-y-2">
                        {filteredResults.tracks.map((track, index) => {
                          // Format duration from seconds to MM:SS if needed
                          const formatDuration = (seconds?: number) => {
                            if (!seconds) return '0:00';
                            const mins = Math.floor(seconds / 60);
                            const secs = seconds % 60;
                            return `${mins}:${secs.toString().padStart(2, '0')}`;
                          };

                          return (
                            <div
                              key={`track-${track.id}-${index}`}
                              className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-muted/50 rounded-lg transition-colors group"
                            >
                              <div
                                className="w-8 h-8 md:w-10 md:h-10 bg-cover bg-center rounded shrink-0 bg-muted"
                                style={{ backgroundImage: track.artwork ? `url(${track.artwork})` : undefined }}
                              >
                                {!track.artwork && <Music className="w-full h-full p-2 text-muted-foreground" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate text-sm md:text-base">{track.title}</div>
                                <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                                  <span className="truncate">{track.artist}</span>
                                  {track.duration && (
                                    <>
                                      <span>•</span>
                                      <span>{formatDuration(track.duration)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    onPlayTrack?.(track);
                                    toast.success(`Now playing: ${track.title}`);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 md:transition-opacity"
                                >
                                  <Play className="w-3 h-3 md:w-4 md:h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Users/Fans */}
                  {!isLoading && !error && filteredResults?.users?.length > 0 && (
                    <motion.div
                      key="users-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {activeTab === 'all' && (
                        <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Users
                        </h3>
                      )}
                      <div className="space-y-2">
                        {filteredResults.users.map((user, index) => (
                          <div
                            key={`user-${user.id}-${index}`}
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                            onClick={() => {
                              if (onViewFanProfile) {
                                onViewFanProfile(user);
                                handleClose();
                              }
                            }}
                          >
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${getInitialBadgeColor(user.accentColor)} font-black text-xs md:text-sm shrink-0`}>
                              {(user.displayName || user.username)?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-sm md:text-base">{user.displayName || user.username}</div>
                              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                                <span className="truncate">@{user.username}</span>
                                {user.followers !== undefined && (
                                  <>
                                    <span className="hidden md:inline">•</span>
                                    <span className="hidden md:inline">{formatNumber(user.followers)} followers</span>
                                  </>
                                )}
                              </div>
                              {user.bio && (
                                <p className="text-xs text-muted-foreground truncate mt-1 hidden md:block">{user.bio}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 shrink-0">
                              <Button
                                size="sm"
                                variant={user.isFollowing ? "outline" : "default"}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent profile navigation
                                  if (user.isFollowing) {
                                    onUnfollowUser?.(user.id);
                                    toast.success(`Unfollowed @${user.username}`);
                                  } else {
                                    onFollowUser?.(user);
                                    toast.success(`Now following @${user.username}!`);
                                  }
                                }}
                                className={`text-xs md:text-sm px-2 md:px-3 ${user.isFollowing ? "" : "bg-accent-coral text-background hover:bg-accent-coral/90"}`}
                              >
                                {user.isFollowing ? 'Unfollow' : 'Follow'}
                              </Button>
                              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Rooms */}
                  {!isLoading && !error && filteredResults?.rooms?.length > 0 && (
                    <motion.div
                      key="rooms-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {activeTab === 'all' && (
                        <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          Rooms
                        </h3>
                      )}
                      <div className="space-y-2">
                        {filteredResults.rooms.map((room, index) => (
                          <div
                            key={`room-${room.id}-${index}`}
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-muted/50 rounded-lg transition-colors"
                          >
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center shrink-0">
                              <Hash className="w-4 h-4 md:w-5 md:h-5 text-accent-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-sm md:text-base">{room.name}</div>
                              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                                <span>{formatNumber(room.memberCount)} members</span>
                                <span>•</span>
                                <span>{room.activeNow} active</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-1 hidden md:block">{room.description}</p>
                            </div>
                            <Button
                              size="sm"
                              variant={room.isJoined ? "outline" : "default"}
                              onClick={() => {
                                onJoinRoom?.(room);
                                handleClose();
                              }}
                              className={`text-xs md:text-sm px-2 md:px-3 shrink-0 ${room.isJoined ? "" : "bg-accent-blue text-background hover:bg-accent-blue/90"}`}
                            >
                              {room.isJoined ? 'Joined' : 'Join'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Crates */}
                  {!isLoading && !error && filteredResults?.crates?.length > 0 && (
                    <motion.div
                      key="crates-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {activeTab === 'all' && (
                        <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Crates
                        </h3>
                      )}
                      <div className="space-y-2">
                        {filteredResults.crates.map((crate, index) => (
                          <div
                            key={`crate-${crate.id}-${index}`}
                            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                            onClick={() => {
                              onViewCrate?.(crate);
                              handleClose();
                            }}
                          >
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent-mint/20 rounded-lg flex items-center justify-center shrink-0">
                              <Users className="w-4 h-4 md:w-5 md:h-5 text-accent-mint" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-sm md:text-base">{crate.name}</div>
                              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                                <span className="truncate">by @{crate.creator}</span>
                                <span>•</span>
                                <span>{crate.trackCount} tracks</span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-1 hidden md:block">{crate.description}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* No Results */}
                  {!isLoading && !error && getTotalResults() === 0 && query && (
                    <motion.div
                      key="no-results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center py-12"
                    >
                      <Search className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">No results found</p>
                      <p className="text-sm text-muted-foreground">
                        Try searching for different keywords or check your spelling
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}