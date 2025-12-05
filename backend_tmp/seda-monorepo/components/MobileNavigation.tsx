import React, { useCallback } from 'react';
import { Button } from './ui/button';
import { Home, Compass, Music, User, Plus, Search, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isDJMode: boolean;
  onCreatePost?: () => void;
  onSearch?: () => void;
}

export function MobileNavigation({ currentView, onViewChange, isDJMode, onCreatePost, onSearch }: MobileNavigationProps) {
  if (isDJMode) return null;

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration for haptic feedback
    }
  }, []);

  const handleNavigation = useCallback((viewId: string) => {
    triggerHapticFeedback();
    onViewChange(viewId);
  }, [onViewChange, triggerHapticFeedback]);
  
  const navItems = [
    { id: 'feed', icon: Home, label: 'Home' },
    { id: 'discover', icon: Compass, label: 'Discover' },
    { id: 'create', icon: Plus, label: 'Create', action: onCreatePost },
    { id: 'listening', icon: Music, label: 'Music' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];
  
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 mobile-safe-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex h-16 items-center justify-around px-2 min-h-[44px] relative">
        {/* Animated background indicator */}
        <motion.div
          className="absolute bottom-0 h-1 bg-primary rounded-t-full"
          initial={false}
          animate={{
            left: `${(navItems.findIndex(item => item.id === currentView) / navItems.length) * 100}%`,
            width: `${100 / navItems.length}%`
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'create' && !currentView);
          const isCreateButton = item.id === 'create';
          
          return (
            <motion.div
              key={item.id}
              className="flex-1"
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col gap-1 h-12 min-w-0 w-full relative transition-all duration-200 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                } ${
                  isCreateButton 
                    ? 'bg-primary/10 hover:bg-primary/20 rounded-full mx-2' 
                    : ''
                }`}
                onClick={() => {
                  if (item.action) {
                    triggerHapticFeedback();
                    item.action();
                  } else {
                    handleNavigation(item.id);
                  }
                }}
              >
                <motion.div
                  animate={isActive ? { 
                    scale: [1, 1.2, 1],
                    rotate: isCreateButton ? [0, 180, 0] : 0
                  } : {}}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                >
                  <Icon className={`h-5 w-5 ${isCreateButton ? 'text-primary' : ''}`} />
                </motion.div>
                <span className={`text-xs truncate transition-all duration-200 ${
                  isActive ? 'font-medium' : ''
                }`}>
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && !isCreateButton && (
                  <motion.div
                    className="absolute -top-1 left-1/2 w-1 h-1 bg-primary rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{ transform: 'translateX(-50%)' }}
                  />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}