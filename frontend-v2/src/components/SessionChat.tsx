import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  Send, 
  Hash, 
  Music, 
  Heart, 
  MessageSquare,
  Crown,
  Disc3,
  Headphones
} from 'lucide-react';

// Mock chat data for demonstration
const MOCK_MESSAGES = [
  {
    id: 1,
    user: { username: 'beat_seeker', verified: false, accent: 'coral' },
    message: "This set is absolutely fire! 🔥",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    type: 'message'
  },
  {
    id: 2,
    user: { username: 'vinyl_collector', verified: true, accent: 'mint' },
    message: "ID on this track please??",
    timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
    type: 'message'
  },
  {
    id: 3,
    user: { username: 'dj_nova', verified: true, accent: 'blue' },
    message: "That's 'Midnight City' by M83 - classic!",
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    type: 'message',
    isDJ: true
  },
  {
    id: 4,
    user: { username: 'house_head', verified: false, accent: 'yellow' },
    message: "❤️ Loving the vibes tonight",
    timestamp: new Date(Date.now() - 1000 * 30), // 30 seconds ago
    type: 'message'
  }
];

export function SessionChat({ session, user, className = "" }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive - only within chat container
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    // Only auto-scroll for new messages, not on initial load
    if (messages.length > MOCK_MESSAGES.length) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      user: { 
        username: user?.username || 'anonymous', 
        verified: user?.verified || false,
        accent: user?.accentColor || 'coral'
      },
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    
    return timestamp.toLocaleDateString();
  };

  // Get accent color class
  const getAccentColor = (accent) => {
    switch (accent) {
      case 'coral': return 'bg-accent-coral text-background';
      case 'blue': return 'bg-accent-blue text-background';
      case 'mint': return 'bg-accent-mint text-background';
      case 'yellow': return 'bg-accent-yellow text-background';
      default: return 'bg-accent-coral text-background';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-card border border-border overflow-hidden rounded-lg ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent-coral" />
            <h3 className="font-semibold">Session Chat</h3>
          </div>
          <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20 text-xs">
            Live
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Headphones className="w-4 h-4" />
          <span>{Array.isArray(session?.listeners) ? session.listeners.length : (session?.listeners || 0)} listening</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="p-4 space-y-4">
            {/* Session Started Indicator */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-accent-mint/10 text-accent-mint px-3 py-1 text-xs border border-accent-mint/20">
                <Disc3 className="w-3 h-3 animate-spin" />
                <span>Session started by {session?.dj?.displayName || session?.host}</span>
              </div>
            </div>

            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className="group">
                <div className="flex items-start gap-3">
                  {/* User Avatar */}
                  <div className={`w-8 h-8 flex items-center justify-center text-sm font-semibold border border-foreground/20 flex-shrink-0 ${getAccentColor(msg.user.accent)}`}>
                    {msg.user.username[0].toUpperCase()}
                  </div>
                  
                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {msg.user.username}
                      </span>
                      {msg.user.verified && (
                        <Crown className="w-3 h-3 text-accent-yellow" />
                      )}
                      {msg.isDJ && (
                        <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20 text-xs px-1 py-0">
                          DJ
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(msg.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground leading-relaxed break-words">
                      {msg.message}
                    </p>
                    
                    {/* Message Actions */}
                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-accent-coral">
                        <Heart className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your thoughts about the session..."
            className="flex-1 bg-input-background border-border"
            maxLength={280}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!newMessage.trim()}
            className="bg-accent-coral text-background hover:bg-accent-coral/90 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        {/* Character count */}
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>Use @ to mention, # for topics</span>
          <span>{newMessage.length}/280</span>
        </div>
      </div>
    </div>
  );
}