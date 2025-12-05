import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Search, 
  Plus, 
  Play, 
  Music, 
  Clock, 
  Filter,
  Loader2,
  Check,
  X,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import { searchService, SearchResult, SearchFilters } from '../services/searchService';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TrackSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTracks: (tracks: SearchResult[], playlistId?: number) => void;
  playlists?: Array<{
    id: number;
    name: string;
    trackCount: number;
  }>;
  selectedPlaylistId?: number;
  title?: string;
  maxSelections?: number;
  showPlaylistSelection?: boolean;
}

export function TrackSearch({
  isOpen,
  onClose,
  onAddTracks,
  playlists = [],
  selectedPlaylistId,
  title = 'Add Tracks',
  maxSelections = 10,
  showPlaylistSelection = true
}: TrackSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [targetPlaylistId, setTargetPlaylistId] = useState<number | undefined>(selectedPlaylistId);
  const [previewingTrack, setPreviewingTrack] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    providers: [],
    genres: [],
    explicit: undefined,
    sortBy: 'relevance'
  });

  // Search with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResponse = await searchService.searchTracks(query, filters, 50);
        setResults(searchResponse.tracks);
      } catch (error) {
        console.error('Search failed:', error);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeout);
  }, [query, filters]);

  // Load popular tracks on open if no query
  useEffect(() => {
    if (isOpen && !query) {
      loadPopularTracks();
    }
  }, [isOpen]);

  const loadPopularTracks = async () => {
    setIsLoading(true);
    try {
      const popular = await searchService.getPopularTracks(undefined, 20);
      setResults(popular);
    } catch (error) {
      console.error('Failed to load popular tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSelect = (trackId: string) => {
    const newSelected = new Set(selectedTracks);
    
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      if (newSelected.size >= maxSelections) {
        toast.warning(`Maximum ${maxSelections} tracks can be selected at once`);
        return;
      }
      newSelected.add(trackId);
    }
    
    setSelectedTracks(newSelected);
  };

  const handleAddSelected = () => {
    const tracksToAdd = results.filter(track => selectedTracks.has(track.id));
    
    if (tracksToAdd.length === 0) {
      toast.error('Please select at least one track');
      return;
    }

    if (showPlaylistSelection && !targetPlaylistId) {
      toast.error('Please select a playlist');
      return;
    }

    onAddTracks(tracksToAdd, targetPlaylistId);
    
    // Reset state
    setSelectedTracks(new Set());
    setQuery('');
    setResults([]);
    onClose();
  };

  const handlePreview = (track: SearchResult) => {
    if (previewingTrack === track.id) {
      setPreviewingTrack(null);
    } else {
      setPreviewingTrack(track.id);
      // In a real implementation, this would play a preview
      toast.info(`Playing preview of "${track.title}"`);
      
      // Auto-stop preview after 30 seconds
      setTimeout(() => {
        if (previewingTrack === track.id) {
          setPreviewingTrack(null);
        }
      }, 30000);
    }
  };

  const selectedTracksList = useMemo(() => {
    return results.filter(track => selectedTracks.has(track.id));
  }, [results, selectedTracks]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProviderBadgeColor = (provider: string): string => {
    const colors: Record<string, string> = {
      'Spotify': 'bg-green-500',
      'Apple Music': 'bg-gray-800',
      'YouTube Music': 'bg-red-500',
      'SoundCloud': 'bg-orange-500'
    };
    return colors[provider] || 'bg-gray-500';
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            {title}
            {selectedTracks.size > 0 && (
              <Badge variant="secondary">
                {selectedTracks.size} selected
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search for tracks, artists, or albums..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {showFilters && (
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm mb-2 block">Providers</label>
                      <div className="space-y-2">
                        {['Spotify', 'Apple Music', 'YouTube Music', 'SoundCloud'].map(provider => (
                          <div key={provider} className="flex items-center space-x-2">
                            <Checkbox
                              id={`provider-${provider}`}
                              checked={filters.providers?.includes(provider)}
                              onCheckedChange={(checked) => {
                                const newProviders = filters.providers || [];
                                if (checked) {
                                  setFilters({
                                    ...filters,
                                    providers: [...newProviders, provider]
                                  });
                                } else {
                                  setFilters({
                                    ...filters,
                                    providers: newProviders.filter(p => p !== provider)
                                  });
                                }
                              }}
                            />
                            <label htmlFor={`provider-${provider}`} className="text-sm">
                              {provider}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm mb-2 block">Sort By</label>
                      <Select
                        value={filters.sortBy || 'relevance'}
                        onValueChange={(value) => setFilters({
                          ...filters,
                          sortBy: value as 'relevance' | 'popularity' | 'recent' | 'duration'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="popularity">Popularity</SelectItem>
                          <SelectItem value="recent">Recent</SelectItem>
                          <SelectItem value="duration">Duration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm mb-2 block">Content</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="clean-only"
                            checked={filters.explicit === false}
                            onCheckedChange={(checked) => {
                              setFilters({
                                ...filters,
                                explicit: checked ? false : undefined
                              });
                            }}
                          />
                          <label htmlFor="clean-only" className="text-sm">
                            Clean only
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Playlist Selection */}
            {showPlaylistSelection && playlists.length > 0 && (
              <div>
                <label className="text-sm mb-2 block">Add to Playlist</label>
                <Select
                  value={targetPlaylistId?.toString()}
                  onValueChange={(value) => setTargetPlaylistId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a playlist" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.map(playlist => (
                      <SelectItem key={playlist.id} value={playlist.id.toString()}>
                        {playlist.name} ({playlist.trackCount} tracks)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-4">
                  {results.map((track) => (
                    <Card key={track.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedTracks.has(track.id)}
                          onCheckedChange={() => handleTrackSelect(track.id)}
                        />

                        <img
                          src={track.artwork}
                          alt={track.title}
                          className="w-12 h-12 rounded object-cover"
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{track.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={`text-xs text-white ${getProviderBadgeColor(track.provider)}`}
                            >
                              {track.provider}
                            </Badge>
                            {track.isExplicit && (
                              <Badge variant="secondary" className="text-xs">E</Badge>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDuration(track.duration)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreview(track)}
                          >
                            {previewingTrack === track.id ? (
                              <Volume2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          
                          {track.streamingUrls && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Open streaming service
                                const url = track.streamingUrls?.spotify || 
                                          track.streamingUrls?.apple || 
                                          track.streamingUrls?.youtube ||
                                          track.streamingUrls?.soundcloud;
                                if (url) {
                                  window.open(url, '_blank');
                                }
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : query ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Search className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No tracks found for "{query}"</p>
                <p className="text-sm text-muted-foreground mt-1">Try different keywords or adjust filters</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Music className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Popular tracks</p>
                <p className="text-sm text-muted-foreground mt-1">Search for specific tracks or browse popular music</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedTracks.size > 0 && (
                <span>{selectedTracks.size} track{selectedTracks.size !== 1 ? 's' : ''} selected</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              
              <Button 
                onClick={handleAddSelected}
                disabled={selectedTracks.size === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {selectedTracks.size > 0 ? `${selectedTracks.size} ` : ''}Track{selectedTracks.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}