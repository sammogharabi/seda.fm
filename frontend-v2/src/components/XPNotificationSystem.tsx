import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Award, Coins, Star, AlertCircle } from 'lucide-react';
import { progressionService } from '../utils/progressionService';
import type { NotificationEvent } from '../utils/progressionService';
import { toast } from 'sonner';

interface XPNotificationSystemProps {
  userId: string;
  enabled?: boolean;
}

interface FloatingNotification {
  id: string;
  event: NotificationEvent;
  timestamp: number;
}

export function XPNotificationSystem({ userId, enabled = true }: XPNotificationSystemProps) {
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const handleNotification = (event: NotificationEvent) => {
      // Add floating notification
      const notification: FloatingNotification = {
        id: Math.random().toString(36).substr(2, 9),
        event,
        timestamp: Date.now()
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 3000);

      // Also show toast for important events
      if (event.type === 'level_up') {
        toast.success(`🎉 ${event.title}`, {
          description: event.description,
          duration: 5000,
        });
      } else if (event.type === 'credits_earned' && event.credits && event.credits > 0) {
        toast.success(`💰 ${event.title}`, {
          description: event.description,
          duration: 4000,
        });
      } else if (event.type === 'badge_unlocked') {
        toast.success(`🏆 ${event.title}`, {
          description: event.description,
          duration: 4000,
        });
      } else if (event.type === 'session_ineligible') {
        toast.warning(`⚠️ ${event.title}`, {
          description: event.description,
          duration: 3000,
        });
      }
    };

    progressionService.onNotification(userId, handleNotification);

    return () => {
      progressionService.removeListener(userId);
    };
  }, [userId, enabled]);

  const getNotificationIcon = (type: NotificationEvent['type']) => {
    switch (type) {
      case 'xp_gained':
        return <TrendingUp className="w-4 h-4" />;
      case 'level_up':
        return <Award className="w-4 h-4" />;
      case 'credits_earned':
        return <Coins className="w-4 h-4" />;
      case 'badge_unlocked':
        return <Star className="w-4 h-4" />;
      case 'session_ineligible':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: NotificationEvent['type']) => {
    switch (type) {
      case 'xp_gained':
        return 'accent-coral';
      case 'level_up':
        return 'accent-mint';
      case 'credits_earned':
        return 'accent-blue';
      case 'badge_unlocked':
        return 'accent-yellow';
      case 'session_ineligible':
        return 'muted';
      default:
        return 'accent-coral';
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification, index) => {
          const color = getNotificationColor(notification.event.type);
          const icon = getNotificationIcon(notification.event.type);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: index * 60, 
                scale: 1 
              }}
              exit={{ 
                opacity: 0, 
                y: -50, 
                scale: 0.8,
                transition: { duration: 0.2 }
              }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
              className={`mb-2 bg-background/95 backdrop-blur-sm border-2 border-${color} rounded-xl p-3 shadow-lg pointer-events-auto min-w-[200px] max-w-[300px]`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-${color} flex items-center justify-center text-background`}>
                  {icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-black text-${color} text-sm`}>
                    {notification.event.title}
                  </div>
                  <div className="text-muted-foreground text-xs truncate">
                    {notification.event.description}
                  </div>
                </div>

                {/* XP/Credits/Level indicator */}
                {notification.event.xp && (
                  <div className={`text-${color} font-black text-lg`}>
                    +{notification.event.xp}
                  </div>
                )}
                
                {notification.event.credits && notification.event.credits > 0 && (
                  <div className={`text-${color} font-black text-lg`}>
                    +{notification.event.credits}
                  </div>
                )}
                
                {notification.event.level && (
                  <div className={`text-${color} font-black text-lg`}>
                    L{notification.event.level}
                  </div>
                )}
              </div>

              {/* Animated progress bar for visual appeal */}
              <motion.div
                className={`mt-2 h-1 bg-${color}/20 rounded-full overflow-hidden`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: "linear" }}
              >
                <div className={`h-full bg-${color} rounded-full`} />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}