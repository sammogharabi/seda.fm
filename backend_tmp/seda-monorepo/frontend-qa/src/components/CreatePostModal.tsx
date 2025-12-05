import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Music, 
  Type, 
  List, 
  Calendar,
  X,
  Plus,
  Search,
  Play,
  Clock
} from 'lucide-react';
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
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackSearch, setTrackSearch] = useState('');
  const [djSessionTitle, setDjSessionTitle] = useState('');
  const [djSessionGenre, setDjSessionGenre] = useState('');
  const [djSessionDuration, setDjSessionDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && postType === 'text') {
      toast.error('Please enter some content for your post');
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
            type: 'text_post'
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
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
          <DialogDescription>
            Share your thoughts, music discoveries, or announce upcoming DJ sessions with the sedā.fm community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.displayName || user.username}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {/* Post Type Tabs */}
          <Tabs value={postType} onValueChange={setPostType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Music
              </TabsTrigger>
              <TabsTrigger value="dj_session" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                DJ Session
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="content">What's on your mind?</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, music discoveries, or upcoming events..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {content.length}/500 characters
                </p>
              </div>
            </TabsContent>

            <TabsContent value="music" className="space-y-4">
              <div>
                <Label htmlFor="content">Tell us about this track</Label>
                <Textarea
                  id="content"
                  placeholder="Why are you sharing this track? What makes it special?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>

              <div>
                <Label htmlFor="track-search">Search for a track</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="track-search"
                    placeholder="Search tracks or artists..."
                    value={trackSearch}
                    onChange={(e) => setTrackSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {selectedTrack && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedTrack.artwork}
                        alt={selectedTrack.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{selectedTrack.title}</h4>
                        <p className="text-sm text-muted-foreground">{selectedTrack.artist}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {selectedTrack.duration}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTrack(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {trackSearch && !selectedTrack && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredTracks.map((track) => (
                    <Card key={track.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => setSelectedTrack(track)}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={track.artwork}
                            alt={track.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{track.title}</h4>
                            <p className="text-xs text-muted-foreground">{track.artist}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {track.duration}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredTracks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No tracks found</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="dj_session" className="space-y-4">
              <div>
                <Label htmlFor="content">Describe your DJ session</Label>
                <Textarea
                  id="content"
                  placeholder="What can listeners expect from your session?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-title">Session Title</Label>
                  <Input
                    id="session-title"
                    placeholder="e.g., Late Night Vibes"
                    value={djSessionTitle}
                    onChange={(e) => setDjSessionTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="session-genre">Genre</Label>
                  <Input
                    id="session-genre"
                    placeholder="e.g., House, Techno"
                    value={djSessionGenre}
                    onChange={(e) => setDjSessionGenre(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="session-duration">Expected Duration</Label>
                <Input
                  id="session-duration"
                  placeholder="e.g., 2 hours"
                  value={djSessionDuration}
                  onChange={(e) => setDjSessionDuration(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}