import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { AlertCircle, Loader2, Users, Lock, Globe, Hash, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: {
    name: string;
    description?: string;
    isPrivate?: boolean;
  }) => Promise<void>;
}

export function CreateRoomModal({ isOpen, onClose, onCreateRoom }: CreateRoomModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Room name must be at least 3 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Room name must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(formData.name.trim())) {
      newErrors.name = 'Room name can only contain letters, numbers, spaces, hyphens, underscores, and periods';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onCreateRoom({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isPrivate: formData.isPrivate,
      });

      // Reset form and close modal on success
      setFormData({ name: '', description: '', isPrivate: false });
      setErrors({});
      onClose();

      toast.success(`Room "${formData.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', description: '', isPrivate: false });
      setErrors({});
      onClose();
    }
  };

  const generateRoomName = () => {
    const adjectives = ['Chill', 'Groovy', 'Electric', 'Smooth', 'Dreamy', 'Vibrant', 'Mellow', 'Funky'];
    const nouns = ['Beats', 'Vibes', 'Sounds', 'Rhythms', 'Melodies', 'Tunes', 'Jams', 'Tracks'];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    setFormData(prev => ({ ...prev, name: `${randomAdjective} ${randomNoun}` }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-primary/10 to-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <MessageSquarePlus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold">Create New Room</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Start a new music conversation space
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Room Name */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Room Name *
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={generateRoomName}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Generate random
                    </Button>
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Chill Hip-Hop Vibes"
                      className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                      disabled={isSubmitting}
                      maxLength={50}
                    />
                  </div>
                  {errors.name && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formData.name.length}/50 characters
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What kind of music and conversations will happen here?"
                    className={`resize-none ${errors.description ? 'border-destructive' : ''}`}
                    rows={3}
                    disabled={isSubmitting}
                    maxLength={200}
                  />
                  {errors.description && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formData.description.length}/200 characters
                  </div>
                </div>

                {/* Privacy Setting */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Privacy Settings</Label>

                  <div className="space-y-3">
                    {/* Public Option */}
                    <div
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        !formData.isPrivate
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => !isSubmitting && setFormData(prev => ({ ...prev, isPrivate: false }))}
                    >
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Public Room</span>
                            <Badge variant="secondary" className="text-xs">Recommended</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Anyone can discover and join this room
                          </p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                          {!formData.isPrivate && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Private Option */}
                    <div
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        formData.isPrivate
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => !isSubmitting && setFormData(prev => ({ ...prev, isPrivate: true }))}
                    >
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Private Room</span>
                            <Badge variant="outline" className="text-xs">Invite Only</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Only invited members can join this room
                          </p>
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                          {formData.isPrivate && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim()}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Create Room
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}