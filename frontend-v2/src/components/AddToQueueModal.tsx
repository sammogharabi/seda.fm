import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Upload,
  Music,
  Search,
  ExternalLink,
  Disc3,
  Play,
  X,
  AlertCircle,
  Check,
  Loader2,
  Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { searchTracks, getStreamingConnections, getSpotifyConnectUrl, getTrack, formatDuration, getHighResArtwork } from '../lib/api/streaming';

// Platform icons/colors
const PLATFORMS = {
  spotify: {
    name: 'Spotify',
    color: 'bg-[#1DB954]',
    textColor: 'text-[#1DB954]',
    bgLight: 'bg-[#1DB954]/10',
    icon: Music,
    placeholder: 'Paste Spotify track URL or search...',
    urlPattern: /spotify\.com\/track\//
  },
  apple: {
    name: 'Apple Music',
    color: 'bg-[#FA243C]',
    textColor: 'text-[#FA243C]',
    bgLight: 'bg-[#FA243C]/10',
    icon: Music,
    placeholder: 'Paste Apple Music track URL or search...',
    urlPattern: /music\.apple\.com/
  },
  bandcamp: {
    name: 'Bandcamp',
    color: 'bg-[#629AA9]',
    textColor: 'text-[#629AA9]',
    bgLight: 'bg-[#629AA9]/10',
    icon: Disc3,
    placeholder: 'Paste Bandcamp track URL...',
    urlPattern: /bandcamp\.com\/track\//
  },
  tidal: {
    name: 'Tidal',
    color: 'bg-[#000000]',
    textColor: 'text-foreground',
    bgLight: 'bg-foreground/10',
    icon: Music,
    placeholder: 'Paste Tidal track URL...',
    urlPattern: /tidal\.com\/browse\/track\//
  },
  beatport: {
    name: 'Beatport',
    color: 'bg-[#01FF95]',
    textColor: 'text-[#01FF95]',
    bgLight: 'bg-[#01FF95]/10',
    icon: Music,
    placeholder: 'Paste Beatport track URL...',
    urlPattern: /beatport\.com\/track\//
  }
};

interface StreamingConnection {
  connected: boolean;
  displayName?: string;
}

interface AddToQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrack: (track: any) => void;
  sessionTitle?: string;
}

