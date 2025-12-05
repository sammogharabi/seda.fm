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
import { toast } from 'sonner@2.0.3';
import { apiService, chatWebSocket } from '../services/api';

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
  '#hiphop': { name: 'Hip Hop', description: 'The latest in hip hop culture', members: 1247, color: '#ff6b6b' },
  '#electronic': { name: 'Electronic', description: 'Electronic music of all kinds', members: 892, color: '#4ecdc4' },
  '#rock': { name: 'Rock', description: 'Rock music through the ages', members: 1456, color: '#45b7d1' },
  '#ambient': { name: 'Ambient', description: 'Chill ambient soundscapes', members: 234, color: '#a29bfe' }
};

export function ChannelView({ channel, user, onStartDJ, onNowPlaying }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [votedTracks, setVotedTracks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const messagesEndRef = useRef(null);
  const channelInfo = CHANNEL_INFO[channel] || CHANNEL_INFO['#hiphop'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages from API on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        // #COMPLETION_DRIVE: Assuming channel names map to room IDs without '#' prefix
        // #SUGGEST_VERIFY: Check if backend expects room names with or without '#' prefix
        const channelRoomId = channel.replace('#', '');
        setRoomId(channelRoomId);
        
        const response = await apiService.getMessages(channelRoomId, { limit: 50 });
        setMessages(response.data || []);
        
        // Connect to WebSocket and join room
        chatWebSocket.connect(user.token);
        chatWebSocket.joinRoom(channelRoomId);
        
        // Set up real-time message listeners
        chatWebSocket.on('new_message', (messageData) => {
          setMessages(prev => [...prev, messageData]);
        });
        
        chatWebSocket.on('message_reaction', (reactionData) => {
          setMessages(prev => prev.map(msg => 
            msg.id === reactionData.messageId 
              ? { ...msg, reactions: reactionData.reactions }
              : msg
          ));
        });
        
      } catch (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
        // Fall back to mock data if API fails
        setMessages(MOCK_MESSAGES);
      } finally {
        setLoading(false);
      }
    };
    
    if (channel && user) {
      loadMessages();
    }
    
    // Cleanup on unmount
    return () => {
      if (roomId) {
        chatWebSocket.leaveRoom(roomId);
      }
      chatWebSocket.off('new_message');
      chatWebSocket.off('message_reaction');
    };
  }, [channel, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      // Send message via API
      await apiService.sendMessage(roomId, {
        text: newMessage,
        type: 'chat'
      });
      
      setNewMessage('');
      toast.success('Earned +2 DJ Points for chat participation!');
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // #COMPLETION_DRIVE: Fallback to local state update if API fails
      // #SUGGEST_VERIFY: Remove this fallback once API is stable
      const fallbackMessage = {
        id: Date.now(),
        type: 'chat',
        user: { username: user.username, avatar: user.avatar, verified: user.verified },
        text: newMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setNewMessage('');
    }
  };

  const handlePlayTrack = async (track, messageId) => {
    try {
      // Send track card to room if not already sent
      if (roomId && track.title && track.artist) {
        await apiService.sendTrackCard(roomId, {
          id: track.id || `track-${Date.now()}`,
          title: track.title,
          artist: track.artist,
          album: track.album,
          artworkUrl: track.artwork,
          provider: 'seda',
          uri: track.url,
          duration: track.duration ? parseInt(track.duration.split(':').reduce((acc, val) => acc * 60 + parseInt(val), 0)) : undefined,
          previewUrl: track.url
        });
      }
      
      setCurrentlyPlaying({ ...track, messageId });
      onNowPlaying({ ...track, messageId, addedBy: messages.find(m => m.id === messageId)?.user });
      toast.success('Earned +5 DJ Points for queueing a track!');
      
    } catch (error) {
      console.error('Error playing track:', error);
      // Still allow local playback even if API fails
      setCurrentlyPlaying({ ...track, messageId });
      onNowPlaying({ ...track, messageId, addedBy: messages.find(m => m.id === messageId)?.user });
      toast.success('Earned +5 DJ Points for queueing a track!');
    }
  };

  const handleVote = async (messageId, voteType) => {
    if (votedTracks.has(messageId)) {
      toast.error('You already voted on this track!');
      return;
    }

    try {
      // Use reaction API for voting
      const emoji = voteType === 'up' ? '👍' : '👎';
      await apiService.addReaction(messageId, emoji);
      
      setVotedTracks(prev => new Set([...prev, messageId]));
      toast.success(`Vote recorded! ${emoji}`);
      
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
      
      // #COMPLETION_DRIVE: Fallback to local state update if API fails
      // #SUGGEST_VERIFY: Remove this fallback once API is stable
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.type === 'music') {
          return {
            ...msg,
            votes: {
              ...msg.votes,
              [voteType]: (msg.votes?.[voteType] || 0) + 1
            }
          };
        }
        return msg;
      }));
      setVotedTracks(prev => new Set([...prev, messageId]));
    }
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
    // #COMPLETION_DRIVE: Handling both API and mock message formats
    // #SUGGEST_VERIFY: Standardize message format between frontend and backend
    const messageType = message.type || message.messageType;
    const messageText = message.text || message.message;
    const messageUser = message.user || message.author;
    const timestamp = message.timestamp || message.createdAt;
    
    if (messageType === 'chat' || messageType === 'text') {
      return (
        <div key={message.id} className="flex gap-3 p-3 hover:bg-accent/50 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarImage src={messageUser?.avatar || messageUser?.avatarUrl} />
            <AvatarFallback>{(messageUser?.username || messageUser?.displayName || 'U')[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{messageUser?.username || messageUser?.displayName}</span>
              {messageUser?.verified && <Crown className="w-3 h-3 text-yellow-500" />}
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(new Date(timestamp))}
              </span>
            </div>
            <p className="text-sm">{messageText}</p>
            
            {/* Show reactions if available */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <span key={index} className="text-xs bg-accent rounded px-2 py-1">
                    {reaction.emoji} {reaction.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (messageType === 'music' || messageType === 'track_card') {
      const isPlaying = currentlyPlaying?.messageId === message.id;
      const trackData = message.track || message.metadata;
      
      return (
        <div key={message.id} className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={messageUser?.avatar || messageUser?.avatarUrl} />
              <AvatarFallback>{(messageUser?.username || messageUser?.displayName || 'U')[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{messageUser?.username || messageUser?.displayName}</span>
            {messageUser?.verified && <Crown className="w-3 h-3 text-yellow-500" />}
            <span className="text-xs text-muted-foreground">
              added a track • {formatTimestamp(new Date(timestamp))}
            </span>
          </div>
          
          <Card className={`border-2 ${isPlaying ? 'border-[#00ff88] shadow-lg shadow-[#00ff88]/20' : 'border-border'}`}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative">
                  <img 
                    src={trackData?.artwork || trackData?.artworkUrl || '/placeholder-album.jpg'} 
                    alt={trackData?.title}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => { e.target.src = '/placeholder-album.jpg'; }}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute inset-0 bg-black/60 hover:bg-black/80 border-0"
                    onClick={() => handlePlayTrack(trackData, message.id)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-sm mb-1">{trackData?.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{trackData?.artist}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {trackData?.duration || '0:00'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => handleVote(message.id, 'up')}
                    disabled={votedTracks.has(message.id)}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    <span className="text-xs">{message.votes?.up || 0}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => handleVote(message.id, 'down')}
                    disabled={votedTracks.has(message.id)}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    <span className="text-xs">{message.votes?.down || 0}</span>
                  </Button>
                </div>
              </div>
              
              {/* Show track reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {message.reactions.map((reaction, index) => (
                    <span key={index} className="text-xs bg-accent rounded px-2 py-1">
                      {reaction.emoji} {reaction.count}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: channelInfo.color }}
            >
              <Music className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg">{channelInfo.name}</h2>
              <p className="text-sm text-muted-foreground">{channelInfo.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{channelInfo.members} members</span>
            </div>
            
            <Button
              onClick={onStartDJ}
              className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-black hover:opacity-90"
            >
              <Radio className="w-4 h-4 mr-2" />
              Start DJ Session
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">No messages yet. Start the conversation!</div>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${channelInfo.name}`}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}