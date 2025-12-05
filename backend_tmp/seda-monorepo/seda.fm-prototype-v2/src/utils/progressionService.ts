/**
 * Progression Service
 * Manages XP tracking, level progression, and credit rewards
 */

import { 
  UserProgression, 
  XPAction, 
  calculateLevel, 
  calculateXPReward, 
  calculateLevelUpCredits,
  getLevelInfo,
  hasReachedSeasonalCap,
  validateSessionEligibility,
  createDefaultProgression,
  LEVEL_PROGRESSION
} from './progression';

export interface ProgressionUpdate {
  xpGained: number;
  levelUp: boolean;
  newLevel: number;
  creditsEarned: number;
  badgeUnlocked: string | null;
  progression: UserProgression;
}

export interface NotificationEvent {
  type: 'xp_gained' | 'level_up' | 'credits_earned' | 'badge_unlocked' | 'session_ineligible';
  title: string;
  description: string;
  xp?: number;
  credits?: number;
  level?: number;
  badge?: string;
  reason?: string;
}

class ProgressionService {
  private progressionData: Map<string, UserProgression> = new Map();
  private listeners: Map<string, (event: NotificationEvent) => void> = new Map();

  /**
   * Initialize or get user progression
   */
  getProgression(userId: string): UserProgression {
    if (!this.progressionData.has(userId)) {
      const stored = localStorage.getItem(`seda_progression_${userId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Ensure backwards compatibility
          if (!parsed.totalXP && parsed.djPoints) {
            parsed.totalXP = parsed.djPoints;
          }
          // Add new fields if missing
          const defaultProgression = createDefaultProgression();
          this.progressionData.set(userId, { ...defaultProgression, ...parsed });
        } catch (error) {
          console.error('Failed to parse stored progression:', error);
          this.progressionData.set(userId, createDefaultProgression());
        }
      } else {
        this.progressionData.set(userId, createDefaultProgression());
      }
    }
    return this.progressionData.get(userId)!;
  }

  /**
   * Save progression to localStorage
   */
  private saveProgression(userId: string, progression: UserProgression): void {
    this.progressionData.set(userId, progression);
    localStorage.setItem(`seda_progression_${userId}`, JSON.stringify(progression));
  }

  /**
   * Add XP and handle level progression
   */
  addXP(userId: string, action: XPAction): ProgressionUpdate {
    const progression = this.getProgression(userId);
    const xpGained = calculateXPReward(action);
    
    // Check if this is a DJ action and session is eligible
    if (action.type.startsWith('dj_') && action.sessionId) {
      // For demo purposes, we'll assume public sessions are eligible
      // In production, this would check actual session data
      if (!action.isPublicSession) {
        this.notifyListener(userId, {
          type: 'session_ineligible',
          title: 'Session Not Eligible',
          description: 'Only public sessions earn XP points',
          reason: 'Private session'
        });
        return {
          xpGained: 0,
          levelUp: false,
          newLevel: progression.level,
          creditsEarned: 0,
          badgeUnlocked: null,
          progression
        };
      }
    }

    if (xpGained === 0) {
      return {
        xpGained: 0,
        levelUp: false,
        newLevel: progression.level,
        creditsEarned: 0,
        badgeUnlocked: null,
        progression
      };
    }

    const oldLevel = progression.level;
    
    // Update XP totals
    progression.totalXP = Math.max(0, progression.totalXP + xpGained);
    
    // Track XP by source
    if (action.type.startsWith('dj_')) {
      progression.djPoints = Math.max(0, progression.djPoints + xpGained);
    } else if (action.type.startsWith('fan_')) {
      progression.fanSupportXP += xpGained;
    }

    // Calculate new level
    const levelInfo = calculateLevel(progression.totalXP);
    progression.level = levelInfo.level;

    let creditsEarned = 0;
    let badgeUnlocked: string | null = null;
    
    // Check for level up
    const levelUp = progression.level > oldLevel;
    if (levelUp) {
      // Award credits for new level
      creditsEarned = calculateLevelUpCredits(progression.level);
      
      // Check seasonal cap
      if (!hasReachedSeasonalCap(progression.seasonCredits)) {
        const actualCredits = Math.min(creditsEarned, 
          Math.max(0, hasReachedSeasonalCap(progression.seasonCredits) ? 0 : creditsEarned));
        
        progression.creditsEarned += actualCredits;
        progression.creditsBalance += actualCredits;
        progression.seasonCredits += actualCredits;
        creditsEarned = actualCredits;
      } else {
        creditsEarned = 0;
      }

      // Update badge
      const newLevelInfo = getLevelInfo(progression.level);
      if (newLevelInfo && newLevelInfo.badge !== progression.currentBadge) {
        badgeUnlocked = newLevelInfo.badge;
        progression.currentBadge = newLevelInfo.badge;
        if (!progression.badges.includes(newLevelInfo.badge)) {
          progression.badges.push(newLevelInfo.badge);
        }
      }
    }

    this.saveProgression(userId, progression);

    // Send notifications
    if (xpGained > 0) {
      this.notifyListener(userId, {
        type: 'xp_gained',
        title: `+${xpGained} XP`,
        description: this.getActionDescription(action),
        xp: xpGained
      });
    }

    if (levelUp) {
      this.notifyListener(userId, {
        type: 'level_up',
        title: `Level ${progression.level}!`,
        description: `You've reached ${progression.currentBadge}`,
        level: progression.level
      });
    }

