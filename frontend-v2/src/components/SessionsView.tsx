import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { AddToQueueModal } from './AddToQueueModal';
import { CreateSessionModal } from './CreateSessionModal';
import { DJMode } from './DJMode';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

import {
  Play,
  Pause,
  Users,
  Crown,
  Music,
  Radio,
  Clock,
  Volume2,
  Heart,
  MessageCircle,
  Plus,
  SkipForward,
  SkipBack,
  Smile,
  Send,
  ThumbsUp,
  ThumbsDown,
  X,
  LogOut,
  ChevronDown,
  ChevronUp,
  Disc3,
  Headphones,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { sessionsApi } from '../lib/api/sessions';

// Platform badges
const PLATFORM_COLORS = {
  spotify: '#1DB954',
  apple: '#FA243C',
  bandcamp: '#629AA9',
  tidal: '#000000',
  beatport: '#01FF95',
  upload: '#ff8c8c'
};

const PLATFORM_NAMES = {
  spotify: 'Spotify',
  apple: 'Apple Music',
  bandcamp: 'Bandcamp',
  tidal: 'Tidal',
  beatport: 'Beatport',
  upload: 'Upload'
};

// Mock data for live sessions
const LIVE_SESSIONS = [
  {
    id: 1,
    dj: {
      username: 'dj_nova',
      displayName: 'DJ Nova',
      verified: true
    },
    title: 'Late Night Electronic Vibes',
    description: 'Join me for a journey through the best electronic music. Expect deep house, ambient techno, and some unreleased tracks!',
    genre: 'Electronic',
    listeners: 247,
    maxListeners: 500,
    duration: '2h 15m',
    currentTrack: {
      title: 'Midnight City',
      artist: 'M83',
      artwork: 'https://images.unsplash.com/photo-1583927109257-f21c74dd0c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
      duration: '3:45',
      platform: 'spotify'
    },
    isLive: true,
    tags: ['Chill', 'Study', 'Late Night'],
    queuePermissions: 'all',
    trackCooldown: 2
  },
  {
    id: 2,
    dj: {
      username: 'house_legends',
      displayName: 'House Legends',
      verified: true
    },
    title: 'Classic House Throwbacks',
    description: 'Reliving the golden era of house music with classics from the 90s and early 2000s.',
    genre: 'House',
    listeners: 189,
    maxListeners: 300,
    duration: '1h 45m',
    currentTrack: {
      title: 'One More Time',
      artist: 'Daft Punk',
      artwork: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMG11c2ljfGVufDF8fHx8MTc1NTQ4OTcyMnww&ixlib=rb-4.1.0&q=80&w=300',
      duration: '4:12',
      platform: 'apple'
    },
    isLive: true,
    tags: ['90s', 'Dance', 'Classic'],
    queuePermissions: 'host-only',
    trackCooldown: 0
  },
  {
    id: 3,
    dj: {
      username: 'vinyl_collector',
      displayName: 'Vinyl Collector',
      verified: false
    },
    title: 'Underground Hip Hop Session',
    description: 'Digging through crates to bring you the best underground hip hop tracks.',
    genre: 'Hip Hop',
    listeners: 134,
    maxListeners: 200,
    duration: '3h 02m',
    currentTrack: {
      title: 'Shook Ones',
      artist: 'Mobb Deep',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
      duration: '3:28',
      platform: 'upload'
    },
    isLive: true,
    tags: ['Underground', 'Boom Bap', 'NYC'],
    queuePermissions: 'all',
    trackCooldown: 5
  }
];

const RECENT_SESSIONS = [
  {
    id: 4,
    dj: {
      username: 'ambient_dreams',
      displayName: 'Ambient Dreams',
      verified: false
    },
    title: 'Morning Meditation Sounds',
    genre: 'Ambient',
    listeners: 0,
    duration: '1h 30m',
    endedAt: '2h ago',
    peakListeners: 89,
    isLive: false,
    tags: ['Meditation', 'Calm', 'Morning']
  },
  {
    id: 5,
    dj: {
      username: 'jazz_nights',
      displayName: 'Jazz Nights',
      verified: true
    },
    title: 'Smooth Jazz After Dark',
    genre: 'Jazz',
    listeners: 0,
    duration: '2h 20m',
    endedAt: '5h ago',
    peakListeners: 156,
    isLive: false,
    tags: ['Jazz', 'Smooth', 'Evening']
  }
];

// Mock participants for lobby
const generateParticipants = (count: number) => {
  const names = ['Sarah', 'Mike', 'Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Jamie', 'Quinn'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    username: `${names[i % names.length].toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
    displayName: names[i % names.length],
    joinedAt: new Date(Date.now() - Math.random() * 3600000)
  }));
};

// Mock queue data
const generateQueue = (currentTrack: any) => {
  const upNext = [
    {
      id: '2',
      track: {
        title: 'Strobe',
        artist: 'deadmau5',
        artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGVsZWN0cm9uaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
        duration: '10:32',
        platform: 'spotify'
      },
      addedBy: { username: 'user123', displayName: 'User 123' },
      votes: { up: 12, down: 2 },
      addedAt: new Date(),
      status: 'ready'
    },
    {
      id: '3',
      track: {
        title: 'Innerbloom',
        artist: 'RÜFÜS DU SOL',
        artwork: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnR8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300',
        duration: '9:36',
        platform: 'apple'
      },
      addedBy: { username: 'musiclover', displayName: 'Music Lover' },
      votes: { up: 8, down: 0 },
      addedAt: new Date(),
      status: 'ready'
    },
    {
      id: '4',
      track: {
        title: 'Genesis',
        artist: 'Justice',
        artwork: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGZlc3RpdmFsfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
        duration: '3:48',
        platform: 'bandcamp'
      },
      addedBy: { username: 'djnova', displayName: 'DJ Nova' },
      votes: { up: 15, down: 1 },
      addedAt: new Date(),
      status: 'ready'
    }
  ];

  const played = [
    {
      id: '0',
      track: {
        title: 'Windowlicker',
        artist: 'Aphex Twin',
        artwork: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHZpbnlsfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
        duration: '6:08',
        platform: 'tidal'
      },
      addedBy: { username: 'djnova', displayName: 'DJ Nova' },
      playedAt: new Date(Date.now() - 360000)
    }
  ];

  return { upNext, played };
};

// Mock chat messages
const generateChatMessages = () => [
  {
    id: '1',
    user: { username: 'user123', displayName: 'User 123' },
    message: 'This track is fire! 🔥',
    timestamp: new Date(Date.now() - 120000),
    isDJ: false
  },
  {
    id: '2',
    user: { username: 'dj_nova', displayName: 'DJ Nova' },
    message: 'Thanks! Got some more heat coming up',
    timestamp: new Date(Date.now() - 60000),
    isDJ: true
  },
  {
    id: '3',
    user: { username: 'musiclover', displayName: 'Music Lover' },
    message: 'Can you play some deadmau5?',
    timestamp: new Date(Date.now() - 30000),
    isDJ: false
  }
];

// Floating reactions
const REACTION_EMOJIS = ['🔥', '❤️', '👏', '🎵', '⚡', '🌟', '💯', '🎉'];

interface SessionsViewProps {
  user: any;
  onNowPlaying: (track: any) => void;
  onJoinSession?: (sessionId: number) => void;
  onStartDJ?: (config: any) => void;
  activeSession?: any;
  onSetActiveSession?: (session: any) => void;
}

type ViewState = 'browse' | 'lobby' | 'live';

export function SessionsView({ user, onNowPlaying, onJoinSession, onStartDJ, activeSession, onSetActiveSession }: SessionsViewProps) {
  const [viewState, setViewState] = useState<ViewState>('browse');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showAddToQueue, setShowAddToQueue] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [preSessionQueue, setPreSessionQueue] = useState<any[]>([]);

  // Sessions data state
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Live session state
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(45); // 0-100
  const [volume, setVolume] = useState(80);
  const [queue, setQueue] = useState<any>({ upNext: [], played: [] });
  const [participants, setParticipants] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [floatingReactions, setFloatingReactions] = useState<any[]>([]);
  const [showQueueExpanded, setShowQueueExpanded] = useState(true);

  // Platform auth state
  const [showPlatformAuth, setShowPlatformAuth] = useState(false);
  const [authPlatform, setAuthPlatform] = useState<string | null>(null);

  // Like/Dislike state
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [trackDislikes, setTrackDislikes] = useState(0); // Track total dislikes for current song

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Fetch sessions data on mount and when returning to browse view
  useEffect(() => {
    if (viewState === 'browse') {
      fetchSessions();
    }
  }, [viewState]);

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const [active, ended] = await Promise.all([
        sessionsApi.getActive(),
        sessionsApi.getRecentlyEnded(10)
      ]);
      setLiveSessions(active);
      setRecentSessions(ended);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Filter sessions based on search and genre
  const filteredSessions = useMemo(() => {
    return liveSessions.filter(session => {
      // Filter by search query
      const matchesSearch = searchQuery === '' ||
        session.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.room?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by genre
      const matchesGenre = selectedGenre === 'all' || session.genre === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [liveSessions, searchQuery, selectedGenre]);

  // Get unique genres from all sessions for filter dropdown
  const availableGenres = useMemo(() => {
    const genres = new Set(liveSessions.map(session => session.genre).filter(Boolean));
    return Array.from(genres).sort();
  }, [liveSessions]);

  // Restore session state from activeSession when component mounts
  useEffect(() => {
    if (activeSession && !selectedSession) {
      setSelectedSession(activeSession);
      setViewState('live');
      setIsPlaying(activeSession.isPlaying || true);
    }
  }, []);

  // Initialize session data when entering live view
  useEffect(() => {
    if (viewState === 'live' && selectedSession) {
      setQueue(generateQueue(selectedSession.currentTrack));
      setParticipants(generateParticipants(Math.floor(selectedSession.listeners / 10)));
      setChatMessages(generateChatMessages());
    }
  }, [viewState, selectedSession]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Simulate progress
  useEffect(() => {
    if (viewState === 'live' && isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            // Auto-skip to next track
            handleNextTrack();
            return 0;
          }
          return prev + 0.5;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [viewState, isPlaying]);

  // Handle joining session (lobby state)
  const handleJoinLobby = (session: any) => {
    setSelectedSession(session);
    setViewState('lobby');
    toast.success(`Joining ${session.title}`, {
      description: 'Waiting for session to start...'
    });
  };

  // Handle entering live session
  const handleEnterLive = () => {
    // Use onJoinSession to properly set up DJ session state
    if (onJoinSession && selectedSession) {
      const sessionWithTrack = {
        ...selectedSession,
        title: selectedSession.name || selectedSession.room?.name || 'Untitled Session',
        isPlaying: true,
        currentTrack: selectedSession.currentTrack || selectedSession.nowPlayingRef
      };
      onJoinSession(sessionWithTrack);
    }

    toast.success('Joined live session!', {
      description: `You're now listening to ${selectedSession.dj?.displayName || selectedSession.host?.displayName || 'the DJ'}`
    });

    // Simulate join notification
    setTimeout(() => {
      addFloatingReaction('👋');
    }, 500);
  };

  // Handle leaving session
  const handleLeaveSession = () => {
    toast.info('Left session', {
      description: `See you next time at ${selectedSession.title}!`
    });
    
    // Clear active session from global state
    if (onSetActiveSession) {
      onSetActiveSession(null);
    }
    
    setViewState('browse');
    setSelectedSession(null);
    setIsPlaying(false);
    setProgress(0);
    setQueue({ upNext: [], played: [] });
    setParticipants([]);
    setChatMessages([]);
  };

  // Player controls
  const handlePlayPause = () => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);

    // Update active session play state
    if (onSetActiveSession && selectedSession) {
      onSetActiveSession({
        ...selectedSession,
        isPlaying: newPlayState,
        currentTrack: selectedSession.currentTrack
      });
    }

    toast.info(isPlaying ? 'Paused' : 'Playing');
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      toast.info('Removed like');
    } else {
      setIsLiked(true);
      setIsDisliked(false); // Remove dislike if present
      toast.success('Liked track!');
    }
  };

  const handleDislike = () => {
    const totalListeners = participants.length || 1; // At least 1 (the current user)
    let newDislikeCount = trackDislikes;

    if (isDisliked) {
      // Removing dislike
      setIsDisliked(false);
      newDislikeCount = Math.max(0, trackDislikes - 1);
      setTrackDislikes(newDislikeCount);
      toast.info('Removed dislike');
    } else {
      // Adding dislike
      setIsDisliked(true);
      setIsLiked(false); // Remove like if present
      newDislikeCount = trackDislikes + 1;
      setTrackDislikes(newDislikeCount);

      // Check if 50% or more have disliked
      const dislikePercentage = (newDislikeCount / totalListeners) * 100;

      if (dislikePercentage >= 50) {
        toast.error('Track skipped', {
          description: '50% of listeners disliked this track'
        });
        // Skip to next track
        setTimeout(() => handleNextTrack(), 500);
      } else {
        toast.info('Disliked track');
      }
    }
  };

  const handleNextTrack = () => {
    if (queue.upNext.length === 0) {
      toast.error('No tracks in queue', {
        description: 'Add some tracks to continue!'
      });
      return;
    }

    const nextTrack = queue.upNext[0];
    const currentTrack = { ...selectedSession.currentTrack };

    // Update queue
    setQueue({
      upNext: queue.upNext.slice(1),
      played: [{ ...currentTrack, playedAt: new Date() }, ...queue.played]
    });

    // Update current track
    const updatedSession = {
      ...selectedSession,
      currentTrack: nextTrack.track
    };
    setSelectedSession(updatedSession);

    // Update active session
    if (onSetActiveSession) {
      onSetActiveSession({
        ...updatedSession,
        isPlaying: true
      });
    }

    // Reset like/dislike state for new track
    setIsLiked(false);
    setIsDisliked(false);
    setTrackDislikes(0);

    setProgress(0);
    addFloatingReaction('⏭️');

    toast.success('Now Playing', {
      description: `${nextTrack.track.title} by ${nextTrack.track.artist}`
    });
  };

  const handlePrevTrack = () => {
    if (queue.played.length === 0) {
      toast.error('No previous tracks');
      return;
    }

    const prevTrack = queue.played[0];
    const currentTrack = { ...selectedSession.currentTrack };
    
    setQueue({
      upNext: [{ id: Date.now().toString(), track: currentTrack, addedBy: selectedSession.dj }, ...queue.upNext],
      played: queue.played.slice(1)
    });
    
    setSelectedSession({
      ...selectedSession,
      currentTrack: prevTrack.track || prevTrack
    });
    
    setProgress(0);
    addFloatingReaction('⏮️');
  };

  // Queue management
  const handleAddTrack = (track: any) => {
    if (viewState === 'browse') {
      // Add to pre-session queue
      setPreSessionQueue([...preSessionQueue, {
        id: Date.now().toString(),
        track,
        addedBy: user,
        status: 'ready',
        votes: { up: 0, down: 0 },
        addedAt: new Date()
      }]);
      toast.success('Track added to queue', {
        description: `${track.title} will play when you start the session`
      });
    } else {
      // Add to live queue
      const newTrack = {
        id: Date.now().toString(),
        track,
        addedBy: user,
        status: 'ready',
        votes: { up: 0, down: 0 },
        addedAt: new Date()
      };

      setQueue({
        ...queue,
        upNext: [...queue.upNext, newTrack]
      });

      // If this is the first track and nothing is playing, set it as now playing
      if (!selectedSession?.nowPlayingRef && queue.upNext.length === 0) {
        setSelectedSession({
          ...selectedSession,
          nowPlayingRef: {
            title: track.title,
            artist: track.artist,
            artwork: track.artwork,
            platform: track.platform || 'spotify',
            duration: track.duration || '3:30'
          },
          nowPlayingStart: new Date()
        });
      }

      toast.success('Track added to queue', {
        description: `${track.title} by ${track.artist}`
      });

      addFloatingReaction('🎵');
    }
  };

  const handleVote = (trackId: string, type: 'up' | 'down') => {
    setQueue({
      ...queue,
      upNext: queue.upNext.map(item => {
        if (item.id === trackId) {
          return {
            ...item,
            votes: {
              up: type === 'up' ? item.votes.up + 1 : item.votes.up,
              down: type === 'down' ? item.votes.down + 1 : item.votes.down
            }
          };
        }
        return item;
      })
    });
  };

  // Chat
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      user: {
        username: user?.username || user?.email || 'Anonymous',
        displayName: user?.displayName || user?.name || user?.username || 'Anonymous User'
      },
      message: chatInput,
      timestamp: new Date(),
      isDJ: user?.username === selectedSession?.dj?.username
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');

    // Scroll to bottom after sending message
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const addFloatingReaction = (emoji: string) => {
    const id = Date.now();
    setFloatingReactions(prev => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  const handleReaction = (emoji: string) => {
    addFloatingReaction(emoji);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (duration: string) => {
    const [mins, secs] = duration.split(':').map(Number);
    return mins * 60 + secs;
  };

  // Platform badge component
  const PlatformBadge = ({ platform }: { platform: string }) => (
    <Badge 
      variant="outline" 
      className="text-xs font-mono uppercase"
      style={{ 
        borderColor: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS],
        color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]
      }}
    >
      {PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES]}
    </Badge>
  );

  // Waveform visualization (simplified)
  const Waveform = ({ progress }: { progress: number }) => {
    const bars = 50;
    return (
      <div className="flex items-center gap-0.5 h-12 w-full">
        {Array.from({ length: bars }).map((_, i) => {
          const height = Math.random() * 60 + 20;
          const isActive = (i / bars) * 100 <= progress;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors duration-150"
              style={{
                height: `${height}%`,
                backgroundColor: isActive ? '#ff8c8c' : '#404040'
              }}
            />
          );
        })}
      </div>
    );
  };

  // ===== RENDER BROWSE STATE =====
  if (viewState === 'browse') {
    return (
      <div className="bg-background pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-coral rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 md:w-6 md:h-6 text-background" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black">Live Sessions</h1>
                  <p className="text-sm text-muted-foreground">Real-time DJ sessions</p>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  onClick={() => setShowCreateSession(true)}
                  className="bg-accent-mint hover:bg-accent-mint/90 text-background font-bold shadow-lg hover:shadow-xl transition-all"
                  size="default"
                >
                  <Radio className="w-5 h-5 mr-2" />
                  Create Session
                </Button>
              </div>
            </div>
            
            {preSessionQueue.length > 0 && (
              <div className="mt-4 p-3 bg-accent-coral/10 border border-accent-coral/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-accent-coral" />
                    <span className="text-sm font-semibold">{preSessionQueue.length} track{preSessionQueue.length !== 1 ? 's' : ''} ready</span>
                  </div>
                  <Button size="sm" className="bg-accent-coral hover:bg-accent-coral/90">
                    Start Session
                  </Button>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions, genres, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative sm:w-48">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input appearance-none cursor-pointer"
                >
                  <option value="all">All Genres</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Live Sessions */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-coral opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-coral"></span>
              </span>
              Live Now
            </h2>

            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-coral" />
              </div>
            ) : liveSessions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Radio className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">No live sessions at the moment</p>
                  <p className="text-sm text-muted-foreground">Be the first to start a session!</p>
                </CardContent>
              </Card>
            ) : filteredSessions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-2">No sessions match your search</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSessions.map((session) => {
                  // Extract track info from nowPlayingRef if available
                  const currentTrack = session.nowPlayingRef ? {
                    artwork: session.nowPlayingRef.artwork || '/placeholder-album.png',
                    title: session.nowPlayingRef.title || 'Unknown Track',
                    artist: session.nowPlayingRef.artist || 'Unknown Artist'
                  } : null;

                  return (
                  <Card key={session.id} className="hover:border-accent-coral/50 transition-colors cursor-pointer overflow-hidden group" onClick={() => handleJoinLobby(session)}>
                    <CardContent className="p-4">
                      {/* DJ Info */}
                      <div className="mb-3">
                        <h3 className="font-semibold truncate text-lg">
                          {session.name || session.room?.name || 'Untitled Session'}
                        </h3>
                        {session.host && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            Hosted by {session.host.profile?.username ? `@${session.host.profile.username}` : session.host.profile?.displayName || session.host.email || 'Unknown'}
                          </p>
                        )}
                        {currentTrack && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            Now playing: {currentTrack.title}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{session.listeners?.length || 0} listening</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          <span>{session._count?.queue || 0} tracks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Just started</span>
                        </div>
                      </div>

                      {/* Genre Tags */}
                      {(session.genre || session.tags) && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {session.genre && (
                            <Badge variant="secondary" className="text-xs">
                              {session.genre}
                            </Badge>
                          )}
                          {session.tags && session.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Status */}
                      {!currentTrack && (
                        <Badge variant="outline" className="text-xs">
                          Waiting for tracks
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                )})}
              </div>
            )}
          </section>

          {/* Recent Sessions */}
          <section>
            <h2 className="text-xl font-bold mb-4">Recently Ended</h2>

            {!isLoadingSessions && recentSessions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No recent sessions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => {
                  const endedDate = new Date(session.endedAt);
                  const timeAgo = formatDistanceToNow(endedDate, { addSuffix: true });

                  return (
                  <Card key={session.id} className="hover:border-border/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* DJ Badge */}
                        <div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Radio className="w-6 h-6 text-muted-foreground" />
                        </div>

                        {/* Session Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm mb-2 truncate">
                            {session.name || session.room?.name || 'Untitled Session'}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="truncate">Ended {timeAgo}</span>
                            <div className="flex items-center gap-1">
                              <Music className="w-3 h-3" />
                              <span>{session._count?.queue || 0} tracks</span>
                            </div>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" disabled>
                          <Radio className="w-4 h-4 mr-2" />
                          Ended
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )})}
              </div>
            )}
          </section>
        </div>

        {/* Add to Queue Modal */}
        <AddToQueueModal
          isOpen={showAddToQueue}
          onClose={() => setShowAddToQueue(false)}
          onAddTrack={handleAddTrack}
          sessionTitle="Pre-Session Queue"
        />

        {/* Create Session Modal */}
        <CreateSessionModal
          open={showCreateSession}
          onOpenChange={setShowCreateSession}
          onSessionCreated={(session, initialTrack) => {
            // Session already has nowPlayingRef set by backend if track was added
            if (session.nowPlayingRef) {
              const sessionWithTrack = {
                ...session,
                title: session.name || session.room?.name || 'Untitled Session',
                currentTrack: session.nowPlayingRef,
                isPlaying: true,
                listeners: 1
              };

              // Use onJoinSession to properly set up DJ session state
              if (onJoinSession) {
                onJoinSession(sessionWithTrack);
              }

              toast.success('Session created with your first track!');
            } else {
              toast.success('Session created! Add tracks to get started.');
              setSelectedSession(session);
              setViewState('lobby');
            }
            // Refetch sessions to show the newly created session
            fetchSessions();
          }}
        />
      </div>
    );
  }

  // ===== RENDER LOBBY STATE =====
  if (viewState === 'lobby' && selectedSession) {
    const sessionTitle = selectedSession.name || selectedSession.room?.name || 'Untitled Session';
    const currentTrack = selectedSession.nowPlayingRef ? {
      title: selectedSession.nowPlayingRef.title || 'Unknown Track',
      artist: selectedSession.nowPlayingRef.artist || 'Unknown Artist'
    } : null;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{sessionTitle}</h2>
                <p className="text-muted-foreground mb-4">
                  {currentTrack ? `Now Playing: ${currentTrack.title} by ${currentTrack.artist}` : 'Waiting for tracks'}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-coral to-accent-mint rounded flex items-center justify-center">
                    <span className="text-background text-sm font-bold">
                      DJ
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">DJ Session</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      <Play className="w-3 h-3 mr-1" />
                      {selectedSession.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewState('browse')}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Session Stats */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Music className="w-4 h-4" />
                Session Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Tracks in Queue</p>
                  <p className="text-lg font-bold">{selectedSession._count?.queue || 0}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-lg font-bold capitalize">{selectedSession.status.toLowerCase()}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleEnterLive}
                className="flex-1 bg-accent-coral hover:bg-accent-coral/90"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Join Session
              </Button>
              <Button variant="outline" onClick={() => setViewState('browse')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDER LIVE SESSION STATE =====
  if (viewState === 'live' && selectedSession) {
    // Use DJMode component for consistent session UI
    return (
      <DJMode
        room={selectedSession}
        user={user}
        onNowPlaying={onNowPlaying}
        onExit={() => setViewState('browse')}
        onMinimize={() => setViewState('browse')}
        isJoiningSession={true}
        sessionConfig={selectedSession}
        isMobile={false}
      />
    );
  }

  return null;
}
