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
  Clock,
  Heart,
  TrendingUp,
  Command,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Mock search data
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
    // Add more mock data as needed
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
  mockArtists = [],
  mockFans = []
}) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const inputRef = useRef(null);

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
    const handleKeyDown = (event) => {
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
            ) : !tabResults || Object.values(tabResults).every(arr => arr.length === 0) ? (
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
                      const count = tabResults[key]?.length ?? 0;
                      const isActive = activeTab === key;
                      
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
                          {key !== 'all' && count > 0 && (
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
                          <div className="space-y-2">
                            {tabResults.artists.slice(0, activeTab === 'all' ? 3 : 20).map((artist, index) => (
                              <div
                                key={`artist-${artist.id}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                                onClick={() => {
                                  onViewArtistProfile?.(artist);
                                  handleClose();
                                }}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getInitialBadgeColor(artist.accentColor)} font-black text-sm`}>
                                  {artist.displayName?.[0] || artist.username?.[0] || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">{artist.displayName || artist.username}</span>
                                    {artist.verified && <Crown className="w-4 h-4 text-accent-blue shrink-0" />}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{artist.followers?.toLocaleString() || '0'} followers</span>
                                    {artist.genres && (
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
                          <div className="space-y-2">
                            {tabResults.tracks.slice(0, activeTab === 'all' ? 3 : 20).map((track, index) => (
                              <div
                                key={`track-${track.id}-${index}`}
                                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer group"
                                onClick={() => {
                                  onPlayTrack?.(track);
                                  handleClose();
                                  toast.success(`Playing "${track.title}"`);
                                }}
                              >
                                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                  <Music className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">{track.title}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="truncate">{track.artist}</span>
                                    <span>•</span>
                                    <span>{track.duration}</span>
                                    <span>•</span>
                                    <span>{track.plays?.toLocaleString() || '0'} plays</span>
                                  </div>
                                </div>
                                <Play className="w-4 h-4 text-muted-foreground group-hover:text-accent-coral transition-colors shrink-0" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Show more results button for 'all' tab */}
                      {activeTab === 'all' && Object.values(tabResults).some(arr => arr.length > 3) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center pt-4"
                        >
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab('tracks')}
                            className="text-sm"
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
      </DialogContent>
    </Dialog>
  );
}