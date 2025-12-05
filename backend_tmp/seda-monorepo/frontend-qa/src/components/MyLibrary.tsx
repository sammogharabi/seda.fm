import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Music, 
  Plus, 
  Search, 
  ExternalLink, 
  Upload, 
  Music2,
  Play,
  Pause,
  MoreVertical,
  Download,
  Heart,
  ListPlus,
  Clock,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { externalMusicService } from '../services/externalMusicService';
import { ExternalTrack, ExternalLibrary, TrackUploadRequest } from '../types/external-music';
import { useAudioEngine } from '../hooks/useAudioEngine';

interface MyLibraryProps {
  user?: any;
  onAddToPlaylist?: (track: ExternalTrack) => void;
  onAddToDJQueue?: (track: ExternalTrack) => void;
  // Dialog mode props (for DJ Mode)
  isOpen?: boolean;
  onClose?: () => void;
  onAddTracks?: (tracks: ExternalTrack[]) => void;
  mode?: 'default' | 'dj';
  title?: string;
  showAddToQueue?: boolean;
  maxSelections?: number;
}

export function MyLibrary({ 
  user, 
  onAddToPlaylist, 
  onAddToDJQueue,
  isOpen,
  onClose,
  onAddTracks,
  mode = 'default',
  title,
  showAddToQueue,
  maxSelections = 10
}: MyLibraryProps) {
  const [activeTab, setActiveTab] = useState<'spotify' | 'apple' | 'uploads'>('spotify');
  const [libraries, setLibraries] = useState<{
    spotify: ExternalLibrary;
    apple: ExternalLibrary;
    uploads: ExternalLibrary;
  }>({
    spotify: { provider: 'spotify', isConnected: false, tracks: [], totalTracks: 0 },
    apple: { provider: 'apple', isConnected: false, tracks: [], totalTracks: 0 },
    uploads: { provider: 'uploads' as any, isConnected: true, tracks: [], totalTracks: 0 }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: '',
    artist: '',
    album: '',
    attestCopyright: false
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const { play, pause, isPlaying, loadTrack, currentTrack } = useAudioEngine();

  // Load libraries on component mount
  useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    try {
      const [spotifyLib, appleLib, uploadsLib] = await Promise.all([
        externalMusicService.getLibrary('spotify'),
        externalMusicService.getLibrary('apple'),
        externalMusicService.getLibrary('uploads')
      ]);

      setLibraries({
        spotify: spotifyLib,
        apple: appleLib,
        uploads: uploadsLib
      });
    } catch (error) {
      console.error('Failed to load libraries:', error);
      toast.error('Failed to load music libraries');
    }
  };

  const handleConnect = async (provider: 'spotify' | 'apple') => {
    setIsLoading(true);
    try {
      await externalMusicService.connectProvider(provider);
      const library = await externalMusicService.syncLibrary(provider);
      
      setLibraries(prev => ({
        ...prev,
        [provider]: library
      }));

      toast.success(`Connected to ${provider === 'spotify' ? 'Spotify' : 'Apple Music'}!`);
    } catch (error) {
      console.error(`Failed to connect to ${provider}:`, error);
      toast.error(`Failed to connect to ${provider === 'spotify' ? 'Spotify' : 'Apple Music'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (provider: 'spotify' | 'apple') => {
    try {
      await externalMusicService.disconnectProvider(provider);
      setLibraries(prev => ({
        ...prev,
        [provider]: { provider, isConnected: false, tracks: [], totalTracks: 0 }
      }));
      toast.success(`Disconnected from ${provider === 'spotify' ? 'Spotify' : 'Apple Music'}`);
    } catch (error) {
      console.error(`Failed to disconnect from ${provider}:`, error);
      toast.error(`Failed to disconnect from ${provider === 'spotify' ? 'Spotify' : 'Apple Music'}`);
    }
  };

  const handleSync = async (provider: 'spotify' | 'apple') => {
    setIsLoading(true);
    try {
      const library = await externalMusicService.syncLibrary(provider);
      setLibraries(prev => ({
        ...prev,
        [provider]: library
      }));
      toast.success(`${provider === 'spotify' ? 'Spotify' : 'Apple Music'} library synced!`);
    } catch (error) {
      console.error(`Failed to sync ${provider}:`, error);
      toast.error(`Failed to sync ${provider === 'spotify' ? 'Spotify' : 'Apple Music'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
      
      // Try to extract metadata from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const parts = nameWithoutExt.split(' - ');
      if (parts.length >= 2) {
        setUploadForm(prev => ({
          ...prev,
          artist: parts[0].trim(),
          title: parts[1].trim()
        }));
      } else {
        setUploadForm(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.artist || !uploadForm.attestCopyright) {
      toast.error('Please fill in all required fields and attest copyright');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const request: TrackUploadRequest = {
        file: uploadForm.file,
        title: uploadForm.title,
        artist: uploadForm.artist,
        album: uploadForm.album,
        attestCopyright: uploadForm.attestCopyright
      };

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      const response = await externalMusicService.uploadTrack(request);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.status === 'completed' && response.track) {
        // Refresh uploads library
        const uploadsLib = await externalMusicService.getLibrary('uploads');
        setLibraries(prev => ({ ...prev, uploads: uploadsLib }));
        
        toast.success('Track uploaded successfully!');
        setUploadDialogOpen(false);
        setActiveTab('uploads');
        
        // Reset form
        setUploadForm({
          file: null,
          title: '',
          artist: '',
          album: '',
          attestCopyright: false
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handlePlayTrack = async (track: ExternalTrack) => {
    try {
      const audioTrack = externalMusicService.convertExternalTrackToAudioTrack(track);
      
      if (currentTrack?.id === track.trackId && isPlaying) {
        pause();
      } else {
        await loadTrack(audioTrack);
        await play();
      }
    } catch (error) {
      console.error('Failed to play track:', error);
      toast.error('Failed to play track. Preview may not be available.');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'spotify':
        return <Music2 className="w-4 h-4" style={{ color: '#1DB954' }} />;
      case 'apple':
        return <Music2 className="w-4 h-4" style={{ color: '#FA2B56' }} />;
      case 'uploads':
        return <Upload className="w-4 h-4" style={{ color: '#00ff88' }} />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'spotify':
        return 'Spotify';
      case 'apple':
        return 'Apple Music';
      case 'uploads':
        return 'My Uploads';
      default:
        return provider;
    }
  };

  const filteredTracks = libraries[activeTab]?.tracks?.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderConnectionStatus = (provider: 'spotify' | 'apple') => {
    const library = libraries[provider];
    
    if (!library.isConnected) {
      return (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            {getProviderIcon(provider)}
            <div>
              <h3 className="text-lg font-semibold">Connect to {getProviderName(provider)}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Access your saved music and bring it into sedā.fm
              </p>
            </div>
            <Button 
              onClick={() => handleConnect(provider)}
              disabled={isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Connect {getProviderName(provider)}
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getProviderIcon(provider)}
            <span className="font-medium">{getProviderName(provider)}</span>
            <Badge variant="secondary" className="text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSync(provider)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sync'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDisconnect(provider)}
            >
              Disconnect
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Music className="w-4 h-4" />
          <span>{library.totalTracks} tracks</span>
          {library.lastSyncAt && (
            <>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>Synced {library.lastSyncAt.toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderTrackList = () => {
    if (filteredTracks.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tracks found</p>
          {searchQuery && (
            <p className="text-sm mt-2">Try adjusting your search terms</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {filteredTracks.map((track) => (
          <Card key={track.trackId} className="p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              {/* Album Art */}
              <div className="relative w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                {track.albumArtUrl ? (
                  <img
                    src={track.albumArtUrl}
                    alt={`${track.title} artwork`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                
                {/* Play/Pause Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handlePlayTrack(track)}
                    className="text-white hover:bg-white/20"
                  >
                    {currentTrack?.id === track.trackId && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{track.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                {track.album && (
                  <p className="text-xs text-muted-foreground truncate">{track.album}</p>
                )}
              </div>

              {/* Provider Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getProviderIcon(track.source)}
                  <span className="text-xs">{getProviderName(track.source)}</span>
                </Badge>
                
                {track.externalUrl && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => window.open(track.externalUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {onAddToPlaylist && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onAddToPlaylist(track)}
                    title="Add to Playlist"
                  >
                    <ListPlus className="w-4 h-4" />
                  </Button>
                )}
                
                {onAddToDJQueue && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onAddToDJQueue(track)}
                    title="Add to DJ Queue"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Library</h2>
          <p className="text-muted-foreground">Your music from all sources</p>
        </div>

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00ff88] hover:bg-[#00ff88]/90 text-black">
              <Upload className="w-4 h-4 mr-2" />
              Upload Track
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Your Track</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Audio File (MP3, WAV, FLAC - Max 100MB)</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
                {uploadForm.file && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(1)}MB)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="track-title">Title *</Label>
                <Input
                  id="track-title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Track title"
                />
              </div>

              <div>
                <Label htmlFor="track-artist">Artist *</Label>
                <Input
                  id="track-artist"
                  value={uploadForm.artist}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, artist: e.target.value }))}
                  placeholder="Artist name"
                />
              </div>

              <div>
                <Label htmlFor="track-album">Album (Optional)</Label>
                <Input
                  id="track-album"
                  value={uploadForm.album}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, album: e.target.value }))}
                  placeholder="Album name"
                />
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="copyright"
                  checked={uploadForm.attestCopyright}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, attestCopyright: e.target.checked }))}
                  className="mt-1"
                />
                <Label htmlFor="copyright" className="text-sm leading-tight">
                  I attest that I own the copyright to this track or have permission to upload it to sedā.fm *
                </Label>
              </div>

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#00ff88] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpload}
                disabled={!uploadForm.file || !uploadForm.title || !uploadForm.artist || !uploadForm.attestCopyright || isLoading}
                className="w-full bg-[#00ff88] hover:bg-[#00ff88]/90 text-black"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Track
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search your library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Provider Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="spotify" className="flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            Spotify
            {libraries.spotify.isConnected && (
              <Badge variant="secondary" className="ml-2">
                {libraries.spotify.totalTracks}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="apple" className="flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            Apple Music
            {libraries.apple.isConnected && (
              <Badge variant="secondary" className="ml-2">
                {libraries.apple.totalTracks}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="uploads" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Uploads
            <Badge variant="secondary" className="ml-2">
              {libraries.uploads.totalTracks}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spotify" className="space-y-4">
          {renderConnectionStatus('spotify')}
          {libraries.spotify.isConnected && (
            <ScrollArea className="h-96">
              {renderTrackList()}
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="apple" className="space-y-4">
          {renderConnectionStatus('apple')}
          {libraries.apple.isConnected && (
            <ScrollArea className="h-96">
              {renderTrackList()}
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="uploads" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#00ff88]" />
              <span className="font-medium">My Uploads</span>
              <Badge variant="secondary" className="text-[#00ff88]">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            </div>
          </div>
          <ScrollArea className="h-96">
            {renderTrackList()}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}