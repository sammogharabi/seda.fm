import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
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
  ChevronRight,
  X,
  ArrowLeft,
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

interface MobileSearchOptimizedProps {
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

export function MobileSearchOptimized({
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
}: MobileSearchOptimizedProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'artists' | 'tracks' | 'users' | 'rooms' | 'crates'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Use the search hook with real API
  const { results: searchResults, isLoading, error } = useSearch(query, activeTab);

  // Auto-focus when sheet opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Clear search when closing
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveTab('all');
    }
  }, [isOpen]);

  // Check for scroll indicator on tab overflow
  useEffect(() => {
    const checkScrollIndicator = () => {
      if (tabsRef.current) {
        const { scrollWidth, clientWidth } = tabsRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScrollIndicator();
    window.addEventListener('resize', checkScrollIndicator);
    return () => window.removeEventListener('resize', checkScrollIndicator);
  }, []);

  const handleClose = useCallback(() => {
    setQuery('');
    setActiveTab('all');
    onClose();
  }, [onClose]);

  const handleScrollIndicatorClick = useCallback(() => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  }, []);

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
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="top"
        className="mobile-search-fullscreen"
        aria-describedby="mobile-search-description"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          maxHeight: 'none',
          border: 'none',
          borderRadius: 0,
          margin: 0,
          padding: 0,
          transform: 'none',
          zIndex: 9999,
          background: 'var(--color-background)',
          overflow: 'hidden',
          inset: 0
        }}
      >
        <div
          className="mobile-search-wrapper"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--color-background)',
            overflow: 'hidden',
            zIndex: 10000
          }}
        >
          <div className="flex flex-col h-full" style={{ height: '100vh', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Mobile Header */}
            <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-muted/50 rounded-lg transition-colors -ml-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  Search
                </SheetTitle>
              </div>
              <SheetDescription id="mobile-search-description" className="sr-only">
                Search for artists, tracks, fans, rooms, and crates on sedā.fm
              </SheetDescription>
            </SheetHeader>

            {/* Search Input */}
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search artists, tracks, fans..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base bg-input-background border-border focus:border-accent-coral focus:ring-1 focus:ring-accent-coral"
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
            <div className="flex-1 min-h-0">
              {!query.trim() ? (
                // Empty state
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <Search className="w-16 h-16 text-muted-foreground mb-6" />
                  <h3 className="text-xl font-medium mb-3">Search sedā.fm</h3>
                  <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                    Discover artists, tracks, fans, rooms, and crates across the platform
                  </p>

                  {/* Popular searches */}
                  <div className="w-full max-w-sm space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground text-left">Popular searches</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Hip Hop', 'Electronic', 'Synthwave', 'Jazz', 'Live Sessions'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-2 bg-muted/50 hover:bg-muted text-sm rounded-lg transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : isLoading ? (
                // Loading state
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              ) : error ? (
                // Error state
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <Search className="w-16 h-16 text-red-500 mb-6" />
                  <h3 className="text-xl font-medium mb-3 text-red-500">Search failed</h3>
                  <p className="text-base text-muted-foreground">{error}</p>
                </div>
              ) : getTotalResults() === 0 ? (
                // No results
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                  <Search className="w-16 h-16 text-muted-foreground mb-6" />
                  <h3 className="text-xl font-medium mb-3">No results found</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Try searching with different keywords or check your spelling
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Filter Tabs */}
                  <div className="px-4 py-2 border-b border-border flex-shrink-0">
                    <div className="relative">
                      <div
                        ref={tabsRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {tabs.map(({ key, label, icon: Icon }) => {
                          const count = key === 'all' ? getTotalResults() : (filteredResults?.[key]?.length ?? 0);
                          const isActive = activeTab === key;

                          // Only show tabs with results (except 'all')
                          if (key !== 'all' && count === 0) return null;

                          return (
                            <button
                              key={key}
                              onClick={() => setActiveTab(key)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] ${
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

                      {/* Scroll Indicator */}
                      {showScrollIndicator && (
                        <button
                          onClick={handleScrollIndicatorClick}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 hover:bg-muted/50 rounded transition-colors"
                          aria-label="Scroll to see more tabs"
                        >
                          <div className="bg-gradient-to-l from-background via-background to-transparent w-8 h-full absolute right-2 top-0 pointer-events-none"></div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground relative z-10" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Results */}
                  <ScrollArea className="flex-1">
                    <div className="px-4 py-3 space-y-4">
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
                            <div className="space-y-1">
                              {filteredResults.artists.slice(0, activeTab === 'all' ? 5 : 50).map((artist: any, index: number) => (
                                <div
                                  key={`artist-${artist.id || artist.artistProfileId}-${index}`}
                                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group active:bg-muted min-h-[60px]"
                                  onClick={() => {
                                    onViewArtistProfile?.(artist);
                                    handleClose();
                                  }}
                                >
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getInitialBadgeColor(artist.accentColor)} font-black text-base shrink-0`}>
                                    {artist.displayName?.[0] || artist.username?.[0] || artist.artistName?.[0] || '?'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium truncate text-base">{artist.displayName || artist.artistName || artist.username}</span>
                                      {artist.verified && <Crown className="w-4 h-4 text-accent-blue shrink-0" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span>{formatNumber(artist.followers || 0)} followers</span>
                                      {artist.genres?.length > 0 && (
                                        <>
                                          <span>•</span>
                                          <span className="truncate">{artist.genres.slice(0, 1).join(', ')}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
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
                            <div className="space-y-1">
                              {filteredResults.tracks.slice(0, activeTab === 'all' ? 5 : 50).map((track: any, index: number) => (
                                <div
                                  key={`track-${track.id}-${index}`}
                                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group active:bg-muted min-h-[60px]"
                                  onClick={() => {
                                    onPlayTrack?.(track);
                                    handleClose();
                                    toast.success(`Playing "${track.title}"`);
                                  }}
                                >
                                  <div
                                    className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0 bg-cover bg-center"
                                    style={track.artwork ? { backgroundImage: `url(${track.artwork})` } : undefined}
                                  >
                                    {!track.artwork && <Music className="w-6 h-6 text-muted-foreground" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-base mb-1">{track.title}</div>
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
                                  <Play className="w-5 h-5 text-muted-foreground group-hover:text-accent-coral transition-colors shrink-0" />
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
                            <div className="space-y-1">
                              {filteredResults.users.slice(0, activeTab === 'all' ? 5 : 50).map((user: any, index: number) => (
                                <div
                                  key={`user-${user.id || user.userId}-${index}`}
                                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group active:bg-muted min-h-[60px]"
                                  onClick={() => {
                                    onViewFanProfile?.(user);
                                    handleClose();
                                  }}
                                >
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getInitialBadgeColor(user.accentColor)} font-black text-base shrink-0`}>
                                    {(user.displayName || user.username)?.[0] || '?'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-base mb-1">{user.displayName || user.username}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span className="truncate">@{user.username}</span>
                                      {user.followers !== undefined && user.followers > 0 && (
                                        <>
                                          <span>•</span>
                                          <span>{formatNumber(user.followers)} followers</span>
                                        </>
                                      )}
                                    </div>
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
                                      className={`min-h-[36px] ${user.isFollowing ? "" : "bg-accent-coral text-background hover:bg-accent-coral/90"}`}
                                    >
                                      {user.isFollowing ? 'Unfollow' : 'Follow'}
                                    </Button>
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
                            <div className="space-y-1">
                              {filteredResults.rooms.slice(0, activeTab === 'all' ? 5 : 50).map((room: any, index: number) => (
                                <div
                                  key={`room-${room.id}-${index}`}
                                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group active:bg-muted min-h-[60px]"
                                  onClick={() => {
                                    onJoinRoom?.(room);
                                    handleClose();
                                  }}
                                >
                                  <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex items-center justify-center shrink-0">
                                    <Hash className="w-6 h-6 text-accent-blue" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-base mb-1">{room.name}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span>{formatNumber(room._count?.memberships || room.memberCount || 0)} members</span>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={room.isJoined ? "outline" : "default"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onJoinRoom?.(room);
                                      handleClose();
                                    }}
                                    className={`min-h-[36px] ${room.isJoined ? "" : "bg-accent-blue text-background hover:bg-accent-blue/90"}`}
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
                            <div className="space-y-1">
                              {filteredResults.crates.slice(0, activeTab === 'all' ? 5 : 50).map((crate: any, index: number) => (
                                <div
                                  key={`crate-${crate.id}-${index}`}
                                  className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group active:bg-muted min-h-[60px]"
                                  onClick={() => {
                                    onViewCrate?.(crate);
                                    handleClose();
                                  }}
                                >
                                  <div className="w-12 h-12 bg-accent-mint/20 rounded-lg flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-accent-mint" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-base mb-1">{crate.title || crate.name}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span className="truncate">by @{crate.owner?.username || crate.creator}</span>
                                      <span>•</span>
                                      <span>{crate._count?.items || crate.trackCount || 0} tracks</span>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
