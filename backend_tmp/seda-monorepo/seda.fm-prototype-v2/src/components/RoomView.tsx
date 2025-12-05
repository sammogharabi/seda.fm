import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  Send, 
  Play, 
  Pause, 
  ThumbsUp, 
  ThumbsDown, 
  Radio,
  Users,
  Music,
  Clock,
  Crown,
  MessageCircle,
  Reply,
  Bookmark,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { DJSessionConfig } from './DJSessionConfig';
import { Comments } from './Comments';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';

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

// Mock messages ordered by newest first (timeline order)
const MOCK_MESSAGES = [
  {
    id: 4,
    type: 'text_post',
    user: { username: 'synth_wave', accentColor: 'yellow' },
    content: 'Anyone know similar tracks to this? Been diving deep into ambient techno lately and looking for more underground gems like this one.',
    timestamp: new Date(Date.now() - 120000),
    likes: 3,
    reposts: 1,
    comments: [],
    isLiked: false,
    isReposted: false
  },
  {
    id: 3,
    type: 'music_share',
    user: { username: 'dj_nova', verified: true, accentColor: 'coral', displayName: 'DJ Nova' },
    content: 'This track absolutely destroyed the dancefloor last night! The build-up around 6:30 is pure magic ✨',
    track: {
      title: 'Strobe',
      artist: 'Deadmau5',
      artwork: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMG11c2ljfGVufDF8fHx8MTc1NTQ4OTcyMnww&ixlib=rb-4.0&q=80&w=300',
      duration: '10:36',
      url: '#'
    },
    timestamp: new Date(Date.now() - 180000),
    likes: 24,
    reposts: 8,
    comments: [],
    isLiked: false,
    isReposted: false
  },
  {
    id: 2,
    type: 'text_post',
    user: { username: 'vinyl_collector', accentColor: 'mint', displayName: 'Vinyl Collector' },
    content: 'Just picked up some rare pressings from the local record shop. The underground scene is alive and thriving! 🔥 Support your local music stores.',
    timestamp: new Date(Date.now() - 240000),
    likes: 8,
    reposts: 2,
    comments: [],
    isLiked: false,
    isReposted: false
  },
  {
    id: 1,
    type: 'music_share',
    user: { username: 'beatmaster_99', accentColor: 'blue', displayName: 'Beat Master' },
    content: 'Classic vibes for late night listening. This album changed everything for me.',
    track: {
      title: 'Midnight City',
      artist: 'M83',
      artwork: 'https://images.unsplash.com/photo-1583927109257-f21c74dd0c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXIlMjBlbGVjdHJvbmljfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.0&q=80&w=300',
      duration: '4:03',
      url: '#'
    },
    timestamp: new Date(Date.now() - 300000),
    likes: 12,
    reposts: 4,
    comments: [
      {
        id: 301,
        user: { username: 'synth_lover', displayName: 'Synth Lover', accentColor: 'mint', verified: false },
        content: 'This is a classic! Love the atmosphere in this track',
        timestamp: new Date(Date.now() - 240000),
        likes: 3,
        isLiked: false,
        replies: []
      }
    ],
    isLiked: false,
    isReposted: false
  }
];

const ROOM_INFO = {
  '#hiphop': { name: 'Hip Hop', description: 'The latest in hip hop culture', members: 1247, color: 'bg-accent-coral' },
  '#electronic': { name: 'Electronic', description: 'Electronic music of all kinds', members: 892, color: 'bg-accent-blue' },
  '#rock': { name: 'Rock', description: 'Rock music through the ages', members: 1456, color: 'bg-accent-mint' },
  '#ambient': { name: 'Ambient', description: 'Chill ambient soundscapes', members: 234, color: 'bg-accent-yellow' }
};

// Mock active DJ sessions data
const ACTIVE_DJ_SESSIONS = {
  '#electronic': {
    isActive: true,
    host: {
      username: 'dj_nova',
      verified: true
    },
    currentTrack: {
      title: 'One More Time',
      artist: 'Daft Punk',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    },
    listeners: 23,
    startedAt: new Date(Date.now() - 1800000) // 30 minutes ago
  },
  '#hiphop': {
    isActive: false
  },
  '#rock': {
    isActive: false
  },
  '#ambient': {
    isActive: true,
    host: {
      username: 'ambient_sage',
      verified: false
    },
    currentTrack: {
      title: 'Weightless',
      artist: 'Marconi Union',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    },
    listeners: 8,
    startedAt: new Date(Date.now() - 900000) // 15 minutes ago
  }
};

