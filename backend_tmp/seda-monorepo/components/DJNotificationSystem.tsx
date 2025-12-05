import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  Radio, 
  X, 
  Users, 
  Crown,
  Bell,
  Music,
  Play
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Mock data for new DJ sessions from followed users
const MOCK_NEW_SESSIONS = [
  {
    id: 'session_1',
    host: {
      username: 'dj_luna',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
      verified: true,
      isFollowing: true
    },
    channel: '#electronic',
    currentTrack: {
      title: 'Midnight City',
      artist: 'M83',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
    },
    listeners: 12,
    startedAt: new Date()
  },
  {
    id: 'session_2',
    host: {
      username: 'beat_master_99',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=beat99',
      verified: false,
      isFollowing: true
    },
    channel: '#hiphop',
    currentTrack: {
      title: 'HUMBLE.',
      artist: 'Kendrick Lamar',
      artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop'
    },
    listeners: 8,
    startedAt: new Date(Date.now() - 120000) // 2 minutes ago
  }
];

export function DJNotificationSystem({ 
  followingList, 
  onJoinSession, 
  onChannelSwitch,
  isEnabled = true 
}) {
  const [notifications, setNotifications] = useState([]);
  const [dismissedSessions, setDismissedSessions] = useState(new Set());

  useEffect(() => {
    if (!isEnabled) return;

    // Simulate real-time notifications for followed users starting DJ sessions
    const checkForNewSessions = () => {
      MOCK_NEW_SESSIONS.forEach(session => {
        // Only show notifications for users we're following
        const isFollowingHost = followingList.some(user => 
          user.username === session.host.username
        );

        if (isFollowingHost && !dismissedSessions.has(session.id)) {
          // Check if we haven't already notified about this session
          const alreadyNotified = notifications.some(n => n.id === session.id);
          
          if (!alreadyNotified) {
            // Add to notifications
            setNotifications(prev => [...prev, session]);
            
            // Show toast notification
            showSessionNotification(session);
          }
        }
      });
    };

    // Check immediately and then every 30 seconds
    checkForNewSessions();
    const interval = setInterval(checkForNewSessions, 30000);

    return () => clearInterval(interval);
  }, [followingList, dismissedSessions, notifications, isEnabled]);

  const showSessionNotification = (session) => {
    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - date) / 1000);
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    };

    toast.custom(
      (t) => (
        <Card className="w-80 border-ring/30 bg-gradient-to-r from-ring/10 to-ring/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-ring/20 rounded-full flex items-center justify-center">
                <Radio className="w-4 h-4 text-ring animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-ring">
                  🎵 New DJ Session Started!
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.host.username} is now live in {session.channel}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.dismiss(t)}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={session.host.avatar} />
                <AvatarFallback>
                  {session.host.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{session.host.username}</span>
                  {session.host.verified && <Crown className="w-3 h-3 text-ring" />}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{session.listeners} listening</span>
                  <span>•</span>
                  <span>{formatTimeAgo(session.startedAt)}</span>
                </div>
              </div>
            </div>

            {session.currentTrack && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-secondary/30 rounded-lg">
                <img
                  src={session.currentTrack.artwork}
                  alt={session.currentTrack.title}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{session.currentTrack.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{session.currentTrack.artist}</p>
                </div>
                <Play className="w-3 h-3 text-muted-foreground" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onChannelSwitch(session.channel);
                  toast.dismiss(t);
                }}
                className="flex-1 text-xs"
              >
                View Channel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onJoinSession(session);
                  toast.dismiss(t);
                }}
                className="flex-1 bg-ring text-white hover:bg-ring/90 text-xs"
              >
                Join Session
              </Button>
            </div>
          </CardContent>
        </Card>
      ),
      {
        duration: 8000,
        position: 'top-right'
      }
    );
  };

  const handleDismissNotification = (sessionId) => {
    setDismissedSessions(prev => new Set([...prev, sessionId]));
    setNotifications(prev => prev.filter(n => n.id !== sessionId));
  };

  const handleJoinFromNotification = (session) => {
    onJoinSession(session);
    handleDismissNotification(session.id);
  };

  // Persistent notification bell (optional UI for viewing all active sessions)
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 space-y-2">
      {/* Notification Bell Icon */}
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full w-10 h-10 p-0 shadow-lg border-ring/20"
        >
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-ring text-white text-xs p-0 flex items-center justify-center">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
}

// Hook for managing DJ session notifications
export function useDJNotifications(followingList, settings = {}) {
  const [isEnabled, setIsEnabled] = useState(settings.enabled ?? true);
  const [notificationHistory, setNotificationHistory] = useState([]);

  const addNotification = (session) => {
    setNotificationHistory(prev => [
      { ...session, notifiedAt: new Date() },
      ...prev.slice(0, 49) // Keep last 50 notifications
    ]);
  };

  const toggleNotifications = () => {
    setIsEnabled(prev => !prev);
  };

  return {
    isEnabled,
    notificationHistory,
    addNotification,
    toggleNotifications
  };
}