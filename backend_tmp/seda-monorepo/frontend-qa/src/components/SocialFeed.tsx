import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
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
  MoreHorizontal,
  Bookmark,
  TrendingUp,
  Volume2,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'framer-motion';
import { motionTokens } from '../styles/motion';

const MOCK_FEED_DATA = [
  {
    id: 1,
    type: 'music_share',
    user: { 
      username: 'dj_nova', 
      displayName: 'DJ Nova',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova', 
      verified: true 
    },
    content: 'This track has been on repeat all week! Perfect vibes for late night sessions 🌙',
    track: {
      title: 'Midnight City',
      artist: 'M83',
      artwork: 'https://images.unsplash.com/photo-1583927109257-f21c74dd0c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXIlMjBlbGVjdHJvbmljfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
      duration: '4:03'
    },
    timestamp: new Date(Date.now() - 300000),
    likes: 24,
    reposts: 3,
    comments: 8,
    isLiked: false,
    isReposted: false
  },
  {
    id: 2,
    type: 'text_post',
    user: { 
      username: 'beatmaster_99', 
      displayName: 'Beat Master',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaster' 
    },
    content: 'Just finished my first DJ set at the underground venue downtown! The crowd was absolutely electric. Thank you to everyone who showed up and vibed with me 🙏✨\n\nNext set: Friday 9PM at #ElectronicLounge',
    timestamp: new Date(Date.now() - 1800000),
    likes: 56,
    reposts: 12,
    comments: 23,
    isLiked: true,
    isReposted: false
  },
  {
    id: 3,
    type: 'dj_session',
    user: { 
      username: 'vinyl_collector', 
      displayName: 'Vinyl Collector',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinyl' 
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
    comments: 15,
    isLiked: false,
    isReposted: true
  },
  {
    id: 4,
    type: 'music_share',
    user: { 
      username: 'synth_wave', 
      displayName: 'Synth Wave',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=synth' 
    },
    content: 'Found this hidden gem! Perfect for those chilly autumn nights 🍂',
    track: {
      title: 'Strobe',
      artist: 'Deadmau5',
      artwork: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMG11c2ljfGVufDF8fHx8MTc1NTQ4OTcyMnww&ixlib=rb-4.1.0&q=80&w=300',
      duration: '10:36'
    },
    timestamp: new Date(Date.now() - 7200000),
    likes: 31,
    reposts: 5,
    comments: 12,
    isLiked: false,
    isReposted: false
  },
  {
    id: 5,
    type: 'playlist_share',
    user: { 
      username: 'ambient_dreams', 
      displayName: 'Ambient Dreams',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ambient' 
    },
    content: 'Curated a new playlist for deep focus sessions. 2 hours of pure flow state ✨',
    playlist: {
      title: 'Deep Focus Flow',
      trackCount: 24,
      duration: '2h 17m',
      artwork: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFtYmllbnQlMjBwbGF5bGlzdHxlbnwxfHx8fDE3NTU1MjM2Nzh8MA&ixlib=rb-4.1.0&q=80&w=300'
    },
    timestamp: new Date(Date.now() - 10800000),
    likes: 42,
    reposts: 18,
    comments: 6,
    isLiked: true,
    isReposted: false
  }
];

export function SocialFeed({ user, onNowPlaying, onStartDJ, posts = [], onFollowUser, onUnfollowUser, isFollowing }) {
  const [feedData, setFeedData] = useState([...posts, ...MOCK_FEED_DATA]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewCounts, setViewCounts] = useState(new Map());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const feedEndRef = useRef(null);
  const observerRef = useRef(null);

  // Update feed when new posts are added
  React.useEffect(() => {
    setFeedData([...posts, ...MOCK_FEED_DATA]);
  }, [posts]);

  useEffect(() => {
    // Auto-scroll to new posts
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedData]);

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
    
    toast.success('Reposted! Earned +2 DJ Points');
  }, []);

  const handleBookmark = useCallback((postId) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast.success('Removed from bookmarks');
      } else {
        newSet.add(postId);
        toast.success('Added to bookmarks');
      }
      return newSet;
    });
  }, []);

  const handleToggleExpand = useCallback((postId) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  const handleViewPost = useCallback((postId) => {
    setViewCounts(prev => {
      const newMap = new Map(prev);
      newMap.set(postId, (newMap.get(postId) || 0) + 1);
      return newMap;
    });
  }, []);

  const refreshFeed = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFeedData([...posts, ...MOCK_FEED_DATA]);
    setIsRefreshing(false);
    toast.success('Feed refreshed!');
  }, [posts]);

  const loadMorePosts = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    // Simulate loading more posts
    await new Promise(resolve => setTimeout(resolve, 1000));
    const morePosts = MOCK_FEED_DATA.map(post => ({
      ...post,
      id: post.id + 1000,
      timestamp: new Date(Date.now() - Math.random() * 86400000)
    }));
    setFeedData(prev => [...prev, ...morePosts]);
    setIsLoading(false);
  }, [isLoading]);

  const handlePlayTrack = (track, postId) => {
    setCurrentlyPlaying({ ...track, postId });
    onNowPlaying({ ...track, postId, addedBy: feedData.find(p => p.id === postId)?.user });
    toast.success('Now playing! Earned +5 DJ Points');
  };

  // Intersection Observer for infinite scroll and view tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const postId = entry.target.getAttribute('data-post-id');
            if (postId) {
              handleViewPost(parseInt(postId));
            }
          }
        });
        
        // Load more when last item is visible
        const lastEntry = entries[entries.length - 1];
        if (lastEntry?.isIntersecting && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );
    
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [handleViewPost, loadMorePosts, isLoading]);

  const memoizedPosts = useMemo(() => feedData, [feedData]);

  const renderPost = useCallback((post) => {
    const isPlaying = currentlyPlaying?.postId === post.id;
    const isBookmarked = bookmarkedPosts.has(post.id);
    const isExpanded = expandedPosts.has(post.id);
    const viewCount = viewCounts.get(post.id) || 0;
    const shouldTruncate = post.content.length > 200;

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: motionTokens.cardEnter.duration, ease: motionTokens.cardEnter.easing }}
        data-post-id={post.id}
        ref={(el) => {
          if (el && observerRef.current) {
            observerRef.current.observe(el);
          }
        }}
      >
        <Card className="border border-border hover:border-ring/20 shadow-sm hover:shadow-lg transition-all duration-300 bg-card group">
          <CardContent className="p-6">
          {/* User Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-11 h-11 shadow-sm">
                <AvatarImage src={post.user.avatar} />
                <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.user.displayName || post.user.username}</span>
                  {post.user.verified && <Crown className="w-4 h-4 text-ring" />}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>@{post.user.username}</span>
                  <span>•</span>
                  <span>{formatTimestamp(post.timestamp)}</span>
                </div>
              </div>
            </div>
            
            {/* Action Menu & Follow Button */}
            <div className="flex items-center gap-2">
              {/* View Count */}
              {viewCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3 h-3" />
                  <span>{viewCount}</span>
                </div>
              )}

              {/* Follow Button - Only show if not current user and follow functions exist */}
              {post.user.username !== user.username && onFollowUser && onUnfollowUser && isFollowing && (
                <div>
                  {isFollowing(post.user.id) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onUnfollowUser(post.user.id)}
                    >
                      <UserMinus className="w-3 h-3 mr-1" />
                      Unfollow
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="text-xs h-8 px-3 bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onFollowUser(post.user)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Follow
                    </Button>
                  )}
                </div>
              )}

              {/* Bookmark Button */}
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleBookmark(post.id)}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-ring' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {shouldTruncate && !isExpanded ? (
                <>
                  {post.content.substring(0, 200)}...
                  <button 
                    onClick={() => handleToggleExpand(post.id)}
                    className="text-ring hover:text-ring/80 ml-2 font-medium text-sm"
                  >
                    Show more
                  </button>
                </>
              ) : (
                <>
                  {post.content}
                  {shouldTruncate && isExpanded && (
                    <button 
                      onClick={() => handleToggleExpand(post.id)}
                      className="text-ring hover:text-ring/80 ml-2 font-medium text-sm"
                    >
                      Show less
                    </button>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Media Content */}
          {post.type === 'music_share' && post.track && (
            <motion.div 
              className={`mb-4 p-4 bg-gradient-to-br from-secondary/20 to-secondary/40 rounded-xl border-2 transition-all duration-300 backdrop-blur-sm ${isPlaying ? 'border-ring shadow-xl shadow-ring/20 bg-ring/5' : 'border-transparent hover:border-ring/20'}`}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-4">
                <div className="relative group">
                  <motion.img 
                    src={post.track.artwork} 
                    alt={post.track.title}
                    className="w-16 h-16 rounded-lg object-cover shadow-lg"
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute inset-0 bg-black/50 hover:bg-black/70 border-0 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                    onClick={() => handlePlayTrack(post.track, post.id)}
                  >
                    {isPlaying ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Pause className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  {isPlaying && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-ring rounded-full animate-pulse shadow-lg" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium mb-1 group-hover:text-ring transition-colors">{post.track.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{post.track.artist}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{post.track.duration}</span>
                    </div>
                    {isPlaying && (
                      <div className="flex items-center gap-1 text-xs text-ring">
                        <Volume2 className="w-3 h-3 animate-pulse" />
                        <span>Now Playing</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {post.type === 'dj_session' && post.djSession && (
            <motion.div 
              className="mb-4 p-4 bg-gradient-to-br from-ring/10 to-ring/20 rounded-xl border border-ring/30 relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ring/5" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1 flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Mic className="w-4 h-4 text-ring" />
                    </motion.div>
                    {post.djSession.title}
                    <Badge variant="secondary" className="text-xs bg-ring/20 text-ring">
                      LIVE
                    </Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">{post.djSession.genre} • {post.djSession.expectedDuration}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{post.djSession.listeners} listening</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-ring">
                      <Zap className="w-3 h-3" />
                      <span>Live Session</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-ring text-ring-foreground hover:bg-ring/90 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => onStartDJ?.(true)}
                >
                  Join Session
                </Button>
              </div>
            </motion.div>
          )}

          {post.type === 'playlist_share' && post.playlist && (
            <motion.div 
              className="mb-4 p-4 bg-gradient-to-br from-secondary/20 to-secondary/40 rounded-xl border border-secondary hover:border-ring/20 transition-all duration-300"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-4">
                <motion.img 
                  src={post.playlist.artwork} 
                  alt={post.playlist.title}
                  className="w-16 h-16 rounded-lg object-cover shadow-lg"
                  loading="lazy"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
                <div className="flex-1">
                  <h4 className="font-medium mb-1 group-hover:text-ring transition-colors">{post.playlist.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{post.playlist.trackCount} tracks • {post.playlist.duration}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="text-xs hover:border-ring hover:text-ring transition-all duration-200">
                      <Play className="w-3 h-3 mr-1" />
                      Play Playlist
                    </Button>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-1">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs h-8 px-3 transition-all duration-200 ${post.isLiked ? 'text-destructive hover:text-destructive bg-destructive/10' : 'hover:text-destructive hover:bg-destructive/10'}`}
                  onClick={() => handleLike(post.id)}
                >
                  <motion.div
                    animate={post.isLiked ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                  </motion.div>
                  {post.likes > 0 && <span>{post.likes}</span>}
                </Button>
              </motion.div>
              
              <Button variant="ghost" size="sm" className="text-xs h-8 px-3 hover:text-primary hover:bg-primary/10 transition-all duration-200">
                <MessageCircle className="w-4 h-4 mr-2" />
                {post.comments > 0 && <span>{post.comments}</span>}
              </Button>
              
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs h-8 px-3 transition-all duration-200 ${post.isReposted ? 'text-chart-2 hover:text-chart-2 bg-chart-2/10' : 'hover:text-chart-2 hover:bg-chart-2/10'}`}
                  onClick={() => handleRepost(post.id)}
                >
                  <motion.div
                    animate={post.isReposted ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Repeat className={`w-4 h-4 mr-2 ${post.isReposted ? 'fill-current' : ''}`} />
                  </motion.div>
                  {post.reposts > 0 && <span>{post.reposts}</span>}
                </Button>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 px-3 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                onClick={() => handleBookmark(post.id)}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-ring' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 px-3 hover:text-primary hover:bg-primary/10 transition-all duration-200">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    );
  }, [currentlyPlaying, bookmarkedPosts, expandedPosts, viewCounts, handleLike, handleRepost, handleBookmark, handleToggleExpand, handlePlayTrack, onFollowUser, onUnfollowUser, isFollowing, user.username, onStartDJ]);

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium">Home</h1>
            <p className="text-sm text-muted-foreground mt-1">Discover what your friends are sharing</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshFeed}
            disabled={isRefreshing}
            className="hover:border-ring hover:text-ring transition-all duration-200"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {memoizedPosts.map(renderPost)}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={`skeleton-${i}`} className="border border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Skeleton className="w-11 h-11 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div ref={feedEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
