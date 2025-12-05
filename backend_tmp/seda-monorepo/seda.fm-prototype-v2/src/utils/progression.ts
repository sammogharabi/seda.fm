/**
 * DJ Points & Progression System
 * Unified XP system for DJ engagement and fan support
 */

export interface UserProgression {
  totalXP: number;
  level: number;
  djPoints: number;
  fanSupportXP: number;
  creditsEarned: number;
  creditsSpent: number;
  creditsBalance: number;
  currentBadge: string;
  badges: string[];
  seasonCredits: number; // Credits earned this season
  lastXPDecay: Date;
}

export interface XPAction {
  type: 'dj_track_played' | 'dj_upvote' | 'dj_downvote' | 'fan_tip' | 'fan_track_purchase' | 'fan_merch_purchase' | 'fan_ticket_purchase' | 'artist_reply_bonus';
  value: number;
  sessionId?: string;
  isPublicSession?: boolean;
  metadata?: Record<string, any>;
}

export interface LevelInfo {
  level: number;
  xpRequired: number;
  badge: string;
  creditsReward: number;
  description: string;
}

export interface SessionEligibility {
  isEligible: boolean;
  reason?: string;
  requirements: {
    isPublic: boolean;
    minListeners: number;
    minDuration: number;
    minTracks: number;
    hasEngagement: boolean;
  };
  metrics: {
    uniqueListeners: number;
    totalDuration: number;
    tracksPlayed: number;
    engagementCount: number;
  };
}

// Level progression table from PRD
export const LEVEL_PROGRESSION: LevelInfo[] = [
  { level: 1, xpRequired: 100, badge: 'Bronze Note', creditsReward: 0, description: 'Welcome to the underground' },
  { level: 2, xpRequired: 250, badge: 'Silver Note', creditsReward: 5, description: 'Finding your rhythm' },
  { level: 3, xpRequired: 500, badge: 'Gold Note', creditsReward: 10, description: 'Building the vibe' },
  { level: 4, xpRequired: 1000, badge: 'Platinum Note', creditsReward: 20, description: 'Crowd favorite' },
  { level: 5, xpRequired: 2000, badge: 'Diamond Note', creditsReward: 40, description: 'Underground legend' },
  { level: 6, xpRequired: 4000, badge: 'Prestige Badge', creditsReward: 50, description: 'Transcendent artist' },
];

// XP reward matrix from PRD
export const XP_REWARDS = {
  // DJ Mode (Public Sessions Only)
  DJ_TRACK_PLAYED: 1,
  DJ_UPVOTE: 1,
  DJ_DOWNVOTE: -1,
  
  // Fan Support Actions
  FAN_TIP_PER_DOLLAR: 5,
  FAN_TRACK_PURCHASE: 10,
  FAN_MERCH_PURCHASE: 20,
  FAN_TICKET_PURCHASE: 25,
  ARTIST_REPLY_BONUS: 10,
} as const;

// Credit economy constants
export const CREDIT_ECONOMY = {
  CREDITS_PER_PREMIUM_MONTH: 100,
  PREMIUM_MONTHLY_PRICE: 10,
  SEASONAL_CREDIT_CAP: 125,
  XP_TO_CREDITS_RATIO: 100, // 100 XP ≈ 1 credit at milestones
} as const;

// Session eligibility requirements
export const SESSION_REQUIREMENTS = {
  MIN_LISTENERS: 3,
  MIN_DURATION_MINUTES: 5,
  MIN_TRACKS: 3,
  MIN_ENGAGEMENT_THRESHOLD: 1,
  LISTENER_DURATION_PERCENTAGE: 0.8, // 80% of session
} as const;

/**
 * Calculate user level based on total XP
 */
export function calculateLevel(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  let currentLevel = 1;
  let currentLevelXP = 0;
  
  for (const levelInfo of LEVEL_PROGRESSION) {
    if (totalXP >= levelInfo.xpRequired) {
      currentLevel = levelInfo.level;
      currentLevelXP = levelInfo.xpRequired;
    } else {
      break;
    }
  }
  
  // Find next level
  const nextLevelInfo = LEVEL_PROGRESSION.find(l => l.level === currentLevel + 1);
  const nextLevelXP = nextLevelInfo ? nextLevelInfo.xpRequired : currentLevelXP;
  
  // Calculate progress to next level
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentLevelXP;
  const progress = xpNeededForNext > 0 ? (xpInCurrentLevel / xpNeededForNext) * 100 : 100;
  
  return {
    level: currentLevel,
    currentLevelXP,
    nextLevelXP,
    progress: Math.min(progress, 100)
  };
}

/**
 * Get level info for a specific level
 */
export function getLevelInfo(level: number): LevelInfo | null {
  return LEVEL_PROGRESSION.find(l => l.level === level) || null;
}

/**
 * Calculate XP reward for an action
 */
