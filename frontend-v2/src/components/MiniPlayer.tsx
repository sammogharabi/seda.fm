import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, Pause, Volume2, X, Maximize2, Users, Radio, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function MiniPlayer({
  track,
  isPlaying: externalIsPlaying = false,
  onPlayPause,
  showControls = true,
  onClose,
  isDJSession = false,
  onExpand,
  djSession
}) {

  const [isPlaying, setIsPlaying] = useState(externalIsPlaying);
  const [progress, setProgress] = useState(45); // Mock progress
  const [volume, setVolume] = useState(70);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  useEffect(() => {
    setIsPlaying(externalIsPlaying);
  }, [externalIsPlaying]);

  useEffect(() => {
    // Simulate track progress when playing
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.5;
          return newProgress >= 100 ? 0 : newProgress;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    const newPlayState = !isPlaying;
    setIsPlaying(newPlayState);
    if (onPlayPause) {
      onPlayPause(newPlayState);
    }
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      toast.info('Removed like');
    } else {
      setIsLiked(true);
      setIsDisliked(false); // Remove dislike if present
      toast.success('Liked track!');
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
      toast.info('Removed dislike');
    } else {
      setIsDisliked(true);
      setIsLiked(false); // Remove like if present
      toast.info('Disliked track');
    }
  };

  const formatTime = (percentage) => {
    if (!track?.duration) return '0:00';
    
    // Parse duration (e.g., "3:41" -> 221 seconds)
    const [mins, secs] = track.duration.split(':').map(Number);
    const totalSeconds = mins * 60 + secs;
    const currentSeconds = Math.floor((percentage / 100) * totalSeconds);
    
    const currentMins = Math.floor(currentSeconds / 60);
    const currentSecs = currentSeconds % 60;
    
    return `${currentMins}:${currentSecs.toString().padStart(2, '0')}`;
  };

  if (!track) {
    return (
      <div className="bg-secondary/30 rounded-lg p-3 text-center">
        <p className="text-sm text-muted-foreground">No track playing</p>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-24 left-1/2 transform -translate-x-1/2 md:bottom-8 md:left-1/2 md:-translate-x-1/2 bg-card border-2 border-foreground rounded-xl shadow-2xl z-[60] w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] md:max-w-5xl md:mx-auto"
      style={{ 
        zIndex: 9999
      }}
    >
      <div className="p-4">
        {/* DJ Session Header */}
        {isDJSession && djSession && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-accent-coral" />
              <span className="font-black text-sm text-accent-coral uppercase tracking-wide">LIVE DJ SESSION</span>
              {djSession.listeners && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{djSession.listeners.length}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onExpand && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onExpand}
                  className="h-8 w-8 p-0 hover:bg-accent-mint/20 hover:text-accent-mint"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              )}
              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Track artwork - Square style */}
          <div className="relative group">
            <img
              src={track.artwork}
              alt={track.title}
              className="w-14 h-14 object-cover rounded-lg border border-foreground/20"
            />
            {/* Now playing indicator */}
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-coral rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-base text-primary truncate">{track.title}</h4>
            <p className="font-mono text-sm text-muted-foreground truncate mb-2">{track.artist}</p>
            
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full h-2 bg-foreground/10 rounded-full">
                <div 
                  className="h-full bg-accent-coral rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-xs text-muted-foreground">
                <span>{formatTime(progress)}</span>
                <span>{track.duration}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2">
            {/* Like/Dislike buttons */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLike}
                className={`h-8 w-8 p-0 transition-colors ${
                  isLiked
                    ? 'text-accent-mint hover:text-accent-mint'
                    : 'text-muted-foreground hover:text-accent-mint'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDislike}
                className={`h-8 w-8 p-0 transition-colors ${
                  isDisliked
                    ? 'text-destructive hover:text-destructive'
                    : 'text-muted-foreground hover:text-destructive'
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Volume indicator */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <div className="w-12 h-1 bg-foreground/20 rounded-full">
                <div
                  className="h-full bg-accent-coral rounded-full transition-all duration-200"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>
          </div>

          {/* Non-DJ session close button */}
          {!isDJSession && onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-coral rounded-full animate-pulse"></div>
            <span className="font-mono text-xs font-black text-accent-coral uppercase tracking-wide">
              {isDJSession ? 'LIVE SESSION' : 'NOW PLAYING'}
            </span>
          </div>
          
          {isPlaying && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-3 bg-accent-mint rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-muted-foreground uppercase">
                {isDJSession ? 'LIVE' : 'STREAMING'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}