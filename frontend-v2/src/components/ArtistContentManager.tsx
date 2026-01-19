import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Music,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Heart,
  MessageSquare,
  Share2,
  Upload,
  Folder,
  MoreVertical,
  Eye,
  Download,
  Calendar,
  Clock,
  Headphones,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { marketplaceApi, Product } from '../lib/api/marketplace';
import { playlistsApi } from '../lib/api/playlists';

interface ArtistContentManagerProps {
  user: any;
  onViewChange?: (view: string) => void;
  onCreateTrack?: () => void;
  onCreateCrate?: () => void;
  onPlayTrack?: (track: any) => void;
}

export function ArtistContentManager({
  user,
  onViewChange,
  onCreateTrack,
  onCreateCrate,
  onPlayTrack
}: ArtistContentManagerProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [crates, setCrates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tracks and crates from API
  useEffect(() => {
    const fetchContent = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch artist's products (tracks)
        const products = await marketplaceApi.getArtistProducts(user.id, true);

        // Convert products to track format
        const trackItems = products
          .filter(p => p.type === 'DIGITAL_TRACK' || p.type === 'DIGITAL_ALBUM')
          .map(p => ({
            id: p.id,
            title: p.title,
            duration: '', // Would need audio metadata
            uploadDate: p.createdAt,
            plays: p.viewCount,
            likes: p.purchaseCount,
            comments: 0,
            shares: 0,
            status: p.status.toLowerCase(),
            genre: '',
            mood: ''
          }));

        setTracks(trackItems);

        // Crates would come from playlists API if available
        // For now, empty array as there's no direct "get my playlists" endpoint exposed
        setCrates([]);
      } catch (error) {
        console.error('[ArtistContentManager] Failed to fetch content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [user?.id]);

  const handlePlayPause = (trackId: string, track: any) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(trackId);
      onPlayTrack?.(track);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-accent-mint/10 text-accent-mint border-accent-mint/20">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'scheduled':
        return <Badge className="bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="artist-content-manager min-h-screen bg-background">
      <div className="max-w-screen-sm mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <motion.div 
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold">Content Manager</h1>
          <p className="text-muted-foreground">Manage your tracks and crates</p>
        </motion.div>

        {/* Quick Create Actions */}
        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button 
            onClick={onCreateTrack}
            className="h-16 bg-accent-coral hover:bg-accent-coral/90 text-background flex flex-col gap-1"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm">Upload Track</span>
          </Button>
          
          <Button 
            onClick={onCreateCrate}
            variant="outline"
            className="h-16 flex flex-col gap-1"
          >
            <Folder className="w-5 h-5" />
            <span className="text-sm">New Crate</span>
          </Button>
        </motion.div>

        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracks">Tracks ({tracks.length})</TabsTrigger>
            <TabsTrigger value="crates">Crates ({crates.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracks" className="space-y-4 mt-6">
            {/* Track List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {tracks.map((track) => (
                <Card key={track.id} className="border-foreground/10">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Track Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{track.title}</h3>
                            {getStatusBadge(track.status)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{track.duration}</span>
                            <span>•</span>
                            <span>{track.genre}</span>
                            <span>•</span>
                            <span>{formatDate(track.uploadDate)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePlayPause(track.id, track)}
                            className="w-8 h-8 p-0"
                          >
                            {currentlyPlaying === track.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Track Stats */}
                      {track.status === 'published' && (
                        <div className="grid grid-cols-4 gap-4 pt-3 border-t border-foreground/10">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Headphones className="w-4 h-4 text-accent-blue" />
                            </div>
                            <div className="text-sm font-medium">{track.plays.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Plays</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Heart className="w-4 h-4 text-accent-coral" />
                            </div>
                            <div className="text-sm font-medium">{track.likes}</div>
                            <div className="text-xs text-muted-foreground">Likes</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <MessageSquare className="w-4 h-4 text-accent-yellow" />
                            </div>
                            <div className="text-sm font-medium">{track.comments}</div>
                            <div className="text-xs text-muted-foreground">Comments</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Share2 className="w-4 h-4 text-accent-mint" />
                            </div>
                            <div className="text-sm font-medium">{track.shares}</div>
                            <div className="text-xs text-muted-foreground">Shares</div>
                          </div>
                        </div>
                      )}

                      {/* Draft Actions */}
                      {track.status === 'draft' && (
                        <div className="flex gap-2 pt-3 border-t border-foreground/10">
                          <Button size="sm" className="flex-1 bg-accent-coral hover:bg-accent-coral/90">
                            Publish
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="crates" className="space-y-4 mt-6">
            {/* Crate List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {crates.map((crate) => (
                <Card key={crate.id} className="border-foreground/10">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Crate Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-accent-mint/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Folder className="w-6 h-6 text-accent-mint" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium truncate">{crate.name}</h3>
                              <Badge variant={crate.isPublic ? "default" : "secondary"} className="text-xs">
                                {crate.isPublic ? 'Public' : 'Private'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {crate.description}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{crate.trackCount} tracks</span>
                              <span>•</span>
                              <span>{formatDate(crate.createdDate)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 flex-shrink-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Crate Stats */}
                      {crate.isPublic && (
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-foreground/10">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Play className="w-4 h-4 text-accent-blue" />
                            </div>
                            <div className="text-sm font-medium">{crate.plays.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Plays</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Eye className="w-4 h-4 text-accent-mint" />
                            </div>
                            <div className="text-sm font-medium">{Math.floor(crate.plays * 1.3)}</div>
                            <div className="text-xs text-muted-foreground">Views</div>
                          </div>
                        </div>
                      )}

                      {/* Crate Actions */}
                      <div className="flex gap-2 pt-3 border-t border-foreground/10">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Bottom Spacing for Mobile Navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}