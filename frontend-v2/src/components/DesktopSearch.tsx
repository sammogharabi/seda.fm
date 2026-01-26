import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useSearch } from '../hooks/useSearch';

const getInitialBadgeColor = (accentColor?: string) => {
  const colorMap: Record<string, string> = {
    coral: 'bg-accent-coral text-background',
    blue: 'bg-accent-blue text-background',
    mint: 'bg-accent-mint text-background',
    yellow: 'bg-accent-yellow text-background'
  };
  return colorMap[accentColor || ''] || 'bg-muted text-muted-foreground';
};

interface DesktopSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onViewArtistProfile?: (artist: any) => void;
  onViewFanProfile?: (user: any) => void;
  onPlayTrack?: (track: any) => void;
  onFollowUser?: (user: any) => void;
  onUnfollowUser?: (userId: string) => void;
  onJoinRoom?: (room: any) => void;
  onViewCrate?: (crate: any) => void;
  currentUser?: any;
}

export function DesktopSearch({
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
}: DesktopSearchProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'artists' | 'tracks' | 'users' | 'rooms' | 'crates'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Use the search hook with real API
  const { results: searchResults, isLoading, error } = useSearch(query, activeTab);

  // Auto-focus when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Clear search when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveTab('all');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleClose = useCallback(() => {
    setQuery('');
    setActiveTab('all');
    onClose();
  }, [onClose]);

  const filteredResults = useMemo(() => {
    if (!searchResults || Object.keys(searchResults).length === 0) return null;

    if (activeTab === 'all') return searchResults;
    return { [activeTab]: searchResults[activeTab] };
  }, [searchResults, activeTab]);

  const getTotalResults = useCallback(() => {
    if (!searchResults) return 0;
    return Object.values(searchResults).reduce((sum: number, arr: any) => sum + (arr?.length || 0), 0);
  }, [searchResults]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { key: 'all' as const, label: 'All', icon: Search },
    { key: 'artists' as const, label: 'Artists', icon: Mic },
    { key: 'tracks' as const, label: 'Tracks', icon: Music },
    { key: 'users' as const, label: 'Fans', icon: Users },
    { key: 'rooms' as const, label: 'Rooms', icon: Hash },
    { key: 'crates' as const, label: 'Crates', icon: User }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="desktop-search-modal max-w-4xl max-h-[85vh] p-0 gap-0 bg-background border-border overflow-hidden" aria-describedby="desktop-search-description">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold flex items-center gap-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            Search sedā.fm
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
            </div>
          </DialogTitle>
          <DialogDescription id="desktop-search-description" className="sr-only">
            Search for artists, tracks, fans, rooms, and crates across the platform
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full max-h-[85vh]">
          {/* Search Input */}
          <div className="px-6 py-4 border-b border-border flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search artists, tracks, fans, rooms, crates..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 h-12 text-base bg-input-background border-border focus:border-accent-coral focus:ring-1 focus:ring-accent-coral"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted/50 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {!query.trim() ? (
              // Empty state with shortcuts
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Start typing to search</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Find artists, tracks, fans, rooms, and crates across sedā.fm
                </p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">↑</kbd>
                    <kbd className="px-2 py-1 bg-muted rounded">↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd>
                    <span>Close</span>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              // Loading state
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Searching...</p>
              </div>
            ) : error ? (
              // Error state
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Search className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-red-500">Search failed</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            ) : getTotalResults() === 0 ? (
              // No results
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground">
                  Try searching with different keywords or check your spelling
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Filter Tabs */}
                <div className="px-6 py-3 border-b border-border flex-shrink-0">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {tabs.map(({ key, label, icon: Icon }) => {
                      const count = key === 'all' ? getTotalResults() : (filteredResults?.[key]?.length ?? 0);
                      const isActive = activeTab === key;

                      // Only show tabs with results (except 'all')
                      if (key !== 'all' && count === 0) return null;

                      return (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                            isActive
                              ? 'bg-accent-coral text-background'
                              : 'hover:bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                          {count > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              {count}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Results */}
                <ScrollArea className="flex-1 overflow-hidden">
                  <div className="px-6 py-4 space-y-6 min-h-0">
                    <AnimatePresence mode="wait">
                      {/* Artists */}
                      {filteredResults?.artists?.length > 0 && (
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
                            {filteredResults.artists.slice(0, activeTab === 'all' ? 5 : 20).map((artist: any, index: number) => (
                              <div
                                key={`artist-${artist.id || artist.artistProfileId}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                                onClick={() => {
                                  onViewArtistProfile?.(artist);
                                  handleClose();
                                }}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getInitialBadgeColor(artist.accentColor)} font-black text-sm`}>
                                  {artist.displayName?.[0] || artist.username?.[0] || artist.artistName?.[0] || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{artist.displayName || artist.artistName || artist.username}</span>
                                    {artist.verified && <Crown className="w-4 h-4 text-accent-blue shrink-0" />}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{formatNumber(artist.followers || 0)} followers</span>
                                    {artist.genres?.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span className="truncate">{artist.genres.slice(0, 2).join(', ')}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Tracks */}
                      {filteredResults?.tracks?.length > 0 && (
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
                            {filteredResults.tracks.slice(0, activeTab === 'all' ? 5 : 20).map((track: any, index: number) => (
                              <div
                                key={`track-${track.id}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                                onClick={() => {
                                  onPlayTrack?.(track);
                                  handleClose();
                                  toast.success(`Playing "${track.title}"`);
                                }}
                              >
                                <div
                                  className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center bg-cover bg-center"
                                  style={track.artwork ? { backgroundImage: `url(${track.artwork})` } : undefined}
                                >
                                  {!track.artwork && <Music className="w-5 h-5 text-muted-foreground" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{track.title}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="truncate">{track.artist}</span>
                                    {track.duration && (
                                      <>
                                        <span>•</span>
                                        <span>{formatDuration(track.duration)}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Play className="w-4 h-4 text-muted-foreground group-hover:text-accent-coral transition-colors shrink-0" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Users/Fans */}
                      {filteredResults?.users?.length > 0 && (
                        <motion.div
                          key="users-section"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          {activeTab === 'all' && (
                            <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Fans
                            </h3>
                          )}
                          <div className="space-y-2">
                            {filteredResults.users.slice(0, activeTab === 'all' ? 5 : 20).map((user: any, index: number) => (
                              <div
                                key={`user-${user.id || user.userId}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                                onClick={() => {
                                  onViewFanProfile?.(user);
                                  handleClose();
                                }}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getInitialBadgeColor(user.accentColor)} font-black text-sm`}>
                                  {(user.displayName || user.username)?.[0] || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{user.displayName || user.username}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="truncate">@{user.username}</span>
                                    {user.followers !== undefined && user.followers > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>{formatNumber(user.followers)} followers</span>
                                      </>
                                    )}
                                  </div>
                                  {user.bio && (
                                    <p className="text-xs text-muted-foreground truncate mt-1">{user.bio}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Button
                                    size="sm"
                                    variant={user.isFollowing ? "outline" : "default"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (user.isFollowing) {
                                        onUnfollowUser?.(user.id || user.userId);
                                        toast.success(`Unfollowed @${user.username}`);
                                      } else {
                                        onFollowUser?.(user);
                                        toast.success(`Now following @${user.username}!`);
                                      }
                                    }}
                                    className={user.isFollowing ? "" : "bg-accent-coral text-background hover:bg-accent-coral/90"}
                                  >
                                    {user.isFollowing ? 'Unfollow' : 'Follow'}
                                  </Button>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Rooms */}
                      {filteredResults?.rooms?.length > 0 && (
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
                            {filteredResults.rooms.slice(0, activeTab === 'all' ? 5 : 20).map((room: any, index: number) => (
                              <div
                                key={`room-${room.id}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                                onClick={() => {
                                  onJoinRoom?.(room);
                                  handleClose();
                                }}
                              >
                                <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                                  <Hash className="w-5 h-5 text-accent-blue" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{room.name}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{formatNumber(room._count?.memberships || room.memberCount || 0)} members</span>
                                  </div>
                                  {room.description && (
                                    <p className="text-xs text-muted-foreground truncate mt-1">{room.description}</p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant={room.isJoined ? "outline" : "default"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onJoinRoom?.(room);
                                    handleClose();
                                  }}
                                  className={room.isJoined ? "" : "bg-accent-blue text-background hover:bg-accent-blue/90"}
                                >
                                  {room.isJoined ? 'Joined' : 'Join'}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Crates */}
                      {filteredResults?.crates?.length > 0 && (
                        <motion.div
                          key="crates-section"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          {activeTab === 'all' && (
                            <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Crates
                            </h3>
                          )}
                          <div className="space-y-2">
                            {filteredResults.crates.slice(0, activeTab === 'all' ? 5 : 20).map((crate: any, index: number) => (
                              <div
                                key={`crate-${crate.id}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                                onClick={() => {
                                  onViewCrate?.(crate);
                                  handleClose();
                                }}
                              >
                                <div className="w-10 h-10 bg-accent-mint/20 rounded-lg flex items-center justify-center">
                                  <User className="w-5 h-5 text-accent-mint" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{crate.title || crate.name}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="truncate">by @{crate.owner?.username || crate.creator}</span>
                                    <span>•</span>
                                    <span>{crate._count?.items || crate.trackCount || 0} tracks</span>
                                  </div>
                                  {crate.description && (
                                    <p className="text-xs text-muted-foreground truncate mt-1">{crate.description}</p>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
