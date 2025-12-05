import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
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
  Shuffle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

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

export function DJMode({ channel, user, onNowPlaying, onExit }) {
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [currentTrack, setCurrentTrack] = useState(queue[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(45);
  const [userVotes, setUserVotes] = useState(new Set());
  const [listeners] = useState(LISTENERS);
  const [skipVotes, setSkipVotes] = useState({ count: 0, threshold: Math.ceil(listeners.length * 0.5) });

  useEffect(() => {
    if (!currentTrack) return;
    
    onNowPlaying({
      ...currentTrack.track,
      addedBy: currentTrack.addedBy,
      messageId: currentTrack.id
    });
  }, [currentTrack, onNowPlaying]);

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

  const handleNextTrack = () => {
    const currentIndex = queue.findIndex(item => item.id === currentTrack?.id);
    const nextTrack = queue[currentIndex + 1];
    
    if (nextTrack) {
      setCurrentTrack(nextTrack);
      setProgress(0);
      setUserVotes(new Set());
      setSkipVotes({ count: 0, threshold: Math.ceil(listeners.length * 0.5) });
      
      // Award completion bonus
      toast.success('Track completed! +10 DJ Points');
    } else {
      toast.info('Queue is empty! Add more tracks to continue.');
    }
  };

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
    toast.success('Track added to queue! +5 DJ Points');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready':
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case 'buffering':
        return <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />;
      case 'error':
        return <div className="w-2 h-2 rounded-full bg-red-500" />;
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-background to-background/80">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-[#00ff88] animate-pulse" />
            <div>
              <h2 className="text-lg">DJ Mode - {channel}</h2>
              <p className="text-sm text-muted-foreground">
                {listeners.length} listeners • Host: {user.username}
              </p>
            </div>
          </div>
          
          <Button variant="outline" onClick={onExit}>
            <X className="w-4 h-4 mr-2" />
            Exit DJ Mode
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4">
        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Now Playing */}
          {currentTrack && (
            <Card className="border-2 border-[#00ff88] shadow-lg shadow-[#00ff88]/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#00ff88]" />
                  Now Playing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <img
                    src={currentTrack.track.artwork}
                    alt={currentTrack.track.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-xl mb-1">{currentTrack.track.title}</h3>
                    <p className="text-muted-foreground mb-3">{currentTrack.track.artist}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={currentTrack.addedBy.avatar} />
                        <AvatarFallback>
                          {currentTrack.addedBy.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        Added by @{currentTrack.addedBy.username}
                      </span>
                      {currentTrack.addedBy.verified && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    
                    <Progress value={progress} className="mb-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatTime(Math.floor((progress / 100) * 320))}</span>
                      <span>{currentTrack.track.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button onClick={handlePlayPause} size="lg">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button onClick={handleNextTrack} variant="outline">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(currentTrack.id, 'up')}
                      disabled={userVotes.has(currentTrack.id.toString())}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {currentTrack.votes.up}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(currentTrack.id, 'down')}
                      disabled={userVotes.has(currentTrack.id.toString())}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {currentTrack.votes.down}
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleSkipVote}
                  >
                    Skip ({skipVotes.count}/{skipVotes.threshold})
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Queue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shuffle className="w-5 h-5" />
                  Queue ({queue.length} tracks)
                </CardTitle>
                <Button onClick={addToQueue} size="sm">
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
                          ? 'border-[#00ff88] bg-[#00ff88]/10' 
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
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
                          {listener.verified && <Crown className="w-3 h-3 text-yellow-500" />}
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