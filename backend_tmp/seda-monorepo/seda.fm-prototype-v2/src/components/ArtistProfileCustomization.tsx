import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  Video, 
  Music, 
  ShoppingBag, 
  Edit3,
  Trash2,
  Star,
  Play,
  ExternalLink,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ArtistProfileCustomizationProps {
  user: any;
  onUpdateUser?: (user: any) => void;
}

export function ArtistProfileCustomization({ user, onUpdateUser }: ArtistProfileCustomizationProps) {
  // Initialize from user data, with fallback to mock data
  const [photos, setPhotos] = useState(user?.profileCustomization?.photos || [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      caption: 'Live at Underground Sessions'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
      caption: 'Studio vibes'
    }
  ]);

  const [videos, setVideos] = useState(user?.profileCustomization?.videos || [
    {
      id: 1,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
      title: 'Behind the Scenes - New Album'
    }
  ]);

  const [highlightedTracks, setHighlightedTracks] = useState(user?.profileCustomization?.highlightedTracks || [
    {
      id: 1,
      title: 'Digital Dreams',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      duration: '4:23',
      plays: 15420
    }
  ]);

  const [highlightedMerch, setHighlightedMerch] = useState(user?.profileCustomization?.highlightedMerch || [
    {
      id: 1,
      title: 'Underground Vibes T-Shirt',
      image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee',
      price: '$25',
      url: 'https://artist.bandcamp.com/merch/tshirt'
    }
  ]);

  const [highlightedConcerts, setHighlightedConcerts] = useState(user?.profileCustomization?.highlightedConcerts || [
    {
      id: 1,
      title: 'Underground Showcase',
      date: 'Nov 15, 2024',
      venue: 'The Underground',
      city: 'Brooklyn, NY',
      price: '$15',
      url: 'https://eventbrite.com/event/123'
    }
  ]);

  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [showHighlightConcertsModal, setShowHighlightConcertsModal] = useState(false);
  const [highlightType, setHighlightType] = useState<'track' | 'merch' | 'concert'>('track');

  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '' });
  const [newVideo, setNewVideo] = useState({ url: '', title: '' });

  // Track if this is the initial mount to avoid saving on first render
  const isInitialMount = useRef(true);

  // Save customization data to user object whenever it changes
  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (onUpdateUser) {
      const updatedUser = {
        ...user,
        profileCustomization: {
          photos,
          videos,
          highlightedTracks,
          highlightedMerch,
          highlightedConcerts
        }
      };
      onUpdateUser(updatedUser);
      console.log('💾 Profile customization saved:', updatedUser.profileCustomization);
    }
  }, [photos, videos, highlightedTracks, highlightedMerch, highlightedConcerts, user, onUpdateUser]);

  const handleAddPhoto = useCallback(() => {
    if (!newPhoto.url.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    const photo = {
      id: Date.now(),
      url: newPhoto.url,
      caption: newPhoto.caption
    };

    setPhotos(prev => [...prev, photo]);
    setNewPhoto({ url: '', caption: '' });
    setShowAddPhotoModal(false);
    toast.success('Photo added!');
  }, [newPhoto]);

  const handleRemovePhoto = useCallback((photoId: number) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    toast.success('Photo removed');
  }, []);

  const handleAddVideo = useCallback(() => {
    if (!newVideo.url.trim()) {
      toast.error('Please enter a video URL');
      return;
    }

    const video = {
      id: Date.now(),
      url: newVideo.url,
      title: newVideo.title,
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745' // Default thumbnail
    };

    setVideos(prev => [...prev, video]);
    setNewVideo({ url: '', title: '' });
    setShowAddVideoModal(false);
    toast.success('Video added!');
  }, [newVideo]);

  const handleRemoveVideo = useCallback((videoId: number) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    toast.success('Video removed');
  }, []);

  const handleToggleHighlightTrack = useCallback((track: any) => {
    const isHighlighted = highlightedTracks.some(t => t.id === track.id);
    
    if (isHighlighted) {
      setHighlightedTracks(prev => prev.filter(t => t.id !== track.id));
      toast.success('Track removed from highlights');
    } else {
      if (highlightedTracks.length >= 3) {
        toast.error('Maximum 3 tracks can be highlighted');
        return;
      }
      setHighlightedTracks(prev => [...prev, track]);
      toast.success('Track added to highlights');
    }
  }, [highlightedTracks]);

  const handleToggleHighlightMerch = useCallback((item: any) => {
    const isHighlighted = highlightedMerch.some(m => m.id === item.id);
    
    if (isHighlighted) {
      setHighlightedMerch(prev => prev.filter(m => m.id !== item.id));
      toast.success('Item removed from highlights');
    } else {
      if (highlightedMerch.length >= 3) {
        toast.error('Maximum 3 items can be highlighted');
        return;
      }
      setHighlightedMerch(prev => [...prev, item]);
      toast.success('Item added to highlights');
    }
  }, [highlightedMerch]);

  const handleToggleHighlightConcert = useCallback((concert: any) => {
    const isHighlighted = highlightedConcerts.some(c => c.id === concert.id);
    
    if (isHighlighted) {
      setHighlightedConcerts(prev => prev.filter(c => c.id !== concert.id));
      toast.success('Concert removed from highlights');
    } else {
      if (highlightedConcerts.length >= 3) {
        toast.error('Maximum 3 concerts can be highlighted');
        return;
      }
      setHighlightedConcerts(prev => [...prev, concert]);
      toast.success('Concert added to highlights');
    }
  }, [highlightedConcerts]);

  // Mock available tracks and merch for highlighting
  const availableTracks = [
    {
      id: 1,
      title: 'Digital Dreams',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      duration: '4:23',
      plays: 15420
    },
    {
      id: 2,
      title: 'Neon Nights',
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
      duration: '5:47',
      plays: 12100
    },
    {
      id: 3,
      title: 'Underground Vibes',
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
      duration: '3:56',
      plays: 8750
    }
  ];

  const availableMerch = [
    {
      id: 1,
      title: 'Underground Vibes T-Shirt',
      image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee',
      price: '$25',
      url: 'https://artist.bandcamp.com/merch/tshirt'
    },
    {
      id: 2,
      title: 'Limited Edition Vinyl',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      price: '$35',
      url: 'https://artist.bandcamp.com/album/debut'
    }
  ];

  const availableConcerts = [
    {
      id: 1,
      title: 'Underground Showcase',
      date: 'Nov 15, 2024',
      venue: 'The Underground',
      city: 'Brooklyn, NY',
      price: '$15',
      url: 'https://eventbrite.com/event/123'
    },
    {
      id: 2,
      title: 'Warehouse Rave',
      date: 'Dec 1, 2024',
      venue: 'Secret Location',
      city: 'Los Angeles, CA',
      price: '$20',
      url: 'https://eventbrite.com/event/456'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-foreground/10 pb-6">
        <h2 className="font-black text-foreground mb-2">Customize Your Public Profile</h2>
        <p className="text-sm text-muted-foreground">
          Add photos, videos, and highlight your best content. Changes are automatically saved and will appear on your public profile.
        </p>
      </div>

      {/* Photos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Photos</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPhotoModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Photo
          </Button>
        </div>

        {photos.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/20 rounded-lg p-8 text-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No photos yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add photos to showcase your work</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-foreground/10"
                >
                  <ImageWithFallback
                    src={photo.url}
                    alt={photo.caption || 'Artist photo'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    {photo.caption && (
                      <p className="text-white text-sm text-center">{photo.caption}</p>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePhoto(photo.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Videos</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddVideoModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </div>

        {videos.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/20 rounded-lg p-8 text-center">
            <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No videos yet</p>
            <p className="text-xs text-muted-foreground mt-1">Share music videos, behind the scenes, and more</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Card className="border-foreground/10 overflow-hidden group">
                    <div className="relative aspect-video bg-secondary">
                      <ImageWithFallback
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(video.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          Watch
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveVideo(video.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium truncate">{video.title}</h4>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Highlighted Tracks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Highlighted Tracks</h3>
            <p className="text-sm text-muted-foreground">Showcase up to 3 tracks</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHighlightType('track');
              setShowHighlightModal(true);
            }}
          >
            <Star className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>

        {highlightedTracks.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/20 rounded-lg p-8 text-center">
            <Music className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No highlighted tracks</p>
            <p className="text-xs text-muted-foreground mt-1">Feature your best work</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {highlightedTracks.map((track) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-foreground/10 p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={track.artwork}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{track.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {track.duration} • {track.plays.toLocaleString()} plays
                        </p>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Star className="w-3 h-3 mr-1" />
                        Highlighted
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Highlighted Merch Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Highlighted Merch</h3>
            <p className="text-sm text-muted-foreground">Feature up to 3 items</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHighlightType('merch');
              setShowHighlightModal(true);
            }}
          >
            <Star className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>

        {highlightedMerch.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/20 rounded-lg p-8 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No highlighted merch</p>
            <p className="text-xs text-muted-foreground mt-1">Promote your best products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {highlightedMerch.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Card className="border-foreground/10 overflow-hidden">
                    <div className="aspect-square bg-secondary relative">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-accent-coral text-background">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium truncate">{item.title}</h4>
                      <p className="text-accent-coral font-semibold mt-1">{item.price}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Highlighted Concerts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Highlighted Concerts</h3>
            <p className="text-sm text-muted-foreground">Feature up to 3 upcoming shows</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHighlightType('concert');
              setShowHighlightModal(true);
            }}
          >
            <Star className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>

        {highlightedConcerts.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/20 rounded-lg p-8 text-center">
            <Music className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No highlighted concerts</p>
            <p className="text-xs text-muted-foreground mt-1">Promote your upcoming shows</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {highlightedConcerts.map((concert) => (
                <motion.div
                  key={concert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-foreground/10 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{concert.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {concert.date} • {concert.venue}, {concert.city}
                        </p>
                        <p className="text-accent-blue font-semibold mt-1">{concert.price}</p>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Star className="w-3 h-3 mr-1" />
                        Highlighted
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Photo Modal */}
      <Dialog open={showAddPhotoModal} onOpenChange={setShowAddPhotoModal}>
        <DialogContent className="border border-foreground/10" aria-describedby="add-photo-description">
          <DialogHeader>
            <DialogTitle>Add Photo</DialogTitle>
            <DialogDescription id="add-photo-description">
              Add a new photo to your profile gallery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input
                value={newPhoto.url}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Caption (optional)</Label>
              <Input
                value={newPhoto.caption}
                onChange={(e) => setNewPhoto(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Describe this photo"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddPhoto} className="flex-1 bg-accent-coral hover:bg-accent-coral/90">
                Add Photo
              </Button>
              <Button variant="outline" onClick={() => setShowAddPhotoModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Video Modal */}
      <Dialog open={showAddVideoModal} onOpenChange={setShowAddVideoModal}>
        <DialogContent className="border border-foreground/10" aria-describedby="add-video-description">
          <DialogHeader>
            <DialogTitle>Add Video</DialogTitle>
            <DialogDescription id="add-video-description">
              Add a video link (YouTube, Vimeo, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Video URL</Label>
              <Input
                value={newVideo.url}
                onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={newVideo.title}
                onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Video title"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddVideo} className="flex-1 bg-accent-coral hover:bg-accent-coral/90">
                Add Video
              </Button>
              <Button variant="outline" onClick={() => setShowAddVideoModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Highlight Manager Modal */}
      <Dialog open={showHighlightModal} onOpenChange={setShowHighlightModal}>
        <DialogContent className="border border-foreground/10 max-w-2xl" aria-describedby="highlight-manager-description">
          <DialogHeader>
            <DialogTitle>
              Manage Highlighted {highlightType === 'track' ? 'Tracks' : highlightType === 'merch' ? 'Merch' : 'Concerts'}
            </DialogTitle>
            <DialogDescription id="highlight-manager-description">
              Select up to 3 {highlightType === 'track' ? 'tracks' : highlightType === 'merch' ? 'items' : 'concerts'} to highlight on your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {highlightType === 'track' ? (
              availableTracks.map((track) => {
                const isHighlighted = highlightedTracks.some(t => t.id === track.id);
                return (
                  <Card
                    key={track.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isHighlighted ? 'border-accent-coral bg-accent-coral/10' : 'border-foreground/10'
                    }`}
                    onClick={() => handleToggleHighlightTrack(track)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={track.artwork}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{track.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {track.duration} • {track.plays.toLocaleString()} plays
                        </p>
                      </div>
                      {isHighlighted && (
                        <Star className="w-5 h-5 text-accent-coral fill-accent-coral" />
                      )}
                    </div>
                  </Card>
                );
              })
            ) : highlightType === 'merch' ? (
              availableMerch.map((item) => {
                const isHighlighted = highlightedMerch.some(m => m.id === item.id);
                return (
                  <Card
                    key={item.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isHighlighted ? 'border-accent-coral bg-accent-coral/10' : 'border-foreground/10'
                    }`}
                    onClick={() => handleToggleHighlightMerch(item)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.title}</h4>
                        <p className="text-accent-coral font-semibold">{item.price}</p>
                      </div>
                      {isHighlighted && (
                        <Star className="w-5 h-5 text-accent-coral fill-accent-coral" />
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              availableConcerts.map((concert) => {
                const isHighlighted = highlightedConcerts.some(c => c.id === concert.id);
                return (
                  <Card
                    key={concert.id}
                    className={`p-4 cursor-pointer transition-all ${
                      isHighlighted ? 'border-accent-blue bg-accent-blue/10' : 'border-foreground/10'
                    }`}
                    onClick={() => handleToggleHighlightConcert(concert)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{concert.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {concert.date} • {concert.venue}, {concert.city}
                        </p>
                        <p className="text-accent-blue font-semibold mt-1">{concert.price}</p>
                      </div>
                      {isHighlighted && (
                        <Star className="w-5 h-5 text-accent-blue fill-accent-blue" />
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setShowHighlightModal(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20"></div>
    </div>
  );
}
