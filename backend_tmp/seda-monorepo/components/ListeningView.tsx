import React, { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
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
  UserPlus
} from 'lucide-react';

const LIVE_SESSIONS = [
  {
    id: 1,
    dj: {
      username: 'dj_nova',
      displayName: 'DJ Nova',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova',
      verified: true
    },
    title: 'Late Night Electronic Vibes',
    genre: 'Electronic',
    listeners: 247,
    duration: '2h 15m',
    currentTrack: {
      title: 'Midnight City',
      artist: 'M83',
      artwork: 'https://images.unsplash.com/photo-1583927109257-f21c74dd0c3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXIlMjBlbGVjdHJvbmljfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
    },
    isLive: true,
    tags: ['Chill', 'Study', 'Late Night']
  },
  {
    id: 2,
    dj: {
      username: 'house_legends',
      displayName: 'House Legends',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=house',
      verified: true
    },
    title: 'Classic House Throwbacks',
    genre: 'House',
    listeners: 189,
    duration: '1h 45m',
    currentTrack: {
      title: 'One More Time',
      artist: 'Daft Punk',
      artwork: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMG11c2ljfGVufDF8fHx8MTc1NTQ4OTcyMnww&ixlib=rb-4.1.0&q=80&w=300'
    },
    isLive: true,
    tags: ['90s', 'Dance', 'Classic']
  },
  {
    id: 3,
    dj: {
      username: 'vinyl_collector',
      displayName: 'Vinyl Collector',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vinyl',
      verified: false
    },
    title: 'Underground Hip Hop Session',
    genre: 'Hip Hop',
    listeners: 134,
    duration: '3h 02m',
    currentTrack: {
      title: 'Shook Ones',
      artist: 'Mobb Deep',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJ8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300'
    },
    isLive: true,
    tags: ['Underground', 'Boom Bap', 'NYC']
  }
];

const RECENT_SESSIONS = [
  {
    id: 4,
    dj: {
      username: 'ambient_dreams',
      displayName: 'Ambient Dreams',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ambient',
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
      username: 'indie_vibes',
      displayName: 'Indie Vibes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=indie',
      verified: false
    },
    title: 'Indie Rock Road Trip',
    genre: 'Indie',
    listeners: 0,
    duration: '2h 20m',
    endedAt: '5h ago',
    peakListeners: 156,
    isLive: false,
    tags: ['Road Trip', 'Alternative', 'Feel Good']
  }
];

export function ListeningView({ user, onNowPlaying, onStartDJ }) {
  const [currentlyListening, setCurrentlyListening] = useState(null);

  const handleJoinSession = (session) => {
    setCurrentlyListening(session);
    onNowPlaying({
      ...session.currentTrack,
      addedBy: session.dj,
      sessionTitle: session.title
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium">Listening</h1>
            <p className="text-sm text-muted-foreground mt-1">Join live DJ sessions and discover new music</p>
          </div>
          <Button 
            onClick={onStartDJ}
            className="bg-ring text-ring-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Radio className="w-4 h-4 mr-2" />
            Start DJ Session
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Live Sessions */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <h2 className="text-lg font-medium">Live Now</h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                {LIVE_SESSIONS.length} active sessions
              </Badge>
            </div>

            <div className="space-y-4">
              {LIVE_SESSIONS.map((session) => {
                const isListening = currentlyListening?.id === session.id;
                
                return (
                  <Card key={session.id} className={`border-2 transition-all duration-200 ${isListening ? 'border-ring shadow-lg shadow-ring/20 scale-[1.02]' : 'border-border hover:border-border shadow-sm hover:shadow-md'}`}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* DJ Info */}
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12 shadow-sm">
                              <AvatarImage src={session.dj.avatar} />
                              <AvatarFallback>{session.dj.displayName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-destructive border-2 border-card rounded-full animate-pulse"></div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{session.dj.displayName}</span>
                              {session.dj.verified && <Crown className="w-4 h-4 text-ring" />}
                            </div>
                            <p className="text-sm text-muted-foreground">@{session.dj.username}</p>
                          </div>
                        </div>

                        {/* Session Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium mb-1">{session.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <Badge variant="outline">{session.genre}</Badge>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {formatNumber(session.listeners)} listening
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {session.duration}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => handleJoinSession(session)}
                              className={`shadow-sm hover:shadow-md transition-all duration-200 ${isListening ? 'bg-destructive text-destructive-foreground' : ''}`}
                            >
                              {isListening ? (
                                <>
                                  <Volume2 className="w-4 h-4 mr-2" />
                                  Listening
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Join
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Currently Playing */}
                          {session.currentTrack && (
                            <div className="p-3 bg-secondary/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={session.currentTrack.artwork}
                                  alt={session.currentTrack.title}
                                  className="w-10 h-10 rounded-md object-cover shadow-sm"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{session.currentTrack.title}</p>
                                  <p className="text-xs text-muted-foreground">{session.currentTrack.artist}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="ghost" className="h-8 px-2">
                                    <Heart className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 px-2">
                                    <MessageCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex gap-1 mt-3">
                            {session.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Recent Sessions */}
          <section>
            <h2 className="text-lg font-medium mb-6">Recent Sessions</h2>
            
            <div className="space-y-4">
              {RECENT_SESSIONS.map((session) => (
                <Card key={session.id} className="border border-border hover:border-border shadow-sm hover:shadow-md transition-all duration-200 opacity-75">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* DJ Info */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 shadow-sm">
                          <AvatarImage src={session.dj.avatar} />
                          <AvatarFallback>{session.dj.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{session.dj.displayName}</span>
                            {session.dj.verified && <Crown className="w-4 h-4 text-ring" />}
                          </div>
                          <p className="text-sm text-muted-foreground">@{session.dj.username}</p>
                        </div>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium mb-1">{session.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="outline">{session.genre}</Badge>
                              <span>Ended {session.endedAt}</span>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                Peak: {formatNumber(session.peakListeners)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {session.duration}
                              </div>
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm" disabled>
                            <Radio className="w-4 h-4 mr-2" />
                            Ended
                          </Button>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1">
                          {session.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}