    if (creditsEarned > 0) {
      this.notifyListener(userId, {
        type: 'credits_earned',
        title: `+${creditsEarned} Credits`,
        description: 'Redeemable for Premium subscription',
        credits: creditsEarned
      });
    }

    if (badgeUnlocked) {
      this.notifyListener(userId, {
        type: 'badge_unlocked',
        title: 'New Badge!',
        description: `Unlocked: ${badgeUnlocked}`,
        badge: badgeUnlocked
      });
    }

    return {
      xpGained,
      levelUp,
      newLevel: progression.level,
      creditsEarned,
      badgeUnlocked,
      progression
    };
  }

  /**
   * Spend credits (Premium upgrade only)
   */
  spendCredits(userId: string, amount: number, purpose: 'premium_upgrade' | 'premium_renewal'): boolean {
    const progression = this.getProgression(userId);
    
    if (progression.creditsBalance < amount) {
      return false;
    }

    progression.creditsBalance -= amount;
    progression.creditsSpent += amount;
    
    this.saveProgression(userId, progression);
    
    this.notifyListener(userId, {
      type: 'credits_earned', // Reusing type for spending notification
      title: 'Credits Redeemed',
      description: `${amount} credits used for ${purpose === 'premium_upgrade' ? 'Premium upgrade' : 'Premium renewal'}`,
      credits: -amount
    });

    return true;
  }

  /**
   * Get leaderboard data
   */
  getLeaderboard(type: 'dj' | 'fan' | 'combined' = 'combined'): Array<{userId: string, xp: number, level: number, badge: string}> {
    const leaderboard: Array<{userId: string, xp: number, level: number, badge: string}> = [];
    
    this.progressionData.forEach((progression, userId) => {
      let xp = 0;
      switch (type) {
        case 'dj':
          xp = progression.djPoints;
          break;
        case 'fan':
          xp = progression.fanSupportXP;
          break;
        default:
          xp = progression.totalXP;
      }
      
      leaderboard.push({
        userId,
        xp,
        level: progression.level,
        badge: progression.currentBadge
      });
    });

    return leaderboard.sort((a, b) => b.xp - a.xp);
  }

  /**
   * Register event listener
   */
  onNotification(userId: string, callback: (event: NotificationEvent) => void): void {
    this.listeners.set(userId, callback);
  }

  /**
   * Remove event listener
   */
  removeListener(userId: string): void {
    this.listeners.delete(userId);
  }

  /**
   * Notify listener of events
   */
  private notifyListener(userId: string, event: NotificationEvent): void {
    const listener = this.listeners.get(userId);
    if (listener) {
      listener(event);
    }
  }

  /**
   * Get human-readable action description
   */
  private getActionDescription(action: XPAction): string {
    switch (action.type) {
      case 'dj_track_played':
        return 'Track played in public DJ session';
      case 'dj_upvote':
        return 'Received upvote from audience';
      case 'dj_downvote':
        return 'Received downvote from audience';
      case 'fan_tip':
        return `Tipped artist $${action.value}`;
      case 'fan_track_purchase':
        return 'Purchased track';
      case 'fan_merch_purchase':
        return 'Purchased merchandise';
      case 'fan_ticket_purchase':
        return 'Purchased event ticket';
      case 'artist_reply_bonus':
        return 'Artist replied to your support';
      default:
        return 'Unknown action';
    }
  }

  /**
   * Simulate DJ session for demo
   */
  simulateDJSession(userId: string, isPublic: boolean = true): void {
    if (!isPublic) {
      this.notifyListener(userId, {
        type: 'session_ineligible',
        title: 'Private Session',
        description: 'Private sessions don\'t earn XP - switch to public to start earning!',
        reason: 'Session set to private'
      });
      return;
    }

    // Simulate track plays
    this.addXP(userId, {
      type: 'dj_track_played',
      value: 1,
      sessionId: 'demo-session',
      isPublicSession: isPublic
    });
  }

  /**
   * Simulate fan support action
   */
  simulateFanSupport(userId: string, action: 'tip' | 'track' | 'merch' | 'ticket', value?: number): void {
    switch (action) {
      case 'tip':
        this.addXP(userId, {
          type: 'fan_tip',
          value: value || 5 // $5 tip
        });
        break;
      case 'track':
        this.addXP(userId, {
          type: 'fan_track_purchase',
          value: 1
        });
        break;
      case 'merch':
        this.addXP(userId, {
          type: 'fan_merch_purchase',
          value: 1
        });
        break;
      case 'ticket':
        this.addXP(userId, {
          type: 'fan_ticket_purchase',
          value: 1
        });
        break;
    }
  }

  /**
   * Reset seasonal credits (called at season reset)
   */
  resetSeasonCredits(userId: string): void {
    const progression = this.getProgression(userId);
    progression.seasonCredits = 0;
    this.saveProgression(userId, progression);
  }

  /**
   * Get progression stats for display
   */
  getProgressionStats(userId: string) {
    const progression = this.getProgression(userId);
    const levelInfo = calculateLevel(progression.totalXP);
    
    return {
      ...progression,
      ...levelInfo,
      nextLevelInfo: getLevelInfo(progression.level + 1),
      canEarnMoreCredits: !hasReachedSeasonalCap(progression.seasonCredits),
      creditsToSeasonCap: Math.max(0, 125 - progression.seasonCredits)
    };
  }
}

// Create singleton instance
export const progressionService = new ProgressionService();