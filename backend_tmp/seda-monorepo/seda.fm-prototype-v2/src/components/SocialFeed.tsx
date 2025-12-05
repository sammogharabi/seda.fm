import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { 
  Heart, 
  MessageCircle, 
  Repeat, 
  Share,
  Play, 
  Pause, 
  Music,
  Clock,
  Crown,
  Users,
  Mic,
  UserPlus,
  UserMinus,
  Bookmark,
  TrendingUp,
  Volume2,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { Comments } from './Comments';
import { LinkPreview } from './LinkPreview';

const MOCK_FEED_DATA = [
  {
    id: 1,
    type: 'link_share',
    user: { 
      username: 'underground_beats', 
      displayName: 'Underground Beats',
      accentColor: 'coral',
      verified: true 
    },
    content: 'Just dropped a new track on Bandcamp! Deep house vibes for your late night sessions. Support independent music ✨',
    links: [
      {
        type: 'bandcamp',
        url: 'https://artist1.bandcamp.com/track/midnight-vibes',
        platform: 'Bandcamp',
        title: 'Midnight Vibes',
        artist: 'Underground Collective',
        description: 'Deep house track with ambient elements',
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=200&fit=crop',
        price: '$1.00',
        isPlayable: true
      }
    ],
    timestamp: new Date(Date.now() - 300000),
    likes: 24,
    reposts: 3,
    comments: [],
    isLiked: false,
    isReposted: false
  },
  {
    id: 2,
    type: 'text_post',
    user: { 
      username: 'dj_nova', 
      displayName: 'DJ Nova',
      accentColor: 'blue',
      verified: true 
    },
    content: 'Found this incredible M83 performance from their last tour. The energy is unreal! https://youtu.be/dQw4w9WgXcQ',
    links: [
      {
        type: 'youtube',
        url: 'https://youtu.be/dQw4w9WgXcQ',
        platform: 'YouTube',
        embedId: 'dQw4w9WgXcQ',
        title: 'M83 - Midnight City (Live Performance)',
        artist: 'M83',
        description: 'Live performance of Midnight City from the 2022 world tour',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
        duration: '4:33',
        isPlayable: true
      }
    ],
    timestamp: new Date(Date.now() - 600000),
    likes: 56,
    reposts: 12,
    comments: [
      {
        id: 201,
        user: { username: 'music_fan', displayName: 'Music Fan', accentColor: 'blue', verified: false },
        content: 'This performance gives me chills every time! 🎵',
        timestamp: new Date(Date.now() - 540000),
        likes: 5,
        isLiked: false,
        replies: []
      }
    ],
    isLiked: false,
    isReposted: false
  },
  {
    id: 3,
    type: 'music_share',
    user: { 
      username: 'vinyl_collector', 
      displayName: 'Vinyl Collector',
      accentColor: 'mint',
      verified: false 
    },
    content: 'This track has been on repeat all week! Perfect vibes for late night sessions 🌙',
    track: {
      title: 'Midnight City',
      artist: 'M83',
      artwork: 'https://images.unsplash.com/photo-1583927109257-f21c74dd0c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXIlMjBlbGVjdHJvbmljfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.0&q=80&w=300',
      duration: '4:03'
    },
    timestamp: new Date(Date.now() - 900000),
    likes: 24,
    reposts: 3,
    comments: [
      {
        id: 301,
        user: { username: 'music_fan', displayName: 'Music Fan', accentColor: 'blue', verified: false },
        content: 'Absolute banger! This brings back so many memories 🎵',
        timestamp: new Date(Date.now() - 840000),
        likes: 5,
        isLiked: false,
        replies: [
          {
            id: 302,
            user: { username: 'vinyl_collector', displayName: 'Vinyl Collector', accentColor: 'mint', verified: false },
            content: 'Right? M83 never misses! 🔥',
            timestamp: new Date(Date.now() - 720000),
            likes: 2,
            isLiked: false,
            replies: []
          }
        ]
      },
      {
        id: 303,
        user: { username: 'synth_lover', displayName: 'Synth Lover', accentColor: 'coral', verified: false },
        content: 'The production on this track is insane. Those synths hit different',
        timestamp: new Date(Date.now() - 780000),
        likes: 3,
        isLiked: false,
        replies: []
      }
    ],
    isLiked: false,
    isReposted: false
  },
  {
    id: 4,
    type: 'link_share',
    user: { 
      username: 'merch_master', 
      displayName: 'Merch Master',
      accentColor: 'yellow'
    },
    content: 'New limited edition vinyl just dropped! Only 500 copies pressed. Get yours before they sell out 🔥',
    links: [
      {
        type: 'generic',
        url: 'https://undergroundrecords.com/limited-vinyl',
        platform: 'undergroundrecords.com',
        title: 'Limited Edition Vinyl Collection',
        description: 'Exclusive underground house music vinyl pressings',
        isPlayable: false
      }
    ],
    timestamp: new Date(Date.now() - 1200000),
    likes: 42,
    reposts: 8,
    comments: [],
    isLiked: false,
    isReposted: false
  },
  {
    id: 5,
    type: 'text_post',
    user: { 
      username: 'beatmaster_99', 
      displayName: 'Beat Master',
      accentColor: 'blue'
    },
    content: 'Just finished my first DJ set at the underground venue downtown! The crowd was absolutely electric. Thank you to everyone who showed up and vibed with me 🙏✨\n\nNext set: Friday 9PM at #ElectronicLounge',
    timestamp: new Date(Date.now() - 1800000),
    likes: 56,
    reposts: 12,
    comments: [
      {
        id: 501,
        user: { username: 'party_goer', displayName: 'Party Goer', accentColor: 'yellow', verified: false },
        content: 'Was there! Your set was incredible, definitely coming to the next one 🕺',
        timestamp: new Date(Date.now() - 1680000),
        likes: 12,
        isLiked: true,
        replies: []
      }
    ],
    isLiked: true,
    isReposted: false
  },
  {
    id: 6,
    type: 'dj_session',
    user: { 
      username: 'vinyl_collector', 
      displayName: 'Vinyl Collector',
      accentColor: 'mint'
    },
    content: 'Going live in 10 minutes! Tonight\'s theme: Classic house gems from the 90s 🏠',
    djSession: {
      title: 'Classic House Night',
      scheduledTime: new Date(Date.now() + 600000),
      expectedDuration: '2 hours',
      genre: 'House',
      listeners: 0
    },
    timestamp: new Date(Date.now() - 3600000),
    likes: 18,
    reposts: 7,
    comments: [],
    isLiked: false,
    isReposted: true
  }
];

// Helper function to get accent color classes
const getAccentClasses = (color) => {
  const colorMap = {
    coral: {
      bg: 'bg-accent-coral',
      bgSubtle: 'bg-accent-coral/10',
      text: 'text-accent-coral',
      border: 'border-accent-coral'
    },
    blue: {
      bg: 'bg-accent-blue',
      bgSubtle: 'bg-accent-blue/10',
      text: 'text-accent-blue',
      border: 'border-accent-blue'
    },
    mint: {
      bg: 'bg-accent-mint',
      bgSubtle: 'bg-accent-mint/10',
      text: 'text-accent-mint',
      border: 'border-accent-mint'
    },
    yellow: {
      bg: 'bg-accent-yellow',
      bgSubtle: 'bg-accent-yellow/10',
      text: 'text-accent-yellow',
      border: 'border-accent-yellow'
    }
  };
  return colorMap[color] || colorMap.coral;
};

export function SocialFeed({ user, onNowPlaying, onStartDJ, posts = [], onFollowUser, onUnfollowUser, isFollowing, onViewArtistProfile, onViewFanProfile, mockArtists = [] }) {
  const [feedData, setFeedData] = useState([...posts, ...MOCK_FEED_DATA]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewCounts, setViewCounts] = useState(new Map());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [openComments, setOpenComments] = useState(new Set());

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleLike = (postId) => {
    setFeedData(prev => prev.map(post => {
      if (post.id === postId) {
        const newIsLiked = !post.isLiked;
        return {
          ...post,
          isLiked: newIsLiked,
          likes: newIsLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleRepost = useCallback((postId) => {
    setFeedData(prev => prev.map(post => {
      if (post.id === postId) {
        const newIsReposted = !post.isReposted;
        return {
          ...post,
          isReposted: newIsReposted,
          reposts: newIsReposted ? post.reposts + 1 : post.reposts - 1
        };
      }
      return post;
    }));
    
    toast.success('Reposted! Earned +2 Points');
  }, []);

  const handlePlayTrack = (track, postId) => {
    setCurrentlyPlaying({ ...track, postId });
    onNowPlaying({ ...track, postId, addedBy: feedData.find(p => p.id === postId)?.user });
    toast.success('Now playing! Earned +5 Points');
  };

  const refreshFeed = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFeedData([...posts, ...MOCK_FEED_DATA]);
    setIsRefreshing(false);
    toast.success('Feed refreshed!');
  }, [posts]);

  const handleToggleComments = (postId) => {
    setOpenComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleAddComment = useCallback((postId, content) => {
    const newComment = {
      id: Date.now(),
      user: {
        username: user.username,
        displayName: user.displayName || user.username,
        accentColor: user.accentColor || 'coral',
        verified: user.verified || false
      },
      content,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: []
    };

    setFeedData(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), newComment]
        };
      }
      return post;
    }));
  }, [user]);

  const handleReplyToComment = useCallback((postId, parentCommentId, content) => {
    const newReply = {
      id: Date.now(),
      user: {
        username: user.username,
        displayName: user.displayName || user.username,
        accentColor: user.accentColor || 'coral',
        verified: user.verified || false
      },
      content,
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: []
    };

    setFeedData(prev => prev.map(post => {
      if (post.id === postId) {
        const updateComments = (comments) => {
          return comments.map(comment => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newReply]
              };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: updateComments(comment.replies)
              };
            }
            return comment;
          });
        };

        return {
          ...post,
          comments: updateComments(post.comments || [])
        };
      }
      return post;
    }));
  }, [user]);

  // Helper function to handle user click
  const handleUserClick = useCallback((postUser) => {
    // Check if user is an artist by looking at verified status or checking mockArtists
    const isArtist = postUser.verified || mockArtists.some(artist => 
      artist.username === postUser.username || artist.id === postUser.id
    );
    
    if (isArtist && onViewArtistProfile) {
      // Create a complete artist object if needed
      const artistData = mockArtists.find(artist => 
        artist.username === postUser.username || artist.id === postUser.id
      ) || {
        id: postUser.id || `artist-${postUser.username}`,
        username: postUser.username,
        displayName: postUser.displayName || postUser.username,
        verified: postUser.verified || false,
        accentColor: postUser.accentColor || 'coral',
        bio: `Music creator and artist`,
        location: 'Unknown',
        genres: ['Electronic', 'Indie'],
        website: '',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
        socialLinks: {}
      };
      onViewArtistProfile(artistData);
    } else if (onViewFanProfile) {
      // Create a fan profile object
      const fanData = {
        id: postUser.id || `fan-${postUser.username}`,
        username: postUser.username,
        displayName: postUser.displayName || postUser.username,
        verified: postUser.verified || false,
        verificationStatus: 'not-requested',
        points: Math.floor(Math.random() * 2000) + 100,
        accentColor: postUser.accentColor || 'coral',
        bio: `Music lover and community member`,
        location: 'Unknown',
        joinedDate: new Date('2024-01-15'),
        genres: ['Various'],
        connectedServices: ['Spotify'],
        isArtist: false,
        website: ''
      };
      onViewFanProfile(fanData);
    }
  }, [mockArtists, onViewArtistProfile, onViewFanProfile]);

  const handleLikeComment = useCallback((postId, commentId) => {
    setFeedData(prev => prev.map(post => {
      if (post.id === postId) {
        const updateComments = (comments) => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              const newIsLiked = !comment.isLiked;
              return {
                ...comment,
                isLiked: newIsLiked,
                likes: newIsLiked ? comment.likes + 1 : comment.likes - 1
              };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: updateComments(comment.replies)
              };
            }
            return comment;
          });
        };

        return {
          ...post,
          comments: updateComments(post.comments || [])
        };
      }
      return post;
    }));
  }, []);

  const renderPost = useCallback((post) => {
    const isPlaying = currentlyPlaying?.postId === post.id;
    const isBookmarked = bookmarkedPosts.has(post.id);
    const isExpanded = expandedPosts.has(post.id);
    const shouldTruncate = post.content.length > 200;
    const commentsOpen = openComments.has(post.id);
    const commentsCount = post.comments ? post.comments.length : 0;

    return (
      <motion.article
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="mb-12 last:mb-0"
      >
        {/* Professional Article Layout */}
        <div className="bg-card border border-foreground/10 hover:border-foreground/20 transition-all duration-300 group rounded-xl">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Editorial Header */}
            <header className="mb-4 md:mb-6">
              <div className="flex items-start gap-3 md:gap-4">
                {/* Professional User Badge */}
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${getAccentClasses(post.user.accentColor).bg} border border-foreground/20 flex items-center justify-center`}>
                    <span className="text-background font-semibold text-base md:text-lg">{post.user.username[0].toUpperCase()}</span>
                  </div>
                  {post.user.verified && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-yellow border border-background flex items-center justify-center">
                      <Crown className="w-2 h-2 text-background" />
                    </div>
                  )}
                </div>
                
                {/* Clean User Info */}
                <div className="flex-1">
                  <button 
                    onClick={() => handleUserClick(post.user)}
                    className="text-base md:text-lg font-semibold text-primary mb-1 hover:text-accent-coral transition-colors text-left cursor-pointer block"
                  >
                    {post.user.displayName || post.user.username}
                  </button>
                  <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                    <button 
                      onClick={() => handleUserClick(post.user)}
                      className="hover:text-accent-coral transition-colors cursor-pointer"
                    >
                      @{post.user.username}
                    </button>
                    <span>•</span>
                    <span>{formatTimestamp(post.timestamp)}</span>
                    {post.user.verified && (
                      <>
                        <span>•</span>
                        <span className="text-accent-yellow font-medium">Artist</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Subtle Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setBookmarkedPosts(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(post.id)) {
                        newSet.delete(post.id);
                      } else {
                        newSet.add(post.id);
                      }
                      return newSet;
                    })}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-accent-yellow' : ''}`} />
                  </Button>
                </div>
              </div>
            </header>

            {/* Editorial Content */}
            <div className="mb-4 md:mb-6">
              <div className="prose prose-base md:prose-lg max-w-none">
                <p className="text-foreground leading-relaxed">
                  {shouldTruncate && !isExpanded ? (
                    <>
                      {post.content.substring(0, 200)}...
                      <button 
                        onClick={() => setExpandedPosts(prev => {
                          const newSet = new Set(prev);
                          newSet.add(post.id);
                          return newSet;
                        })}
                        className="text-accent-blue hover:text-accent-blue/80 ml-2 font-medium underline"
                      >
                        Read more
                      </button>
                    </>
                  ) : (
                    <>
                      {post.content}
                      {shouldTruncate && isExpanded && (
                        <button 
                          onClick={() => setExpandedPosts(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(post.id);
                            return newSet;
                          })}
                          className="text-accent-blue hover:text-accent-blue/80 ml-2 font-medium underline"
                        >
                          Show less
                        </button>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Music Share - Professional Card */}
            {post.type === 'music_share' && post.track && (
              <div className="mb-4 md:mb-6">
                <div className={`p-3 md:p-4 lg:p-6 bg-card border border-foreground/10 relative overflow-hidden rounded-lg ${isPlaying ? 'border-accent-coral' : ''}`}>
                  <div className="flex gap-3 md:gap-4">
                    <div className="relative group flex-shrink-0">
                      {/* Album Cover */}
                      <div className="relative">
                        <img 
                          src={post.track.artwork} 
                          alt={post.track.title}
                          className="w-12 h-12 md:w-16 md:h-16 object-cover border border-foreground/20"
                          loading="lazy"
                        />
                        {/* Play button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute inset-0 bg-black/60 hover:bg-black/80 border-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          onClick={() => handlePlayTrack(post.track, post.id)}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        {/* Now playing indicator */}
                        {isPlaying && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-coral rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    {/* Track Info - Clean Layout */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-primary mb-1 truncate">{post.track.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2 truncate">{post.track.artist}</p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 md:gap-2 text-sm text-muted-foreground flex-shrink-0">
                          <Clock className="w-4 h-4" />
                          <span>{post.track.duration}</span>
                        </div>
                        {isPlaying && (
                          <div className="flex items-center gap-1 md:gap-2 text-sm text-accent-coral flex-shrink-0">
                            <Volume2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Playing</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Track Upload - Professional Product Card with Purchase */}
            {post.type === 'track' && post.track && (
              <div className="mb-6">
                <div className="border border-foreground/10 hover:border-accent-coral/50 transition-all duration-300 rounded-lg overflow-hidden bg-secondary/30">
                  <div className="flex gap-4 p-4">
                    {/* Track Artwork */}
                    {post.track.artwork && (
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted group">
                        <img 
                          src={post.track.artwork} 
                          alt={post.track.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Play button overlay */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute inset-0 bg-black/60 hover:bg-black/80 border-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          onClick={() => handlePlayTrack(post.track, post.id)}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* Track Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-primary line-clamp-1">{post.track.title}</h4>
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">
                          Track
                        </Badge>
                      </div>
                      
                      {post.track.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.track.description}
                        </p>
                      )}
                      
                      {/* Price and CTA */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {(post.track.fixedPrice || post.track.suggestedPrice) && (
                          <span className="text-accent-coral font-semibold">
                            {post.track.pricingType === 'pwyw' 
                              ? `${post.track.minimumPrice || '0'}+ (suggested: ${post.track.suggestedPrice})`
                              : `${post.track.fixedPrice}`
                            }
                          </span>
                        )}
                        
                        <Button
                          size="sm"
                          className="bg-accent-coral hover:bg-accent-coral/90 text-background"
                          onClick={() => {
                            toast.success('Opening purchase...', {
                              description: `Buy "${post.track.title}"`
                            });
                          }}
                        >
                          Buy Track
                        </Button>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        {post.track.duration && (
                          <span>• {post.track.duration}</span>
                        )}
                        {post.track.formats && post.track.formats.length > 0 && (
                          <span>• {post.track.formats.slice(0, 2).join(', ')}</span>
                        )}
                        {post.track.genre && (
                          <span>• {post.track.genre}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Link Share - Rich Link Previews */}
            {(post.type === 'link_share' || (post.type === 'text_post' && post.links)) && post.links && post.links.length > 0 && (
              <div className="mb-6 space-y-4">
                {post.links.map((link, index) => (
                  <LinkPreview 
                    key={`${post.id}-link-${index}-${link.url}`} 
                    link={link}
                    onPlay={(link) => {
                      // Handle play functionality for supported platforms
                      if (link.isPlayable) {
                        onNowPlaying?.({
                          title: link.title || 'Unknown Track',
                          artist: link.artist || 'Unknown Artist',
                          artwork: link.thumbnail || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
                          duration: link.duration || '0:00',
                          url: link.url
                        });
                        toast.success(`Now playing: ${link.title || 'Unknown Track'}`);
                      }
                    }}
                    isPlaying={false} // TODO: Implement proper playing state tracking
                  />
                ))}
              </div>
            )}

            {/* DJ Session - Professional Event Card */}
            {post.type === 'dj_session' && post.djSession && (
              <div className="mb-6">
                <div className={`p-6 ${getAccentClasses(post.user.accentColor).bg} text-background border border-foreground/20 relative rounded-lg`}>
                  <div className="text-center">
                    <div className="text-xs text-background/80 mb-2 uppercase tracking-wider">
                      Live Session • {post.djSession.genre}
                    </div>
                    <h4 className="text-xl font-semibold mb-2">{post.djSession.title}</h4>
                    <p className="text-background/90 mb-4">{post.djSession.expectedDuration}</p>
                    
                    <Button 
                      size="sm" 
                      className="bg-background text-foreground hover:bg-background/90"
                      onClick={() => onStartDJ?.(true)}
                    >
                      Join Session
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Store Item - Professional Product Card */}
            {post.type === 'store-item' && post.storeItem && (
              <div className="mb-6">
                <div className="border border-foreground/10 hover:border-accent-coral/50 transition-all duration-300 rounded-lg overflow-hidden bg-secondary/30">
                  <div className="flex gap-4 p-4">
                    {/* Item Image */}
                    {(post.storeItem.image || post.storeItem.artwork) && (
                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={post.storeItem.image || post.storeItem.artwork} 
                          alt={post.storeItem.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-primary line-clamp-1">{post.storeItem.title}</h4>
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">
                          {post.storeItemType === 'merch' ? 'Merch' : post.storeItemType === 'track' ? 'Track' : 'Show'}
                        </Badge>
                      </div>
                      
                      {post.storeItem.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.storeItem.description}
                        </p>
                      )}
                      
                      {/* Price and CTA */}
                      <div className="flex items-center gap-3">
                        <span className="text-accent-coral font-semibold">
                          {post.storeItem.price || `${post.storeItem.fixedPrice || post.storeItem.suggestedPrice}`}
                        </span>
                        
                        {post.storeItem.url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-accent-coral text-accent-coral hover:bg-accent-coral hover:text-background"
                            onClick={() => window.open(post.storeItem.url, '_blank')}
                          >
                            {post.storeItemType === 'concert' ? 'Get Tickets' : post.storeItemType === 'track' ? 'Buy Track' : 'Shop Now'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-accent-coral hover:bg-accent-coral/90 text-background"
                            onClick={() => {
                              toast.success('Opening store...', {
                                description: `View ${post.storeItem.title}`
                              });
                            }}
                          >
                            {post.storeItemType === 'concert' ? 'Get Tickets' : post.storeItemType === 'track' ? 'Buy Track' : 'Shop Now'}
                          </Button>
                        )}
                      </div>
                      
                      {/* Additional Info */}
                      {(post.storeItem.venue || post.storeItem.date || post.storeItem.duration) && (
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                          {post.storeItem.venue && (
                            <span>@ {post.storeItem.venue}</span>
                          )}
                          {post.storeItem.date && (
                            <span>• {new Date(post.storeItem.date).toLocaleDateString()}</span>
                          )}
                          {post.storeItem.duration && (
                            <span>• {post.storeItem.duration}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Actions - Clean Button Row */}
            <footer className="border-t border-foreground/10 pt-4 md:pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Like Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 px-2 md:px-4 transition-all duration-200 ${
                      post.isLiked 
                        ? 'bg-accent-coral/10 text-accent-coral hover:bg-accent-coral/20' 
                        : 'hover:bg-accent-coral/10 hover:text-accent-coral'
                    }`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart className={`w-4 h-4 mr-1 md:mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes > 0 && <span className="text-sm md:text-base">{post.likes}</span>}
                  </Button>
                  
                  {/* Comment Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-10 px-2 md:px-4 transition-all duration-200 ${
                      commentsOpen 
                        ? 'bg-accent-blue/10 text-accent-blue' 
                        : 'hover:bg-accent-blue/10 hover:text-accent-blue'
                    }`}
                    onClick={() => handleToggleComments(post.id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1 md:mr-2" />
                    {commentsCount > 0 && <span className="text-sm md:text-base">{commentsCount}</span>}
                  </Button>
                  
                  {/* Repost Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 px-2 md:px-4 transition-all duration-200 ${
                      post.isReposted 
                        ? 'bg-accent-mint/10 text-accent-mint hover:bg-accent-mint/20' 
                        : 'hover:bg-accent-mint/10 hover:text-accent-mint'
                    }`}
                    onClick={() => handleRepost(post.id)}
                  >
                    <Repeat className={`w-4 h-4 mr-1 md:mr-2 ${post.isReposted ? 'fill-current' : ''}`} />
                    {post.reposts > 0 && <span className="text-sm md:text-base">{post.reposts}</span>}
                  </Button>
                </div>
                
                {/* Share Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 px-2 md:px-4 hover:bg-accent-yellow/10 hover:text-accent-yellow transition-all duration-200"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Post metadata - Clean footer */}
              <div className="mt-4 pt-3 border-t border-foreground/5">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>#{post.id.toString().padStart(6, '0')}</span>
                  <span>{formatTimestamp(post.timestamp)}</span>
                </div>
              </div>
            </footer>
          </div>
          
          {/* Comments Section */}
          <Comments
            postId={post.id}
            comments={post.comments || []}
            user={user}
            onAddComment={handleAddComment}
            onReplyToComment={handleReplyToComment}
            onLikeComment={handleLikeComment}
            isOpen={commentsOpen}
            onToggle={() => handleToggleComments(post.id)}
            onViewArtistProfile={onViewArtistProfile}
            onViewFanProfile={onViewFanProfile}
            mockArtists={mockArtists}
          />
        </div>
      </motion.article>
    );
  }, [currentlyPlaying, bookmarkedPosts, expandedPosts, openComments, handleRepost, handleToggleComments, handleAddComment, handleReplyToComment, handleLikeComment, user]);

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-foreground/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary">Feed</h1>
              <p className="text-sm text-muted-foreground">
                Real music • Real people • No algorithms
              </p>
            </div>
            
            <Button
              onClick={refreshFeed}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-32">
        <AnimatePresence>
          {feedData.map((post) => renderPost(post))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading more content...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}