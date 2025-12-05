import React from 'react';
import { motion } from 'motion/react';
import { formatXP, getBadgeColor } from '../utils/progression';

interface ProgressBarProps {
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
  badge: string;
  className?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  totalXP,
  level,
  currentLevelXP,
  nextLevelXP,
  progress,
  badge,
  className = '',
  showDetails = true,
  size = 'md'
}: ProgressBarProps) {
  const badgeColor = getBadgeColor(level);
  const isMaxLevel = level >= 6;
  
  const sizeClasses = {
    sm: 'h-2 text-xs',
    md: 'h-3 text-sm',
    lg: 'h-4 text-base'
  };

  const paddingClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${paddingClasses[size]} ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full bg-${badgeColor} flex items-center justify-center`}>
              <span className="text-background font-black text-xs">
                {level}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{badge}</h4>
              <p className="text-muted-foreground text-xs">{formatXP(totalXP)} total</p>
            </div>
          </div>
          
          {!isMaxLevel && (
            <div className="text-right">
              <p className="text-muted-foreground text-xs">
                {nextLevelXP - totalXP} XP to next level
              </p>
              <p className="text-accent-coral text-xs font-medium">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div className={`w-full bg-muted rounded-full ${sizeClasses[size].split(' ')[0]}`}>
          <motion.div
            className={`bg-accent-coral rounded-full ${sizeClasses[size].split(' ')[0]} transition-all duration-500`}
            style={{ width: `${Math.min(progress, 100)}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        
        {isMaxLevel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-accent-yellow font-black text-xs">
              MAX LEVEL
            </span>
          </div>
        )}
      </div>

      {showDetails && !isMaxLevel && (
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatXP(currentLevelXP)}</span>
          <span>{formatXP(nextLevelXP)}</span>
        </div>
      )}
    </div>
  );
}