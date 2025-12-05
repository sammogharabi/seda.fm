import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

const MOCK_FEED_DATA = [
  {
    id: 1,
    type: 'music_share',
    user: { 
      username: 'dj_nova', 
      displayName: 'DJ Nova',
      accentColor: 'coral',
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
      accentColor: 'blue'
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
    comments: 15,
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

export function SocialFeed({ user, onNowPlaying, onStartDJ, posts = [], onFollowUser, onUnfollowUser, isFollowing }) {
  const [feedData, setFeedData] = useState([...posts, ...MOCK_FEED_DATA]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewCounts, setViewCounts] = useState(new Map());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [expandedPosts, setExpandedPosts] = useState(new Set());

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

  const handlePlayTrack = (track, postId) => {
    setCurrentlyPlaying({ ...track, postId });
    onNowPlaying({ ...track, postId, addedBy: feedData.find(p => p.id === postId)?.user });
    toast.success('Now playing! Earned +5 DJ Points');
  };

  const refreshFeed = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFeedData([...posts, ...MOCK_FEED_DATA]);
    setIsRefreshing(false);
    toast.success('Feed refreshed!');
  }, [posts]);

  const renderPost = useCallback((post) => {
    const isPlaying = currentlyPlaying?.postId === post.id;
    const isBookmarked = bookmarkedPosts.has(post.id);
    const isExpanded = expandedPosts.has(post.id);
    const shouldTruncate = post.content.length > 200;

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 20, rotate: Math.random() * 4 - 2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        className="relative mb-8"
      >
        {/* Tape/Sticker Effects */}
        <div className="absolute -top-2 left-4 w-16 h-6 bg-accent-yellow border border-accent-yellow transform -rotate-12 z-10 opacity-80"></div>
        <div className="absolute -top-2 right-8 w-12 h-6 bg-accent-mint border border-accent-mint transform rotate-6 z-10 opacity-80"></div>
        
        {/* Main Card - Music Memorabilia Style */}
        <div className={`bg-card border-2 border-foreground shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden ${
          Math.random() > 0.5 ? 'transform rotate-1' : 'transform -rotate-1'
        }`}>
          {/* Paper texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-background/10 pointer-events-none"></div>
          
          <div className="p-6 relative">
            {/* Backstage Pass Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                {/* Laminated ID Badge */}
                <div className="relative">
                  <div className={`w-14 h-20 ${getAccentClasses(post.user.accentColor).bg} border-2 border-foreground relative overflow-hidden shadow-lg`}>
                    {/* Photo area */}
                    <div className="h-12 bg-background/20 flex items-center justify-center border-b border-foreground/20">
                      <span className="text-background font-black text-xl">{post.user.username[0].toUpperCase()}</span>
                    </div>
                    {/* Info strip */}
                    <div className="h-8 bg-background text-foreground flex items-center justify-center">
                      <span className="font-mono text-xs font-black">
                        {post.user.verified ? 'VIP' : 'FAN'}
                      </span>
                    </div>
                    {/* Lanyard hole */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-foreground rounded-full"></div>
                  </div>
                  {post.user.verified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent-yellow border-2 border-foreground rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-background" />
                    </div>
                  )}
                </div>
                
                {/* User Info - Concert Poster Style */}
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="font-black text-xl uppercase tracking-tight">{post.user.displayName || post.user.username}</h3>
                    <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground uppercase tracking-wider">
                      <span>@{post.user.username}</span>
                      <span>•</span>
                      <span>{formatTimestamp(post.timestamp)}</span>
                      <div className={`w-3 h-3 ${getAccentClasses(post.user.accentColor).bg} rounded-full`} />
                    </div>
                  </div>
                  {/* Scene Tag */}
                  <div className={`inline-block px-3 py-1 ${getAccentClasses(post.user.accentColor).bgSubtle} ${getAccentClasses(post.user.accentColor).border} border text-xs font-mono uppercase tracking-wide`}>
                    UNDERGROUND SCENE
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-8 px-2"
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

            {/* Post Content - Zine Article Style */}
            <div className="mb-6">
              <div className="bg-foreground/5 border-l-4 border-accent-blue p-4">
                <blockquote className="text-base leading-relaxed font-medium italic text-foreground">
                  "{shouldTruncate && !isExpanded ? (
                    <>
                      {post.content.substring(0, 200)}...
                      <button 
                        onClick={() => setExpandedPosts(prev => {
                          const newSet = new Set(prev);
                          newSet.add(post.id);
                          return newSet;
                        })}
                        className="text-accent-blue hover:text-accent-blue/80 ml-2 font-black text-sm underline"
                      >
                        READ MORE
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
                          className="text-accent-blue hover:text-accent-blue/80 ml-2 font-black text-sm underline"
                        >
                          COLLAPSE
                        </button>
                      )}
                    </>
                  )}"
                </blockquote>
              </div>
            </div>

            {/* Music Share - Vinyl Record Style */}
            {post.type === 'music_share' && post.track && (
              <motion.div 
                className="mb-6 relative"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                {/* Vinyl record decorations */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-foreground rounded-full opacity-20"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-accent-coral rounded-full opacity-30"></div>
                
                {/* Album Card - Polaroid Style */}
                <div className={`p-4 bg-card border-2 border-foreground relative overflow-hidden ${isPlaying ? 'shadow-xl shadow-accent-coral/30' : 'shadow-lg'}`}>
                  <div className="bg-foreground/5 p-3 mb-3">
                    <div className="flex gap-4">
                      <div className="relative group">
                        {/* Album Cover */}
                        <div className="relative">
                          <motion.img 
                            src={post.track.artwork} 
                            alt={post.track.title}
                            className="w-24 h-24 object-cover border-2 border-foreground"
                            loading="lazy"
                            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                            transition={isPlaying ? { duration: 10, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
                          />
                          {/* Vinyl center hole */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-foreground rounded-full"></div>
                          </div>
                          {/* Play button */}
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
                          {/* Now playing indicator */}
                          {isPlaying && (
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-coral rounded-full animate-pulse shadow-lg" />
                          )}
                        </div>
                      </div>
                      
                      {/* Track Info - Record Label Style */}
                      <div className="flex-1">
                        <div className="border-b border-foreground/20 pb-2 mb-3">
                          <h4 className="font-black text-xl uppercase tracking-tight">{post.track.title}</h4>
                          <p className="font-mono text-base text-muted-foreground uppercase">{post.track.artist}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{post.track.duration}</span>
                          </div>
                          {isPlaying && (
                            <div className="flex items-center gap-2 text-sm text-accent-coral font-mono uppercase font-black">
                              <Volume2 className="w-4 h-4 animate-pulse" />
                              <span>NOW SPINNING</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Handwritten caption */}
                  <div className="text-sm text-muted-foreground font-mono italic text-center">
                    "Discovered in the underground scene..."
                  </div>
                </div>
              </motion.div>
            )}

            {/* DJ Session - Event Poster Style */}
            {post.type === 'dj_session' && post.djSession && (
              <motion.div 
                className={`mb-6 p-6 ${getAccentClasses(post.user.accentColor).bg} text-background border-2 border-foreground relative`}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <div className="font-mono text-xs text-background/80 mb-2 uppercase tracking-wider">
                    LIVE • TONIGHT • UNDERGROUND
                  </div>
                  <h4 className="text-2xl font-black uppercase mb-2">{post.djSession.title}</h4>
                  <div className="text-4xl font-black mb-2">🎧</div>
                  <p className="text-background/90 mb-4">{post.djSession.genre} • {post.djSession.expectedDuration}</p>
                  
                  <Button 
                    size="sm" 
                    className="bg-background text-foreground hover:bg-background/90 font-black uppercase tracking-wide border-2 border-background"
                    onClick={() => onStartDJ?.(true)}
                  >
                    JOIN SESSION
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Engagement Actions - Venue Stamp Style */}
            <div className="border-t-2 border-foreground/20 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Like Button - Heart Stamp */}
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-10 px-4 font-mono text-xs uppercase transition-all duration-200 border-2 ${
                        post.isLiked 
                          ? 'border-accent-coral bg-accent-coral text-background' 
                          : 'border-foreground/20 hover:border-accent-coral hover:bg-accent-coral/10'
                      }`}
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
                  
                  {/* Comment Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 px-4 font-mono text-xs uppercase border-2 border-foreground/20 hover:border-accent-blue hover:bg-accent-blue/10 transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {post.comments > 0 && <span>{post.comments}</span>}
                  </Button>
                  
                  {/* Repost Button */}
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-10 px-4 font-mono text-xs uppercase transition-all duration-200 border-2 ${
                        post.isReposted 
                          ? 'border-accent-mint bg-accent-mint text-background' 
                          : 'border-foreground/20 hover:border-accent-mint hover:bg-accent-mint/10'
                      }`}
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
                
                {/* Share Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 px-4 font-mono text-xs uppercase border-2 border-foreground/20 hover:border-accent-yellow hover:bg-accent-yellow/10 transition-all duration-200"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Post metadata - Receipt style */}
              <div className="mt-4 pt-3 border-t border-dashed border-foreground/20">
                <div className="flex justify-between items-center font-mono text-xs text-muted-foreground">
                  <span>POST #{post.id.toString().padStart(6, '0')}</span>
                  <span>{formatTimestamp(post.timestamp).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }, [currentlyPlaying, bookmarkedPosts, expandedPosts, handleRepost]);

  return (
    <div className="min-h-screen bg-background">
      {/* Zine Header */}
      <div className="sticky top-0 z-40 bg-background border-b-2 border-foreground">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-coral border-2 border-foreground flex items-center justify-center">
              <Music className="w-4 h-4 text-background" />
            </div>
            <div>
              <h1 className="font-black text-lg uppercase tracking-tight">Underground Feed</h1>
              <div className="font-mono text-xs text-muted-foreground uppercase">
                Real music • Real people • Real underground
              </div>
            </div>
          </div>
          
          <Button
            onClick={refreshFeed}
            variant="outline"
            size="sm"
            className="border-2 border-foreground font-mono uppercase text-xs"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Feed Content */}
      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="max-w-2xl mx-auto p-6">
          <AnimatePresence>
            {feedData.map(renderPost)}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading more underground content...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}