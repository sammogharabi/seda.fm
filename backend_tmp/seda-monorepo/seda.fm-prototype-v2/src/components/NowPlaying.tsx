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

  return (
    <Card className="border-t border-border bg-card/98 backdrop-blur-md shadow-lg">
      <div className={`flex items-center gap-3 ${isMobile ? 'p-3' : 'p-5'}`}>
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {track ? (
            <>
              <img
                src={track.artwork}
                alt={track.title}
                className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg object-cover shadow-md`}
              />
              
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium truncate">{track.title}</h4>
                <p className="text-xs text-muted-foreground truncate mb-1">{track.artist}</p>
                {track.addedBy && (
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={track.addedBy.avatar} />
                      <AvatarFallback className="text-xs">
                        {track.addedBy.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      @{track.addedBy.username}
                    </span>
                    {track.addedBy.verified && (
                      <Crown className="w-3 h-3 text-ring" />
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className={`${isMobile ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg bg-secondary/50 flex items-center justify-center`}>
                <Radio className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} text-muted-foreground`} />
              </div>
              
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-muted-foreground">No track playing</h4>
                <p className="text-xs text-muted-foreground/70">Choose music to get started</p>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => track && setIsPlaying(!isPlaying)}
            disabled={!track}
            className="h-9 w-9 hover:bg-secondary transition-colors duration-150 disabled:opacity-50"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button 
            size="sm" 
            variant="ghost" 
            disabled={!track}
            className="h-9 w-9 hover:bg-secondary transition-colors duration-150 disabled:opacity-50"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          {track && (
            <div className="flex items-center gap-1 ml-2">
              <Button size="sm" variant="ghost" className="h-9 w-9 hover:bg-secondary transition-colors duration-150">
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-9 w-9 hover:bg-secondary transition-colors duration-150">
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Progress */}
        {!isMobile && track && (
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xs">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(Math.floor((progress / 100) * 240))}
            </span>
            <Progress value={progress} className="flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {track.duration || '4:00'}
            </span>
          </div>
        )}

        {/* Volume & DJ Mode */}
        <div className="flex items-center gap-2">
          {!isMobile && (
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Progress value={volume} className="w-20 h-2" />
            </div>
          )}
          
          <Button
            size={isMobile ? "sm" : "sm"}
            variant="outline"
            onClick={onToggleDJ}
            className={`${isMobile ? 'px-3' : 'ml-2'} shadow-sm hover:shadow-md transition-all duration-200 ${track?.isLiveSession ? 'border-ring text-ring' : ''}`}
          >
            <Radio className={`w-4 h-4 mr-2 ${track?.isLiveSession ? 'animate-pulse' : ''}`} />
            {track?.isLiveSession ? 
              (isMobile ? 'Live' : 'Live Session') : 
              (isMobile ? 'DJ' : 'DJ Mode')
            }
          </Button>
        </div>
      </div>
      
      {/* Mobile Progress Bar */}
      {isMobile && track && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>{formatTime(Math.floor((progress / 100) * 240))}</span>
            <span className="flex-1"></span>
            <span>{track.duration || '4:00'}</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </Card>
  );
}