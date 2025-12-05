import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
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
  Disc
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { motionTokens } from '../styles/motion';

const MOCK_QUEUE = [
  {
    id: 1,
    track: {
      title: 'One More Time',
      artist: 'Daft Punk',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      duration: '5:20'
    },
    addedBy: { username: 'daft_lover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daft' },
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
    addedBy: { username: 'edm_king', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=edm', verified: true },
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
    addedBy: { username: 'classic_raver', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=classic' },
    status: 'buffering',
    votes: { up: 12, down: 3 },
    addedAt: new Date(Date.now() - 360000)
  }
];

const LISTENERS = [
  { username: 'beat_seeker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beat', djPoints: 1247 },
  { username: 'melody_hunter', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=melody', djPoints: 892 },
  { username: 'rhythm_master', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rhythm', djPoints: 2103, verified: true },
  { username: 'bass_dropper', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bass', djPoints: 567 }
];

export function DJMode({ channel, user, onNowPlaying, onExit, isJoiningSession = false, sessionConfig = null }) {
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

    // Mock adding a track
    const newTrack = {
      id: Date.now(),
      track: {
        title: 'Feel Good Inc.',
        artist: 'Gorillaz',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        duration: '3:41'
      },
      addedBy: user,
      status: 'ready',
      votes: { up: 0, down: 0 },
      addedAt: new Date()
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
        return <div className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" />;
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-background via-background to-ring/5">
      {/* Enhanced Header */}
      <motion.div
        className="p-4 md:p-6 border-b border-border bg-gradient-to-r from-card to-card/80 backdrop-blur-sm relative overflow-hidden"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionTokens.cardEnter.duration, ease: motionTokens.cardEnter.easing }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-ring/5 to-transparent" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 bg-ring/10 rounded-xl flex items-center justify-center relative"
              animate={{ 
                boxShadow: isPlaying ? 
                  "0 0 20px rgba(255, 255, 255, 0.3)" : 
                  "0 0 0px rgba(255, 255, 255, 0)"
              }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
              <motion.div
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Disc className="w-6 h-6 text-ring" />
              </motion.div>
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 border-2 border-ring/50 rounded-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-medium">DJ Mode - {channel}</h2>
                <Badge variant="secondary" className="bg-ring/20 text-ring border-ring/30">
                  LIVE
                </Badge>
                {isHost && (
                  <Badge variant="outline" className="border-primary/50 text-primary">
                    HOST
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{listeners.length} listeners</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(sessionStats.sessionDuration / 60)}m</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Music className="w-4 h-4" />
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

          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
            {isHost && (
              <Button
                size="sm"
                variant={micEnabled ? "default" : "outline"}
                onClick={toggleMic}
                className={micEnabled ? "bg-ring text-ring-foreground" : ""}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={onExit} 
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-2 md:p-4">
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
                      <motion.div 
                        className="w-8 h-8 bg-ring/10 rounded-lg flex items-center justify-center"
                        animate={{ 
                          boxShadow: isPlaying ? 
                            "0 0 15px rgba(255, 255, 255, 0.3)" : 
                            "0 0 0px rgba(255, 255, 255, 0)"
                        }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <Music className="w-5 h-5 text-ring" />
                      </motion.div>
                      Now Playing
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-ring/20 text-ring">
                        {isPlaying ? 'PLAYING' : 'PAUSED'}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.img
                        src={currentTrack.track.artwork}
                        alt={currentTrack.track.title}
                        className="w-32 h-32 rounded-xl object-cover shadow-xl"
                        animate={{ 
                          filter: isPlaying ? "brightness(1.1)" : "brightness(1)"
                        }}
                        transition={{ 
                          filter: { duration: 0.3 }
                        }}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
                      {isPlaying && (
                        <motion.div
                          className="absolute top-2 right-2 w-3 h-3 bg-ring rounded-full shadow-lg"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-medium mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        {currentTrack.track.title}
                      </h3>
                      <p className="text-muted-foreground text-lg mb-4">{currentTrack.track.artist}</p>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-7 h-7 shadow-lg ring-2 ring-ring/20">
                          <AvatarImage src={currentTrack.addedBy.avatar} />
                          <AvatarFallback>
                            {currentTrack.addedBy.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
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
                    
                    <div className="flex flex-col gap-3">
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button 
                          onClick={handlePlayPause} 
                          size="lg" 
                          className="h-14 w-14 shadow-xl hover:shadow-2xl transition-all duration-200 bg-gradient-to-br from-primary to-primary/80"
                        >
                          <motion.div
                            animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
                          </motion.div>
                        </Button>
                      </motion.div>
                      {isHost && (
                        <Button 
                          onClick={handleNextTrack} 
                          variant="outline" 
                          className="h-10 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <SkipForward className="w-5 h-5" />
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        variant="ghost" 
                        className="h-8 w-14"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-border/50">
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(currentTrack.id, 'up')}
                          disabled={userVotes.has(currentTrack.id.toString())}
                          className={`transition-all duration-200 ${
                            currentTrack.votes.up > currentTrack.votes.down 
                              ? 'border-green-500/50 text-green-500 bg-green-500/10' 
                              : ''
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {currentTrack.votes.up}
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(currentTrack.id, 'down')}
                          disabled={userVotes.has(currentTrack.id.toString())}
                          className="transition-all duration-200"
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          {currentTrack.votes.down}
                        </Button>
                      </motion.div>
                    </div>

                    <div className="flex items-center gap-2 justify-center sm:justify-end">
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

          {/* Queue */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                    <Shuffle className="w-5 h-5" />
                  </div>
                  Queue ({queue.length} tracks)
                </CardTitle>
                <Button onClick={addToQueue} size="sm" className="shadow-sm hover:shadow-md transition-all duration-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Track
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
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
                        className="w-12 h-12 rounded object-cover"
                      />
                      
                      <div className="flex-1">
                        <h4 className="text-sm">{item.track.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.track.artist} • {item.track.duration}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={item.addedBy.avatar} />
                            <AvatarFallback className="text-xs">
                              {item.addedBy.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            @{item.addedBy.username}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => handleVote(item.id, 'up')}
                            disabled={userVotes.has(item.id.toString())}
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            <span className="text-xs">{item.votes.up}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => handleVote(item.id, 'down')}
                            disabled={userVotes.has(item.id.toString())}
                          >
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            <span className="text-xs">{item.votes.down}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Listeners Sidebar */}
        <div className="w-80">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                Listeners ({listeners.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {listeners.map((listener) => (
                    <div key={listener.username} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={listener.avatar} />
                        <AvatarFallback>
                          {listener.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
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
        </div>
      </div>
    </div>
  );
}
