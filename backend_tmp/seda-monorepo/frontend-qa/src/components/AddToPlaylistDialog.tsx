import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  Plus, 
  Music, 
  Users, 
  Lock, 
  Globe, 
  Check,
  Search,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

interface Track {
  id: string | number;
  title: string;
  artist: string;
  duration?: string | number;
  artwork?: string;
  provider?: string;
  addedBy?: {
    username: string;
    avatar: string;
    verified?: boolean;
  };
}

interface Playlist {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  isCollaborative: boolean;
  trackCount: number;
  owner: {
    username: string;
    avatar: string;
    verified?: boolean;
  };
  collaborators?: Array<{
    username: string;
    avatar: string;
  }>;
}

interface AddToPlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  currentUser: {
    username: string;
    avatar: string;
    verified?: boolean;
  };
  onAddToPlaylist: (playlistId: number, track: Track) => void;
  onCreatePlaylist: (playlist: {
    name: string;
    description: string;
    isPublic: boolean;
    isCollaborative: boolean;
  }, track: Track) => void;
}

export function AddToPlaylistDialog({
  isOpen,
  onClose,
  track,
  playlists,
  currentUser,
  onAddToPlaylist,
  onCreatePlaylist
}: AddToPlaylistDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: true,
    isCollaborative: false
  });

  if (!track) return null;

  // Filter playlists based on search and user permissions
  const filteredPlaylists = playlists.filter(playlist => {
    // Check if user can add to this playlist
    const canAdd = playlist.owner.username === currentUser.username || 
                   playlist.isCollaborative;
    
    if (!canAdd) return false;

    // Apply search filter
    if (searchQuery.trim()) {
      return playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             playlist.description?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    return true;
  });

  const handleAddToPlaylist = (playlistId: number) => {
    onAddToPlaylist(playlistId, track);
    onClose();
    toast.success('Track added to playlist!');
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylist.name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    onCreatePlaylist(newPlaylist, track);
    setNewPlaylist({
      name: '',
      description: '',
      isPublic: true,
      isCollaborative: false
    });
    setShowCreateForm(false);
    onClose();
    toast.success('Playlist created and track added!');
  };

  const formatDuration = (duration: string | number | undefined): string => {
    if (!duration) return '';
    
    if (typeof duration === 'string') {
      return duration;
    }
    
    // If duration is in seconds
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Add to Playlist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Track Preview */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            {track.artwork && (
              <img
                src={track.artwork}
                alt={track.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{track.title}</h4>
              <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              <div className="flex items-center gap-2 mt-1">
                {track.provider && (
                  <Badge variant="secondary" className="text-xs">
                    {track.provider}
                  </Badge>
                )}
                {track.duration && (
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {showCreateForm ? (
            /* Create New Playlist Form */
            <div className="space-y-4 border rounded-lg p-4">
              <h3 className="text-sm font-medium">Create New Playlist</h3>
              
              <div>
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input
                  id="playlist-name"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter playlist name"
                />
              </div>
              
              <div>
                <Label htmlFor="playlist-description">Description (Optional)</Label>
                <Textarea
                  id="playlist-description"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your playlist"
                  className="h-20"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="public-playlist">Public Playlist</Label>
                  <Switch
                    id="public-playlist"
                    checked={newPlaylist.isPublic}
                    onCheckedChange={(checked) => setNewPlaylist(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="collaborative-playlist">Allow Collaboration</Label>
                  <Switch
                    id="collaborative-playlist"
                    checked={newPlaylist.isCollaborative}
                    onCheckedChange={(checked) => setNewPlaylist(prev => ({ ...prev, isCollaborative: checked }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreateAndAdd} className="flex-1">
                  Create & Add Track
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylist({ name: '', description: '', isPublic: true, isCollaborative: false });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* Existing Playlists */
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search your playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Playlists List */}
              <div className="max-h-64 overflow-hidden">
                <ScrollArea className="h-64">
                  <div className="space-y-2 pr-4">
                    {filteredPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleAddToPlaylist(playlist.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium truncate">{playlist.name}</h4>
                            {playlist.isPublic ? (
                              <Globe className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Lock className="w-3 h-3 text-muted-foreground" />
                            )}
                            {playlist.isCollaborative && (
                              <Users className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={playlist.owner.avatar} />
                              <AvatarFallback className="text-xs">
                                {playlist.owner.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {playlist.owner.username === currentUser.username ? 'You' : `@${playlist.owner.username}`}
                            </span>
                            {playlist.owner.verified && <Crown className="w-3 h-3 text-yellow-500" />}
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {playlist.trackCount} tracks
                            </span>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}

                    {filteredPlaylists.length === 0 && (
                      <div className="text-center py-6">
                        <Music className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {searchQuery ? 'No playlists found' : 'No playlists available'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create your first playlist to get started
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Create New Playlist Button */}
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Playlist
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}