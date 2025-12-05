import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Music, Palette, Radio, X, Eye, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockFans, mockArtists } from '../data/mockData';

interface UserTypeSwitcherProps {
  currentUser: any;
  onSwitchUserType: (userType: 'fan' | 'artist') => void;
  onSelectUser: (user: any) => void;
  onViewChange?: (view: string) => void;
}

export function UserTypeSwitcher({ currentUser, onSwitchUserType, onSelectUser, onViewChange }: UserTypeSwitcherProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [switching, setSwitching] = useState(false);
  
  if (!isVisible) {
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="user-type-switcher fixed top-4 right-4 w-12 h-12 bg-accent-coral text-background rounded-full shadow-lg flex items-center justify-center hover:bg-accent-coral/90 transition-colors"
        style={{ zIndex: 10000 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Eye className="w-5 h-5" />
      </motion.button>
    );
  }
  
  // Use actual mock users for switching
  const sampleFan = mockFans[0]; // Beat Seeker - complete user object
  const sampleArtist = mockArtists[0]; // Underground Beats - complete user object

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="user-type-switcher fixed top-4 right-4 max-w-xs"
      style={{ zIndex: 10000 }}
    >
      <Card className="border-2 border-accent-coral/20 bg-background shadow-2xl border-solid">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-accent-coral" />
              Experience Switcher
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="w-6 h-6 p-0 hover:bg-accent-coral/10"
            >
              <X className="w-3 h-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Current User Display */}
          <div className="p-2 bg-secondary/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Current User:</div>
            <div className="font-medium text-sm">
              {currentUser?.displayName || 'Unknown User'}
              <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-accent-coral/10 text-accent-coral">
                {currentUser?.userType || 'unknown'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ID: {currentUser?.id || 'N/A'}
            </div>
          </div>

          {/* Quick Switch Buttons */}
          <div className="space-y-2">
            <Button
              size="sm"
              variant={currentUser?.userType === 'fan' ? 'default' : 'outline'}
              onClick={() => {
                if (currentUser?.userType === 'fan' || switching) return;
                
                setSwitching(true);
                console.log('🎵 Switching to Fan Experience');
                console.log('Fan user object:', sampleFan);
                
                try {
                  onSelectUser(sampleFan);
                } catch (error) {
                  console.error('Error switching to fan:', error);
                } finally {
                  // Visual feedback delay
                  setTimeout(() => setSwitching(false), 2000);
                }
              }}
              className="w-full justify-start gap-2 text-xs"
              disabled={currentUser?.userType === 'fan' || switching}
            >
              <Users className="w-3 h-3" />
              {switching && currentUser?.userType !== 'fan' ? 'Switching...' : 'Fan Experience'}
              {currentUser?.userType === 'fan' && (
                <span className="ml-auto text-xs text-accent-blue">ACTIVE</span>
              )}
            </Button>
            
            <Button
              size="sm" 
              variant={currentUser?.userType === 'artist' ? 'default' : 'outline'}
              onClick={() => {
                if (currentUser?.userType === 'artist' || switching) return;
                
                setSwitching(true);
                console.log('🎨 Switching to Artist Experience');
                console.log('Artist user object:', sampleArtist);
                
                try {
                  onSelectUser(sampleArtist);
                } catch (error) {
                  console.error('Error switching to artist:', error);
                } finally {
                  // Visual feedback delay
                  setTimeout(() => setSwitching(false), 2000);
                }
              }}
              className={`w-full justify-start gap-2 text-xs ${
                currentUser?.userType === 'artist' 
                  ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-accent-coral' 
                  : 'border-accent-coral/50 hover:bg-accent-coral/10 hover:border-accent-coral'
              }`}
              disabled={currentUser?.userType === 'artist' || switching}
            >
              <Radio className="w-3 h-3" />
              {switching && currentUser?.userType !== 'artist' ? 'Switching...' : 'Artist Experience'}
              {currentUser?.userType === 'artist' && (
                <span className="ml-auto text-xs text-background">ACTIVE</span>
              )}
            </Button>

            {onViewChange && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  console.log('📖 Opening Artist Guide');
                  onViewChange('artist-guide');
                }}
                className="w-full justify-start gap-2 text-xs border border-accent-mint/20 hover:bg-accent-mint/10"
              >
                <Palette className="w-3 h-3 text-accent-mint" />
                View Guide
              </Button>
            )}
            
            {/* Emergency Refresh Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                console.log('🔄 Emergency refresh triggered');
                setSwitching(false);
                // Force a page reload as last resort
                if (confirm('Force refresh the entire app? This will reset everything.')) {
                  window.location.reload();
                }
              }}
              className="w-full justify-start gap-2 text-xs border border-accent-yellow/20 hover:bg-accent-yellow/10"
            >
              <RefreshCw className="w-3 h-3 text-accent-yellow" />
              Emergency Refresh
            </Button>
          </div>

          {/* Current Features */}
          <div className="text-xs text-muted-foreground">
            {currentUser?.userType === 'artist' ? (
              <div className="space-y-1">
                <div>• Artist Dashboard</div>
                <div>• Analytics & Insights</div>
                <div>• Content Manager</div>
                <div>• Fan Community</div>
                <div>• Live Sessions</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div>• Social Feed</div>
                <div>• Discover Artists</div>
                <div>• Join Sessions</div>
                <div>• Music Crates</div>
                <div>• Messages</div>
              </div>
            )}
          </div>

          {/* Interface Status */}
          <div className="space-y-1">
            <div className="text-xs text-accent-mint flex items-center gap-1">
              <Music className="w-3 h-3" />
              {typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Desktop'} Interface
            </div>
            {currentUser?.userType === 'artist' && (
              <div className="text-xs text-accent-coral flex items-center gap-1">
                <Radio className="w-3 h-3" />
                Artist Mode Active
              </div>
            )}
            {currentUser?.userType === 'fan' && (
              <div className="text-xs text-accent-blue flex items-center gap-1">
                <Users className="w-3 h-3" />
                Fan Mode Active
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}