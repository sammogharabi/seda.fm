import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { PostTypeTabs } from './PostTypeTabs';
import { toast } from 'sonner@2.0.3';

// Mock music search data
const MOCK_TRACKS = [
  {
    id: 1,
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
    duration: '3:20'
  },
  {
    id: 2,
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    artwork: 'https://images.unsplash.com/photo-1573247318234-d0d48ba00c7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
    duration: '2:54'
  },
  {
    id: 3,
    title: 'Levitating',
    artist: 'Dua Lipa',
    artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
    duration: '3:23'
  }
];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (post: any) => void;
  user: any;
}

export function CreatePostModal({ isOpen, onClose, onCreatePost, user }: CreatePostModalProps) {
  // Don't render if user is not available
  if (!user) {
    return null;
  }
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackSearch, setTrackSearch] = useState('');
  const [djSessionTitle, setDjSessionTitle] = useState('');
  const [djSessionGenre, setDjSessionGenre] = useState('');
  const [djSessionDuration, setDjSessionDuration] = useState('');
  const [detectedLinks, setDetectedLinks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && (postType === 'text' || postType === 'link')) {
      toast.error('Please enter some content for your post');
      return;
    }

    if (postType === 'link' && detectedLinks.length === 0) {
      toast.error('Please include a valid link to share');
      return;
    }

    if (postType === 'music' && !selectedTrack) {
      toast.error('Please select a track to share');
      return;
    }

    if (postType === 'dj_session' && (!djSessionTitle.trim() || !djSessionGenre.trim())) {
      toast.error('Please fill in the DJ session details');
      return;
    }

    setIsSubmitting(true);

    try {
      const basePost = {
        id: Date.now(),
        user: user,
        content: content.trim(),
        timestamp: new Date(),
        likes: 0,
        reposts: 0,
        comments: 0,
        isLiked: false,
        isReposted: false
      };

      let newPost;

      switch (postType) {
        case 'text':
          newPost = {
            ...basePost,
            type: 'text_post',
            links: detectedLinks.length > 0 ? detectedLinks : undefined
          };
          break;
        
        case 'link':
          newPost = {
            ...basePost,
            type: 'link_share',
            links: detectedLinks
          };
          break;
        
        case 'music':
          newPost = {
            ...basePost,
            type: 'music_share',
            track: selectedTrack
          };
          break;
        
        case 'dj_session':
          newPost = {
            ...basePost,
            type: 'dj_session',
            djSession: {
              title: djSessionTitle,
              scheduledTime: new Date(Date.now() + 600000), // 10 minutes from now
              expectedDuration: djSessionDuration || '1 hour',
              genre: djSessionGenre,
              listeners: 0
            }
          };
          break;
      }

      onCreatePost(newPost);
      
      // Reset form
      setContent('');
      setSelectedTrack(null);
      setTrackSearch('');
      setDjSessionTitle('');
      setDjSessionGenre('');
      setDjSessionDuration('');
      setDetectedLinks([]);
      setPostType('text');
      
      onClose();
      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
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
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" aria-describedby="create-post-description">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription id="create-post-description">
            Share your thoughts, music discoveries, or announce upcoming DJ sessions with the sedā.fm community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 bg-secondary/30 border border-foreground/10">
            <div className="w-10 h-10 bg-accent-coral text-background flex items-center justify-center font-semibold border border-foreground/20">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium">{user?.displayName || user?.username || 'User'}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {/* Post Type Tabs */}
          <PostTypeTabs
            postType={postType}
            onPostTypeChange={setPostType}
            content={content}
            onContentChange={setContent}
            selectedTrack={selectedTrack}
            onSelectedTrackChange={setSelectedTrack}
            trackSearch={trackSearch}
            onTrackSearchChange={setTrackSearch}
            filteredTracks={filteredTracks}
            djSessionTitle={djSessionTitle}
            onDjSessionTitleChange={setDjSessionTitle}
            djSessionGenre={djSessionGenre}
            onDjSessionGenreChange={setDjSessionGenre}
            djSessionDuration={djSessionDuration}
            onDjSessionDurationChange={setDjSessionDuration}
            detectedLinks={detectedLinks}
            onLinksChange={setDetectedLinks}
          />

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
              className="bg-accent-coral text-background hover:bg-accent-coral/90"
            >
              {isSubmitting ? 'Posting...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}