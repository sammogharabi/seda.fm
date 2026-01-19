import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { 
  List,
  Music,
  Plus,
  X,
  Search,
  Clock,
  Play,
  Volume2,
  Crown,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

// Mock track data
const MOCK_TRACKS = [
  {
    id: 1,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
    duration: '3:20',
    album: 'After Hours'
  },
  {
    id: 2,
    title: 'Strobe',
    artist: 'Deadmau5',
    artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
    duration: '10:37',
    album: 'For Lack of a Better Name'
  },
  {
    id: 3,
    title: 'Miles Runs the Voodoo Down',
    artist: 'Miles Davis',
    artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
    duration: '14:03',
    album: 'Bitches Brew'
  }
];

interface CreateCrateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCrate: (crate: any) => void;
  user: any;
}

export function CreateCrateModal({ isOpen, onClose, onCreateCrate, user }: CreateCrateModalProps) {
  // Don't render if user is not available
  if (!user) {
    return null;
  }
  const [crateName, setCrateName] = useState('');
  const [description, setDescription] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim()) && customTags.length < 5) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCustomTags(customTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddTrack = (track) => {
    if (!selectedTracks.find(t => t.id === track.id)) {
      setSelectedTracks([...selectedTracks, track]);
    }
    setTrackSearch('');
  };

  const handleRemoveTrack = (trackId) => {
    setSelectedTracks(selectedTracks.filter(track => track.id !== trackId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!crateName.trim()) {
      toast.error('Please enter a crate name');
      return;
    }

    if (!description.trim()) {
      toast.error('Please add a description for your crate');
      return;
    }

    if (selectedTracks.length === 0) {
      toast.error('Please add at least one track to your crate');
      return;
    }

    setIsSubmitting(true);

    try {
      const newCrate = {
        id: `crate-${Date.now()}`,
        name: crateName,
        description: description.trim(),
        owner: user,
        tracks: selectedTracks,
        trackCount: selectedTracks.length,
        createdAt: new Date(),
        tags: customTags,
        isPublic,
        plays: 0,
        likes: 0,
        reposts: 0
      };

      onCreateCrate(newCrate);
      
      // Reset form
      setCrateName('');
      setDescription('');
      setCustomTags([]);
      setNewTag('');
      setIsPublic(true);
      setSelectedTracks([]);
      setTrackSearch('');
      
      onClose();
      toast.success('Crate created successfully! Start sharing your curated music.');
    } catch (error) {
      console.error('Error creating crate:', error);
      toast.error('Failed to create crate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTracks = MOCK_TRACKS.filter(track =>
    track.title.toLowerCase().includes(trackSearch.toLowerCase()) ||
    track.artist.toLowerCase().includes(trackSearch.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby="create-crate-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a Crate</DialogTitle>
          <DialogDescription id="create-crate-description">
            Curate your favorite tracks into a collection. Crates are your personal playlists 
            that reflect your unique musical taste and discoveries.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Creator Info */}
          <div className="flex items-center gap-3 p-4 bg-secondary/30 border border-foreground/10 rounded-lg">
            <div className="w-10 h-10 bg-accent-blue text-background flex items-center justify-center font-semibold border border-foreground/20 rounded">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium flex items-center gap-1">
                {user?.displayName || user?.username || 'User'}
                <List className="w-4 h-4 text-accent-blue" />
                <span className="text-xs text-muted-foreground">Crate Creator</span>
              </p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {/* Crate Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="crate-name">Crate Name *</Label>
              <Input
                id="crate-name"
                placeholder="e.g., Late Night Vibes, Summer Discoveries, Underground Gems"
                value={crateName}
                onChange={(e) => setCrateName(e.target.value)}
                maxLength={50}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {crateName.length}/50 characters
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="What makes this crate special? Describe the vibe, mood, or theme..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none mt-1"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/200 characters
              </p>
            </div>

            {/* Custom Tags */}
            <div>
              <Label>Tags (Optional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  maxLength={20}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={customTags.length >= 5}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {customTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Add up to 5 tags to help others discover your crate
              </p>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-accent-mint" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <Label className="font-medium">
                    {isPublic ? 'Public Crate' : 'Private Crate'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isPublic 
                      ? 'Anyone can discover and listen to your crate'
                      : 'Only you can access this crate'
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          {/* Track Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Add Tracks</Label>
              <p className="text-sm text-muted-foreground">Search and add tracks to your crate</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for tracks to add..."
                value={trackSearch}
                onChange={(e) => setTrackSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Search Results */}
            {trackSearch && (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-foreground/10 rounded-lg p-2">
                {filteredTracks.map((track) => (
                  <Card 
                    key={track.id} 
                    className="cursor-pointer hover:bg-secondary/50 transition-colors" 
                    onClick={() => handleAddTrack(track)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={track.artwork}
                          alt={track.title}
                          className="w-10 h-10 object-cover border border-foreground/20 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{track.title}</h4>
                          <p className="text-xs text-muted-foreground">{track.artist}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {track.duration}
                        </div>
                        <Plus className="w-4 h-4 text-accent-blue" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredTracks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No tracks found</p>
                )}
              </div>
            )}

            {/* Selected Tracks */}
            {selectedTracks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-medium">Tracks in Crate ({selectedTracks.length})</Label>
                  <Badge variant="secondary">{selectedTracks.length} tracks</Badge>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-foreground/10 rounded-lg p-2">
                  {selectedTracks.map((track, index) => (
                    <Card key={track.id} className="border-accent-blue/20">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-accent-blue text-background flex items-center justify-center rounded text-xs font-medium">
                            {index + 1}
                          </div>
                          <img
                            src={track.artwork}
                            alt={track.title}
                            className="w-10 h-10 object-cover border border-foreground/20 rounded"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{track.title}</h4>
                            <p className="text-xs text-muted-foreground">{track.artist}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {track.duration}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTrack(track.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-accent-blue text-background hover:bg-accent-blue/90 min-w-[120px]"
            >
              {isSubmitting ? 'Creating...' : 'Create Crate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}