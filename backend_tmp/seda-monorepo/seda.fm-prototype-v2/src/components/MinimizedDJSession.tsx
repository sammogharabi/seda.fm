import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Maximize2, 
  X, 
  Play, 
  Pause, 
  Users, 
  Disc,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Crown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export function MinimizedDJSession({ 
  session, 
  currentTrack, 
  isPlaying,
  listeners,
  onExpand, 
  onLeave,
  onTogglePlay,
  onVote,
  user,
  volume,
  onVolumeToggle
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [progress, setProgress] = useState(45); // Mock progress

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

  if (!session) return null;

  const handleVote = (type) => {
    if (hasVoted) return;
    setHasVoted(true);
    onVote?.(type);
    // Reset vote state after cooldown
    setTimeout(() => setHasVoted(false), 30000);
  };

  const formatTime = (percentage) => {
    if (!currentTrack?.duration) return '0:00';
    
    // Parse duration (e.g., "3:41" -> 221 seconds)
    const [mins, secs] = currentTrack.duration.split(':').map(Number);
    const totalSeconds = mins * 60 + secs;
    const currentSeconds = Math.floor((percentage / 100) * totalSeconds);
    
    const currentMins = Math.floor(currentSeconds / 60);
    const currentSecs = currentSeconds % 60;
    
    return `${currentMins}:${currentSecs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50"
    >
      <div className="bg-card border-2 border-foreground p-4 relative overflow-hidden max-w-sm mx-auto">
        {/* Track Info and Controls - Same layout as MiniPlayer */}
        <div className="flex items-center gap-4 mb-4 relative">
          {/* Track artwork - Clean professional style */}
          <div className="relative group">
            {currentTrack ? (
              <img
                src={currentTrack.artwork}
                alt={currentTrack.title}
                className="w-14 h-14 object-cover border border-foreground/20"
              />
            ) : (
              <div className="w-14 h-14 bg-secondary border border-foreground/20 flex items-center justify-center">
                <Disc className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            
            <Button
              size="sm"
              variant="secondary"
              className="absolute inset-0 bg-black/60 hover:bg-black/80 border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={onTogglePlay}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </Button>
            
            {/* Now playing indicator */}
            {isPlaying && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-coral rounded-full animate-pulse"></div>
            )}
          </div>

          {/* Track info - Clean typography */}
          <div className="flex-1 min-w-0">
            <div className="border-b border-foreground/20 pb-2 mb-2">
              <h4 className="font-black text-base text-primary truncate">
                {currentTrack?.title || 'No track playing'}
              </h4>
              <p className="font-mono text-sm text-muted-foreground truncate">
                {currentTrack?.artist || session.title || 'Live Session'}
              </p>
            </div>
            
            {/* Progress bar - Clean style */}
            {currentTrack && (
              <div>
                <Progress value={progress} className="h-2 bg-foreground/10" />
                <div className="flex justify-between font-mono text-xs text-muted-foreground mt-1">
                  <span>{formatTime(progress)}</span>
                  <span>{currentTrack.duration || '0:00'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls - Clean buttons */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={onTogglePlay}
              className="h-10 w-10 p-0 border border-foreground/20 hover:border-accent-coral hover:bg-accent-coral/10"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <div className="w-12 h-1 bg-foreground/20">
                <div 
                  className="h-full bg-accent-coral transition-all duration-200"
                  style={{ width: `${volume || 70}%` }}
                />
              </div>
            </div>
          </div>

          {/* Session controls */}
          <div className="flex flex-col items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-accent-coral/10"
              onClick={onExpand}
              title="Expand to full screen"
            >
              <Maximize2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => {
                console.log('Close button clicked - leaving session');
                onLeave?.();
              }}
              title="Leave session"
            >
              <X className="w-3.5 h-3.5 stroke-2" />
            </Button>
          </div>
        </div>

        {/* Live status - Clean professional indicator */}
        <div className="flex items-center justify-between relative border-t border-foreground/20 pt-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-coral rounded-full animate-pulse"></div>
            <span className="font-mono text-xs font-black text-accent-coral uppercase tracking-wide">
              DJ SESSION LIVE
            </span>
            <Badge variant="secondary" className="bg-accent-coral/20 text-accent-coral border-accent-coral/30 text-xs px-1 py-0">
              {listeners?.length || 0} listening
            </Badge>
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
              <span className="font-mono text-xs text-muted-foreground uppercase">STREAMING</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}