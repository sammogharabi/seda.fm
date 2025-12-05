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

export function NowPlaying({ track, onToggleDJ }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(25);
  const [volume, setVolume] = useState(75);

  useEffect(() => {
    // Simulate track progress
    const interval = setInterval(() => {
      if (isPlaying && progress < 100) {
        setProgress(prev => prev + 0.3);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <Card className="border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-4 p-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-12 h-12 rounded object-cover"
          />
          
          <div className="min-w-0 flex-1">
            <h4 className="text-sm truncate">{track.title}</h4>
            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
            {track.addedBy && (
              <div className="flex items-center gap-1 mt-1">
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
                  <Crown className="w-3 h-3 text-yellow-500" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button size="sm" variant="ghost">
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 ml-2">
            <Button size="sm" variant="ghost">
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xs">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTime(Math.floor((progress / 100) * 240))}
          </span>
          <Progress value={progress} className="flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {track.duration || '4:00'}
          </span>
        </div>

        {/* Volume & DJ Mode */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Progress value={volume} className="w-20" />
          
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleDJ}
            className="ml-4"
          >
            <Radio className="w-4 h-4 mr-2" />
            DJ Mode
          </Button>
        </div>
      </div>
    </Card>
  );
}