import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
import { toast } from 'sonner';

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

export function Crates({ user }) {
  const [crates, setCrates] = useState(MOCK_CRATES);
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
      <div className="flex-1 p-6 space-y-6">
        {/* Crate Header */}
        <div className="bg-card border-2 border-foreground p-6 relative overflow-hidden">
          {/* Clean background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/10"></div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCrate(null)}
                className="font-mono uppercase tracking-wide font-black"
              >
                ← Back
              </Button>
            </div>
            
            <h1 className="font-black text-4xl text-primary mb-2 uppercase">{selectedCrate.name}</h1>
            <p className="font-mono text-sm text-muted-foreground mb-4 uppercase tracking-wider">{selectedCrate.description}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-primary">BY @{selectedCrate.owner.username}</span>
                {selectedCrate.owner.verified && <Crown className="w-4 h-4 text-accent-yellow" />}
              </div>
              
              <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                <Music className="w-4 h-4" />
                <span>{selectedCrate.trackCount} TRACKS</span>
              </div>
              
              <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{selectedCrate.duration.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                <Play className="w-4 h-4" />
                <span>{selectedCrate.plays} PLAYS</span>
              </div>
              
              <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span>{selectedCrate.likes} LIKES</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              {selectedCrate.isPublic ? (
                <div className="bg-accent-mint text-background px-3 py-1 font-mono text-xs font-black uppercase flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Public
                </div>
              ) : (
                <div className="bg-accent-coral text-background px-3 py-1 font-mono text-xs font-black uppercase flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Private
                </div>
              )}
              
              {selectedCrate.isCollaborative && (
                <div className="bg-accent-blue text-background px-3 py-1 font-mono text-xs font-black uppercase flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Collaborative
                </div>
              )}
            </div>
            
            {selectedCrate.isCollaborative && selectedCrate.collaborators.length > 0 && (
              <div className="mb-4">
                <p className="font-mono text-sm text-muted-foreground mb-2 uppercase tracking-wider">Collaborators:</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCrate.collaborators.slice(0, 5).map((collaborator, index) => (
                    <div key={index} className="bg-accent-yellow text-background px-2 py-1 font-mono text-xs font-black uppercase">
                      @{collaborator.username}
                    </div>
                  ))}
                  {selectedCrate.collaborators.length > 5 && (
                    <span className="font-mono text-sm text-muted-foreground uppercase">
                      +{selectedCrate.collaborators.length - 5} MORE
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={() => handlePlayCrate(selectedCrate)}
                className="font-mono uppercase tracking-wide font-black bg-accent-coral text-background hover:bg-accent-coral/90 border-2 border-accent-coral"
              >
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => handleShareCrate(selectedCrate)}
                className="font-mono uppercase tracking-wide font-black border-2 border-foreground/20 hover:border-accent-blue hover:bg-accent-blue/10"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              {selectedCrate.isCollaborative && selectedCrate.owner.username === user.username && (
                <Button 
                  variant="outline"
                  onClick={() => setShowInviteDialog(true)}
                  className="font-mono uppercase tracking-wide font-black border-2 border-foreground/20 hover:border-accent-mint hover:bg-accent-mint/10"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="bg-card border-2 border-foreground relative overflow-hidden">
          {/* Clean background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/10"></div>
          
          <div className="p-6 relative">
            <div className="border-b border-foreground/20 pb-3 mb-6">
              <h2 className="font-black text-2xl text-primary uppercase">TRACKS</h2>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">CRATE CONTENTS</div>
            </div>
            
            {selectedCrate.tracks.length > 0 ? (
              <div className="space-y-3">
                {selectedCrate.tracks.map((track, index) => (
                  <div key={track.id} className="flex items-center gap-4 p-4 border border-foreground/20 hover:border-accent-coral transition-colors">
                    <div className="w-8 h-8 bg-accent-coral text-background flex items-center justify-center font-black text-sm">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-black text-primary">{track.title}</h4>
                      <p className="font-mono text-xs text-muted-foreground uppercase">{track.artist}</p>
                    </div>
                    
                    <div className="font-mono text-sm text-muted-foreground">
                      {track.duration}
                    </div>
                    
                    <div className="font-mono text-xs text-muted-foreground">
                      @{track.addedBy.username}
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="border border-foreground/20 hover:border-accent-blue hover:bg-accent-blue/10"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="font-mono text-muted-foreground uppercase tracking-wider">No tracks in this crate yet</p>
                {selectedCrate.isCollaborative || selectedCrate.owner.username === user.username ? (
                  <Button className="mt-4 font-mono uppercase tracking-wide font-black bg-accent-mint text-background hover:bg-accent-mint/90 border-2 border-accent-mint">
                    Add First Track
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent aria-describedby="invite-playlist-description">
            <DialogHeader>
              <DialogTitle>Invite Collaborators</DialogTitle>
              <DialogDescription id="invite-playlist-description">
                Send an invitation to collaborate on this playlist by entering their email or username.
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
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header - Clean professional style */}
      <div className="bg-card border-2 border-foreground p-6 relative overflow-hidden">
        {/* Clean background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/5 to-transparent"></div>
        
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="font-black text-3xl text-primary">YOUR CRATES</h1>
            <div className="w-16 h-1 bg-accent-yellow mb-2"></div>
            <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
              [CURATED • COLLECTIONS • MUSIC]
            </p>
          </div>
        
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="font-mono uppercase tracking-wide font-black bg-accent-yellow text-background hover:bg-accent-yellow/90 border-2 border-accent-yellow">
                <Plus className="w-4 h-4 mr-2" />
                Create Crate
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="create-playlist-crate-description">
              <DialogHeader>
                <DialogTitle>Create New Crate</DialogTitle>
                <DialogDescription id="create-playlist-crate-description">
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
      </div>

      {/* Crates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {crates.map((crate) => (
          <div
            key={crate.id}
            className="bg-card border-2 border-foreground p-6 relative overflow-hidden cursor-pointer hover:border-accent-yellow transition-colors"
            onClick={() => setSelectedCrate(crate)}
          >
            {/* Clean background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/10"></div>
            
            <div className="space-y-4 relative">
              {/* Header with play button */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-accent-yellow text-background flex items-center justify-center font-black text-xl">
                  ♪
                </div>
                <Button
                  size="sm"
                  className="w-10 h-10 rounded-full p-0 bg-accent-coral text-background hover:bg-accent-coral/90 border-2 border-accent-coral"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayCrate(crate);
                  }}
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-black text-lg text-primary uppercase truncate">{crate.name}</h3>
                <p className="font-mono text-xs text-muted-foreground line-clamp-2 uppercase tracking-wider">
                  {crate.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground truncate uppercase">
                    @{crate.owner.username}
                  </span>
                  {crate.owner.verified && <Crown className="w-3 h-3 text-accent-yellow" />}
                </div>
                
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>{crate.trackCount} TRACKS</span>
                  <span>{crate.duration.toUpperCase()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {crate.isPublic ? (
                    <div className="bg-accent-mint text-background px-2 py-1 font-mono text-xs font-black uppercase flex items-center gap-1">
                      <Globe className="w-2 h-2" />
                      Public
                    </div>
                  ) : (
                    <div className="bg-accent-coral text-background px-2 py-1 font-mono text-xs font-black uppercase flex items-center gap-1">
                      <Lock className="w-2 h-2" />
                      Private
                    </div>
                  )}
                  
                  {crate.isCollaborative && (
                    <div className="bg-accent-blue text-background px-2 py-1 font-mono text-xs font-black uppercase flex items-center gap-1">
                      <Users className="w-2 h-2" />
                      Collab
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
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
            </div>
          </div>
        ))}
      </div>

      {crates.length === 0 && (
        <div className="bg-card border-2 border-foreground p-12 text-center relative overflow-hidden">
          {/* Clean background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/10"></div>
          
          <div className="relative">
            <Music className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
            <h3 className="font-black text-2xl text-primary mb-2 uppercase">No Crates Yet</h3>
            <p className="font-mono text-muted-foreground mb-6 uppercase tracking-wider">
              Create your first crate to start curating your favorite tracks
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="font-mono uppercase tracking-wide font-black bg-accent-mint text-background hover:bg-accent-mint/90 border-2 border-accent-mint"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Crate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}