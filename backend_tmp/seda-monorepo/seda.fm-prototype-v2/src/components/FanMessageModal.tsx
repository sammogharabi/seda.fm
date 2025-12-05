import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useIsMobile } from './ui/use-mobile';
import { 
  Send, 
  Heart, 
  MessageCircle, 
  CheckCircle, 
  UserPlus,
  Clock,
  TrendingUp
} from 'lucide-react';

interface FanMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  fan: any;
  currentUser: any;
  onSendMessage?: (fan: any, message: string, messageType: string) => void;
  onFollowUser?: (user: any) => void;
  isFollowing?: (userId: string) => boolean;
}

export function FanMessageModal({
  isOpen,
  onClose,
  fan,
  currentUser,
  onSendMessage,
  onFollowUser,
  isFollowing
}: FanMessageModalProps) {
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('general'); // general, collaboration, support
  const isMobile = useIsMobile();

  const getInitialBadgeColor = (accentColor: string) => {
    switch (accentColor) {
      case 'coral': return 'bg-accent-coral text-background';
      case 'blue': return 'bg-accent-blue text-background';
      case 'mint': return 'bg-accent-mint text-background';
      case 'yellow': return 'bg-accent-yellow text-background';
      default: return 'bg-foreground text-background';
    }
  };

  const handleSendMessage = useCallback(() => {
    if (!messageText.trim() || !fan) return;
    
    if (onSendMessage) {
      onSendMessage(fan, messageText, messageType);
    } else {
      // Default behavior
      toast.success(`Message sent to ${fan.displayName}!`, {
        description: `Your ${messageType} message has been delivered`
      });
    }
    
    setMessageText('');
    onClose();
  }, [messageText, messageType, fan, onSendMessage, onClose]);

  const handleFollowFan = useCallback(() => {
    if (onFollowUser) {
      onFollowUser(fan);
    } else {
      toast.success(`Following ${fan.displayName}!`);
    }
  }, [fan, onFollowUser]);

  const quickMessages = [
    {
      type: 'general',
      text: "Hey! Love your taste in music. Let's connect!",
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      type: 'collaboration', 
      text: "Would you be interested in collaborating on a music project?",
      icon: <UserPlus className="w-4 h-4" />
    },
    {
      type: 'support',
      text: "Thanks for supporting independent music. Keep discovering!",
      icon: <Heart className="w-4 h-4" />
    }
  ];

  if (!fan) return null;

  // Shared header content
  const HeaderContent = () => (
    <>
      <div className={`w-12 h-12 ${getInitialBadgeColor(fan.accentColor)} flex items-center justify-center font-black text-sm relative`}>
        {(fan.displayName || fan.username)?.[0]?.toUpperCase()}
        {fan.isFollowedByCurrentUser && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-blue rounded-full flex items-center justify-center">
            <CheckCircle className="w-2 h-2 text-background" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-black">{fan.displayName || fan.username}</p>
          {fan.verified && (
            <CheckCircle className="w-4 h-4 text-accent-blue" />
          )}
          {fan.isArtist && (
            <Badge variant="outline" className="text-xs">
              Artist
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-mono">@{fan.username}</p>
        
        {/* Fan Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {fan.followDate && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Followed {new Date(fan.followDate).toLocaleDateString()}</span>
            </div>
          )}
          {fan.activityScore && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{fan.activityScore} activity</span>
            </div>
          )}
          {fan.mutualConnections > 0 && (
            <div className="flex items-center gap-1">
              <UserPlus className="w-3 h-3" />
              <span>{fan.mutualConnections} mutual</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Shared body content
  const BodyContent = () => (
    <div className="space-y-6">
      {/* Quick Message Templates */}
      <div>
        <h4 className="text-sm font-medium mb-3">Quick Messages</h4>
        <div className="space-y-2">
          {quickMessages.map((template, index) => (
            <motion.button
              key={template.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
              onClick={() => {
                setMessageText(template.text);
                setMessageType(template.type);
              }}
              className="w-full p-3 text-left border border-foreground/10 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="text-accent-coral group-hover:scale-110 transition-transform">
                  {template.icon}
                </div>
                <span className="text-sm">{template.text}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Custom Message */}
      <div>
        <h4 className="text-sm font-medium mb-3">Custom Message</h4>
        <Textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Write your personalized message..."
          className="min-h-[120px] resize-none"
          maxLength={500}
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Badge 
              variant={messageType === 'general' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMessageType('general')}
            >
              General
            </Badge>
            <Badge 
              variant={messageType === 'collaboration' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMessageType('collaboration')}
            >
              Collaboration
            </Badge>
            <Badge 
              variant={messageType === 'support' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setMessageType('support')}
            >
              Support
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {messageText.length}/500
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {/* Follow Button if not following */}
          {!isFollowing || !isFollowing(fan.id) ? (
            <Button
              variant="outline"
              onClick={handleFollowFan}
              className="font-mono uppercase tracking-wide"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Follow
            </Button>
          ) : (
            <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Following
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-mono uppercase tracking-wide"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-accent-coral text-background hover:bg-accent-coral/90 font-mono uppercase tracking-wide"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
        <p>💌 Your message will be sent to {fan.displayName}'s inbox. Be respectful and follow community guidelines.</p>
      </div>
    </div>
  );

  // Render Sheet on mobile, Dialog on desktop
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto pb-safe" aria-describedby="fan-message-mobile-description">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <HeaderContent />
            </SheetTitle>
            <SheetDescription id="fan-message-mobile-description" className="sr-only">
              Send a direct message to {fan.displayName || fan.username}
            </SheetDescription>
          </SheetHeader>
          <BodyContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" aria-describedby="fan-message-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <HeaderContent />
          </DialogTitle>
          <DialogDescription id="fan-message-description" className="sr-only">
            Send a direct message to {fan.displayName || fan.username}
          </DialogDescription>
        </DialogHeader>
        <BodyContent />
      </DialogContent>
    </Dialog>
  );
}