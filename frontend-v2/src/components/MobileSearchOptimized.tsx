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
  Clock,
  Heart,
  TrendingUp,
  ChevronRight,
  X,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Mock search data - same as desktop
const MOCK_SEARCH_DATA = {
  artists: [
    {
      id: 'search-artist-1',
      username: 'neon_synth',
      displayName: 'Neon Synth',
      verified: true,
      accentColor: 'blue',
      followers: 8420,
      genres: ['Synthwave', 'Electronic'],
      bio: 'Synthwave producer creating nostalgic soundscapes for the digital age.'
    },
    {
      id: 'search-artist-2',
      username: 'vinyl_soul',
      displayName: 'Vinyl Soul',
      verified: false,
      accentColor: 'mint',
      followers: 3250,
      genres: ['Soul', 'Jazz', 'Hip Hop'],
      bio: 'Digging deep into vintage sounds with a modern twist.'
    }
  ],
  tracks: [
    {
      id: 'search-track-1',
      title: 'Midnight Drive',
      artist: 'Neon Synth',
      genre: 'Synthwave',
      duration: '4:32',
      plays: 15670,
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    },
    {
      id: 'search-track-2',
      title: 'Urban Groove',
      artist: 'Vinyl Soul',
      genre: 'Hip Hop',
      duration: '3:45',
      plays: 8920,
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'
    }
  ],
  fans: [
    {
      id: 'search-fan-1',
      username: 'beat_hunter',
      displayName: 'Beat Hunter',
      accentColor: 'coral',
      following: 245,
      followers: 892,
      bio: 'Always on the hunt for the next underground hit.'
    },
    {
      id: 'search-fan-2',
      username: 'melody_maven',
      displayName: 'Melody Maven',
      accentColor: 'yellow',
      following: 156,
      followers: 434,
      bio: 'Curator of beautiful melodies and hidden gems.'
    }
  ],
  rooms: [
    {
      id: 'search-room-1',
      name: 'Underground Hip Hop',
      description: 'Raw beats and conscious lyrics from the underground scene',
      memberCount: 1247,
      isLive: true,
      genre: 'Hip Hop'
    },
    {
      id: 'search-room-2',
      name: 'Synthwave Sessions',
      description: 'Nostalgic electronic sounds for late night coding',
      memberCount: 892,
      isLive: false,
      genre: 'Electronic'
    }
  ],
  crates: [
    {
      id: 'search-crate-1',
      name: 'Late Night Vibes',
      description: 'Perfect tracks for those 3am coding sessions',
      trackCount: 47,
      creator: 'neon_synth',
      plays: 2340
    },
    {
      id: 'search-crate-2',
      name: 'Hip Hop Essentials',
      description: 'The tracks that defined a generation',
      trackCount: 33,
      creator: 'vinyl_soul',
      plays: 5670
    }
  ]
};

const getInitialBadgeColor = (accentColor) => {
  const colorMap = {
    coral: 'bg-accent-coral text-background',
    blue: 'bg-accent-blue text-background',
    mint: 'bg-accent-mint text-background',
    yellow: 'bg-accent-yellow text-background'
  };
  return colorMap[accentColor] || 'bg-muted text-muted-foreground';
};

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
  mockArtists = [],
  mockFans = []
}) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const inputRef = useRef(null);
  const tabsRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  // Auto-focus when sheet opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Longer delay for mobile sheet animation
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

  // Filter results based on query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return null;

    const searchQuery = query.toLowerCase().trim();
    
    const filterByQuery = (items, searchFields) => {
      return items.filter(item => 
        searchFields.some(field => {
          const value = item[field];
          if (Array.isArray(value)) {
            return value.some(v => v.toLowerCase().includes(searchQuery));
          }
          return value?.toLowerCase().includes(searchQuery);
        })
      );
    };

    return {
      artists: filterByQuery([...MOCK_SEARCH_DATA.artists, ...mockArtists], ['username', 'displayName', 'bio', 'genres']),
      tracks: filterByQuery(MOCK_SEARCH_DATA.tracks, ['title', 'artist', 'genre']),
      fans: filterByQuery([...MOCK_SEARCH_DATA.fans, ...mockFans], ['username', 'displayName', 'bio']),
      rooms: filterByQuery(MOCK_SEARCH_DATA.rooms, ['name', 'description', 'genre']),
      crates: filterByQuery(MOCK_SEARCH_DATA.crates, ['name', 'description', 'creator'])
    };
  }, [query, mockArtists, mockFans]);

  const tabs = [
    { key: 'all', label: 'All', icon: Search },
    { key: 'tracks', label: 'Tracks', icon: Music },
    { key: 'artists', label: 'Artists', icon: Mic },
    { key: 'fans', label: 'Fans', icon: Users },
    { key: 'rooms', label: 'Rooms', icon: Hash },
    { key: 'crates', label: 'Crates', icon: User }
  ];

  const getFilteredResultsByTab = () => {
    if (!filteredResults) return null;
    
    if (activeTab === 'all') return filteredResults;
    
    return {
      [activeTab]: filteredResults[activeTab] || []
    };
  };

  const tabResults = getFilteredResultsByTab();

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
              // Empty state - more mobile-friendly
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
            ) : !tabResults || Object.values(tabResults).every(arr => arr.length === 0) ? (
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
                {/* Filter Tabs - Mobile optimized */}
                <div className="px-4 py-2 border-b border-border flex-shrink-0">
                  <div className="relative">
                    <div 
                      ref={tabsRef}
                      className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {tabs.map(({ key, label, icon: Icon }) => {
                        const count = tabResults[key]?.length ?? 0;
                        const isActive = activeTab === key;
                        
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
                            {key !== 'all' && count > 0 && (
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
                      {tabResults?.artists?.length > 0 && (
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
                            {tabResults.artists.slice(0, activeTab === 'all' ? 5 : 50).map((artist, index) => (
                              <div
                                key={`artist-${artist.id}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group active:bg-muted min-h-[60px]"
                                onClick={() => {
                                  onViewArtistProfile?.(artist);
                                  handleClose();
                                }}
                              >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getInitialBadgeColor(artist.accentColor)} font-black text-base shrink-0`}>
                                  {artist.displayName?.[0] || artist.username?.[0] || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate text-base">{artist.displayName || artist.username}</span>
                                    {artist.verified && <Crown className="w-4 h-4 text-accent-blue shrink-0" />}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{artist.followers?.toLocaleString() || '0'} followers</span>
                                    {artist.genres && (
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
                      {tabResults?.tracks?.length > 0 && (
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
                            {tabResults.tracks.slice(0, activeTab === 'all' ? 5 : 50).map((track, index) => (
                              <div
                                key={`track-${track.id}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group active:bg-muted min-h-[60px]"
                                onClick={() => {
                                  onPlayTrack?.(track);
                                  handleClose();
                                  toast.success(`Playing "${track.title}"`);
                                }}
                              >
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                  <Music className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate text-base mb-1">{track.title}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="truncate">{track.artist}</span>
                                    <span>•</span>
                                    <span>{track.duration}</span>
                                  </div>
                                </div>
                                <Play className="w-5 h-5 text-muted-foreground group-hover:text-accent-coral transition-colors shrink-0" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Show more results for 'all' tab */}
                      {activeTab === 'all' && Object.values(tabResults).some(arr => arr.length > 5) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center pt-4"
                        >
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('tracks')}
                            className="text-base min-h-[44px] px-6"
                          >
                            View all results
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
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