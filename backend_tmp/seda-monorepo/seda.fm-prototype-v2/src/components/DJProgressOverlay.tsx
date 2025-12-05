import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, Users, Clock, Music, Eye, EyeOff, Zap } from 'lucide-react';
import { formatXP } from '../utils/progression';
import { progressionService } from '../utils/progressionService';

interface DJProgressOverlayProps {
  userId: string;
  sessionId: string;
  isPublicSession: boolean;
  onTogglePublic?: (isPublic: boolean) => void;
  listeners: number;
  sessionDuration: string;
  tracksPlayed: number;
  className?: string;
}

export function DJProgressOverlay({
  userId,
  sessionId,
  isPublicSession,
  onTogglePublic,
  listeners,
  sessionDuration,
  tracksPlayed,
  className = ''
}: DJProgressOverlayProps) {
  const [sessionXP, setSessionXP] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [showEligibilityWarning, setShowEligibilityWarning] = useState(!isPublicSession);

  useEffect(() => {
    setShowEligibilityWarning(!isPublicSession);
  }, [isPublicSession]);

  const handleTrackPlay = () => {
    const update = progressionService.addXP(userId, {
      type: 'dj_track_played',
      value: 1,
      sessionId,
      isPublicSession
    });
    
    if (update.xpGained > 0) {
      setSessionXP(prev => prev + update.xpGained);
      setLastAction('Track played');
      
      // Clear action after 3 seconds
      setTimeout(() => setLastAction(null), 3000);
    }
  };

  const handleUpvote = () => {
    const update = progressionService.addXP(userId, {
      type: 'dj_upvote',
      value: 1,
      sessionId,
      isPublicSession
    });
    
    if (update.xpGained > 0) {
      setSessionXP(prev => prev + update.xpGained);
      setLastAction('Audience upvote');
      setTimeout(() => setLastAction(null), 3000);
    }
  };

  const handleDownvote = () => {
    const update = progressionService.addXP(userId, {
      type: 'dj_downvote',
      value: 1,
      sessionId,
      isPublicSession
    });
    
    if (update.xpGained !== 0) {
      setSessionXP(prev => prev + update.xpGained);
      setLastAction('Audience downvote');
      setTimeout(() => setLastAction(null), 3000);
    }
  };

  const sessionEligible = isPublicSession && listeners >= 3;
  const eligibilityColor = sessionEligible ? 'accent-mint' : 'muted';

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}>
      {/* Session Status Card */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 min-w-[280px] shadow-lg"
      >
        {/* Session Type Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isPublicSession ? (
              <Eye className="w-4 h-4 text-accent-mint" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium text-sm">
              {isPublicSession ? 'Public Session' : 'Private Session'}
            </span>
          </div>
          
          {onTogglePublic && (
            <Button
              onClick={() => onTogglePublic(!isPublicSession)}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
            >
              {isPublicSession ? 'Make Private' : 'Make Public'}
            </Button>
          )}
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className={`text-lg font-black text-${eligibilityColor}`}>
              {listeners}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              <Users className="w-3 h-3" />
              Listeners
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-black text-foreground">
              {tracksPlayed}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              <Music className="w-3 h-3" />
              Tracks
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-black text-foreground">
              {sessionDuration}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
              <Clock className="w-3 h-3" />
              Time
            </div>
          </div>
        </div>

        {/* XP Counter */}
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-coral" />
              <span className="font-medium text-sm">Session XP</span>
            </div>
            <Badge 
              variant="outline" 
              className={`font-black ${isPublicSession ? 'text-accent-coral border-accent-coral' : 'text-muted-foreground'}`}
            >
              {formatXP(sessionXP)}
            </Badge>
          </div>
          
          {lastAction && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-accent-mint mt-1"
            >
              +1 XP • {lastAction}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Eligibility Warning */}
      <AnimatePresence>
        {showEligibilityWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-3 text-sm"
          >
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-accent-yellow mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-accent-yellow">
                  {!isPublicSession ? 'Private sessions don\'t earn XP' : 'Session not eligible yet'}
                </p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  {!isPublicSession && <li>• Switch to public to start earning XP</li>}
                  {isPublicSession && listeners < 3 && <li>• Need at least 3 listeners</li>}
                  {isPublicSession && tracksPlayed < 3 && <li>• Play at least 3 tracks</li>}
                  {isPublicSession && <li>• Need audience engagement (votes/comments)</li>}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Action Buttons */}
      {isPublicSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2"
        >
          <p className="text-xs text-muted-foreground text-center mb-2">Demo Actions</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleTrackPlay}
              size="sm"
              variant="outline"
              className="text-xs h-8"
            >
              Play Track
            </Button>
            <Button
              onClick={handleUpvote}
              size="sm"
              variant="outline"
              className="text-xs h-8 text-accent-mint border-accent-mint"
            >
              Upvote
            </Button>
            <Button
              onClick={handleDownvote}
              size="sm"
              variant="outline"
              className="text-xs h-8 text-accent-coral border-accent-coral"
            >
              Downvote
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}