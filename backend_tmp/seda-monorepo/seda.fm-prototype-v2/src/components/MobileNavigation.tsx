import React, { useCallback } from 'react';
import { Button } from './ui/button';
import { Home, Compass, User, Plus, List } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onCreateClick?: () => void;
  onOpenSearch?: () => void;
}

export function MobileNavigation({ currentView, onViewChange, onCreateClick, onOpenSearch }: MobileNavigationProps) {
  
  // Debug logging
  console.log('📱 MobileNavigation render:', { 
    currentView, 
    hasOnViewChange: !!onViewChange, 
    hasOnCreateClick: !!onCreateClick 
  });

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Short vibration for haptic feedback
    }
  }, []);

  const handleNavigation = useCallback((viewId: string) => {
    console.log('🔄 Mobile Navigation clicked:', viewId);
    console.log('🔄 onViewChange function:', onViewChange);
    console.log('🔄 Calling onViewChange with:', viewId);
    triggerHapticFeedback();
    try {
      onViewChange(viewId);
      console.log('🔄 onViewChange called successfully');
    } catch (error) {
      console.error('🔄 Error calling onViewChange:', error);
    }
  }, [onViewChange, triggerHapticFeedback]);

  const handleCreateClick = useCallback(() => {
    console.log('➕ Mobile Create button clicked');
    triggerHapticFeedback();
    if (onCreateClick) {
      onCreateClick();
    }
  }, [onCreateClick, triggerHapticFeedback]);
  
  // Left side navigation items
  const leftNavItems = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'discover', icon: Compass, label: 'Discover' }
  ];

  // Right side navigation items  
  const rightNavItems = [
    { id: 'crates', icon: List, label: 'Crates' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  const getActiveIndicatorPosition = () => {
    const totalItems = leftNavItems.length + 1 + rightNavItems.length; // +1 for create button
    let activeIndex = -1;

    if (leftNavItems.some(item => item.id === currentView)) {
      activeIndex = leftNavItems.findIndex(item => item.id === currentView);
    } else if (rightNavItems.some(item => item.id === currentView)) {
      activeIndex = leftNavItems.length + 1 + rightNavItems.findIndex(item => item.id === currentView);
    }

    if (activeIndex === -1) return { display: 'none' };

    return {
      left: `${(activeIndex / totalItems) * 100}%`,
      width: `${100 / totalItems}%`
    };
  };
  
  return (
    <nav className="mobile-navigation fixed bottom-0 left-0 right-0 z-50 border-t border-foreground/10 bg-background/95 backdrop-blur-sm pb-safe">
      <div className="relative flex h-16 items-center px-2 max-w-screen-sm mx-auto">
        {/* Active indicator */}
        <div
          className="absolute top-0 h-0.5 bg-accent-coral transition-all duration-300"
          style={getActiveIndicatorPosition()}
        />
        
        {/* Left Navigation Items */}
        <div className="flex flex-1 gap-1">
          {leftNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <div key={item.id} className="flex-1">
                <button
                  className={`flex flex-col items-center justify-center gap-1 h-14 w-full min-h-[44px] rounded-lg transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'text-accent-coral bg-accent-coral/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      handleNavigation(item.id);
                    }
                  }}
                  type="button"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`text-[10px] leading-none font-medium transition-all duration-200 ${
                    isActive ? 'text-accent-coral' : ''
                  }`}>
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Centered Create Button */}
        <div className="flex-shrink-0 px-2">
          <motion.button
            className="flex flex-col items-center justify-center gap-1 h-14 w-14 min-h-[44px] bg-accent-coral text-background hover:bg-accent-coral/90 rounded-2xl border-0 shadow-lg transition-colors duration-200"
            onClick={handleCreateClick}
            type="button"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-6 w-6 text-background flex-shrink-0" />
            <span className="text-[10px] text-background font-medium leading-none">Create</span>
          </motion.button>
        </div>

        {/* Right Navigation Items */}
        <div className="flex flex-1 gap-1">
          {rightNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <div key={item.id} className="flex-1">
                <button
                  className={`flex flex-col items-center justify-center gap-1 h-14 w-full min-h-[44px] rounded-lg transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'text-accent-coral bg-accent-coral/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      handleNavigation(item.id);
                    }
                  }}
                  type="button"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className={`text-[10px] leading-none font-medium transition-all duration-200 ${
                    isActive ? 'text-accent-coral' : ''
                  }`}>
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}