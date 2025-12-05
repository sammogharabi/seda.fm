import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Card } from './ui/card';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  Radio,
  ThumbsUp,
  ThumbsDown,
  Crown
} from 'lucide-react';

export function NowPlaying({ track, onToggleDJ, isMobile = false }) {
  const [isPlaying, setIsPlaying] = useState(!!track);
  const [progress, setProgress] = useState(track ? 25 : 0);
  const [volume, setVolume] = useState(75);

  useEffect(() => {
    if (track) {
      setIsPlaying(true);
      setProgress(25);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [track]);

  useEffect(() => {
    // Simulate track progress
    const interval = setInterval(() => {
      if (isPlaying && progress < 100 && track) {
        setProgress(prev => prev + 0.3);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, progress, track]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMobile) {
    return (
      <div className="px-4 py-2">
        <Card className="border-t border-border bg-card shadow-lg">
          <div className="h-[120px] p-3 flex flex-col">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0">
                {track ? (
                  <img src={track.artwork} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Radio className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{track ? track.title : 'No track playing'}</h4>
                <p className="text-xs text-muted-foreground truncate">{track ? track.artist : 'Choose music to get started'}</p>
                {track?.addedBy && (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={track.addedBy.avatar} />
                      <AvatarFallback className="text-xs">{track.addedBy.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">@{track.addedBy.username}</span>
                    {track.addedBy.verified && <Crown className="w-3 h-3 text-ring" />}
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => track && setIsPlaying(!isPlaying)} disabled={!track} className="h-9 w-9">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button size="sm" variant="outline" onClick={onToggleDJ} className="w-16">
                  <Radio className={`w-4 h-4 mr-1 ${track?.isLiveSession ? 'animate-pulse' : ''}`} />
                  <span className="text-xs">{track?.isLiveSession ? 'Live' : 'DJ'}</span>
                </Button>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{track ? formatTime(Math.floor((progress / 100) * 240)) : '0:00'}</span>
                <span>{track ? (track.duration || '4:00') : '0:00'}</span>
              </div>
              <Progress value={track ? progress : 0} className="h-1" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-2">
      <Card className="border-t border-border bg-card shadow-lg">
        <div className="h-20 p-4">
          <table className="w-full h-full">
            <tbody>
              <tr className="h-full">
                {/* Track Info */}
                <td className="w-80 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {track ? (
                        <img src={track.artwork} alt={track.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Radio className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{track ? track.title : 'No track playing'}</h4>
                      <p className="text-xs text-muted-foreground truncate">{track ? track.artist : 'Choose music to get started'}</p>
                      {track?.addedBy && (
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={track.addedBy.avatar} />
                            <AvatarFallback className="text-xs">{track.addedBy.username[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">@{track.addedBy.username}</span>
                          {track.addedBy.verified && <Crown className="w-3 h-3 text-ring" />}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Controls */}
                <td className="w-40 align-middle text-center">
                  <div className="flex gap-1 justify-center">
                    <Button size="sm" variant="ghost" onClick={() => track && setIsPlaying(!isPlaying)} disabled={!track} className="h-8 w-8">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={!track} className="h-8 w-8">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" disabled={!track} className="h-8 w-8">
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" disabled={!track} className="h-8 w-8">
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </td>

                {/* Progress */}
                <td className="w-60 align-middle">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-8">{track ? formatTime(Math.floor((progress / 100) * 240)) : '0:00'}</span>
                    <Progress value={track ? progress : 0} className="flex-1" />
                    <span className="text-xs text-muted-foreground w-8">{track ? (track.duration || '4:00') : '0:00'}</span>
                  </div>
                </td>

                {/* Volume */}
                <td className="w-32 align-middle">
                  <div className="flex items-center gap-2 justify-center">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <Progress value={volume} className="w-16 h-2" />
                  </div>
                </td>

                {/* DJ Mode */}
                <td className="w-32 align-middle text-right">
                  <Button size="sm" variant="outline" onClick={onToggleDJ} className="w-28">
                    <Radio className={`w-4 h-4 mr-2 ${track?.isLiveSession ? 'animate-pulse' : ''}`} />
                    <span className="text-xs">{track?.isLiveSession ? 'Live' : 'DJ'}</span>
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}