import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  ShoppingBag, 
  Music, 
  Ticket, 
  X,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';

interface CreateStorePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (post: any) => void;
  item: any;
  itemType: 'merch' | 'track' | 'concert';
  user: any;
}

export function CreateStorePostModal({
  isOpen,
  onClose,
  onCreatePost,
  item,
  itemType,
  user
}: CreateStorePostModalProps) {
  const [postText, setPostText] = useState(() => {
    // Generate default post text based on item type
    if (itemType === 'merch') {
      return `Check out my new merch: ${item?.title} ✨\n\n${item?.description || ''}\n\nAvailable now for ${item?.price}`;
    } else if (itemType === 'track') {
      return `New track available: ${item?.title} 🎵\n\n${item?.description || ''}\n\nGet it now for $${item?.fixedPrice || item?.suggestedPrice}`;
    } else if (itemType === 'concert') {
      return `I'm performing at ${item?.venue}! 🎤\n\n${item?.title}\n${item?.date}\n${item?.city}\n\nTickets: ${item?.price}`;
    }
    return '';
  });

  const handleSubmit = () => {
    const post = {
      id: Date.now().toString(),
      type: 'store-item',
      storeItemType: itemType,
      content: postText,
      user: user,
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      comments: 0,
      isLiked: false,
      isReposted: false,
      storeItem: item
    };

    onCreatePost(post);
    onClose();
  };

  const getIcon = () => {
    if (itemType === 'merch') return <ShoppingBag className="w-5 h-5" />;
    if (itemType === 'track') return <Music className="w-5 h-5" />;
    if (itemType === 'concert') return <Ticket className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  const getTypeLabel = () => {
    if (itemType === 'merch') return 'Merch';
    if (itemType === 'track') return 'Track';
    if (itemType === 'concert') return 'Show';
    return 'Store Item';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="store-post-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {getIcon()}
              Create Post for {getTypeLabel()}
            </DialogTitle>
          </div>
          <DialogDescription id="store-post-description">
            Share your {getTypeLabel().toLowerCase()} with your fans and the sedā.fm community. Customize your announcement to drive engagement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Item Preview */}
          <div className="p-4 border border-foreground/10 rounded-lg bg-secondary/30">
            <div className="flex gap-4">
              {/* Item Image/Artwork */}
              {(item?.image || item?.artwork) && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img 
                    src={item?.image || item?.artwork} 
                    alt={item?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold line-clamp-1">{item?.title}</h4>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {getTypeLabel()}
                  </Badge>
                </div>
                
                {item?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item?.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 text-sm">
                  {item?.price && (
                    <span className="text-accent-coral font-semibold">
                      {item.price}
                    </span>
                  )}
                  {item?.fixedPrice && (
                    <span className="text-accent-coral font-semibold">
                      ${item.fixedPrice}
                    </span>
                  )}
                  {item?.suggestedPrice && !item?.fixedPrice && (
                    <span className="text-accent-coral font-semibold">
                      ${item.suggestedPrice}
                    </span>
                  )}
                  {item?.venue && (
                    <span className="text-muted-foreground">
                      @ {item.venue}
                    </span>
                  )}
                  {item?.date && (
                    <span className="text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  )}
                  {item?.duration && (
                    <span className="text-muted-foreground">
                      {item.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Post Text Editor */}
          <div className="space-y-2">
            <Label htmlFor="post-text">Post Caption</Label>
            <Textarea
              id="post-text"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Write something about this item..."
              className="min-h-[150px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Customize your post to share with your fans
              </p>
              <span className="text-xs text-muted-foreground">
                {postText.length}/500
              </span>
            </div>
          </div>

          {/* Post Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-4 border border-foreground/10 rounded-lg bg-background">
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 bg-accent-coral/10 border-2 border-accent-coral rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-coral font-bold text-sm">
                    {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm truncate">
                      {user?.displayName || user?.username}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel()}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </div>
              </div>
              
              <p className="text-sm whitespace-pre-wrap mb-3">{postText || 'Your caption will appear here...'}</p>
              
              {/* Item card in preview */}
              <div className="border border-foreground/10 rounded-lg overflow-hidden bg-secondary/30">
                <div className="flex gap-3 p-3">
                  {(item?.image || item?.artwork) && (
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={item?.image || item?.artwork} 
                        alt={item?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-sm line-clamp-1">{item?.title}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {item?.price || `$${item?.fixedPrice || item?.suggestedPrice}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-foreground/10">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!postText.trim()}
              className="flex-1 bg-accent-coral hover:bg-accent-coral/90 text-background"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
