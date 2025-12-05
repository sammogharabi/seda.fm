import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Music, Loader2, Plus, X, Globe, Lock, Star, Tag } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { sessionsApi } from '../lib/api/sessions';
import type { DJSession } from '../lib/api/types';
import { AddToQueueModal } from './AddToQueueModal';

// Common music genres
const GENRE_OPTIONS = [
  'Electronic', 'House', 'Techno', 'Trance', 'Drum & Bass',
  'Hip Hop', 'Rap', 'R&B', 'Trap',
  'Rock', 'Indie', 'Alternative', 'Metal', 'Punk',
  'Pop', 'Dance', 'EDM',
  'Jazz', 'Blues', 'Soul', 'Funk',
  'Classical', 'Ambient', 'Experimental',
  'Reggae', 'Ska', 'Dub',
  'Country', 'Folk', 'Bluegrass',
  'Latin', 'Salsa', 'Reggaeton',
  'Other'
];

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreated?: (session: DJSession, initialTrack?: any) => void;
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  open,
  onOpenChange,
  onSessionCreated,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [addedTrack, setAddedTrack] = useState<any>(null);
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    } else if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCreateSession = async () => {
    // Validate that a track is added
    if (!addedTrack) {
      toast.error('Please add a starting track for your session');
      return;
    }

    // Validate that a genre is selected
    if (!selectedGenre) {
      toast.error('Please select a genre for your session');
      return;
    }

    setIsCreating(true);
    try {
      // Prepare initial track data
      const initialTrack = {
        title: addedTrack.title,
        artist: addedTrack.artist,
        artwork: addedTrack.artwork,
        platform: addedTrack.source || addedTrack.platform || 'spotify',
        duration: addedTrack.duration || '3:30'
      };

      // Create standalone session with name, privacy, and initial track
      const session = await sessionsApi.create({
        sessionName: sessionName || undefined,
        isPrivate: isPrivate,
        initialTrack: initialTrack,
        genre: selectedGenre,
        tags: tags.length > 0 ? tags : undefined
      });

      toast.success('Session created successfully!');
      onOpenChange(false);

      if (onSessionCreated) {
        onSessionCreated(session, addedTrack);
      }

      // Reset form
      setSessionName('');
      setIsPrivate(false);
      setAddedTrack(null);
      setSelectedGenre('');
      setTags([]);
      setTagInput('');
    } catch (error: any) {
      console.error('Failed to create session:', error);
      toast.error(error.message || 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddTrack = (track: any) => {
    setAddedTrack(track);
    setShowAddTrack(false);
    toast.success('Track added!', {
      description: 'This track will play when the session starts'
    });
  };

  const handleRemoveTrack = () => {
    setAddedTrack(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby="create-session-description">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create a DJ Session</DialogTitle>
            <DialogDescription id="create-session-description">
              Start a live DJ session where you and others can queue tracks, vote, and vibe together in real-time.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleCreateSession(); }} className="space-y-6">
            {/* Session Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="session-name">Session Name (Optional)</Label>
                <Input
                  id="session-name"
                  type="text"
                  placeholder="e.g., Late Night Vibes, Workout Mix, Study Beats"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  disabled={isCreating}
                  maxLength={50}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {sessionName.length}/50 characters
                </p>
              </div>

              {/* Genre Selection */}
              <div>
                <Label htmlFor="genre">Genre *</Label>
                <select
                  id="genre"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  disabled={isCreating}
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                >
                  <option value="">Select a genre...</option>
                  {GENRE_OPTIONS.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Input */}
              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Add up to 5 tags to describe your session vibe
                </p>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    type="text"
                    placeholder="e.g., Chill, Study, Late Night"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    disabled={isCreating || tags.length >= 5}
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={isCreating || !tagInput.trim() || tags.length >= 5}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={isCreating}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Session Settings */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Session Settings</Label>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {isPrivate ? (
                    <Lock className="w-5 h-5 text-accent-yellow mt-0.5" />
                  ) : (
                    <Globe className="w-5 h-5 text-accent-mint mt-0.5" />
                  )}
                  <div className="flex-1">
                    <Label htmlFor="is-private" className="font-normal">Private Session</Label>
                    <p className="text-sm text-muted-foreground">
                      {isPrivate
                        ? 'Only people you invite can join this session'
                        : 'Anyone can discover and join this session'}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 self-start pt-1">
                  <Switch
                    id="is-private"
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                    disabled={isCreating}
                  />
                </div>
              </div>
            </div>

            {/* Starting Track */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Starting Track *</Label>
                <p className="text-sm text-muted-foreground">Set the vibe with a track that will play when the session starts</p>
              </div>

              {addedTrack ? (
                <Card className="border-accent-mint">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={addedTrack.artwork}
                          alt={addedTrack.title}
                          className="w-12 h-12 object-cover border border-foreground/20 rounded"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
                          <Star className="w-4 h-4 text-accent-yellow fill-current" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Starting Track</h4>
                        <p className="text-sm text-muted-foreground">{addedTrack.title}</p>
                        <p className="text-xs text-muted-foreground">{addedTrack.artist}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveTrack}
                        disabled={isCreating}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAddTrack(true)}
                  disabled={isCreating}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Starting Track
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-foreground/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-accent-coral text-background hover:bg-accent-coral/90 min-w-[140px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4 mr-2" />
                    Create Session
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Track Modal */}
      <AddToQueueModal
        isOpen={showAddTrack}
        onClose={() => setShowAddTrack(false)}
        onAddTrack={handleAddTrack}
        sessionTitle="New Session"
      />
    </>
  );
};
