import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Crown,
  Globe,
  Lock,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { roomsApi } from '../lib/api';

// Available genre options
const GENRES = [
  'Hip Hop', 'Electronic', 'Jazz', 'Rock', 'Pop', 'Indie', 'House', 'Techno',
  'Ambient', 'R&B', 'Alternative', 'Classical', 'Folk', 'Reggae', 'Latin'
];

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: any) => void;
  user: any;
}

export function CreateRoomModal({ isOpen, onClose, onCreateRoom, user }: CreateRoomModalProps) {
  // Don't render if user is not available
  if (!user) {
    return null;
  }
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [allowInvites, setAllowInvites] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    if (!description.trim()) {
      toast.error('Please add a description for your room');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the backend API to create the room
      const createdRoom = await roomsApi.create({
        name: roomName.trim(),
        description: description.trim(),
        isPrivate,
        genre: selectedGenre || undefined,
      });

      onCreateRoom(createdRoom);
      
      // Reset form
      setRoomName('');
      setDescription('');
      setSelectedGenre('');
      setCustomTags([]);
      setNewTag('');
      setAllowInvites(true);
      setRequireApproval(false);
      setIsPrivate(false);
      
      onClose();
      toast.success('Room created successfully! Welcome to your new space.');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby="create-room-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a Room</DialogTitle>
          <DialogDescription id="create-room-description">
            Build a music-first community around your favorite sounds, artists, or genres. 
            Rooms are spaces where music lovers gather to discover, share, and vibe together.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Creator Info */}
          <div className="flex items-center gap-3 p-4 bg-secondary/30 border border-foreground/10 rounded-lg">
            <div className="w-10 h-10 bg-accent-coral text-background flex items-center justify-center font-semibold border border-foreground/20 rounded">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium flex items-center gap-1">
                {user?.displayName || user?.username || 'User'}
                <Crown className="w-4 h-4 text-accent-yellow" />
                <span className="text-xs text-muted-foreground">Room Owner</span>
              </p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-secondary/30 border border-foreground/10 rounded-lg">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <div className="w-10 h-10 bg-accent-yellow/20 text-accent-yellow flex items-center justify-center rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-accent-mint/20 text-accent-mint flex items-center justify-center rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-medium">{isPrivate ? 'Private Room' : 'Public Room'}</p>
                <p className="text-sm text-muted-foreground">
                  {isPrivate
                    ? 'Only invited members can join this room'
                    : 'Anyone can discover and join this room'}
                </p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              className="data-[state=checked]:!bg-accent-yellow data-[state=unchecked]:!bg-accent-mint"
            />
          </div>

          {/* Room Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="room-name">Room Name *</Label>
              <Input
                id="room-name"
                placeholder="e.g., Late Night Beats, Underground Hip Hop, Flume Fans"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                maxLength={50}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {roomName.length}/50 characters
              </p>
            </div>

            {/* Genre Selection */}
            <div>
              <Label htmlFor="genre-select">Genre (Optional)</Label>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Help people discover your room by genre
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="What's this room about? What kind of music and vibes can members expect?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none mt-1"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/300 characters
              </p>
            </div>

            {/* Custom Tags */}
            <div>
              <Label>Custom Tags (Optional)</Label>
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
                Add up to 5 tags to help people discover your room
              </p>
            </div>
          </div>

          {/* Room Settings - Only show for private rooms */}
          {isPrivate && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Room Settings</Label>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label htmlFor="allow-invites" className="font-normal">Allow Member Invites</Label>
                    <p className="text-sm text-muted-foreground">Let members invite their friends</p>
                  </div>
                  <div className="flex-shrink-0 self-start pt-1">
                    <Switch
                      id="allow-invites"
                      checked={allowInvites}
                      onCheckedChange={setAllowInvites}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-approval" className="font-normal">Require Join Approval</Label>
                    <p className="text-sm text-muted-foreground">Manually approve new members</p>
                  </div>
                  <Switch
                    id="require-approval"
                    checked={requireApproval}
                    onCheckedChange={setRequireApproval}
                  />
                </div>
              </div>
            </div>
          )}

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
              className="bg-accent-coral text-background hover:bg-accent-coral/90 min-w-[120px]"
            >
              {isSubmitting ? 'Creating...' : 'Create Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}