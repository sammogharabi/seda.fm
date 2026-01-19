import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AddToQueueModal } from './AddToQueueModal';

import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { SessionChat } from './SessionChat';
import { 
  Play, 
  Pause, 
  SkipForward, 
  ThumbsUp, 
  ThumbsDown, 
  Users, 
  Clock,
  Music,
  Radio,
  X,
  Plus,
  Crown,
  Shuffle,
  Volume2,
  VolumeX,
  Settings,
  Search,
  Filter,
  Mic,
  MicOff,
  Share,
  Heart,
  MessageCircle,
  Zap,
  TrendingUp,
  Headphones,
  Disc,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Menu
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { DJProgressOverlay } from './DJProgressOverlay';

const MOCK_QUEUE = [
  {
    id: 1,
    track: {
      title: 'One More Time',
      artist: 'Daft Punk',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      duration: '5:20'
    },
    addedBy: { username: 'daft_lover' },
    status: 'ready',
    votes: { up: 15, down: 2 },
    addedAt: new Date(Date.now() - 600000)
  },
  {
    id: 2,
    track: {
      title: 'Levels',
      artist: 'Avicii',
      artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
      duration: '3:18'
    },
    addedBy: { username: 'edm_king', verified: true },
    status: 'ready',
    votes: { up: 8, down: 0 },
    addedAt: new Date(Date.now() - 480000)
  },
  {
    id: 3,
    track: {
      title: 'Sandstorm',
      artist: 'Darude',
      artwork: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop',
      duration: '3:49'
    },
    addedBy: { username: 'classic_raver' },
    status: 'buffering',
    votes: { up: 12, down: 3 },
    addedAt: new Date(Date.now() - 360000)
  }
];

const LISTENERS = [
  { username: 'beat_seeker', djPoints: 1247 },
  { username: 'melody_hunter', djPoints: 892 },
  { username: 'rhythm_master', djPoints: 2103, verified: true },
  { username: 'bass_dropper', djPoints: 567 }
];



export function DJMode({ room, user, onNowPlaying, onExit, onMinimize, isJoiningSession = false, sessionConfig = null, isMobile = false }) {
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [currentTrack, setCurrentTrack] = useState(queue[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(45);
  const [userVotes, setUserVotes] = useState(new Set());
  const [listeners, setListeners] = useState(LISTENERS);
  const [skipVotes, setSkipVotes] = useState({ 
    count: 0, 
    threshold: sessionConfig?.autoSkipThreshold 
      ? Math.ceil(listeners.length * (sessionConfig.autoSkipThreshold / 100))
      : Math.ceil(listeners.length * 0.5)
  });
  const [showWelcome, setShowWelcome] = useState(isJoiningSession);
  const [userCooldowns, setUserCooldowns] = useState(new Map());
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalTracks: 0,
    totalLikes: 0,
    sessionDuration: 0,
    peakListeners: listeners.length
  });
  const [isHost] = useState(user.username === 'current_host');
  const [micEnabled, setMicEnabled] = useState(false);
  
  // Mobile state management
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const [mobileListenersOpen, setMobileListenersOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileControlsMinimized, setMobileControlsMinimized] = useState(false);
  
  // Add to queue modal state
  const [showAddToQueue, setShowAddToQueue] = useState(false);



  useEffect(() => {
    if (!currentTrack) return;
    
    onNowPlaying({
      ...currentTrack.track,
      addedBy: currentTrack.addedBy,
      messageId: currentTrack.id,
      isLiveSession: true
    });
  }, [currentTrack, onNowPlaying]);

  useEffect(() => {
    if (showWelcome) {
      toast.success('Welcome to the DJ session! You can vote on tracks and add to the queue.');
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  useEffect(() => {
    // Simulate track progress
    const interval = setInterval(() => {
      if (isPlaying && progress < 100) {
        setProgress(prev => prev + 0.5);
      } else if (progress >= 100) {
        handleNextTrack();
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = useCallback(() => {
    const currentIndex = queue.findIndex(item => item.id === currentTrack?.id);
    const nextTrack = queue[currentIndex + 1];
    
    if (nextTrack) {
      setCurrentTrack(nextTrack);
      setProgress(0);
      setUserVotes(new Set());
      setSkipVotes({ count: 0, threshold: Math.ceil(listeners.length * 0.5) });
      
      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        totalTracks: prev.totalTracks + 1
      }));
      
      // Award completion bonus
      toast.success('Track completed! +10 DJ Points');
    } else {
      toast.info('Queue is empty! Add more tracks to continue.');
    }
  }, [queue, currentTrack, listeners.length]);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleMic = useCallback(() => {
    setMicEnabled(!micEnabled);
    if (!micEnabled) {
      toast.success('Microphone enabled - You can now talk to listeners');
    } else {
      toast.info('Microphone disabled');
    }
  }, [micEnabled]);

  const sendChatMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      user: user,
      message: newMessage,
      timestamp: new Date(),
      type: 'chat'
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
    toast.success('Message sent!');
  }, [newMessage, user]);

  const filteredQueue = useMemo(() => {
    if (!searchQuery) return queue;
    return queue.filter(item => 
      item.track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.addedBy.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [queue, searchQuery]);

  const handleVote = (trackId, voteType) => {
    const voteKey = `${trackId}-${voteType}`;
    
    if (userVotes.has(voteKey.replace(`-${voteType}`, ''))) {
      toast.error('You already voted on this track!');
      return;
    }

    setQueue(prev => prev.map(item => {
      if (item.id === trackId) {
        return {
          ...item,
          votes: {
            ...item.votes,
            [voteType]: item.votes[voteType] + 1
          }
        };
      }
      return item;
    }));

    setUserVotes(prev => new Set([...prev, `${trackId}`]));
    
    // Check for auto-skip
    const track = queue.find(item => item.id === trackId);
    if (track && voteType === 'down' && track.votes.down + 1 >= skipVotes.threshold) {
      toast.warning('Track skipped due to downvotes!');
      if (trackId === currentTrack?.id) {
        handleNextTrack();
      }
    } else {
      toast.success(`Vote recorded! ${voteType === 'up' ? '👍' : '👎'}`);
    }
  };

  const handleSkipVote = () => {
    const newCount = skipVotes.count + 1;
    setSkipVotes(prev => ({ ...prev, count: newCount }));
    
    if (newCount >= skipVotes.threshold) {
      toast.warning('Track skipped by listener vote!');
      handleNextTrack();
    } else {
      toast.info(`Skip vote recorded! (${newCount}/${skipVotes.threshold})`);
    }
  };

  const addToQueue = () => {
    // Check permissions
    if (sessionConfig) {
      const { queuePermissions, trackCooldown } = sessionConfig;
      
      // Check queue permissions
      if (queuePermissions === 'host-only' && user.username !== 'current_host') {
        toast.error('Only the host can add tracks to this session');
        return;
      }
      
      // Check cooldown
      if (trackCooldown > 0) {
        const lastAddTime = userCooldowns.get(user.username);
        if (lastAddTime && (Date.now() - lastAddTime) < trackCooldown * 1000) {
          const remainingTime = Math.ceil((trackCooldown * 1000 - (Date.now() - lastAddTime)) / 1000);
          toast.error(`Please wait ${Math.ceil(remainingTime / 60)}m before adding another track`);
          return;
        }
      }
    }

    // Open the add to queue modal
    setShowAddToQueue(true);
  };

  const handleAddTrack = (track) => {
    const newTrack = {
      id: Date.now(),
      track: {
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        duration: track.duration
      },
      addedBy: user,
      status: 'ready',
      votes: { up: 0, down: 0 },
      addedAt: new Date(),
      source: track.source
    };
    
    setQueue(prev => [...prev, newTrack]);
    
    // Update cooldown
    if (sessionConfig?.trackCooldown > 0) {
      setUserCooldowns(prev => new Map(prev.set(user.username, Date.now())));
    }
    
    toast.success('Track added to queue! +5 DJ Points');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <div className="w-2 h-2 rounded-full bg-chart-2" />;
      case 'buffering':
        return <div className="w-2 h-2 rounded-full bg-chart-3" />;
      case 'error':
        return <div className="w-2 h-2 rounded-full bg-destructive" />;
      default:
        return null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-ring/5 pb-safe">
      {/* Enhanced Header */}
      <motion.div 
        className={`${isMobile ? 'p-4' : 'p-6'} border-b border-border bg-gradient-to-r from-card to-card/80 backdrop-blur-sm relative overflow-hidden`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-ring/5 via-ring/3 to-transparent pointer-events-none -z-10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'} ${isMobile ? 'flex-wrap' : ''}`}>
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium ${isMobile ? 'truncate' : ''}`}>
                  {sessionConfig?.title || sessionConfig?.name || room || 'Untitled Session'}
                </h2>
                <Badge variant="secondary" className="bg-ring/20 text-ring border-ring/30 text-xs">
                  LIVE
                </Badge>
                {isHost && (
                  <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                    HOST
                  </Badge>
                )}
              </div>
              <div className={`flex items-center ${isMobile ? 'gap-2 mt-1' : 'gap-4 mt-1'} ${isMobile ? 'flex-wrap' : ''}`}>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{listeners.length}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{Math.floor(sessionStats.sessionDuration / 60)}m</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{sessionStats.totalTracks} tracks</span>
                </div>
                {sessionConfig && (
                  <span className="text-xs text-ring">
                    {sessionConfig.queuePermissions === 'host-only' && 'Host Only'}
                    {sessionConfig.queuePermissions === 'followers' && 'Followers'}
                    {sessionConfig.queuePermissions === 'anyone' && 'Open Queue'}
                    {sessionConfig.isPrivate && ' • Private'}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Navigation Controls - Mobile Optimized */}
            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2 ml-2 border-l border-border pl-3'}`}>
              {onMinimize && (
                <Button 
                  variant="outline" 
                  onClick={onMinimize} 
                  className={`bg-accent-mint/20 hover:bg-accent-mint/30 border-accent-mint/50 text-accent-mint border-2 font-black uppercase tracking-wide transition-all hover:scale-105 ${isMobile ? 'text-xs px-3 py-2' : 'text-sm px-6 py-3'}`}
                >
                  {isMobile ? <Minimize2 className="w-4 h-4" /> : '↓ MINIMIZE'}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onExit} 
                className={`bg-destructive/10 hover:bg-destructive/20 border-destructive/50 text-destructive border-2 font-medium ${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-4 py-2'}`}
              >
                {isMobile ? <X className="w-4 h-4" /> : 'EXIT SESSION'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className={`flex-1 overflow-y-auto p-4 ${isMobile ? 'flex flex-col space-y-3 pb-safe' : 'flex gap-4'}`}>
        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Enhanced Now Playing */}
          {currentTrack && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-ring shadow-2xl bg-gradient-to-br from-card via-card/90 to-ring/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ring/5 to-transparent" />
                <CardHeader className="pb-4 relative">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      Now Playing
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className={`flex ${isMobile ? 'gap-3' : 'gap-6'}`}>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={currentTrack.track.artwork}
                        alt={currentTrack.track.title}
                        className={`${isMobile ? 'w-20 h-20' : 'w-32 h-32'} rounded-xl object-cover shadow-xl`}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-medium mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text`}>
                        {currentTrack.track.title}
                      </h3>
                      <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-lg'} mb-4`}>{currentTrack.track.artist}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm text-muted-foreground">
                          Added by @{currentTrack.addedBy.username}
                        </span>
                        {currentTrack.addedBy.verified && (
                          <Crown className="w-4 h-4 text-ring" />
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <Progress value={progress} className="mb-3 h-3 bg-secondary" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatTime(Math.floor((progress / 100) * 320))}</span>
                          <span>{currentTrack.track.duration}</span>
                        </div>
                      </div>

                      {/* Volume Control */}
                      <div className="flex items-center gap-3 mb-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={toggleMute}
                          className="h-8 px-2"
                        >
                          {isMuted || volume === 0 ? 
                            <VolumeX className="w-4 h-4" /> : 
                            <Volume2 className="w-4 h-4" />
                          }
                        </Button>
                        <div className="flex-1 max-w-32">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">
                          {isMuted ? 0 : volume}%
                        </span>
                      </div>
                    </div>

                    <div className={`flex ${isMobile ? 'flex-row gap-2' : 'flex-col gap-3'}`}>
                      {isHost && (
                        <Button
                          onClick={handleNextTrack}
                          variant="outline"
                          className={`${isMobile ? 'h-10 w-10' : 'h-10 w-14'} shadow-lg hover:shadow-xl transition-all duration-200`}
                        >
                          <SkipForward className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                    <div className={`flex ${isMobile ? 'gap-1' : 'gap-2'}`}>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(currentTrack.id, 'up')}
                          disabled={userVotes.has(currentTrack.id.toString())}
                          className={`transition-all duration-200 ${isMobile ? 'px-2' : ''} ${
                            currentTrack.votes.up > currentTrack.votes.down 
                              ? 'border-green-500/50 text-green-500 bg-green-500/10' 
                              : ''
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 ${isMobile ? '' : 'mr-1'}`} />
                          {!isMobile && currentTrack.votes.up}
                          {isMobile && <span className="ml-1 text-xs">{currentTrack.votes.up}</span>}
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(currentTrack.id, 'down')}
                          disabled={userVotes.has(currentTrack.id.toString())}
                          className={`transition-all duration-200 ${isMobile ? 'px-2' : ''}`}
                        >
                          <ThumbsDown className={`w-4 h-4 ${isMobile ? '' : 'mr-1'}`} />
                          {!isMobile && currentTrack.votes.down}
                          {isMobile && <span className="ml-1 text-xs">{currentTrack.votes.down}</span>}
                        </Button>
                      </motion.div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleSkipVote}
                        className="shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Skip ({skipVotes.count}/{skipVotes.threshold})
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Chat Section - Direct SessionChat rendering to avoid hook order issues */}
          <div className={isMobile ? "mb-4" : ""}>
            {isMobile ? (
              <Collapsible 
                open={mobileChatOpen} 
                onOpenChange={setMobileChatOpen}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-card border-2"
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Session Chat</span>
                    </div>
                    {mobileChatOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="h-64">
                    <SessionChat 
                      key="mobile-chat"
                      session={{
                        title: sessionConfig?.title || 'DJ Session',
                        dj: user,
                        listeners: listeners
                      }}
                      user={user}
                      className="h-full shadow-lg"
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <div className="h-[520px]">
                <SessionChat 
                  key="desktop-chat"
                  session={{
                    title: sessionConfig?.title || 'DJ Session',
                    dj: user,
                    listeners: listeners
                  }}
                  user={user}
                  className="h-full shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Queue Section - Mobile Collapsible, moved after chat */}
          {isMobile && (
            <Collapsible 
              open={mobileQueueOpen} 
              onOpenChange={setMobileQueueOpen}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-between bg-card border-2 mr-2"
                  >
                    <div className="flex items-center gap-2">
                      <span>Queue ({queue.length})</span>
                    </div>
                    {mobileQueueOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <Button onClick={addToQueue} size="sm" className="px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <CollapsibleContent>
                <Card className="border-2">
                  <CardContent className="p-4">
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {queue.map((item, index) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border ${
                              item.id === currentTrack?.id 
                                ? 'border-ring bg-ring/10' 
                                : 'border-border'
                            }`}
                          >
                            <div className="text-xs text-muted-foreground w-4">
                              #{index + 1}
                            </div>
                            
                            <img
                              src={item.track.artwork}
                              alt={item.track.title}
                              className="w-8 h-8 rounded object-cover"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm truncate">{item.track.title}</h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.track.artist}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1"
                                onClick={() => handleVote(item.id, 'up')}
                                disabled={userVotes.has(item.id.toString())}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span className="text-xs ml-1">{item.votes.up}</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1"
                                onClick={() => handleVote(item.id, 'down')}
                                disabled={userVotes.has(item.id.toString())}
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span className="text-xs ml-1">{item.votes.down}</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Queue & Listeners Section - Desktop Sidebar / Mobile Collapsible */}
        {isMobile ? (
          <>
            {/* Mobile Listeners Section */}
            <Collapsible 
              open={mobileListenersOpen} 
              onOpenChange={setMobileListenersOpen}
              className="mb-4"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between bg-card border-2"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Listeners ({listeners.length})</span>
                  </div>
                  {mobileListenersOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Card className="border-2">
                  <CardContent className="p-4">
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {listeners.map((listener) => (
                          <div key={listener.username} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-1">
                                <p className="text-sm">{listener.username}</p>
                                {listener.verified && <Crown className="w-3 h-3 text-ring" />}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {listener.djPoints} DJ Points
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <div className="w-80">
            {/* Queue Section - Desktop Sidebar */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    Queue ({queue.length})
                  </CardTitle>
                  <Button onClick={addToQueue} size="sm" className="shadow-sm hover:shadow-md transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {queue.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          item.id === currentTrack?.id 
                            ? 'border-ring bg-ring/10' 
                            : 'border-border'
                        }`}
                      >
                        <div className="text-sm text-muted-foreground w-6">
                          #{index + 1}
                        </div>
                        
                        <img
                          src={item.track.artwork}
                          alt={item.track.title}
                          className="w-10 h-10 rounded object-cover"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm truncate">{item.track.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.track.artist}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground truncate">
                              @{item.addedBy.username}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          {getStatusIcon(item.status)}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleVote(item.id, 'up')}
                              disabled={userVotes.has(item.id.toString())}
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <span className="text-xs text-muted-foreground w-4 text-center">{item.votes.up}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleVote(item.id, 'down')}
                              disabled={userVotes.has(item.id.toString())}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                            <span className="text-xs text-muted-foreground w-4 text-center">{item.votes.down}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Listeners Section - Desktop Sidebar */}
            <Card className="shadow-lg mt-4">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  Listeners ({listeners.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {listeners.map((listener) => (
                      <div key={listener.username} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm truncate">{listener.username}</p>
                            {listener.verified && <Crown className="w-3 h-3 text-ring" />}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {listener.djPoints} DJ Points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>


          </div>
        )}
      </div>

      {/* Mobile Quick Action Bar */}
      {isMobile && (
        <div className="sticky bottom-0 bg-card border-t border-border p-3 pb-safe flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMobileChatOpen(!mobileChatOpen)}
              className="px-3"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-xs">Chat</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMobileQueueOpen(!mobileQueueOpen)}
              className="px-3"
            >
              <Shuffle className="w-4 h-4 mr-1" />
              <span className="text-xs">Queue</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMobileListenersOpen(!mobileListenersOpen)}
              className="px-3"
            >
              <Users className="w-4 h-4 mr-1" />
              <span className="text-xs">{listeners.length}</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={addToQueue} size="sm" className="px-4">
              <Plus className="w-4 h-4 mr-1" />
              <span className="text-xs">Add</span>
            </Button>
          </div>
        </div>
      )}

      {/* DJ Progress Overlay - Shows session stats and XP tracking (only for fans, artists don't have XP) */}
      {isHost && user.userType !== 'artist' && (
        <DJProgressOverlay
          userId={user.id}
          sessionId="current-dj-session"
          isPublicSession={!sessionConfig?.isPrivate}
          onTogglePublic={(isPublic) => {
            // Update session privacy setting
            toast.success(
              isPublic ? 'Session is now public - earn XP points!' : 'Session is now private',
              { description: isPublic ? 'Audience votes and participation will now count toward your progression' : 'XP earning is disabled for private sessions' }
            );
          }}
          listeners={listeners.length}
          sessionDuration={`${Math.floor(sessionStats.sessionDuration / 60)}:${String(sessionStats.sessionDuration % 60).padStart(2, '0')}`}
          tracksPlayed={sessionStats.totalTracks}
        />
      )}

      {/* Add to Queue Modal */}
      <AddToQueueModal
        isOpen={showAddToQueue}
        onClose={() => setShowAddToQueue(false)}
        onAddTrack={handleAddTrack}
        sessionTitle={sessionConfig?.title || room}
      />
    </div>
  );
}