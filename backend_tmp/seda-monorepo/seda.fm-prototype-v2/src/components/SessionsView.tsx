import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { AddToQueueModal } from './AddToQueueModal';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { motion, AnimatePresence } from 'motion/react';

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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

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
  const [preSessionQueue, setPreSessionQueue] = useState<any[]>([]);
  
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

  const chatScrollRef = useRef<HTMLDivElement>(null);

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
    setViewState('live');
    setIsPlaying(true);
    
    // Set active session in global state
    if (onSetActiveSession && selectedSession) {
      onSetActiveSession({
        ...selectedSession,
        isPlaying: true,
        currentTrack: selectedSession.currentTrack
      });
    }
    
    toast.success('Joined live session!', {
      description: `You're now listening to ${selectedSession.dj.displayName}`
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
      user: { username: user.username, displayName: user.displayName || user.name },
      message: chatInput,
      timestamp: new Date(),
      isDJ: user.username === selectedSession?.dj.username
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
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
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-coral rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 md:w-6 md:h-6 text-background" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black">Live Sessions</h1>
                  <p className="text-sm text-muted-foreground">Real-time DJ sessions</p>
                </div>
              </div>
              
              <Button onClick={() => setShowAddToQueue(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Add Track</span>
              </Button>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LIVE_SESSIONS.map((session) => (
                <Card key={session.id} className="hover:border-accent-coral/50 transition-colors cursor-pointer overflow-hidden group" onClick={() => handleJoinLobby(session)}>
                  <CardContent className="p-4">
                    {/* Album Artwork */}
                    <div className="relative mb-3 overflow-hidden rounded-lg">
                      <img 
                        src={session.currentTrack.artwork} 
                        alt={session.currentTrack.title}
                        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-sm font-semibold truncate">{session.currentTrack.title}</p>
                        <p className="text-white/80 text-xs truncate">{session.currentTrack.artist}</p>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-accent-coral border-0 text-background">
                        <Play className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>
                    </div>

                    {/* DJ Info */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-br from-accent-coral to-accent-mint rounded flex items-center justify-center">
                          <span className="text-background text-xs font-bold">
                            {session.dj.displayName.charAt(0)}
                          </span>
                        </div>
                        <button className="text-sm font-semibold hover:text-accent-coral transition-colors">
                          @{session.dj.username}
                        </button>
                        {session.dj.verified && (
                          <CheckCircle className="w-3 h-3 text-accent-blue" />
                        )}
                      </div>
                      <h3 className="font-semibold truncate">{session.title}</h3>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{session.listeners}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.duration}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {session.genre}
                      </Badge>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-1 flex-wrap">
                      {session.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Recent Sessions */}
          <section>
            <h2 className="text-xl font-bold mb-4">Recently Ended</h2>
            
            <div className="space-y-3">
              {RECENT_SESSIONS.map((session) => (
                <Card key={session.id} className="hover:border-border/80">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* DJ Badge */}
                      <div className="w-12 h-12 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-foreground text-lg font-bold">
                          {session.dj.displayName.charAt(0)}
                        </span>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <button className="text-sm font-semibold hover:text-accent-coral transition-colors truncate">
                            @{session.dj.username}
                          </button>
                        </div>
                        <h3 className="font-semibold text-sm mb-2 truncate">{session.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {session.genre}
                          </Badge>
                          <span className="truncate">Ended {session.endedAt}</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Peak: {session.peakListeners}</span>
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
              ))}
            </div>
          </section>
        </div>

        {/* Add to Queue Modal */}
        <AddToQueueModal
          isOpen={showAddToQueue}
          onClose={() => setShowAddToQueue(false)}
          onAddTrack={handleAddTrack}
          sessionTitle="Pre-Session Queue"
        />
      </div>
    );
  }

  // ===== RENDER LOBBY STATE =====
  if (viewState === 'lobby' && selectedSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedSession.title}</h2>
                <p className="text-muted-foreground mb-4">{selectedSession.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-coral to-accent-mint rounded flex items-center justify-center">
                    <span className="text-background text-sm font-bold">
                      {selectedSession.dj.displayName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Hosted by @{selectedSession.dj.username}</p>
                    <p className="text-xs text-muted-foreground">{selectedSession.genre}</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewState('browse')}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Separator className="my-6" />

            {/* Participants */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Participants ({selectedSession.listeners}/{selectedSession.maxListeners})
              </h3>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {generateParticipants(20).map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 bg-gradient-to-br from-accent-blue to-accent-mint rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-background text-xs font-bold">
                          {participant.displayName.charAt(0)}
                        </span>
                      </div>
                      <span>{participant.displayName}</span>
                      <span className="text-muted-foreground text-xs">@{participant.username}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator className="my-6" />

            {/* Session Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Queue Permissions</p>
                <p className="text-sm font-semibold capitalize">{selectedSession.queuePermissions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Track Cooldown</p>
                <p className="text-sm font-semibold">{selectedSession.trackCooldown} min</p>
              </div>
            </div>

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
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Floating Now Playing Bar */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-card border-b border-border p-3">
          <div className="flex items-center gap-3">
            <img 
              src={selectedSession.currentTrack.artwork}
              alt={selectedSession.currentTrack.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{selectedSession.currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{selectedSession.currentTrack.artist}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={handlePlayPause}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
          <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-accent-coral transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 mt-24 md:mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Player Section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{selectedSession.title}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-coral opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-coral"></span>
                    </span>
                    <span>{selectedSession.listeners} listening</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleLeaveSession}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave
                </Button>
              </div>

              {/* Player Card */}
              <Card className="relative overflow-hidden">
                <CardContent className="p-0">
                  {/* Album Artwork */}
                  <div className="relative aspect-square md:aspect-video overflow-hidden">
                    <img 
                      src={selectedSession.currentTrack.artwork}
                      alt={selectedSession.currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Floating Reactions */}
                    <AnimatePresence>
                      {floatingReactions.map((reaction) => (
                        <motion.div
                          key={reaction.id}
                          initial={{ y: 0, opacity: 1, scale: 0 }}
                          animate={{ y: -200, opacity: 0, scale: 1.5 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 3 }}
                          className="absolute text-4xl pointer-events-none"
                          style={{ left: `${reaction.x}%`, bottom: '20%' }}
                        >
                          {reaction.emoji}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Track Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-end justify-between">
                        <div className="flex-1 min-w-0">
                          <PlatformBadge platform={selectedSession.currentTrack.platform} />
                          <h2 className="text-white text-2xl md:text-3xl font-bold mt-2 mb-1">{selectedSession.currentTrack.title}</h2>
                          <p className="text-white/80 text-lg">{selectedSession.currentTrack.artist}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-accent-coral to-accent-mint rounded flex items-center justify-center">
                              <span className="text-background text-xs font-bold">
                                {selectedSession.dj.displayName.charAt(0)}
                              </span>
                            </div>
                            <span className="text-white/80 text-sm">@{selectedSession.dj.username}</span>
                            {selectedSession.dj.verified && (
                              <Crown className="w-4 h-4 text-accent-yellow" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Waveform */}
                  <div className="px-6 py-4 bg-card">
                    <Waveform progress={progress} />
                  </div>

                  {/* Controls */}
                  <div className="px-6 py-4 bg-card border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        {formatTime((progress / 100) * formatDuration(selectedSession.currentTrack.duration))}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selectedSession.currentTrack.duration}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handlePrevTrack}
                        disabled={queue.played.length === 0}
                      >
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      
                      <Button 
                        size="icon" 
                        className="w-12 h-12 bg-accent-coral hover:bg-accent-coral/90"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-background" />
                        ) : (
                          <Play className="w-5 h-5 text-background" />
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleNextTrack}
                        disabled={queue.upNext.length === 0}
                      >
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Reaction Buttons */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                      {REACTION_EMOJIS.map((emoji) => (
                        <Button
                          key={emoji}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(emoji)}
                          className="text-lg hover:scale-110 transition-transform"
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Queue Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Music className="w-5 h-5" />
                      Queue ({queue.upNext.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddToQueue(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Track
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowQueueExpanded(!showQueueExpanded)}
                      >
                        {showQueueExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {showQueueExpanded && (
                    <>
                      {/* Up Next */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
                          Up Next
                        </h4>
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {queue.upNext.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No tracks in queue</p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-3"
                                  onClick={() => setShowAddToQueue(true)}
                                >
                                  Add Track
                                </Button>
                              </div>
                            ) : (
                              queue.upNext.map((item, index) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <div className="text-sm text-muted-foreground font-mono w-6">
                                    {index + 1}
                                  </div>
                                  <img 
                                    src={item.track.artwork}
                                    alt={item.track.title}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{item.track.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{item.track.artist}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <PlatformBadge platform={item.track.platform} />
                                      <span className="text-xs text-muted-foreground">
                                        Added by @{item.addedBy.username}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleVote(item.id, 'up')}
                                      className="h-8 w-8 p-0"
                                    >
                                      <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                    <span className="text-xs font-mono w-6 text-center">
                                      {item.votes.up - item.votes.down}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleVote(item.id, 'down')}
                                      className="h-8 w-8 p-0"
                                    >
                                      <ThumbsDown className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Recently Played */}
                      {queue.played.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
                              Recently Played
                            </h4>
                            <div className="space-y-2">
                              {queue.played.slice(0, 3).map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-3 rounded-lg opacity-60"
                                >
                                  <img 
                                    src={item.track?.artwork || item.artwork}
                                    alt={item.track?.title || item.title}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                      {item.track?.title || item.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {item.track?.artist || item.artist}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Sidebar */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {participants.length}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
                    <div className="space-y-3">
                      {chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 bg-gradient-to-br from-accent-blue to-accent-mint rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-background text-xs font-bold">
                                  {message.user.displayName.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm font-semibold">
                                {message.user.displayName}
                              </span>
                              {message.isDJ && (
                                <Crown className="w-3 h-3 text-accent-yellow" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {message.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-sm ml-8">{message.message}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Send a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        size="icon" 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        className="bg-accent-coral hover:bg-accent-coral/90"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Add to Queue Modal */}
        <AddToQueueModal
          isOpen={showAddToQueue}
          onClose={() => setShowAddToQueue(false)}
          onAddTrack={handleAddTrack}
          sessionTitle={selectedSession.title}
        />
      </div>
    );
  }

  return null;
}
