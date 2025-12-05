import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Plus, 
  Music, 
  Users, 
  Lock, 
  Globe, 
  Share, 
  Play, 
  MoreVertical,
  Clock,
  Heart,
  UserPlus,
  Crown,
  Copy,
  ExternalLink,
  Search,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { TrackSearch } from './TrackSearch';
import { SearchResult } from '../services/searchService';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

// Enhanced playlist interface to support more track metadata
interface PlaylistTrack {
  id: string | number;
  title: string;
  artist: string;
  duration: string | number;
  artwork?: string;
  provider?: string;
  isExplicit?: boolean;
  addedBy: {
    username: string;
    avatar: string;
    verified?: boolean;
  };
  addedAt: string;
  metadata?: {
    album?: string;
    genre?: string;
    year?: number;
    popularity?: number;
  };
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  isCollaborative: boolean;
  trackCount: number;
  duration: string;
  cover: string;
  owner: {
    username: string;
    avatar: string;
    verified?: boolean;
  };
  collaborators: Array<{
    username: string;
    avatar: string;
    verified?: boolean;
  }>;
  plays: number;
  likes: number;
  createdAt: string;
  tracks: PlaylistTrack[];
}

const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: 1,
    name: 'Late Night Vibes',
    description: 'Perfect tracks for those midnight coding sessions',
    isPublic: true,
    isCollaborative: false,
    trackCount: 24,
    duration: '1h 47m',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    owner: { username: 'night_owl', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=night' },
    collaborators: [],
    plays: 156,
    likes: 23,
    createdAt: '2024-02-15',
    tracks: [
      {
        id: 1,
        title: 'Midnight City',
        artist: 'M83',
        duration: '4:03',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        provider: 'Spotify',
        addedBy: { username: 'night_owl', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=night' },
        addedAt: '2024-02-15',
        metadata: {
          album: 'Hurry Up, We\'re Dreaming',
          genre: 'Electronic',
          year: 2011,
          popularity: 85
        }
      },
      {
        id: 2,
        title: 'Breathe Me',
        artist: 'Sia',
        duration: '4:31',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        provider: 'Apple Music',
        addedBy: { username: 'night_owl', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=night' },
        addedAt: '2024-02-16',
        metadata: {
          album: 'Colour the Small One',
          genre: 'Pop',
          year: 2004,
          popularity: 78
        }
      }
    ]
  },
  {
    id: 2,
    name: 'Electronic Collaboration',
    description: 'A community-curated electronic playlist',
    isPublic: true,
    isCollaborative: true,
    trackCount: 42,
    duration: '3h 12m',
    cover: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    owner: { username: 'edm_curator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=edm', verified: true },
    collaborators: [
      { username: 'beat_maker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beat' },
      { username: 'bass_head', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bass' },
      { username: 'synth_lover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=synth' }
    ],
    plays: 892,
    likes: 127,
    createdAt: '2024-01-20',
    tracks: [
      {
        id: 3,
        title: 'Strobe',
        artist: 'Deadmau5',
        duration: '10:36',
        addedBy: { username: 'edm_curator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=edm' },
        addedAt: '2024-01-20'
      },
      {
        id: 4,
        title: 'One More Time',
        artist: 'Daft Punk',
        duration: '5:20',
        addedBy: { username: 'beat_maker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beat' },
        addedAt: '2024-01-22'
      }
    ]
  },
  {
    id: 3,
    name: 'Private Collection',
    description: 'My secret stash of rare finds',
    isPublic: false,
    isCollaborative: false,
    trackCount: 15,
    duration: '58m',
    cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop',
    owner: { username: 'vinyl_digger', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinyl' },
    collaborators: [],
    plays: 45,
    likes: 8,
    createdAt: '2024-03-01',
    tracks: []
  }
];

export function Playlists({ user }) {
  const [playlists, setPlaylists] = useState(MOCK_PLAYLISTS);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showTrackSearch, setShowTrackSearch] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    isPublic: true,
    isCollaborative: false
  });
  const [inviteEmail, setInviteEmail] = useState('');

  const handleCreatePlaylist = () => {
    if (!newPlaylist.name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    const playlist = {
      id: Date.now(),
      ...newPlaylist,
      trackCount: 0,
      duration: '0m',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      owner: user,
      collaborators: [],
      plays: 0,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0],
      tracks: []
    };

    setPlaylists(prev => [playlist, ...prev]);
    setNewPlaylist({ name: '', description: '', isPublic: true, isCollaborative: false });
    setShowCreateDialog(false);
    toast.success('Playlist created successfully!');
  };

  const handleInviteCollaborator = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email or username');
      return;
    }

    // Mock adding collaborator
    const mockCollaborator = {
      username: inviteEmail.includes('@') ? inviteEmail.split('@')[0] : inviteEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteEmail}`
    };

    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === selectedPlaylist?.id) {
        return {
          ...playlist,
          collaborators: [...playlist.collaborators, mockCollaborator]
        };
      }
      return playlist;
    }));

    setInviteEmail('');
    setShowInviteDialog(false);
    toast.success('Invitation sent!');
  };

  const handlePlayPlaylist = (playlist) => {
    toast.success(`Playing "${playlist.name}"`);
  };

  const handleSharePlaylist = (playlist: Playlist) => {
    const shareUrl = `https://seda.fm/playlist/${playlist.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Playlist link copied to clipboard!');
  };

  const handleAddTracks = (tracks: SearchResult[], playlistId?: number) => {
    const targetPlaylistId = playlistId || selectedPlaylist?.id;
    
    if (!targetPlaylistId) {
      toast.error('No playlist selected');
      return;
    }

    // Convert SearchResults to PlaylistTracks
    const newTracks: PlaylistTrack[] = tracks.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      duration: Math.floor(track.duration / 60) + ':' + String(track.duration % 60).padStart(2, '0'),
      artwork: track.artwork,
      provider: track.provider,
      isExplicit: track.isExplicit,
      addedBy: user,
      addedAt: new Date().toISOString().split('T')[0],
      metadata: {
        album: track.metadata?.album,
        genre: track.metadata?.genre,
        year: track.metadata?.year,
        popularity: track.popularity
      }
    }));

    // Add tracks to playlist
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === targetPlaylistId) {
        // Check for duplicates
        const existingTrackIds = new Set(playlist.tracks.map(t => t.id));
        const uniqueNewTracks = newTracks.filter(track => !existingTrackIds.has(track.id));
        
        if (uniqueNewTracks.length < newTracks.length) {
          const duplicateCount = newTracks.length - uniqueNewTracks.length;
          toast.warning(`${duplicateCount} track${duplicateCount > 1 ? 's' : ''} already in playlist and were skipped`);
        }

        const updatedPlaylist = {
          ...playlist,
          tracks: [...playlist.tracks, ...uniqueNewTracks],
          trackCount: playlist.trackCount + uniqueNewTracks.length
        };

        // Update selected playlist if it's the target
        if (selectedPlaylist?.id === targetPlaylistId) {
          setSelectedPlaylist(updatedPlaylist);
        }

        return updatedPlaylist;
      }
      return playlist;
    }));

    const addedCount = newTracks.length;
    toast.success(`${addedCount} track${addedCount !== 1 ? 's' : ''} added to ${playlists.find(p => p.id === targetPlaylistId)?.name}!`);
  };

  const handleRemoveTrack = (trackId: string | number) => {
    if (!selectedPlaylist) return;

    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === selectedPlaylist.id) {
        const updatedPlaylist = {
          ...playlist,
          tracks: playlist.tracks.filter(track => track.id !== trackId),
          trackCount: playlist.trackCount - 1
        };
        setSelectedPlaylist(updatedPlaylist);
        return updatedPlaylist;
      }
      return playlist;
    }));

    toast.success('Track removed from playlist');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (selectedPlaylist) {
    return (
      <div className="flex-1 p-6 space-y-6">
        {/* Playlist Header */}
        <div className="flex items-start gap-6">
          <img
            src={selectedPlaylist.cover}
            alt={selectedPlaylist.name}
            className="w-48 h-48 rounded-lg object-cover shadow-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPlaylist(null)}
              >
                ← Back
              </Button>
            </div>
            
            <h1 className="text-3xl mb-2">{selectedPlaylist.name}</h1>
            <p className="text-muted-foreground mb-4">{selectedPlaylist.description}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={selectedPlaylist.owner.avatar} />
                  <AvatarFallback>
                    {selectedPlaylist.owner.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">By @{selectedPlaylist.owner.username}</span>
                {selectedPlaylist.owner.verified && <Crown className="w-4 h-4 text-yellow-500" />}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Music className="w-4 h-4" />
                <span>{selectedPlaylist.trackCount} tracks</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{selectedPlaylist.duration}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Play className="w-4 h-4" />
                <span>{selectedPlaylist.plays} plays</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span>{selectedPlaylist.likes} likes</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              {selectedPlaylist.isPublic ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              )}
              
              {selectedPlaylist.isCollaborative && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Collaborative
                </Badge>
              )}
            </div>
            
            {selectedPlaylist.isCollaborative && selectedPlaylist.collaborators.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Collaborators:</p>
                <div className="flex items-center gap-2">
                  {selectedPlaylist.collaborators.slice(0, 5).map((collaborator, index) => (
                    <Avatar key={index} className="w-6 h-6">
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback className="text-xs">
                        {collaborator.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {selectedPlaylist.collaborators.length > 5 && (
                    <span className="text-sm text-muted-foreground">
                      +{selectedPlaylist.collaborators.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={() => handlePlayPlaylist(selectedPlaylist)}>
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
              
              {(selectedPlaylist.isCollaborative || selectedPlaylist.owner.username === user.username) && (
                <Button 
                  variant="outline"
                  onClick={() => setShowTrackSearch(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Add Tracks
                </Button>
              )}
              
              <Button 
                variant="outline"
                onClick={() => handleSharePlaylist(selectedPlaylist)}
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              {selectedPlaylist.isCollaborative && selectedPlaylist.owner.username === user.username && (
                <Button 
                  variant="outline"
                  onClick={() => setShowInviteDialog(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <Card>
          <CardHeader>
            <CardTitle>Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPlaylist.tracks.length > 0 ? (
              <div className="space-y-3">
                {selectedPlaylist.tracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 group">
                    <div className="w-8 text-center text-sm text-muted-foreground">
                      {index + 1}
                    </div>
                    
                    {track.artwork && (
                      <img
                        src={track.artwork}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{track.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {track.provider && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {track.provider}
                          </Badge>
                        )}
                        {track.isExplicit && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">E</Badge>
                        )}
                        {track.metadata?.genre && (
                          <span className="text-xs text-muted-foreground">
                            {track.metadata.genre}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {track.duration}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={track.addedBy.avatar} />
                        <AvatarFallback className="text-xs">
                          {track.addedBy.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>@{track.addedBy.username}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost">
                        <Play className="w-4 h-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleRemoveTrack(track.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove from playlist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No tracks in this playlist yet</p>
                {selectedPlaylist.isCollaborative || selectedPlaylist.owner.username === user.username ? (
                  <Button className="mt-4" onClick={() => setShowTrackSearch(true)}>
                    <Search className="w-4 h-4 mr-2" />
                    Add First Track
                  </Button>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Track Search Dialog */}
        <TrackSearch
          isOpen={showTrackSearch}
          onClose={() => setShowTrackSearch(false)}
          onAddTracks={handleAddTracks}
          playlists={playlists.map(p => ({ id: p.id, name: p.name, trackCount: p.trackCount }))}
          selectedPlaylistId={selectedPlaylist?.id}
          showPlaylistSelection={false}
          title="Add Tracks to Playlist"
        />

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Collaborators</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">Email or Username</Label>
                <Input
                  id="invite-email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email or username"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleInviteCollaborator} className="flex-1">
                  Send Invite
                </Button>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Your Playlists</h1>
          <p className="text-muted-foreground">Manage your music collections</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Playlist Name</Label>
                <Input
                  id="name"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter playlist name"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your playlist"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="public">Public Playlist</Label>
                <Switch
                  id="public"
                  checked={newPlaylist.isPublic}
                  onCheckedChange={(checked) => setNewPlaylist(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="collaborative">Allow Collaboration</Label>
                <Switch
                  id="collaborative"
                  checked={newPlaylist.isCollaborative}
                  onCheckedChange={(checked) => setNewPlaylist(prev => ({ ...prev, isCollaborative: checked }))}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleCreatePlaylist} className="flex-1">
                  Create Playlist
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlists.map((playlist) => (
          <Card 
            key={playlist.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={() => setSelectedPlaylist(playlist)}
          >
            <CardContent className="p-4">
              <div className="relative mb-4">
                <img
                  src={playlist.cover}
                  alt={playlist.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full p-0 bg-black/60 hover:bg-black/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPlaylist(playlist);
                  }}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm truncate">{playlist.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {playlist.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={playlist.owner.avatar} />
                    <AvatarFallback className="text-xs">
                      {playlist.owner.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    @{playlist.owner.username}
                  </span>
                  {playlist.owner.verified && <Crown className="w-3 h-3 text-yellow-500" />}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{playlist.trackCount} tracks</span>
                  <span>{playlist.duration}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {playlist.isPublic ? (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="w-2 h-2 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="w-2 h-2 mr-1" />
                      Private
                    </Badge>
                  )}
                  
                  {playlist.isCollaborative && (
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-2 h-2 mr-1" />
                      Collab
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    <span>{playlist.plays}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    <span>{playlist.likes}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {playlists.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first playlist to start curating your favorite tracks
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Playlist
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}