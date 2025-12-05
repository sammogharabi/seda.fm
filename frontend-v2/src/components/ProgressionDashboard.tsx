import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, Award, Coins, Zap, Music, Heart, Star, Eye } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { CreditsWallet } from './CreditsWallet';
import { FanSupportActions } from './FanSupportActions';
import { DJProgressOverlay } from './DJProgressOverlay';
import { progressionService } from '../utils/progressionService';
import { calculateLevel, formatXP, LEVEL_PROGRESSION } from '../utils/progression';
import { toast } from 'sonner@2.0.3';

interface ProgressionDashboardProps {
  user: any;
  onUpdateUser?: (user: any) => void;
}

export function ProgressionDashboard({ user, onUpdateUser }: ProgressionDashboardProps) {
  const [userProgression, setUserProgression] = useState(null);
  const [isDJSessionActive, setIsDJSessionActive] = useState(false);
  const [sessionType, setSessionType] = useState<'public' | 'private'>('public');

  useEffect(() => {
    const progression = progressionService.getProgression(user.id);
    setUserProgression(progression);
  }, [user.id]);

  const handleProgressionUpdate = () => {
    const updatedProgression = progressionService.getProgression(user.id);
    setUserProgression(updatedProgression);
    
    // Sync user points
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        points: updatedProgression.totalXP
      });
    }
  };

  const handleDJAction = (action: 'play_track' | 'upvote' | 'downvote') => {
    progressionService.addXP(user.id, {
      type: `dj_${action}` as any,
      value: 1,
      sessionId: 'demo-session',
      isPublicSession: sessionType === 'public'
    });
    handleProgressionUpdate();
  };

  const handleFanAction = (action: 'tip' | 'track' | 'merch' | 'ticket', value?: number) => {
    progressionService.simulateFanSupport(user.id, action, value);
    handleProgressionUpdate();
  };

  const resetProgression = () => {
    localStorage.removeItem(`seda_progression_${user.id}`);
    const freshProgression = progressionService.getProgression(user.id);
    setUserProgression(freshProgression);
    toast.success('Progression reset!', {
      description: 'Starting fresh with a clean slate'
    });
  };

  const simulateLevel = (targetLevel: number) => {
    const targetLevelInfo = LEVEL_PROGRESSION.find(l => l.level === targetLevel);
    if (!targetLevelInfo) return;

    // Reset progression first
    localStorage.removeItem(`seda_progression_${user.id}`);
    
    // Add XP to reach target level
    for (let i = 0; i < targetLevelInfo.xpRequired; i += 10) {
      progressionService.addXP(user.id, {
        type: 'dj_track_played',
        value: 10,
        sessionId: 'demo-session',
        isPublicSession: true
      });
    }
    
    handleProgressionUpdate();
    toast.success(`Jumped to Level ${targetLevel}!`, {
      description: `Now ${targetLevelInfo.badge} with ${formatXP(targetLevelInfo.xpRequired)}`
    });
  };

  if (!userProgression) {
    return <div className="p-8 text-center">Loading progression data...</div>;
  }

  const levelInfo = calculateLevel(userProgression.totalXP);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-accent-coral" />
            <div>
              <h1 className="text-3xl font-semibold text-primary">
                Progression Dashboard
              </h1>
              <p className="text-muted-foreground">DJ Points & Fan Support System Demo</p>
            </div>
          </div>
        </div>

        {/* Main Progress Overview */}
        <div className="mb-8">
          <ProgressBar
            totalXP={userProgression.totalXP}
            level={userProgression.level}
            currentLevelXP={levelInfo.currentLevelXP}
            nextLevelXP={levelInfo.nextLevelXP}
            progress={levelInfo.progress}
            badge={userProgression.currentBadge}
            size="lg"
            className="bg-gradient-to-r from-accent-coral/10 to-accent-mint/10 border-accent-coral/20"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-lg text-center">
            <div className="text-2xl font-black text-accent-coral">
              {userProgression.level}
            </div>
            <div className="text-sm text-muted-foreground">Current Level</div>
            <div className="text-xs text-accent-coral mt-1">{userProgression.currentBadge}</div>
          </div>
          
          <div className="p-4 bg-accent-mint/10 border border-accent-mint/20 rounded-lg text-center">
            <div className="text-2xl font-black text-accent-mint">
              {formatXP(userProgression.totalXP)}
            </div>
            <div className="text-sm text-muted-foreground">Total XP</div>
            <div className="text-xs text-accent-mint mt-1">Combined Progress</div>
          </div>
          
          <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-center">
            <div className="text-2xl font-black text-accent-blue">
              {userProgression.creditsBalance}
            </div>
            <div className="text-sm text-muted-foreground">Credits Available</div>
            <div className="text-xs text-accent-blue mt-1">For Premium Upgrades</div>
          </div>

          <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg text-center">
            <div className="text-2xl font-black text-accent-yellow">
              {userProgression.badges.length}
            </div>
            <div className="text-sm text-muted-foreground">Badges Earned</div>
            <div className="text-xs text-accent-yellow mt-1">Collection Complete</div>
          </div>
        </div>

        {/* Demo Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* DJ Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-accent-coral" />
                DJ Session Actions
                <Badge variant="outline" className={`ml-auto text-xs ${sessionType === 'public' ? 'text-accent-mint border-accent-mint' : 'text-muted-foreground'}`}>
                  {sessionType === 'public' ? 'Public - Earns XP' : 'Private - No XP'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Session Type Toggle */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Session Type:</span>
                <Button
                  onClick={() => setSessionType(sessionType === 'public' ? 'private' : 'public')}
                  size="sm"
                  variant={sessionType === 'public' ? 'default' : 'outline'}
                  className={sessionType === 'public' ? 'bg-accent-mint text-background' : ''}
                >
                  {sessionType === 'public' ? 'Public' : 'Private'}
                </Button>
              </div>

              {/* DJ Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleDJAction('play_track')}
                  size="sm"
                  className="bg-accent-coral hover:bg-accent-coral/90 text-background"
                >
                  Play Track (+1 XP)
                </Button>
                <Button
                  onClick={() => handleDJAction('upvote')}
                  size="sm"
                  variant="outline"
                  className="border-accent-mint text-accent-mint hover:bg-accent-mint/10"
                >
                  Get Upvote (+1 XP)
                </Button>
                <Button
                  onClick={() => handleDJAction('downvote')}
                  size="sm"
                  variant="outline"
                  className="border-accent-coral text-accent-coral hover:bg-accent-coral/10"
                >
                  Get Downvote (-1 XP)
                </Button>
              </div>

              {/* DJ XP Display */}
              <div className="p-3 bg-accent-coral/10 border border-accent-coral/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">DJ Points:</span>
                  <span className="font-bold text-accent-coral">{formatXP(userProgression.djPoints)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fan Support Actions */}
          <FanSupportActions
            userId={user.id}
            artistName="Demo Artist"
            onXPUpdate={handleProgressionUpdate}
          />
        </div>

        {/* Credits Wallet */}
        <div className="mb-8">
          <CreditsWallet
            userId={user.id}
            creditsBalance={userProgression.creditsBalance}
            creditsEarned={userProgression.creditsEarned}
            seasonCredits={userProgression.seasonCredits}
            onCreditsUpdate={handleProgressionUpdate}
          />
        </div>

        {/* Level Simulation & Reset Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-yellow" />
              Demo Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {LEVEL_PROGRESSION.slice(0, 6).map((level) => (
                <Button
                  key={level.level}
                  onClick={() => simulateLevel(level.level)}
                  size="sm"
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <span className="text-xs">Level {level.level}</span>
                  <span className="text-xs text-muted-foreground">{level.badge}</span>
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={resetProgression}
                variant="outline"
                className="flex-1"
              >
                Reset Progress
              </Button>
              <Button
                onClick={() => {
                  // Add a bunch of random XP for testing
                  for (let i = 0; i < 10; i++) {
                    progressionService.addXP(user.id, {
                      type: Math.random() > 0.5 ? 'dj_track_played' : 'fan_tip',
                      value: Math.floor(Math.random() * 10) + 1,
                      sessionId: 'demo-session',
                      isPublicSession: true
                    });
                  }
                  handleProgressionUpdate();
                  toast.success('Added random XP!', {
                    description: 'Mixed DJ and fan support XP added'
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Add Random XP
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}