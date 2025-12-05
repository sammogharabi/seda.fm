import React, { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

export function MobileDebugUtils() {
  const [touchInfo, setTouchInfo] = useState({
    lastTouch: null,
    touchCount: 0,
    userAgent: '',
    screenInfo: '',
    viewportInfo: ''
  });

  useEffect(() => {
    // Device information
    const userAgent = navigator.userAgent;
    const screenInfo = `${screen.width}x${screen.height}`;
    const viewportInfo = `${window.innerWidth}x${window.innerHeight}`;

    setTouchInfo(prev => ({
      ...prev,
      userAgent,
      screenInfo,
      viewportInfo
    }));

    // Touch event listeners for debugging
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const now = new Date().toLocaleTimeString();
      
      setTouchInfo(prev => ({
        ...prev,
        lastTouch: {
          x: Math.round(touch.clientX),
          y: Math.round(touch.clientY),
          time: now,
          target: e.target.tagName || 'unknown'
        },
        touchCount: prev.touchCount + 1
      }));

      console.log('👆 Touch detected:', {
        x: touch.clientX,
        y: touch.clientY,
        target: e.target.tagName,
        time: now
      });
    };

    // Add global touch listener
    document.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  const testVibration = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
      toast.success('Vibration test triggered!');
    } else {
      toast.error('Vibration not supported on this device');
    }
  };

  const testTouch = (testName) => {
    console.log(`🧪 ${testName} touched`);
    toast.success(`${testName} touch registered!`, { duration: 2000 });
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Device Information */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="font-bold text-accent-coral mb-3">📱 Device Information</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Mobile Detection:</strong> {isMobileDevice() ? '✅ Mobile' : '❌ Desktop'}</div>
          <div><strong>Touch Support:</strong> {isTouchDevice() ? '✅ Touch' : '❌ No Touch'}</div>
          <div><strong>Screen:</strong> {touchInfo.screenInfo}</div>
          <div><strong>Viewport:</strong> {touchInfo.viewportInfo}</div>
          <div><strong>Touch Count:</strong> {touchInfo.touchCount}</div>
          {touchInfo.lastTouch && (
            <div><strong>Last Touch:</strong> ({touchInfo.lastTouch.x}, {touchInfo.lastTouch.y}) at {touchInfo.lastTouch.time} on {touchInfo.lastTouch.target}</div>
          )}
        </div>
      </div>

      {/* User Agent */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="font-bold text-accent-blue mb-3">🌐 User Agent</h3>
        <div className="text-xs break-all text-muted-foreground">
          {touchInfo.userAgent}
        </div>
      </div>

      {/* Touch Test Buttons */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="font-bold text-accent-mint mb-3">🔘 Touch Tests</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            className="p-4 bg-accent-coral text-background rounded-lg active:scale-95 transition-transform font-bold"
            onClick={() => testTouch('Coral Button')}
            onTouchStart={() => console.log('👆 Coral button touch start')}
            onTouchEnd={() => console.log('👆 Coral button touch end')}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              minHeight: '60px'
            }}
          >
            Coral Test
          </button>
          
          <button
            className="p-4 bg-accent-blue text-background rounded-lg active:scale-95 transition-transform font-bold"
            onClick={() => testTouch('Blue Button')}
            onTouchStart={() => console.log('👆 Blue button touch start')}
            onTouchEnd={() => console.log('👆 Blue button touch end')}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              minHeight: '60px'
            }}
          >
            Blue Test
          </button>
          
          <button
            className="p-4 bg-accent-mint text-background rounded-lg active:scale-95 transition-transform font-bold"
            onClick={() => testTouch('Mint Button')}
            onTouchStart={() => console.log('👆 Mint button touch start')}
            onTouchEnd={() => console.log('👆 Mint button touch end')}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              minHeight: '60px'
            }}
          >
            Mint Test
          </button>
          
          <button
            className="p-4 bg-accent-yellow text-background rounded-lg active:scale-95 transition-transform font-bold"
            onClick={testVibration}
            onTouchStart={() => console.log('👆 Vibration button touch start')}
            onTouchEnd={() => console.log('👆 Vibration button touch end')}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              minHeight: '60px'
            }}
          >
            Vibration Test
          </button>
        </div>
      </div>

      {/* CSS Media Query Tests */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="font-bold text-accent-yellow mb-3">📐 CSS Media Query Tests</h3>
        <div className="space-y-2 text-sm">
          <div className="block md:hidden text-accent-mint">✅ Mobile CSS (&lt; 768px) Active</div>
          <div className="hidden md:block text-accent-coral">✅ Desktop CSS (≥ 768px) Active</div>
          <div className="block lg:hidden text-muted-foreground">&lt; 1024px viewport</div>
          <div className="hidden lg:block text-muted-foreground">≥ 1024px viewport</div>
        </div>
      </div>

      {/* Interactive Area Test */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="font-bold text-accent-coral mb-3">🎯 Interactive Area Test</h3>
        <div className="space-y-3">
          <div
            className="p-6 bg-accent-coral/20 border-2 border-accent-coral/50 rounded-lg text-center cursor-pointer select-none"
            onClick={() => testTouch('Large Touch Area')}
            onTouchStart={() => console.log('👆 Large area touch start')}
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              minHeight: '80px'
            }}
          >
            <div className="font-bold">Large Touch Target</div>
            <div className="text-sm text-muted-foreground">Tap anywhere in this area</div>
          </div>
          
          <div className="flex gap-2">
            <button
              className="flex-1 p-2 bg-accent-blue/20 border border-accent-blue/50 rounded text-sm"
              onClick={() => testTouch('Small Button 1')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                minHeight: '44px'
              }}
            >
              Small 1
            </button>
            <button
              className="flex-1 p-2 bg-accent-mint/20 border border-accent-mint/50 rounded text-sm"
              onClick={() => testTouch('Small Button 2')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                minHeight: '44px'
              }}
            >
              Small 2
            </button>
            <button
              className="flex-1 p-2 bg-accent-yellow/20 border border-accent-yellow/50 rounded text-sm"
              onClick={() => testTouch('Small Button 3')}
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                minHeight: '44px'
              }}
            >
              Small 3
            </button>
          </div>
        </div>
      </div>

      {/* Console Instructions */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="font-bold text-accent-mint mb-3">🛠️ Debugging Instructions</h3>
        <div className="text-sm space-y-2">
          <p>1. Open browser dev tools (Console tab)</p>
          <p>2. Touch/tap any element to see console output</p>
          <p>3. Look for 👆 touch events and 🔄 navigation logs</p>
          <p>4. Check for any JavaScript errors</p>
          <p>5. Verify toast notifications appear</p>
        </div>
      </div>
    </div>
  );
}