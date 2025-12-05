import React, { useState } from 'react';
import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
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
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const MOCK_CRATES = [
  {
    id: 1,
    name: 'Late Night Vibes',
    description: 'Perfect tracks for those midnight coding sessions',
    isPublic: true,
    isCollaborative: false,
    trackCount: 24,
    duration: '1h 47m',
    owner: { username: 'night_owl', verified: false },
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
        addedBy: { username: 'night_owl' },
        addedAt: '2024-02-15'
      },
      {
        id: 2,
        title: 'Breathe Me',
        artist: 'Sia',
        duration: '4:31',
        addedBy: { username: 'night_owl' },
        addedAt: '2024-02-16'
      }
    ]
  },
  {
    id: 2,
    name: 'Electronic Collaboration',
    description: 'A community-curated electronic crate',
    isPublic: true,
    isCollaborative: true,
    trackCount: 42,
    duration: '3h 12m',
    owner: { username: 'edm_curator', verified: true },
    collaborators: [
      { username: 'beat_maker' },
      { username: 'bass_head' },
      { username: 'synth_lover' }
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
        addedBy: { username: 'edm_curator' },
        addedAt: '2024-01-20'
      },
      {
        id: 4,
        title: 'One More Time',
        artist: 'Daft Punk',
        duration: '5:20',
        addedBy: { username: 'beat_maker' },
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
    owner: { username: 'vinyl_digger', verified: false },
    collaborators: [],
    plays: 45,
    likes: 8,
    createdAt: '2024-03-01',
    tracks: []
  }
];

