import React, { useState } from 'react';
import { Button } from './ui/button';
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

export function ListeningView({ user, onNowPlaying, onStartDJ, onJoinSession }) {
  const [currentlyListening, setCurrentlyListening] = useState(null);

  const handleJoinSession = (session) => {
    setCurrentlyListening(session);
    onNowPlaying({
      ...session.currentTrack,
      addedBy: session.dj,
      sessionTitle: session.title
    });
    
    // Use the new join session functionality
    if (onJoinSession) {
      onJoinSession({
        ...session,
        host: session.dj?.username,
        queueSize: Math.floor(Math.random() * 20) + 5,
        listeners: Array.from({ length: session.listeners }, (_, i) => ({
          id: i,
          username: `listener_${i}`,
          verified: Math.random() > 0.8
        }))
      });
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Listening</h1>
            <p className="text-muted-foreground">
              Live DJ sessions and music experiences
            </p>
          </div>
          <Button 
            onClick={onStartDJ}
            className="bg-accent-coral text-background hover:bg-accent-coral/90"
          >
            <Radio className="w-4 h-4 mr-2" />
            Start DJ Session
          </Button>
        </div>

        <div className="space-y-12">
          {/* Live Sessions */}
          <section>
            <div className="flex items-center gap-2 md:gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent-coral rounded-full animate-pulse"></div>
                <h2 className="text-xl md:text-2xl font-semibold">Live Now</h2>
              </div>
              <Badge className="bg-accent-coral/10 text-accent-coral border-accent-coral/20 text-xs">
                {LIVE_SESSIONS.length} active sessions
              </Badge>
            </div>

            <div className="space-y-4 md:space-y-6">
              {LIVE_SESSIONS.map((session) => {
                const isListening = currentlyListening?.id === session.id;
                
                return (
                  <Card key={session.id} className={`transition-all duration-200 ${isListening ? 'border-accent-coral shadow-lg shadow-accent-coral/10' : 'hover:border-accent-coral/50'}`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        {/* DJ Info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-accent-coral text-background flex items-center justify-center border border-foreground/20 font-semibold text-lg md:text-xl">
                              {session.dj.displayName[0].toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-accent-mint border-2 border-card rounded-full animate-pulse"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-base md:text-lg truncate">{session.dj.displayName}</span>
                              {session.dj.verified && <Crown className="w-4 h-4 md:w-5 md:h-5 text-accent-yellow flex-shrink-0" />}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground truncate">@{session.dj.username}</p>
                          </div>
                        </div>

                        {/* Session Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-lg md:text-xl mb-2 truncate">{session.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                                <Badge className="bg-accent-blue/10 text-accent-blue border-accent-blue/20 text-xs">
                                  {session.genre}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{formatNumber(session.listeners)} listening</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{session.duration}</span>
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => handleJoinSession(session)}
                              className={`transition-all duration-200 w-full sm:w-auto min-h-[44px] ${isListening ? 'bg-accent-coral text-background hover:bg-accent-coral/90' : 'bg-accent-mint text-background hover:bg-accent-mint/90'}`}
                              size="sm"
                            >
                              {isListening ? (
                                <>
                                  <Volume2 className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">Listening</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <span className="truncate">Join Session</span>
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Currently Playing */}
                          {session.currentTrack && (
                            <div className="bg-accent-yellow/10 border-l-4 border-accent-yellow p-3 md:p-4 mb-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={session.currentTrack.artwork}
                                  alt={session.currentTrack.title}
                                  className="w-10 h-10 md:w-12 md:h-12 object-cover border border-foreground/20 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs md:text-sm truncate">{session.currentTrack.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{session.currentTrack.artist}</p>
                                </div>
                                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <Heart className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MessageCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex gap-1 md:gap-2 flex-wrap">
                            {session.tags.map((tag) => (
                              <Badge key={tag} className="bg-accent-mint/10 text-accent-mint border-accent-mint/20 text-xs">
                                {tag}
                              </Badge>
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
            <h2 className="text-xl md:text-2xl font-semibold mb-6">Recent Sessions</h2>
            
            <div className="space-y-4">
              {RECENT_SESSIONS.map((session) => (
                <Card key={session.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      {/* DJ Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-accent-blue text-background flex items-center justify-center border border-foreground/20 font-semibold text-lg md:text-xl flex-shrink-0">
                          {session.dj.displayName[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base md:text-lg truncate">{session.dj.displayName}</span>
                            {session.dj.verified && <Crown className="w-4 h-4 md:w-5 md:h-5 text-accent-yellow flex-shrink-0" />}
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">@{session.dj.username}</p>
                        </div>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-lg md:text-xl mb-2 truncate">{session.title}</h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {session.genre}
                              </Badge>
                              <span className="truncate">Ended {session.endedAt}</span>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">Peak: {formatNumber(session.peakListeners)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{session.duration}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm" disabled className="w-full sm:w-auto min-h-[44px]">
                            <Radio className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">Ended</span>
                          </Button>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1 md:gap-2 flex-wrap">
                          {session.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
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
      </div>
    </div>
  );
}