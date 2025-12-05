import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Play, Pause, Volume2 } from 'lucide-react';

export function MiniPlayer({ track, isPlaying: externalIsPlaying = false, onPlayPause, showControls = true }) {
  const [isPlaying, setIsPlaying] = useState(externalIsPlaying);
  const [progress, setProgress] = useState(45); // Mock progress
  const [volume, setVolume] = useState(70);

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
    <div className="bg-gradient-to-r from-secondary/40 to-secondary/20 rounded-lg p-3 border border-border/50">
      <div className="flex items-center gap-3 mb-3">
        {/* Track artwork */}
        <div className="relative group">
          <img
            src={track.artwork}
            alt={track.title}
            className="w-12 h-12 rounded-lg object-cover shadow-sm"
          />
          {showControls && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute inset-0 bg-black/50 hover:bg-black/70 border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white" />
              )}
            </Button>
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{track.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
          
          {/* Progress bar */}
          <div className="mt-2">
            <Progress value={progress} className="h-1" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(progress)}</span>
              <span>{track.duration}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePlayPause}
              className="h-8 w-8 p-0 hover:bg-secondary"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <div className="w-12 h-1 bg-secondary rounded-full">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${volume}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-red-500">LIVE</span>
        </div>
        
        {isPlaying && (
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-3 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-2">Playing</span>
          </div>
        )}
      </div>
    </div>
  );
}