export function Crates({ user, userCrates = [], onViewArtistProfile, onViewFanProfile, mockArtists = [] }) {
  const [crates, setCrates] = useState([...userCrates, ...MOCK_CRATES]);
  
  // Update crates when userCrates changes
  React.useEffect(() => {
    setCrates([...userCrates, ...MOCK_CRATES]);
  }, [userCrates]);
  const [selectedCrate, setSelectedCrate] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newCrate, setNewCrate] = useState({
    name: '',
    description: '',
    isPublic: true,
    isCollaborative: false
  });
  const [inviteEmail, setInviteEmail] = useState('');

  // Helper function to handle user click
  const handleUserClick = useCallback((crateUser) => {
    // Check if user is an artist by looking at verified status or checking mockArtists
    const isArtist = crateUser.verified || mockArtists.some(artist => 
      artist.username === crateUser.username || artist.id === crateUser.id
    );
    
    if (isArtist && onViewArtistProfile) {
      // Create a complete artist object if needed
      const artistData = mockArtists.find(artist => 
        artist.username === crateUser.username || artist.id === crateUser.id
      ) || {
        id: crateUser.id || `artist-${crateUser.username}`,
        username: crateUser.username,
        displayName: crateUser.displayName || crateUser.username,
        verified: crateUser.verified || false,
        accentColor: crateUser.accentColor || 'coral',
        bio: `Music creator and artist`,
        location: 'Unknown',
        genres: ['Electronic', 'Indie'],
        website: '',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
        socialLinks: {}
      };
      onViewArtistProfile(artistData);
    } else if (onViewFanProfile) {
      // Create a fan profile object
      const fanData = {
        id: crateUser.id || `fan-${crateUser.username}`,
        username: crateUser.username,
        displayName: crateUser.displayName || crateUser.username,
        verified: crateUser.verified || false,
        verificationStatus: 'not-requested',
        points: Math.floor(Math.random() * 2000) + 100,
        accentColor: crateUser.accentColor || 'coral',
        bio: `Music lover and community member`,
        location: 'Unknown',
        joinedDate: new Date('2024-01-15'),
        genres: ['Various'],
        connectedServices: ['Spotify'],
        isArtist: false,
        website: ''
      };
      onViewFanProfile(fanData);
    }
  }, [mockArtists, onViewArtistProfile, onViewFanProfile]);

  const handleCreateCrate = () => {
    if (!newCrate.name.trim()) {
      toast.error('Please enter a crate name');
      return;
    }

    const crate = {
      id: Date.now(),
      ...newCrate,
      trackCount: 0,
      duration: '0m',
      owner: user,
      collaborators: [],
      plays: 0,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0],
      tracks: []
    };

    setCrates(prev => [crate, ...prev]);
    setNewCrate({ name: '', description: '', isPublic: true, isCollaborative: false });
    setShowCreateDialog(false);
    toast.success('Crate created successfully!');
  };

  const handleInviteCollaborator = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email or username');
      return;
    }

    // Mock adding collaborator
    const mockCollaborator = {
      username: inviteEmail.includes('@') ? inviteEmail.split('@')[0] : inviteEmail
    };

    setCrates(prev => prev.map(crate => {
      if (crate.id === selectedCrate?.id) {
        return {
          ...crate,
          collaborators: [...crate.collaborators, mockCollaborator]
        };
      }
      return crate;
    }));

    setInviteEmail('');
    setShowInviteDialog(false);
    toast.success('Invitation sent!');
  };

  const handlePlayCrate = (crate) => {
    toast.success(`Playing "${crate.name}"`);
  };

  const handleShareCrate = (crate) => {
    const shareUrl = `https://seda.fm/crate/${crate.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Crate link copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (selectedCrate) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Crate Header */}
          <div className="bg-card border border-foreground/10 p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCrate(null)}
              >
                ← Back to Crates
              </Button>
            </div>
            
            <h1 className="text-3xl font-semibold text-primary mb-2">{selectedCrate.name}</h1>
            <p className="text-muted-foreground mb-6">{selectedCrate.description}</p>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleUserClick(selectedCrate.owner)}
                  className="font-medium hover:text-accent-coral transition-colors cursor-pointer"
                >
                  By @{selectedCrate.owner.username}
                </button>
                {selectedCrate.owner.verified && <Crown className="w-4 h-4 text-accent-yellow" />}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Music className="w-4 h-4" />
                <span>{selectedCrate.trackCount} tracks</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{selectedCrate.duration}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Play className="w-4 h-4" />
                <span>{selectedCrate.plays} plays</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span>{selectedCrate.likes} likes</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              {selectedCrate.isPublic ? (
                <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              )}
              
              {selectedCrate.isCollaborative && (
                <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20">
                  <Users className="w-3 h-3 mr-1" />
                  Collaborative
                </Badge>
              )}
            </div>
            
            {selectedCrate.isCollaborative && selectedCrate.collaborators.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Collaborators:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCrate.collaborators.slice(0, 5).map((collaborator, index) => (
                    <Badge key={index} variant="outline">
                      @{collaborator.username}
                    </Badge>
                  ))}
                  {selectedCrate.collaborators.length > 5 && (
                    <span className="text-sm text-muted-foreground">
                      +{selectedCrate.collaborators.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={() => handlePlayCrate(selectedCrate)}
                className="bg-accent-coral text-background hover:bg-accent-coral/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Play Crate
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleShareCrate(selectedCrate)}
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              {selectedCrate.isCollaborative && selectedCrate.owner.username === user.username && (
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

          {/* Tracks List */}
          <Card>
            <CardHeader>
              <CardTitle>Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCrate.tracks.length > 0 ? (
                <div className="space-y-3">
                  {selectedCrate.tracks.map((track, index) => (
                    <div key={track.id} className="flex items-center gap-4 p-4 bg-secondary/30 border border-foreground/10 hover:border-foreground/20 transition-colors">
                      <div className="w-8 h-8 bg-accent-coral text-background flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{track.title}</h4>
                        <p className="text-sm text-muted-foreground">{track.artist}</p>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {track.duration}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        @{track.addedBy.username}
                      </div>
                      
                      <Button size="sm" variant="ghost">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No tracks in this crate yet</p>
                  {selectedCrate.isCollaborative || selectedCrate.owner.username === user.username ? (
                    <Button className="bg-accent-mint text-background hover:bg-accent-mint/90">
                      Add First Track
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invite Dialog */}
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogContent aria-describedby="invite-crate-description">
              <DialogHeader>
                <DialogTitle>Invite Collaborators</DialogTitle>
                <DialogDescription id="invite-crate-description">
                  Send an invitation to collaborate on this crate by entering their email or username.
                </DialogDescription>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Your Crates</h1>
            <p className="text-muted-foreground">
              Curated collections of your favorite music
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-accent-yellow text-background hover:bg-accent-yellow/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Crate
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="create-new-crate-description">
              <DialogHeader>
                <DialogTitle>Create New Crate</DialogTitle>
                <DialogDescription id="create-new-crate-description">
                  Create a new music crate to organize and share your favorite tracks.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Crate Name</Label>
                  <Input
                    id="name"
                    value={newCrate.name}
                    onChange={(e) => setNewCrate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter crate name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newCrate.description}
                    onChange={(e) => setNewCrate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your crate"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="public">Public Crate</Label>
                  <Switch
                    id="public"
                    checked={newCrate.isPublic}
                    onCheckedChange={(checked) => setNewCrate(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="collaborative">Allow Collaboration</Label>
                  <Switch
                    id="collaborative"
                    checked={newCrate.isCollaborative}
                    onCheckedChange={(checked) => setNewCrate(prev => ({ ...prev, isCollaborative: checked }))}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreateCrate} className="flex-1">
                    Create Crate
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Crates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crates.map((crate) => (
            <Card
              key={crate.id}
              className="cursor-pointer hover:border-accent-yellow/50 transition-colors"
              onClick={() => setSelectedCrate(crate)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-accent-yellow text-background flex items-center justify-center font-semibold text-xl">
                    ♪
                  </div>
                  <Button
                    size="sm"
                    className="w-10 h-10 rounded-full p-0 bg-accent-coral text-background hover:bg-accent-coral/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayCrate(crate);
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg truncate">{crate.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {crate.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground truncate">
                      @{crate.owner.username}
                    </span>
                    {crate.owner.verified && <Crown className="w-3 h-3 text-accent-yellow" />}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{crate.trackCount} tracks</span>
                    <span>{crate.duration}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {crate.isPublic ? (
                      <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20 text-xs">
                        <Globe className="w-2 h-2 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20 text-xs">
                        <Lock className="w-2 h-2 mr-1" />
                        Private
                      </Badge>
                    )}
                    
                    {crate.isCollaborative && (
                      <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20 text-xs">
                        <Users className="w-2 h-2 mr-1" />
                        Collab
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      <span>{crate.plays}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{crate.likes}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {crates.length === 0 && (
          <Card className="p-12 text-center">
            <Music className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50" />
            <h3 className="text-2xl font-semibold mb-2">No Crates Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first crate to start curating your favorite tracks
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-accent-mint text-background hover:bg-accent-mint/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Crate
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}