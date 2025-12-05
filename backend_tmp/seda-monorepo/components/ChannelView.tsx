import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
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
  Crown
} from 'lucide-react';
import { MiniPlayer } from './MiniPlayer';
import { DJSessionConfig } from './DJSessionConfig';
import { toast } from 'sonner@2.0.3';

const MOCK_MESSAGES = [
  {
    id: 1,
    type: 'music',
    user: { username: 'beatmaster_99', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beatmaster' },
    track: {
      title: 'Midnight City',
      artist: 'M83',
      artwork: 'https://images.unsplash.com/photo-1583927109257-f21c74dd0c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXIlMjBlbGVjdHJvbmljfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300',
      duration: '4:03',
      url: '#'
    },
    timestamp: new Date(Date.now() - 300000),
    votes: { up: 12, down: 2 }
  },
  {
    id: 2,
    type: 'chat',
    user: { username: 'vinyl_collector', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinyl' },
    message: 'This track is absolutely fire! 🔥',
    timestamp: new Date(Date.now() - 240000)
  },
  {
    id: 3,
    type: 'music',
    user: { username: 'dj_nova', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova', verified: true },
    track: {
      title: 'Strobe',
      artist: 'Deadmau5',
      artwork: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMG11c2ljfGVufDF8fHx8MTc1NTQ4OTcyMnww&ixlib=rb-4.1.0&q=80&w=300',
      duration: '10:36',
      url: '#'
    },
    timestamp: new Date(Date.now() - 180000),
    votes: { up: 24, down: 1 }
  },
  {
    id: 4,
    type: 'chat',
    user: { username: 'synth_wave', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=synth' },
    message: 'Anyone know similar tracks to this?',
    timestamp: new Date(Date.now() - 120000)
  }
];

const CHANNEL_INFO = {
  '#hiphop': { name: 'Hip Hop', description: 'The latest in hip hop culture', members: 1247, color: 'var(--chart-1)' },
  '#electronic': { name: 'Electronic', description: 'Electronic music of all kinds', members: 892, color: 'var(--chart-2)' },
  '#rock': { name: 'Rock', description: 'Rock music through the ages', members: 1456, color: 'var(--chart-3)' },
  '#ambient': { name: 'Ambient', description: 'Chill ambient soundscapes', members: 234, color: 'var(--chart-4)' }
};

// Mock active DJ sessions data
const ACTIVE_DJ_SESSIONS = {
  '#electronic': {
    isActive: true,
    host: {
      username: 'dj_nova',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova',
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
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ambient',
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

export function ChannelView({ channel, user, onStartDJ, onNowPlaying }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [votedTracks, setVotedTracks] = useState(new Set());
  const [showDJConfig, setShowDJConfig] = useState(false);
  const messagesEndRef = useRef(null);
  const channelInfo = CHANNEL_INFO[channel] || CHANNEL_INFO['#hiphop'];
  const activeDJSession = ACTIVE_DJ_SESSIONS[channel] || { isActive: false };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      type: 'chat',
      user: { username: user.username, avatar: user.avatar, verified: user.verified },
      message: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Award DJ points for participation
    toast.success('Earned +2 DJ Points for chat participation!');
  };

  const handlePlayTrack = (track, messageId) => {
    setCurrentlyPlaying({ ...track, messageId });
    onNowPlaying({ ...track, messageId, addedBy: messages.find(m => m.id === messageId)?.user });
    
    // Award DJ points
    toast.success('Earned +5 DJ Points for queueing a track!');
  };

  const handleVote = (messageId, voteType) => {
    if (votedTracks.has(messageId)) {
      toast.error('You already voted on this track!');
      return;
    }

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.type === 'music') {
        return {
          ...msg,
          votes: {
            ...msg.votes,
            [voteType]: msg.votes[voteType] + 1
          }
        };
      }
      return msg;
    }));

    setVotedTracks(prev => new Set([...prev, messageId]));
    toast.success(`Vote recorded! ${voteType === 'up' ? '👍' : '👎'}`);
  };

  const handleJoinDJSession = () => {
    if (activeDJSession.isActive) {
      // Join the existing DJ session
      onStartDJ(true); // Pass true to indicate joining an existing session
      toast.success(`Joined ${activeDJSession.host.username}'s DJ session!`);
    }
  };

  const handleStartDJClick = () => {
    setShowDJConfig(true);
  };

  const handleStartDJSession = (config) => {
    // Start DJ session with configuration
    onStartDJ(false, config);
    toast.success('DJ Session started! 🎵');
  };

  const formatSessionDuration = (startTime) => {
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const renderMessage = (message) => {
    if (message.type === 'chat') {
      return (
        <div key={message.id} className="flex gap-3 p-4 hover:bg-accent/50 rounded-xl transition-colors duration-150">
          <Avatar className="w-9 h-9 shadow-sm">
            <AvatarImage src={message.user.avatar} />
            <AvatarFallback>{message.user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">{message.user.username}</span>
              {message.user.verified && <Crown className="w-3 h-3 text-ring" />}
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{message.message}</p>
          </div>
        </div>
      );
    }

    if (message.type === 'music') {
      const isPlaying = currentlyPlaying?.messageId === message.id;
      
      return (
        <div key={message.id} className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-7 h-7 shadow-sm">
              <AvatarImage src={message.user.avatar} />
              <AvatarFallback>{message.user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{message.user.username}</span>
            {message.user.verified && <Crown className="w-3 h-3 text-ring" />}
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
              added track • {formatTimestamp(message.timestamp)}
            </span>
          </div>
          
          <Card className={`border-2 transition-all duration-200 ${isPlaying ? 'border-ring shadow-lg shadow-ring/20 scale-[1.02]' : 'border-border hover:border-border shadow-sm hover:shadow-md'}`}>
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div className="relative group">
                  <img 
                    src={message.track.artwork} 
                    alt={message.track.title}
                    className="w-20 h-20 rounded-xl object-cover shadow-md"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute inset-0 bg-black/50 hover:bg-black/70 border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => handlePlayTrack(message.track, message.id)}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-base font-medium mb-1">{message.track.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{message.track.artist}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{message.track.duration}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-3 hover:bg-secondary"
                    onClick={() => handleVote(message.id, 'up')}
                    disabled={votedTracks.has(message.id)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    <span className="text-sm">{message.votes.up}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-3 hover:bg-secondary"
                    onClick={() => handleVote(message.id, 'down')}
                    disabled={votedTracks.has(message.id)}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    <span className="text-sm">{message.votes.down}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-card to-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: channelInfo.color }}
            >
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium">{channelInfo.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{channelInfo.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
              <Users className="w-4 h-4" />
              <span>{channelInfo.members.toLocaleString()} members</span>
            </div>
            
            {activeDJSession.isActive ? (
              <div className="flex items-center gap-4">
                {/* Active DJ Session Info */}
                <div className="bg-ring/10 border border-ring/20 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-ring/20 rounded-lg flex items-center justify-center">
                      <Radio className="w-4 h-4 text-ring animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ring">Live DJ Session</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={activeDJSession.host.avatar} />
                          <AvatarFallback className="text-xs">
                            {activeDJSession.host.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>@{activeDJSession.host.username}</span>
                        {activeDJSession.host.verified && <Crown className="w-3 h-3 text-ring" />}
                        <span>•</span>
                        <span>{activeDJSession.listeners} listening</span>
                        <span>•</span>
                        <span>{formatSessionDuration(activeDJSession.startedAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {activeDJSession.currentTrack && (
                    <div className="mt-3 pt-3 border-t border-ring/20">
                      <MiniPlayer 
                        track={{
                          ...activeDJSession.currentTrack,
                          duration: '3:41' // Mock duration
                        }}
                        isPlaying={true}
                        showControls={false}
                      />
                    </div>
                  )}
                </div>
                
                {/* Join/Return Button */}
                {activeDJSession.host.username === user.username ? (
                  <Button
                    onClick={onStartDJ}
                    className="bg-ring text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 px-6"
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    Return to Session
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoinDJSession}
                    variant="outline"
                    className="border-ring text-ring hover:bg-ring hover:text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 px-6"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={handleStartDJClick}
                className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 px-6"
              >
                <Radio className="w-4 h-4 mr-2" />
                Start DJ Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Active DJ Session Banner */}
          {activeDJSession.isActive && (
            <div className="mb-4 mx-2">
              <Card className="border-ring/30 bg-gradient-to-r from-ring/10 to-ring/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-ring/20 rounded-full flex items-center justify-center">
                      <Radio className="w-5 h-5 text-ring animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-ring">
                        🎵 DJ Session in Progress
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activeDJSession.host.username} is live with {activeDJSession.listeners} listeners
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleJoinDJSession}
                      className="bg-ring text-white hover:bg-ring/90"
                    >
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${channelInfo.name}`}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-input-background border-border focus:border-ring transition-colors duration-200"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim()}
            className="shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* DJ Session Configuration Modal */}
      <DJSessionConfig
        user={user}
        channel={channel}
        isOpen={showDJConfig}
        onClose={() => setShowDJConfig(false)}
        onStart={handleStartDJSession}
      />
    </div>
  );
}