export function calculateXPReward(action: XPAction): number {
  switch (action.type) {
    case 'dj_track_played':
      return action.isPublicSession ? XP_REWARDS.DJ_TRACK_PLAYED : 0;
    case 'dj_upvote':
      return action.isPublicSession ? XP_REWARDS.DJ_UPVOTE : 0;
    case 'dj_downvote':
      return action.isPublicSession ? XP_REWARDS.DJ_DOWNVOTE : 0;
    case 'fan_tip':
      return Math.floor(action.value * XP_REWARDS.FAN_TIP_PER_DOLLAR);
    case 'fan_track_purchase':
      return XP_REWARDS.FAN_TRACK_PURCHASE;
    case 'fan_merch_purchase':
      return XP_REWARDS.FAN_MERCH_PURCHASE;
    case 'fan_ticket_purchase':
      return XP_REWARDS.FAN_TICKET_PURCHASE;
    case 'artist_reply_bonus':
      return XP_REWARDS.ARTIST_REPLY_BONUS;
    default:
      return 0;
  }
}

/**
 * Validate if a DJ session is eligible for XP rewards
 */
export function validateSessionEligibility(sessionData: {
  sessionType: 'public' | 'private';
  uniqueListeners: number;
  totalDuration: number; // in minutes
  tracksPlayed: number;
  engagementCount: number;
  sessionHash?: string;
}): SessionEligibility {
  const requirements = {
    isPublic: sessionData.sessionType === 'public',
    minListeners: sessionData.uniqueListeners >= SESSION_REQUIREMENTS.MIN_LISTENERS,
    minDuration: sessionData.totalDuration >= SESSION_REQUIREMENTS.MIN_DURATION_MINUTES,
    minTracks: sessionData.tracksPlayed >= SESSION_REQUIREMENTS.MIN_TRACKS,
    hasEngagement: sessionData.engagementCount >= SESSION_REQUIREMENTS.MIN_ENGAGEMENT_THRESHOLD,
  };
  
  const isEligible = Object.values(requirements).every(req => req === true);
  
  let reason: string | undefined;
  if (!isEligible) {
    if (!requirements.isPublic) reason = 'Session must be public to earn XP';
    else if (!requirements.minListeners) reason = `Need at least ${SESSION_REQUIREMENTS.MIN_LISTENERS} listeners`;
    else if (!requirements.minDuration) reason = `Session must be at least ${SESSION_REQUIREMENTS.MIN_DURATION_MINUTES} minutes`;
    else if (!requirements.minTracks) reason = `Must play at least ${SESSION_REQUIREMENTS.MIN_TRACKS} tracks`;
    else if (!requirements.hasEngagement) reason = 'Need at least one audience interaction';
  }
  
  return {
    isEligible,
    reason,
    requirements: {
      isPublic: requirements.isPublic,
      minListeners: SESSION_REQUIREMENTS.MIN_LISTENERS,
      minDuration: SESSION_REQUIREMENTS.MIN_DURATION_MINUTES,
      minTracks: SESSION_REQUIREMENTS.MIN_TRACKS,
      hasEngagement: requirements.hasEngagement,
    },
    metrics: {
      uniqueListeners: sessionData.uniqueListeners,
      totalDuration: sessionData.totalDuration,
      tracksPlayed: sessionData.tracksPlayed,
      engagementCount: sessionData.engagementCount,
    }
  };
}

/**
 * Calculate credits earned from reaching a new level
 */
export function calculateLevelUpCredits(newLevel: number): number {
  const levelInfo = getLevelInfo(newLevel);
  return levelInfo ? levelInfo.creditsReward : 0;
}

/**
 * Apply XP decay (called periodically to maintain engagement)
 */
export function calculateXPDecay(progression: UserProgression, daysSinceLastActivity: number): number {
  if (daysSinceLastActivity <= 7) return 0; // No decay for first week
  if (daysSinceLastActivity <= 30) return Math.floor(progression.totalXP * 0.01); // 1% per week after first week
  return Math.floor(progression.totalXP * 0.05); // 5% after 30 days of inactivity
}

/**
 * Check if user has reached seasonal credit cap
 */
export function hasReachedSeasonalCap(seasonCredits: number): boolean {
  return seasonCredits >= CREDIT_ECONOMY.SEASONAL_CREDIT_CAP;
}

/**
 * Format XP value for display
 */
export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M XP`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K XP`;
  return `${xp} XP`;
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return `${credits} credits`;
}

/**
 * Get badge color based on level
 */
export function getBadgeColor(level: number): string {
  if (level >= 6) return 'accent-yellow'; // Prestige
  if (level >= 5) return 'accent-blue'; // Diamond
  if (level >= 4) return 'accent-mint'; // Platinum
  if (level >= 3) return 'accent-coral'; // Gold
  if (level >= 2) return 'accent-light-blue'; // Silver
  return 'muted'; // Bronze
}

/**
 * Generate session hash for repeat detection
 */
export function generateSessionHash(djId: string, trackList: string[], startTime: Date): string {
  const trackString = trackList.sort().join(',');
  const dayString = startTime.toISOString().split('T')[0];
  return btoa(`${djId}-${trackString}-${dayString}`).slice(0, 16);
}

/**
 * Initialize default user progression
 */
export function createDefaultProgression(): UserProgression {
  return {
    totalXP: 0,
    level: 1,
    djPoints: 0,
    fanSupportXP: 0,
    creditsEarned: 0,
    creditsSpent: 0,
    creditsBalance: 0,
    currentBadge: 'Bronze Note',
    badges: ['Bronze Note'],
    seasonCredits: 0,
    lastXPDecay: new Date(),
  };
}