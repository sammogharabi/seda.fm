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
  UserPlus,
  Loader2
} from 'lucide-react';
import { DJSessionConfig } from './DJSessionConfig';
import { Comments } from './Comments';
import { toast } from 'sonner@2.0.3';
import { motion, AnimatePresence } from 'motion/react';
import { roomsApi, type Room, type RoomMessage } from '../lib/api';

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

interface RoomViewProps {
  roomId: string;
  user: any;
  onNowPlaying?: (track: any) => void;
  viewMode?: 'member' | 'owner';
  onJoinRoom?: (room: any) => void;
  onBackToRooms: () => void;
  onJoinSession?: (sessionId: string) => void;
}

export function RoomView({ roomId, user, onNowPlaying, viewMode = 'member', onJoinRoom, onBackToRooms, onJoinSession }: RoomViewProps) {
  // API data state
  const [roomData, setRoomData] = useState<Room | null>(null);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [newMessage, setNewMessage] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [openComments, setOpenComments] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInSession, setIsInSession] = useState(false); // Track if user is in the session
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch room data on mount
  useEffect(() => {
    async function fetchRoom() {
      try {
        setLoading(true);
        setError(null);
        const room = await roomsApi.getById(roomId);
        setRoomData(room);
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room. Please try again.');
        toast.error('Failed to load room');
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId]);

  // Fetch messages on mount and when room changes
  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await roomsApi.getMessages(roomId, { limit: 50 });
        setMessages(Array.isArray(response?.messages) ? response.messages : []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        toast.error('Failed to load messages');
      }
    }
    if (roomId) {
      fetchMessages();
    }
  }, [roomId]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!roomId) return;

    const interval = setInterval(async () => {
      try {
        const response = await roomsApi.getMessages(roomId, { limit: 50 });
        setMessages(Array.isArray(response?.messages) ? response.messages : []);
      } catch (err) {
        console.error('Error polling messages:', err);
        // Don't show toast on polling errors to avoid spam
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  const roomInfo = roomData ? {
    name: roomData.name,
    description: roomData.description || 'Community discussions',
    members: roomData._count?.memberships || 0,
    color: 'bg-accent-coral'
  } : { name: 'Loading...', description: '', members: 0, color: 'bg-accent-coral' };
  const djSession = null; // Sessions not implemented yet

  // Get session data from roomData prop (passed from RoomsView)
  const sessionData = roomData?.session;

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const message = await roomsApi.sendMessage(roomId, { content: newMessage });
      setMessages(prev => [message, ...prev]); // Add to beginning for newest first
      setNewMessage('');
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
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

  const handleJoinSession = useCallback(() => {
    if (onJoinSession && sessionData) {
      // Call the parent handler to navigate to DJ Mode
      onJoinSession(sessionData);
      setIsInSession(true);
    } else {
      // Fallback if no handler provided
      setIsInSession(true);
      toast.success(`Joined ${roomInfo.name} session! You can now play and queue tracks.`);
    }
  }, [onJoinSession, sessionData, roomInfo.name]);

  const handleLeaveSession = useCallback(() => {
    setIsInSession(false);
    toast.success('Left the session');
  }, []);

  const renderPost = useCallback((post: RoomMessage) => {
    const isPlaying = currentlyPlaying?.postId === post.id;
    const isBookmarked = bookmarkedPosts.has(post.id);
    const isExpanded = expandedPosts.has(post.id);
    const content = post.text || '';
    const shouldTruncate = content.length > 200;
    const commentsOpen = openComments.has(post.id);
    const commentsCount = 0; // Comments not implemented yet
    const timestamp = new Date(post.createdAt);

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
                  {/* User avatar placeholder */}
                </div>

                {/* Clean User Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {post.user.profile?.displayName || post.user.profile?.username || 'Unknown User'}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>@{post.user.profile?.username || 'unknown'}</span>
                    <span>•</span>
                    <span>{formatTimestamp(timestamp)}</span>
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
            {content && (
              <div className="mb-6">
                <div className="prose prose-lg max-w-none">
                  <p className="text-foreground leading-relaxed">
                    {shouldTruncate && !isExpanded ? (
                      <>
                        {content.substring(0, 200)}...
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
                        {content}
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
            {post.type === 'TRACK' && post.trackRef && (
              <div className="mb-6">
                <div className={`p-6 bg-card border border-foreground/10 relative overflow-hidden rounded-lg ${isPlaying ? 'border-accent-coral' : ''}`}>
                  <div className="flex gap-4">
                    <div className="relative group flex-shrink-0">
                      {/* Album Cover */}
                      <div className="relative">
                        <img
                          src={post.trackRef?.artwork}
                          alt={post.trackRef?.title}
                          className="w-16 h-16 object-cover border border-foreground/20"
                          loading="lazy"
                        />
                        {/* Play button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute inset-0 bg-black/60 hover:bg-black/80 border-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          onClick={() => handlePlayTrack(post.trackRef, post.id)}
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
                      <h4 className="font-semibold text-primary mb-1">{post.trackRef?.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{post.trackRef?.artist}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{post.trackRef?.duration}</span>
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

            {/* Message metadata footer */}
            <footer className="border-t border-foreground/10 pt-4 mt-4">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{formatTimestamp(timestamp)}</span>
              </div>
            </footer>
          </div>
        </div>
      </motion.article>
    );
  }, [currentlyPlaying, bookmarkedPosts, expandedPosts]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-500 mb-4">{error || 'Room not found'}</p>
          <Button onClick={onBackToRooms}>
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-foreground/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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

      {/* Room Session Banner */}
      {sessionData && (
        <div className={`${sessionData.isActive ? 'bg-accent-yellow' : 'bg-accent-blue/20'} ${sessionData.isActive ? 'text-background' : 'text-foreground'} border-b border-foreground/10`}>
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                {sessionData.isActive ? (
                  <>
                    <div className={`w-10 h-10 ${sessionData.isActive ? 'bg-background/20 border-background/30' : 'bg-accent-blue border-accent-blue/30'} border flex items-center justify-center`}>
                      <Radio className={`w-5 h-5 ${sessionData.isActive ? 'text-background' : 'text-background'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Session Active</p>
                        <Badge className="bg-background/20 text-background border-background/30 text-xs">
                          LIVE
                        </Badge>
                      </div>
                      {sessionData.nowPlaying ? (
                        <p className={`text-sm ${sessionData.isActive ? 'text-background/80' : 'text-muted-foreground'}`}>
                          Now Playing: {sessionData.nowPlaying.title} - {sessionData.nowPlaying.artist}
                        </p>
                      ) : (
                        <p className={`text-sm ${sessionData.isActive ? 'text-background/80' : 'text-muted-foreground'}`}>
                          {sessionData.activeListeners} listener{sessionData.activeListeners !== 1 ? 's' : ''} • {sessionData.queueLength} track{sessionData.queueLength !== 1 ? 's' : ''} in queue
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-muted border border-foreground/20 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Session Inactive</p>
                      <p className="text-sm text-muted-foreground">
                        Be the first to start playing music
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-right mr-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{sessionData.activeListeners}</span>
                  </div>
                  <p className={`text-xs ${sessionData.isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {sessionData.activeListeners === 1 ? 'listener' : 'listeners'}
                  </p>
                </div>
                {!isInSession ? (
                  <Button
                    onClick={handleJoinSession}
                    size="sm"
                    className={`${sessionData.isActive ? 'bg-background text-accent-yellow hover:bg-background/90' : 'bg-accent-blue text-background hover:bg-accent-blue/90'}`}
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                ) : (
                  <Button
                    onClick={handleLeaveSession}
                    variant="outline"
                    size="sm"
                    className={`${sessionData.isActive ? 'border-background/30 text-background hover:bg-background/20' : 'border-foreground/20'}`}
                  >
                    Leave Session
                  </Button>
                )}
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
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-accent-blue hover:bg-accent-blue/90 text-background"
                    >
                      {sendingMessage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Join Room Prompt for Preview Mode */
            <div className="bg-card border border-accent-yellow/30 rounded-xl p-6 shadow-lg ring-1 ring-accent-yellow/20">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-accent-yellow/20 border border-accent-yellow/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-accent-yellow" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Join {roomInfo.name}</h3>
                  <p className="text-muted-foreground">
                    You're viewing this room as a guest. Join to participate in discussions, share music, and connect with the community.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => onJoinRoom && onJoinRoom({ id: room, name: roomInfo.name })}
                    className="bg-accent-yellow hover:bg-accent-yellow/90 text-background flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join Room
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onBackToRooms}
                    className="border-accent-yellow/30 text-accent-yellow hover:bg-accent-yellow/10"
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
            {Array.isArray(messages) && messages.map(renderPost)}
          </AnimatePresence>

          {/* Preview Mode Footer Message */}
          {viewMode === 'preview' && Array.isArray(messages) && messages.length > 0 && (
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