export function AddToQueueModal({ isOpen, onClose, onAddTrack, sessionTitle }: AddToQueueModalProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connections, setConnections] = useState<{
    spotify: StreamingConnection;
    appleMusic: StreamingConnection;
  }>({
    spotify: { connected: false },
    appleMusic: { connected: false }
  });
  const [loadingConnections, setLoadingConnections] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch streaming connection status on mount
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoadingConnections(true);
        const data = await getStreamingConnections();
        setConnections({
          spotify: data.spotify || { connected: false },
          appleMusic: data.appleMusic || { connected: false }
        });
      } catch (error) {
        console.error('[AddToQueueModal] Failed to fetch connections:', error);
      } finally {
        setLoadingConnections(false);
      }
    };

    if (isOpen) {
      fetchConnections();
    }
  }, [isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload an MP3, WAV, OGG, or FLAC file'
      });
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Maximum file size is 50MB'
      });
      return;
    }

    setUploadedFile(file);
  };

  const handleUploadTrack = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    // Simulate upload processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const track = {
      id: Date.now().toString(),
      title: uploadedFile.name.replace(/\.[^/.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Uploaded Track',
      duration: '0:00',
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      source: 'upload',
      file: uploadedFile
    };

    onAddTrack(track);
    setIsProcessing(false);
    setUploadedFile(null);
    
    toast.success('Track added to queue!', {
      description: `"${track.title}" will play next`
    });
    
    onClose();
  };

  const handleSearch = async (platform: string, query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Debounce search
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);

      try {
        // Map platform to API provider name
        const provider = platform === 'apple' ? 'apple-music' : platform;
        const results = await searchTracks(query, { provider: provider as any, limit: 10 });

        // Extract tracks from the response
        let tracks: any[] = [];
        if (provider === 'spotify' && results.spotify && 'tracks' in results.spotify) {
          tracks = results.spotify.tracks.map(t => ({
            id: t.id,
            title: t.name,
            artist: t.artist,
            album: t.album,
            duration: formatDuration(t.duration),
            artwork: getHighResArtwork(t.artwork || '', 300),
            externalUrl: t.externalUrl,
            uri: t.uri,
            provider: 'spotify'
          }));
        } else if (provider === 'apple-music' && results.appleMusic && 'tracks' in results.appleMusic) {
          tracks = results.appleMusic.tracks.map(t => ({
            id: t.id,
            title: t.name,
            artist: t.artist,
            album: t.album,
            duration: formatDuration(t.duration),
            artwork: getHighResArtwork(t.artwork || '', 300),
            externalUrl: t.externalUrl,
            provider: 'apple-music'
          }));
        }

        setSearchResults(tracks);
      } catch (error: any) {
        console.error('[AddToQueueModal] Search failed:', error);
        if (error.message?.includes('not connected')) {
          toast.error('Connect your account first', {
            description: `Please connect your ${platform === 'apple' ? 'Apple Music' : 'Spotify'} account in Settings`
          });
        } else {
          toast.error('Search failed', {
            description: 'Please try again'
          });
        }
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleUrlImport = async (platform: string, url: string) => {
    const platformData = PLATFORMS[platform];

    if (!platformData.urlPattern.test(url)) {
      toast.error('Invalid URL', {
        description: `Please enter a valid ${platformData.name} track URL`
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Extract track ID from URL
      let trackId: string | null = null;
      const provider = platform === 'apple' ? 'apple-music' : platform;

      if (platform === 'spotify') {
        // Extract from spotify.com/track/TRACKID or open.spotify.com/track/TRACKID
        const match = url.match(/track\/([a-zA-Z0-9]+)/);
        trackId = match ? match[1] : null;
      } else if (platform === 'apple') {
        // Extract from music.apple.com/.../album/.../TRACKID or ?i=TRACKID
        const match = url.match(/[?&]i=(\d+)/) || url.match(/\/(\d+)(?:\?|$)/);
        trackId = match ? match[1] : null;
      }

      if (!trackId) {
        toast.error('Could not extract track ID', {
          description: 'Please check the URL format'
        });
        setIsProcessing(false);
        return;
      }

      // Fetch track details from API
      const trackData = await getTrack(provider as 'spotify' | 'apple-music', trackId);

      const track = {
        id: trackData.id,
        title: trackData.name,
        artist: trackData.artist,
        album: trackData.album,
        duration: formatDuration(trackData.duration),
        artwork: getHighResArtwork(trackData.artwork || '', 300),
        source: platform,
        platform: provider,
        externalUrl: trackData.externalUrl,
        uri: trackData.uri,
        url: url
      };

      onAddTrack(track);
      setUrlInput('');

      toast.success('Track added!', {
        description: `"${track.title}" by ${track.artist}`
      });

      onClose();
    } catch (error: any) {
      console.error('[AddToQueueModal] URL import failed:', error);
      if (error.message?.includes('not connected')) {
        toast.error('Connect your account first', {
          description: `Please connect your ${platformData.name} account in Settings`
        });
      } else {
        toast.error('Failed to import track', {
          description: 'Could not fetch track details. Make sure your account is connected.'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddFromSearch = (track: any, platform: string) => {
    const trackWithSource = {
      ...track,
      source: platform
    };
    
    onAddTrack(trackWithSource);
    
    toast.success('Track added to queue!', {
      description: `"${track.title}" by ${track.artist}`
    });
    
    onClose();
  };

  const renderPlatformTab = (platform: string) => {
    const platformData = PLATFORMS[platform];
    const Icon = platformData.icon;

    // Check connection status for Spotify and Apple Music
    const isConnected = platform === 'spotify'
      ? connections.spotify.connected
      : platform === 'apple'
      ? connections.appleMusic.connected
      : false;
    const showConnectionWarning = (platform === 'spotify' || platform === 'apple') && !isConnected && !loadingConnections;

    return (
      <TabsContent value={platform} className="space-y-4 mt-4">
        {/* Connection Warning */}
        {showConnectionWarning && (
          <div className="bg-accent-yellow/10 border border-accent-yellow/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Link2 className="w-5 h-5 text-accent-yellow mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Connect your {platformData.name} account</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  To search and import tracks from {platformData.name}, you need to connect your account first.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    if (platform === 'spotify') {
                      window.location.href = getSpotifyConnectUrl();
                    } else {
                      toast.info('Connect in Settings', {
                        description: 'Go to Settings > Streaming to connect your Apple Music account'
                      });
                    }
                  }}
                  className={`${platformData.color} text-background hover:opacity-90`}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect {platformData.name}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor={`${platform}-url`}>
            Paste {platformData.name} URL
          </Label>
          <div className="flex gap-2">
            <Input
              id={`${platform}-url`}
              type="url"
              placeholder={platformData.placeholder}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => handleUrlImport(platform, urlInput)}
              disabled={!urlInput.trim() || isProcessing}
              className={`${platformData.color} text-background hover:opacity-90`}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Example: {platformData.name === 'Spotify' && 'https://open.spotify.com/track/...'}
            {platformData.name === 'Apple Music' && 'https://music.apple.com/us/album/...'}
            {platformData.name === 'Bandcamp' && 'https://artist.bandcamp.com/track/...'}
            {platformData.name === 'Tidal' && 'https://tidal.com/browse/track/...'}
            {platformData.name === 'Beatport' && 'https://www.beatport.com/track/...'}
          </p>
        </div>

        {/* Search (for Spotify and Apple Music) */}
        {(platform === 'spotify' || platform === 'apple') && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or search
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${platform}-search`}>
                Search {platformData.name}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id={`${platform}-search`}
                  type="text"
                  placeholder={`Search for tracks on ${platformData.name}...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(platform, e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            {(isSearching || searchResults.length > 0) && (
              <div className="space-y-2">
                <Label>Results</Label>
                <ScrollArea className="h-64 border border-border rounded-lg">
                  <div className="p-2 space-y-2">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Music className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No results found
                        </p>
                      </div>
                    ) : (
                      searchResults.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors group"
                        >
                          <img
                            src={track.artwork}
                            alt={track.title}
                            className="w-12 h-12 object-cover rounded border border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {track.artist} • {track.duration}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddFromSearch(track, platform)}
                            className={`${platformData.color} text-background hover:opacity-90`}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </>
        )}

        {/* Info Alert */}
        <div className={`${platformData.bgLight} border-l-4 ${platformData.textColor} border-current p-3 rounded-r`}>
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium mb-1">Streaming Integration</p>
              <p className="text-muted-foreground">
                Tracks from {platformData.name} will be played through their streaming service.
                Listeners must have an active subscription to hear the full track.
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby="add-queue-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Track to Queue</DialogTitle>
          <DialogDescription id="add-queue-description">
            {sessionTitle ? `Add a track to "${sessionTitle}"` : 'Choose a source to add music to your session'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="upload" className="text-xs">
              <Upload className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="spotify" className="text-xs">
              <Music className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Spotify</span>
            </TabsTrigger>
            <TabsTrigger value="apple" className="text-xs">
              <Music className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Apple</span>
            </TabsTrigger>
            <TabsTrigger value="bandcamp" className="text-xs">
              <Disc3 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Bandcamp</span>
            </TabsTrigger>
            <TabsTrigger value="tidal" className="text-xs">
              <Music className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Tidal</span>
            </TabsTrigger>
            <TabsTrigger value="beatport" className="text-xs">
              <Music className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Beatport</span>
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="bg-accent-mint/10 border border-accent-mint/20 rounded-lg p-4">
                        <Check className="w-8 h-8 text-accent-mint" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                      <Button
                        onClick={handleUploadTrack}
                        disabled={isProcessing}
                        className="bg-accent-coral text-background hover:bg-accent-coral/90"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Add to Queue
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="bg-accent-coral/10 border border-accent-coral/20 rounded-lg p-4">
                        <Upload className="w-8 h-8 text-accent-coral" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Upload an audio file</p>
                      <p className="text-sm text-muted-foreground">
                        MP3, WAV, OGG, or FLAC (max 50MB)
                      </p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-accent-coral text-background hover:bg-accent-coral/90"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                )}
              </div>

              <div className="bg-accent-blue/10 border-l-4 border-accent-blue p-3 rounded-r">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-accent-blue flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium mb-1">Upload Guidelines</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Only upload music you have rights to share</li>
                      <li>• Maximum file size: 50MB</li>
                      <li>• Supported formats: MP3, WAV, OGG, FLAC</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Platform Tabs */}
          {renderPlatformTab('spotify')}
          {renderPlatformTab('apple')}
          {renderPlatformTab('bandcamp')}
          {renderPlatformTab('tidal')}
          {renderPlatformTab('beatport')}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