export function RoomView({ room, user, onNowPlaying, viewMode = 'member', onJoinRoom, onBackToRooms }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [openComments, setOpenComments] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const roomInfo = ROOM_INFO[room] || { name: room, description: 'Community discussions', members: 0, color: 'bg-accent-coral' };
  const djSession = ACTIVE_DJ_SESSIONS[room];

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      type: 'text_post',
      user: user,
      content: newMessage,
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      comments: [],
      isLiked: false,
      isReposted: false
    };

    setMessages(prev => [message, ...prev]); // Add to beginning for newest first
    setNewMessage('');
    toast.success('Message sent! Earned +2 Points');
  };

  const handleLike = (postId) => {
    setMessages(prev => prev.map(post => {
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
    setMessages(prev => prev.map(post => {
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
    onNowPlaying({ ...track, postId, addedBy: messages.find(p => p.id === postId)?.user });
    toast.success('Now playing! Earned +5 Points');
  };

  const handleToggleComments = (messageId) => {
    setOpenComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleAddComment = useCallback((messageId, content) => {
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

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          comments: [...(msg.comments || []), newComment]
        };
      }
      return msg;
    }));
  }, [user]);

  const handleReplyToComment = useCallback((messageId, parentCommentId, content) => {
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

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
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
          ...msg,
          comments: updateComments(msg.comments || [])
        };
      }
      return msg;
    }));
  }, [user]);

  const handleLikeComment = useCallback((messageId, commentId) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
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
          ...msg,
          comments: updateComments(msg.comments || [])
        };
      }
      return msg;
    }));
  }, []);

  const refreshRoom = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessages(MOCK_MESSAGES);
    setIsRefreshing(false);
    toast.success('Room refreshed!');
  }, []);

  const renderPost = useCallback((post) => {
    const isPlaying = currentlyPlaying?.postId === post.id;
    const isBookmarked = bookmarkedPosts.has(post.id);
    const isExpanded = expandedPosts.has(post.id);
    const shouldTruncate = post.content && post.content.length > 200;
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
          <div className="p-8">
            {/* Editorial Header */}
            <header className="mb-6">
              <div className="flex items-start gap-4">
                {/* Professional User Badge */}
                <div className="relative flex-shrink-0">

                  {post.user.verified && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-yellow border border-background flex items-center justify-center">
                      <Crown className="w-2 h-2 text-background" />
                    </div>
                  )}
                </div>
                
                {/* Clean User Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-1">{post.user.displayName || post.user.username}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>@{post.user.username}</span>
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
            {post.content && (
              <div className="mb-6">
                <div className="prose prose-lg max-w-none">
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
            )}

            {/* Music Share - Professional Card */}
            {post.type === 'music_share' && post.track && (
              <div className="mb-6">
                <div className={`p-6 bg-card border border-foreground/10 relative overflow-hidden rounded-lg ${isPlaying ? 'border-accent-coral' : ''}`}>
                  <div className="flex gap-4">
                    <div className="relative group flex-shrink-0">
                      {/* Album Cover */}
                      <div className="relative">
                        <img 
                          src={post.track.artwork} 
                          alt={post.track.title}
                          className="w-16 h-16 object-cover border border-foreground/20"
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
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary mb-1">{post.track.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{post.track.artist}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{post.track.duration}</span>
                        </div>
                        {isPlaying && (
                          <div className="flex items-center gap-2 text-sm text-accent-coral">
                            <Music className="w-4 h-4" />
                            <span>Playing</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Actions - Clean Button Row */}
            <footer className="border-t border-foreground/10 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 px-4 transition-all duration-200 ${
                      post.isLiked 
                        ? 'bg-accent-coral/10 text-accent-coral hover:bg-accent-coral/20' 
                        : 'hover:bg-accent-coral/10 hover:text-accent-coral'
                    } ${viewMode === 'preview' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={viewMode === 'member' ? () => handleLike(post.id) : undefined}
                    disabled={viewMode === 'preview'}
                  >
                    <ThumbsUp className={`w-4 h-4 mr-2 ${post.isLiked ? 'fill-current' : ''}`} />
                    {post.likes > 0 && <span>{post.likes}</span>}
                  </Button>
                  
                  {/* Comment Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-10 px-4 transition-all duration-200 ${
                      commentsOpen 
                        ? 'bg-accent-blue/10 text-accent-blue' 
                        : 'hover:bg-accent-blue/10 hover:text-accent-blue'
                    } ${viewMode === 'preview' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={viewMode === 'member' ? () => handleToggleComments(post.id) : undefined}
                    disabled={viewMode === 'preview'}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {commentsCount > 0 && <span>{commentsCount}</span>}
                  </Button>
                  
                  {/* Repost Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-10 px-4 transition-all duration-200 ${
                      post.isReposted 
                        ? 'bg-accent-mint/10 text-accent-mint hover:bg-accent-mint/20' 
                        : 'hover:bg-accent-mint/10 hover:text-accent-mint'
                    } ${viewMode === 'preview' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={viewMode === 'member' ? () => handleRepost(post.id) : undefined}
                    disabled={viewMode === 'preview'}
                  >
                    <Reply className={`w-4 h-4 mr-2 ${post.isReposted ? 'fill-current' : ''}`} />
                    {post.reposts > 0 && <span>{post.reposts}</span>}
                  </Button>
                </div>
                
                {/* Share Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 px-4 hover:bg-accent-yellow/10 hover:text-accent-yellow transition-all duration-200"
                >
                  <Music className="w-4 h-4" />
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
          {viewMode === 'member' && (
            <Comments
              postId={post.id}
              comments={post.comments || []}
              user={user}
              onAddComment={handleAddComment}
              onReplyToComment={handleReplyToComment}
              onLikeComment={handleLikeComment}
              isOpen={commentsOpen}
              onToggle={() => handleToggleComments(post.id)}
            />
          )}
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
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${roomInfo.color} border border-foreground/20 flex items-center justify-center`}>
                <span className="text-background font-black text-lg">{room[1].toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-primary">{roomInfo.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {roomInfo.members.toLocaleString()} members • Music community room
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {viewMode === 'preview' && (
                <div className="flex items-center gap-2 text-sm text-accent-mint bg-accent-mint/10 px-3 py-1 rounded-full border border-accent-mint/20">
                  <span>👁️</span>
                  <span>Preview Mode</span>
                </div>
              )}
              
              {djSession?.isActive && (
                <div className="flex items-center gap-2 text-sm text-accent-coral">
                  <Radio className="w-4 h-4" />
                  <span>Live • {djSession.listeners} listening</span>
                </div>
              )}
              
              <Button
                onClick={refreshRoom}
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
      </div>

      {/* Active DJ Session Banner */}
      {djSession?.isActive && (
        <div className="bg-accent-coral text-background border-b border-foreground/10">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/20 border border-background/30 flex items-center justify-center">
                  <span className="text-background font-semibold">
                    {djSession.host.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{djSession.host.username} is live</p>
                  <p className="text-sm text-background/80">
                    Now Playing: {djSession.currentTrack.title} - {djSession.currentTrack.artist}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="secondary" size="sm" className="bg-background/20 text-background border-background/30 hover:bg-background/30">
                  <Radio className="w-4 h-4 mr-2" />
                  Join Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Input - Top Position OR Join Room Prompt */}
      <div className="bg-background border-b border-foreground/10 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          {viewMode === 'member' ? (
            <div className="bg-card border border-accent-coral/30 rounded-xl p-6 shadow-lg ring-1 ring-accent-coral/20">
              <div className="flex gap-4">
                {/* User Badge */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 ${getAccentClasses(user.accentColor || 'coral').bg} border border-foreground/20 flex items-center justify-center`}>
                    <span className="text-background font-semibold">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Input Container */}
                <div className="flex-1">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Share your thoughts in ${roomInfo.name}...`}
                    className="min-h-[60px] mb-3 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                    
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-accent-coral hover:bg-accent-coral/90 text-background"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Join Room Prompt for Preview Mode */
            <div className="bg-card border border-accent-mint/30 rounded-xl p-6 shadow-lg ring-1 ring-accent-mint/20">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-accent-mint/20 border border-accent-mint/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-accent-mint" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Join {roomInfo.name}</h3>
                  <p className="text-muted-foreground">
                    You're viewing this room as a guest. Join to participate in discussions, share music, and connect with the community.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => onJoinRoom && onJoinRoom({ id: room, name: roomInfo.name })}
                    className="bg-accent-mint hover:bg-accent-mint/90 text-background flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join Room
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={onBackToRooms}
                    className="border-accent-mint/30 text-accent-mint hover:bg-accent-mint/10"
                  >
                    Back to Rooms
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Posts Timeline */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="space-y-8">
          <AnimatePresence>
            {messages.map(renderPost)}
          </AnimatePresence>
          
          {/* Preview Mode Footer Message */}
          {viewMode === 'preview' && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="bg-accent-mint/10 border border-accent-mint/20 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-3">
                  Join {roomInfo.name} to like, comment, and share music with the community
                </p>
                <Button 
                  onClick={() => onJoinRoom && onJoinRoom({ id: room, name: roomInfo.name })}
                  size="sm"
                  className="bg-accent-mint hover:bg-accent-mint/90 text-background"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}