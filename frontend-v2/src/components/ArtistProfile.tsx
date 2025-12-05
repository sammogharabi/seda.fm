import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FanMessageModal } from './FanMessageModal';
import { FansAnalytics } from './FansAnalytics';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { profilesApi } from '../lib/api/profiles';
import { 
  Music, 
  MapPin, 
  ExternalLink, 
  Heart, 
  MessageCircle, 
  Play,
  Users,
  ShoppingBag,
  Instagram,
  Youtube,
  Globe,
  CheckCircle,
  UserPlus,
  UserCheck,
  Crown,
  Award,
  Star,
  ArrowUpDown,
  Send,
  UserMinus2,
  Clock,
  TrendingUp,
  ArrowUpAZ,
  Ban,
  Shield,
  Edit3,
  Plus,
  Trash2,
  Repeat
} from 'lucide-react';
import { ArtistProfileCustomization } from './ArtistProfileCustomization';

// Helper function to format timestamps
const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 2592000)}mo`;
};

interface ArtistProfileProps {
  artist: any;
  currentUser: any;
  onNowPlaying: (track: any) => void;
  onBack: () => void;
  isFollowing?: boolean;
  onFollowToggle?: (artistId: string) => void;
  onViewMarketplace?: (artist: any) => void;
  onJoinRoom?: (room: any) => void;
  onPreviewRoom?: (room: any) => void;
  userRooms?: any[];  // Rooms the user owns
  joinedRooms?: any[];  // Rooms the user has joined as a member
  onViewFanProfile?: (fan: any) => void;
  onViewArtistProfile?: (artist: any) => void;
  mockArtists?: any[];
  mockFans?: any[];
  onFollowUser?: (user: any) => void;
  onUnfollowUser?: (userId: string) => void;
  isFollowingUser?: (userId: string) => boolean;
  onSendMessage?: (fan: any, message: string, messageType: string) => void;
  onBlockUser?: (userId: string) => void;
  isBlocked?: (userId: string) => boolean;
  editMode?: boolean;  // When true, show inline editing UI
  onUpdateUser?: (user: any) => void;  // Callback to save changes
}

export function ArtistProfile({
  artist,
  currentUser,
  onNowPlaying,
  onBack,
  isFollowing = false,
  onFollowToggle,
  onViewMarketplace,
  onJoinRoom,
  onPreviewRoom,
  userRooms = [],
  joinedRooms = [],
  onViewFanProfile,
  onViewArtistProfile,
  mockArtists = [],
  mockFans = [],
  onFollowUser,
  onUnfollowUser,
  isFollowingUser,
  onSendMessage,
  onBlockUser,
  isBlocked,
  editMode = false,
  onUpdateUser
}: ArtistProfileProps) {
  const [followState, setFollowState] = useState(isFollowing);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [showAllFans, setShowAllFans] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [fansSortBy, setFansSortBy] = useState('newest');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedFanForMessage, setSelectedFanForMessage] = useState(null);
  const [messageText, setMessageText] = useState('');

  // API data state
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [topFans, setTopFans] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [isFollowingState, setIsFollowingState] = useState(false);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!artist?.username) return;

      try {
        setLoading(true);

        // Fetch all profile data in parallel
        const [
          statsData,
          postsData,
          commentsData,
          tracksData,
          topFansData,
          followersData,
          followingData
        ] = await Promise.all([
          profilesApi.getStats(artist.username).catch(() => ({ followers: 0, following: 0, posts: 0, tracks: 0, totalPlays: 0 })),
          profilesApi.getPosts(artist.username, 20).catch(() => []),
          profilesApi.getComments(artist.username, 20).catch(() => []),
          profilesApi.getTracks(artist.username).catch(() => []),
          profilesApi.getTopFans(artist.username, 10).catch(() => []),
          profilesApi.getFollowers(artist.username, 50).catch(() => []),
          currentUser ? profilesApi.isFollowing(artist.username).catch(() => ({ following: false })) : Promise.resolve({ following: false })
        ]);

        setStats(statsData);
        setPosts(postsData);
        setComments(commentsData);
        setTracks(tracksData);
        setTopFans(topFansData);
        setFollowers(followersData);
        setIsFollowingState(followingData.following);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [artist?.username, currentUser]);

  // Mock data for posts history (fallback - will be replaced with real data)
  const mockPosts = posts.length > 0 ? posts : [
    {
      id: 'post-1',
      type: 'music_share',
      content: 'Just finished this track after months of work! Really proud of how it turned out. Let me know what you think 🎵',
      track: {
        title: 'Digital Dreams',
        artist: artist?.displayName || 'Artist',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        duration: '4:23'
      },
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      likes: 124,
      reposts: 18,
      comments: 23
    },
    {
      id: 'post-2',
      type: 'text_post',
      content: 'Thanks to everyone who came out to the show last night! The energy was incredible. Already planning the next one 🔥',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      likes: 89,
      reposts: 7,
      comments: 31
    },
    {
      id: 'post-3',
      type: 'link_share',
      content: 'New EP available now on all platforms! This has been a labor of love. Support independent music ✨',
      links: [{
        type: 'bandcamp',
        url: 'https://artist.bandcamp.com/album/new-ep',
        platform: 'Bandcamp',
        title: 'New EP - Digital Dreams',
        artist: artist?.displayName || 'Artist',
        description: 'Collection of electronic tracks',
        thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop',
        price: '$5.00'
      }],
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      likes: 256,
      reposts: 42,
      comments: 67
    }
  ];

  // Use real data from API
  const mockCommentHistory = comments;
  const mockTracks = tracks;
  const mockTopFans = topFans;

  // Get highlighted content from artist's profile customization, with fallback to defaults
  const highlightedMerch = artist?.profileCustomization?.highlightedMerch || [
    {
      id: 1,
      title: 'Underground Vibes T-Shirt',
      price: '$25',
      image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=300&h=300&fit=crop',
      url: 'https://artist.bandcamp.com/merch/tshirt'
    },
    {
      id: 2,
      title: 'Limited Edition Vinyl',
      price: '$35',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      url: 'https://artist.bandcamp.com/album/debut'
    }
  ];

  const highlightedConcerts = artist?.profileCustomization?.highlightedConcerts || [
    {
      id: 1,
      title: 'Underground Showcase',
      date: 'Nov 15, 2024',
      venue: 'The Underground',
      city: 'Brooklyn, NY',
      price: '$15',
      url: 'https://eventbrite.com/event/123'
    }
  ];

  const profilePhotos = artist?.profileCustomization?.photos || [];
  const profileVideos = artist?.profileCustomization?.videos || [];

  // Get the actual fans list from API followers data
  const fansList = useMemo(() => {
    if (!followers || !Array.isArray(followers)) {
      return [];
    }

    // Sort fans based on selected criteria
    const sortedFans = [...followers].sort((a, b) => {
      switch (fansSortBy) {
        case 'newest':
          return new Date(b.followedAt || 0).getTime() - new Date(a.followedAt || 0).getTime();
        case 'oldest':
          return new Date(a.followedAt || 0).getTime() - new Date(b.followedAt || 0).getTime();
        case 'most-active':
          return (b.activityScore || 0) - (a.activityScore || 0);
        case 'alphabetical':
          return (a.displayName || a.username).localeCompare(b.displayName || b.username);
        case 'mutual-connections':
          return (b.mutualConnections || 0) - (a.mutualConnections || 0);
        default:
          return 0;
      }
    });

    return sortedFans;
  }, [followers, fansSortBy]);

  const mockStats = stats || {
    followers: 0,
    following: 0,
    posts: 0,
    tracks: 0,
    totalPlays: 0
  };

  // Artist rooms - each artist has their own room
  const artistRoom = {
    id: `artist-room-${artist.id}`,
    name: `${artist.displayName} Community`,
    description: `Join ${artist.displayName}'s community room to chat with fans, get updates, and share music together.`,
    memberCount: Math.floor(Math.random() * 500) + 50, // Random member count between 50-550
    isPublic: true,
    artistId: artist.id,
    recentActivity: [
      { type: 'track_share', content: 'New track preview shared', timestamp: '2 hours ago' },
      { type: 'message', content: 'Artist updated their bio', timestamp: '1 day ago' },
      { type: 'fan_join', content: '12 new fans joined', timestamp: '2 days ago' }
    ]
  };

  // Check if user has already joined this artist's room
  const isRoomMember = joinedRooms.some(room => room.id === artistRoom.id);

  const handleFollowToggle = useCallback(async () => {
    if (!artist?.username) return;

    try {
      if (!isFollowingState) {
        await profilesApi.follow(artist.username);
        setIsFollowingState(true);
        setStats(prev => prev ? { ...prev, followers: prev.followers + 1 } : null);
        toast.success(`Following ${artist.displayName}!`, {
          description: 'You\'ll see their posts in your feed'
        });
      } else {
        await profilesApi.unfollow(artist.username);
        setIsFollowingState(false);
        setStats(prev => prev ? { ...prev, followers: Math.max(0, prev.followers - 1) } : null);
        toast.success(`Unfollowed ${artist.displayName}`);
      }
      onFollowToggle?.(artist.id);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  }, [isFollowingState, artist, onFollowToggle]);

  const handlePlayTrack = useCallback((track) => {
    const trackData = {
      ...track,
      artist: artist.displayName,
      artistId: artist.id
    };
    onNowPlaying(trackData);
    toast.success(`Now playing: ${track.title}`);
  }, [artist, onNowPlaying]);

  const handleTipArtist = useCallback(() => {
    // In a real app, this would open a tipping modal
    toast.success('Tip feature coming soon!', {
      description: 'Support your favorite artists directly'
    });
  }, []);

  const handleMessageArtist = useCallback(() => {
    // In a real app, this would open a messaging interface
    toast.success('Messaging coming soon!', {
      description: 'Connect directly with artists'
    });
  }, []);

  const handleVisitMarketplace = useCallback(() => {
    if (onViewMarketplace) {
      onViewMarketplace(artist);
    } else {
      // Fallback for when handler is not provided
      toast.success('Opening marketplace...', {
        description: 'Explore music, merch, and tickets'
      });
    }
  }, [artist, onViewMarketplace]);

  const handlePurchaseTrack = useCallback((track) => {
    // In a real app, this would open the purchase modal
    toast.success(`Purchasing "${track.title}" for ${track.price}`, {
      description: 'Artist receives 90% of proceeds'
    });
  }, []);

  const handleJoinArtistRoom = useCallback(() => {
    if (onJoinRoom) {
      onJoinRoom(artistRoom);
    } else {
      toast.success(`Joined ${artistRoom.name}!`, {
        description: 'You can now chat with other fans and the artist'
      });
    }
  }, [artistRoom, onJoinRoom]);

  const handlePreviewArtistRoom = useCallback(() => {
    if (onPreviewRoom) {
      onPreviewRoom(artistRoom);
    } else {
      toast.success(`Previewing ${artistRoom.name}`, {
        description: 'Join to participate in discussions'
      });
    }
  }, [artistRoom, onPreviewRoom]);

  const handleViewFan = useCallback((fan) => {
    if (onViewFanProfile) {
      onViewFanProfile(fan);
    } else {
      toast.success(`Viewing ${fan.displayName}'s profile`);
    }
  }, [onViewFanProfile]);

  const handleViewArtist = useCallback((artist) => {
    if (onViewArtistProfile) {
      onViewArtistProfile(artist);
    } else {
      toast.success(`Viewing ${artist.displayName}'s profile`);
    }
  }, [onViewArtistProfile]);

  const handleFollowFan = useCallback((fan) => {
    if (onFollowUser) {
      onFollowUser(fan);
    } else {
      toast.success(`Following ${fan.displayName}!`);
    }
  }, [onFollowUser]);

  const handleUnfollowFan = useCallback((fanId) => {
    if (onUnfollowUser) {
      onUnfollowUser(fanId);
    } else {
      toast.success('Unfollowed!');
    }
  }, [onUnfollowUser]);

  const handleMessageFan = useCallback((fan) => {
    setSelectedFanForMessage(fan);
    setMessageDialogOpen(true);
  }, []);

  const handleSendMessage = useCallback((fan, message, messageType) => {
    if (onSendMessage) {
      onSendMessage(fan, message, messageType);
    } else {
      // Default behavior
      toast.success(`${messageType} message sent to ${fan.displayName}!`, {
        description: 'They will receive your message in their inbox'
      });
    }
    
    setMessageDialogOpen(false);
    setSelectedFanForMessage(null);
  }, [onSendMessage]);

  const getSortIcon = (sortType) => {
    switch (sortType) {
      case 'newest':
      case 'oldest':
        return <Clock className="w-4 h-4" />;
      case 'most-active':
        return <TrendingUp className="w-4 h-4" />;
      case 'alphabetical':
        return <ArrowUpAZ className="w-4 h-4" />;
      case 'mutual-connections':
        return <Users className="w-4 h-4" />;
      default:
        return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  const getSortLabel = (sortType) => {
    switch (sortType) {
      case 'newest':
        return 'Newest Followers';
      case 'oldest':
        return 'Oldest Followers';
      case 'most-active':
        return 'Most Active';
      case 'alphabetical':
        return 'A-Z';
      case 'mutual-connections':
        return 'Mutual Connections';
      default:
        return 'Sort By';
    }
  };

  const getInitialBadgeColor = (accentColor: string) => {
    switch (accentColor) {
      case 'coral': return 'bg-accent-coral text-background';
      case 'blue': return 'bg-accent-blue text-background';
      case 'mint': return 'bg-accent-mint text-background';
      case 'yellow': return 'bg-accent-yellow text-background';
      default: return 'bg-foreground text-background';
    }
  };

  const displayedTracks = showAllTracks ? mockTracks : mockTracks.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button - Hide in edit mode */}
      {!editMode && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="font-mono uppercase tracking-wide font-black border-2"
            >
              ← Back
            </Button>
            <div className="font-mono text-sm text-muted-foreground">
              ARTIST PROFILE
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Cover Image & Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-2 border-foreground/10">
            {/* Cover Image */}
            <div 
              className="h-48 md:h-64 bg-gradient-to-br from-accent-coral via-accent-blue to-accent-mint relative"
              style={{
                backgroundImage: artist.coverImage ? `url(${artist.coverImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              
            </div>

            <CardContent className="pt-6 pb-6">
              {/* Edit Mode Banner */}
              {editMode && (
                <div className="mb-6 p-4 bg-accent-coral/10 border-2 border-accent-coral/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-accent-coral" />
                    <div>
                      <p className="font-black text-foreground">Editing Your Public Profile</p>
                      <p className="text-sm text-muted-foreground">Use the Overview tab below to customize what fans see on your profile</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Name, Handle, and Verification */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-black text-foreground">
                    {artist.displayName || artist.username}
                  </h1>
                  {artist.verified && (
                    <CheckCircle className="w-6 h-6 text-accent-blue" />
                  )}
                  {!artist.verified && (
                    <div className="w-6 h-6 border-2 border-muted-foreground/30 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-muted-foreground/30 rounded-full" />
                    </div>
                  )}
                </div>
                
                <p className="text-muted-foreground font-mono">@{artist.username}</p>

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{mockStats.followers.toLocaleString()}</span>
                    <span className="text-muted-foreground">followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Music className="w-4 h-4" />
                    <span className="font-medium">{mockStats.totalTracks}</span>
                    <span className="text-muted-foreground">tracks</span>
                  </div>
                  {mockStats.mutualFollowers > 0 && (
                    <div className="flex items-center gap-1 text-accent-blue">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">{mockStats.mutualFollowers}</span>
                      <span>mutual</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {artist.bio && (
                <div className="mt-4">
                  <p className="text-foreground leading-relaxed">{artist.bio}</p>
                </div>
              )}

              {/* Genre Tags and Location */}
              <div className="mt-4 space-y-3">
                {artist.genres && artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {artist.genres.map((genre, index) => (
                      <Badge key={index} variant="outline" className="font-mono">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}

                {artist.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{artist.location}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons - Hide in edit mode */}
              {!editMode && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={handleFollowToggle}
                    className={`font-mono uppercase tracking-wide font-black border-2 ${
                      isFollowingState
                        ? 'bg-accent-blue border-accent-blue text-background hover:bg-accent-blue/90'
                        : 'border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-background'
                    }`}
                  >
                  {isFollowingState ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleTipArtist}
                  className="font-mono uppercase tracking-wide font-black border-2 border-accent-mint text-accent-mint hover:bg-accent-mint hover:text-background"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Tip
                </Button>

                <Button
                  variant="outline"
                  onClick={handleMessageArtist}
                  className="font-mono uppercase tracking-wide font-black border-2"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                
                {/* Block Button */}
                {onBlockUser && isBlocked && artist.id && (
                  <Button
                    variant="outline"
                    onClick={() => onBlockUser(artist.id)}
                    className="font-mono uppercase tracking-wide font-black border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-background"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Block
                  </Button>
                )}
                </div>
              )}

              {/* Marketplace CTA - Hide in edit mode */}
              {!editMode && (
              <div className="mt-6">
                <Card className="bg-accent-coral/10 border-accent-coral/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-foreground mb-1">Artist Marketplace</h3>
                        <p className="text-sm text-muted-foreground">Music • Merch • Tickets</p>
                      </div>
                      <Button
                        onClick={handleVisitMarketplace}
                        className="bg-accent-coral hover:bg-accent-coral/90 text-background font-black uppercase tracking-wide"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Shop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}

              {/* Artist Community Room - Hide in edit mode */}
              {!editMode && (
              <div className="mt-6">
                <Card className={`${isRoomMember ? 'bg-accent-blue/10 border-accent-blue/20' : 'bg-accent-mint/10 border-accent-mint/20'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-black text-foreground">{artistRoom.name}</h3>
                          {isRoomMember && (
                            <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30 text-xs px-2 py-0.5">
                              Member
                            </Badge>
                          )}

                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{artistRoom.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{artistRoom.memberCount.toLocaleString()} members</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            <span>Official</span>
                          </div>
                        </div>

                        {/* Recent Activity Preview */}
                        <div className="space-y-1">
                          {artistRoom.recentActivity.slice(0, 2).map((activity, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-1 h-1 bg-accent-mint rounded-full" />
                              <span>{activity.content}</span>
                              <span>•</span>
                              <span>{activity.timestamp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {isRoomMember ? (
                          <Button
                            onClick={handlePreviewArtistRoom}
                            className="bg-accent-blue hover:bg-accent-blue/90 text-background font-black uppercase tracking-wide text-xs px-3 py-2"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            Enter
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={handleJoinArtistRoom}
                              className="bg-accent-mint hover:bg-accent-mint/90 text-background font-black uppercase tracking-wide text-xs px-3 py-2"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              Join
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handlePreviewArtistRoom}
                              className="border-accent-mint/30 text-accent-mint hover:bg-accent-mint/10 font-black uppercase tracking-wide text-xs px-3 py-2"
                            >
                              Preview
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-foreground/10">
            {/* Navigation Buttons */}
            <div className="p-4 border-b border-foreground/10">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Button
                  variant={activeTab === 'overview' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('overview')}
                  className={activeTab === 'overview' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Overview
                </Button>
                <Button
                  variant={activeTab === 'tracks' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('tracks')}
                  className={activeTab === 'tracks' ? 'bg-accent-blue hover:bg-accent-blue/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Tracks ({mockTracks.length})
                </Button>
                <Button
                  variant={activeTab === 'fans' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('fans')}
                  className={activeTab === 'fans' ? 'bg-accent-mint hover:bg-accent-mint/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Fans ({fansList.length})
                </Button>
                <Button
                  variant={activeTab === 'posts' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('posts')}
                  className={activeTab === 'posts' ? 'bg-accent-yellow hover:bg-accent-yellow/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Posts ({mockPosts.length})
                </Button>
                <Button
                  variant={activeTab === 'comments' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('comments')}
                  className={activeTab === 'comments' ? 'bg-accent-blue hover:bg-accent-blue/90 text-background font-mono uppercase tracking-wide font-black' : 'font-mono uppercase tracking-wide font-black'}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comments ({mockCommentHistory.length})
                </Button>
              </div>
            </div>

            {/* Content Sections */}
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* Edit Mode: Show ArtistProfileCustomization */}
                {editMode ? (
                  <ArtistProfileCustomization user={artist} onUpdateUser={onUpdateUser} />
                ) : (
                  <>
                    {/* Top Supporters */}
                    <div>
                      <h3 className="text-lg font-black text-foreground mb-4">Top Supporters</h3>
                  <div className="space-y-4">
                    {mockTopFans.map((fan, index) => (
                      <motion.div
                        key={fan.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        {/* Fan Badge */}
                        <div className="flex items-center gap-2">
                          {index === 0 && <Crown className="w-4 h-4 text-accent-yellow" />}
                          {index === 1 && <Award className="w-4 h-4 text-muted-foreground" />}
                          {index === 2 && <Star className="w-4 h-4 text-accent-coral" />}
                          <span className="font-mono text-sm text-muted-foreground">#{index + 1}</span>
                        </div>

                        {/* Fan Info */}
                        <div className="flex-1">
                          <p className="font-medium">{fan.displayName}</p>
                          <p className="text-sm text-muted-foreground font-mono">@{fan.username}</p>
                        </div>

                        {/* Tip Amount */}
                        <div className="text-right">
                          <p className="font-black text-accent-mint">${fan.tipAmount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">total support</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Highlighted Merch */}
                {highlightedMerch.length > 0 && (
                  <div>
                    <h3 className="text-lg font-black text-foreground mb-4">Highlighted Merch</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {highlightedMerch.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border border-foreground/10 rounded-lg overflow-hidden hover:border-accent-coral/50 transition-all group"
                        >
                          <div className="aspect-square bg-muted relative overflow-hidden">
                            <div 
                              className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-105"
                              style={{ backgroundImage: `url(${item.image})` }}
                            />
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium flex-1">{item.title}</h4>
                              <span className="text-accent-coral font-black">{item.price}</span>
                            </div>
                            <Button
                              onClick={() => window.open(item.url, '_blank')}
                              variant="outline"
                              size="sm"
                              className="w-full border-2 hover:border-accent-coral hover:text-accent-coral"
                            >
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Shop Now
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlighted Concerts */}
                {highlightedConcerts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-black text-foreground mb-4">Upcoming Shows</h3>
                    <div className="space-y-3">
                      {highlightedConcerts.map((concert, index) => (
                        <motion.div
                          key={concert.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border border-foreground/10 rounded-lg p-4 hover:border-accent-blue/50 transition-all hover:bg-accent-blue/5"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                              <div>
                                <h4 className="font-black text-foreground">{concert.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{concert.date}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{concert.venue}</p>
                                  <p className="text-muted-foreground">{concert.city}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 md:items-end">
                              <span className="font-black text-accent-blue text-lg">{concert.price}</span>
                              <Button
                                onClick={() => window.open(concert.url, '_blank')}
                                className="bg-accent-blue hover:bg-accent-blue/90 text-background font-black uppercase tracking-wide"
                                size="sm"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Get Tickets
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos Section */}
                {profilePhotos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-black text-foreground mb-4">Photos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profilePhotos.map((photo, index) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="aspect-square rounded-lg overflow-hidden border border-foreground/10 group relative"
                        >
                          <div 
                            className="w-full h-full bg-cover bg-center transition-transform group-hover:scale-110"
                            style={{ backgroundImage: `url(${photo.url})` }}
                          />
                          {photo.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-sm">{photo.caption}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos Section */}
                {profileVideos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-black text-foreground mb-4">Videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileVideos.map((video, index) => (
                        <motion.div
                          key={video.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="border border-foreground/10 rounded-lg overflow-hidden hover:border-accent-coral/50 transition-all group"
                        >
                          <div className="aspect-video bg-muted relative">
                            <div 
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${video.thumbnail})` }}
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                            <Button
                              onClick={() => window.open(video.url, '_blank')}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity w-full h-full rounded-none flex items-center justify-center gap-2"
                              variant="ghost"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Watch</span>
                            </Button>
                          </div>
                          <div className="p-4">
                            <h4 className="font-medium">{video.title}</h4>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity or other overview content */}
                <div>
                  <h3 className="text-lg font-black text-foreground mb-4">Recent Activity</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-mint rounded-full" />
                      <span>Released new track "Digital Dreams"</span>
                      <span>•</span>
                      <span>2 days ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-blue rounded-full" />
                      <span>Started following 3 new artists</span>
                      <span>•</span>
                      <span>1 week ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent-coral rounded-full" />
                      <span>Gained 100 new followers</span>
                      <span>•</span>
                      <span>2 weeks ago</span>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'tracks' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-foreground">All Tracks</h3>
                  <Button
                    variant="outline"
                    onClick={() => setShowAllTracks(!showAllTracks)}
                    className="font-mono text-xs uppercase tracking-wide"
                  >
                    {showAllTracks ? 'Show Less' : `View All ${mockTracks.length}`}
                  </Button>
                </div>

                <div className="space-y-3">
                  {displayedTracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      {/* Track Artwork */}
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <div 
                          className="w-full h-full bg-muted rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${track.artwork})` }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handlePlayTrack(track)}
                          className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity w-full h-full rounded-lg"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{track.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{track.duration}</span>
                          <span>•</span>
                          <span>{track.plays.toLocaleString()} plays</span>
                          <span>•</span>
                          <span>${track.price}</span>
                        </div>
                      </div>

                      {/* Track Actions */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="w-4 h-4" />
                          <span>{track.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePlayTrack(track)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePurchaseTrack(track)}
                            className="bg-accent-mint text-background hover:bg-accent-mint/90"
                          >
                            ${track.price}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'fans' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-foreground">All Fans</h3>
                  <div className="flex items-center gap-3">
                    {/* Sort Control */}
                    <Select value={fansSortBy} onValueChange={setFansSortBy}>
                      <SelectTrigger className="w-auto min-w-[180px] font-mono text-xs uppercase tracking-wide">
                        <div className="flex items-center gap-2">
                          {getSortIcon(fansSortBy)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest" className="font-mono uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Newest First
                          </div>
                        </SelectItem>
                        <SelectItem value="oldest" className="font-mono uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Oldest First
                          </div>
                        </SelectItem>
                        <SelectItem value="most-active" className="font-mono uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Most Active
                          </div>
                        </SelectItem>
                        <SelectItem value="alphabetical" className="font-mono uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <ArrowUpAZ className="w-4 h-4" />
                            A-Z
                          </div>
                        </SelectItem>
                        <SelectItem value="mutual-connections" className="font-mono uppercase tracking-wide">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Mutual Connections
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Show More/Less Button */}
                    {fansList.length > 12 && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAllFans(!showAllFans)}
                        className="font-mono text-xs uppercase tracking-wide"
                      >
                        {showAllFans ? 'Show Less' : `View All ${fansList.length}`}
                      </Button>
                    )}
                  </div>
                </div>

                {fansList.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium text-foreground mb-2">No fans yet</h4>
                    <p className="text-sm text-muted-foreground">Be the first to follow this artist!</p>
                  </div>
                ) : (
                  <>
                    {/* Enhanced Fans Analytics */}
                    <FansAnalytics fansList={fansList} className="mb-6" />
                  
                    {/* Current Sort Info */}
                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                      {getSortIcon(fansSortBy)}
                      <span>Sorted by: {getSortLabel(fansSortBy)}</span>
                      {fansSortBy === 'mutual-connections' && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {fansList.filter(f => f.isFollowedByCurrentUser).length} mutual connections
                        </Badge>
                      )}
                    </div>
                
                    {/* Fans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(showAllFans ? fansList : fansList.slice(0, 12)).map((fan, index) => (
                      <motion.div
                        key={fan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-lg border border-foreground/10 hover:bg-muted/30 transition-colors group"
                      >
                        {/* Mutual Connection Indicator */}
                        {fan.isFollowedByCurrentUser && (
                          <div className="w-6 h-6 bg-accent-blue rounded-full flex items-center justify-center flex-shrink-0">
                            <UserMinus2 className="w-3 h-3 text-background" />
                          </div>
                        )}

                        {/* Fan Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              onClick={() => fan.isArtist ? handleViewArtist(fan) : handleViewFan(fan)}
                              className="font-medium truncate hover:text-accent-coral transition-colors"
                            >
                              {fan.displayName || fan.username}
                            </button>
                            {fan.verified && (
                              <CheckCircle className="w-4 h-4 text-accent-blue flex-shrink-0" />
                            )}
                            {fan.isArtist && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                Artist
                              </Badge>
                            )}
                            {fan.isFollowedByCurrentUser && (
                              <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30 text-xs px-1 py-0">
                                Mutual
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono truncate">@{fan.username}</p>
                          
                          {/* Enhanced Fan Details */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            {fan.followedAt && <span>Followed {new Date(fan.followedAt).toLocaleDateString()}</span>}
                            {fan.mutualConnections > 0 && (
                              <>
                                <span>•</span>
                                <span>{fan.mutualConnections} mutual</span>
                              </>
                            )}
                            {fansSortBy === 'most-active' && fan.activityScore && (
                              <>
                                <span>•</span>
                                <span>{fan.activityScore} activity</span>
                              </>
                            )}
                          </div>
                          
                          {fan.bio && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{fan.bio}</p>
                          )}
                        </div>

                        {/* Fan Actions */}
                        {currentUser?.id !== fan.id && (
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Message Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMessageFan(fan)}
                              className="font-mono text-xs uppercase tracking-wide"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Message
                            </Button>
                            
                            {/* Follow/Unfollow Button */}
                            {isFollowingUser && isFollowingUser(fan.id) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnfollowFan(fan.id)}
                                className="font-mono text-xs uppercase tracking-wide"
                              >
                                <UserCheck className="w-3 h-3 mr-1" />
                                Following
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleFollowFan(fan)}
                                className="bg-accent-mint text-background hover:bg-accent-mint/90 font-mono text-xs uppercase tracking-wide"
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                Follow
                              </Button>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    </div>
                  </>
                )}

                {/* Show more fans hint */}
                {!showAllFans && fansList.length > 12 && (
                  <div className="text-center mt-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      Showing 12 of {fansList.length} fans
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowAllFans(true)}
                      className="font-mono uppercase tracking-wide"
                    >
                      View All {fansList.length} Fans
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="p-6">
                <h3 className="text-lg font-black text-foreground mb-6">Post History</h3>
                <div className="space-y-4">
                  {mockPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-foreground/10 rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      {/* Post Header */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black">{artist.displayName || artist.username}</span>
                          {artist.verified && <CheckCircle className="w-4 h-4 text-accent-blue" />}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">@{artist.username} • {formatTimestamp(post.timestamp)}</p>
                      </div>

                      {/* Post Content */}
                      <p className="text-foreground mb-3">{post.content}</p>

                      {/* Track Preview */}
                      {post.track && (
                        <div className="border border-foreground/10 rounded-lg p-3 mb-3 flex items-center gap-3">
                          <img
                            src={post.track.artwork}
                            alt={post.track.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-black text-sm">{post.track.title}</p>
                            <p className="text-xs text-muted-foreground">{post.track.artist} • {post.track.duration}</p>
                          </div>
                          <Button size="sm" variant="ghost" className="hover:bg-accent-coral/10">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {/* Post Stats */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground pt-3 border-t border-foreground/10">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Repeat className="w-4 h-4" />
                          <span>{post.reposts}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="p-6">
                <h3 className="text-lg font-black text-foreground mb-6">Comment History</h3>
                <div className="space-y-4">
                  {mockCommentHistory.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border border-foreground/10 rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      {/* Original Post Context */}
                      <div className="bg-muted/30 rounded-lg p-3 mb-3 border-l-4 border-accent-blue">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-black text-sm">{comment.postContext.author.displayName}</span>
                          <span className="text-xs text-muted-foreground">posted:</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{comment.postContext.content}</p>
                      </div>

                      {/* Comment */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm">{artist.displayName || artist.username}</span>
                          {artist.verified && <CheckCircle className="w-3 h-3 text-accent-blue" />}
                          <span className="text-xs text-muted-foreground">• {formatTimestamp(comment.timestamp)}</span>
                        </div>
                        <p className="text-foreground">{comment.content}</p>

                        {/* Comment Stats */}
                        <div className="flex items-center gap-4 mt-2">
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent-coral transition-colors">
                            <Heart className="w-3 h-3" />
                            <span>{comment.likes}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Social Links */}
        {artist.socialLinks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-6">
                <h2 className="text-xl font-black text-foreground mb-4">Connect</h2>
                
                <div className="flex flex-wrap gap-3">
                  {artist.socialLinks.instagram && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(artist.socialLinks.instagram, '_blank')}
                      className="font-mono uppercase tracking-wide border-2"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                  )}
                  {artist.socialLinks.youtube && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(artist.socialLinks.youtube, '_blank')}
                      className="font-mono uppercase tracking-wide border-2"
                    >
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </Button>
                  )}
                  {artist.website && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(artist.website, '_blank')}
                      className="font-mono uppercase tracking-wide border-2"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Messaging Modal */}
        <FanMessageModal
          isOpen={messageDialogOpen}
          onClose={() => {
            setMessageDialogOpen(false);
            setSelectedFanForMessage(null);
          }}
          fan={selectedFanForMessage}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onFollowUser={onFollowUser}
          isFollowing={isFollowingUser}
        />
      </div>
    </div>
  );
}