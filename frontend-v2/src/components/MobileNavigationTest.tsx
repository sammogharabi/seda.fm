import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MobileNavigation } from './MobileNavigation';
import { MobileHeader } from './MobileHeader';
import { MobileDebugUtils } from './MobileDebugUtils';
import { toast } from 'sonner@2.0.3';

export function MobileNavigationTest() {
  const [currentView, setCurrentView] = useState('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDebugUtils, setShowDebugUtils] = useState(false);

  // Mock user for testing
  const mockUser = {
    id: 'test-user',
    username: 'test_user',
    displayName: 'Test User',
    points: 100,
    verified: false
  };

  const handleViewChange = (view: string) => {
    console.log('🔄 TEST: View changing to:', view);
    setCurrentView(view);
    toast.success(`Navigated to ${view}`, { duration: 2000 });
  };

  const handleCreateClick = () => {
    console.log('➕ TEST: Create button clicked');
    toast.success('Create button clicked!', { duration: 2000 });
  };

  const handleRoomSelect = (room: string) => {
    console.log('🏠 TEST: Room selected:', room);
    toast.success(`Room selected: ${room}`, { duration: 2000 });
  };

  const getViewContent = () => {
    switch (currentView) {
      case 'feed':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-accent-coral">Home Feed</h2>
            <p>Welcome to your feed! This is where you'll see posts from artists and fans you follow.</p>
            <div className="bg-card p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Test post content would appear here</p>
            </div>
          </div>
        );
      case 'discover':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-accent-blue">Discover</h2>
            <p>Discover new artists, tracks, and trending content.</p>
            <div className="bg-card p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Discovery content would appear here</p>
            </div>
          </div>
        );
      case 'rooms':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-accent-mint">Rooms</h2>
            <p>Join music rooms and connect with other fans.</p>
            <div className="bg-card p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Room list would appear here</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-accent-yellow">Profile</h2>
            <p>Your profile and settings.</p>
            <div className="bg-card p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Profile content would appear here</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Unknown View</h2>
            <p>Current view: {currentView}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <MobileHeader
        user={mockUser}
        currentRoom="#test"
        currentView={currentView}
        onRoomSelect={handleRoomSelect}
        onViewChange={handleViewChange}
        onLogout={() => console.log('Logout clicked')}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onCreateClick={handleCreateClick}
        onOpenSearch={() => toast.success('Search clicked!')}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20">
        {/* Tab Switcher */}
        <div className="mb-6 flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showDebugUtils 
                ? 'bg-accent-coral text-background' 
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setShowDebugUtils(false)}
          >
            Navigation Test
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showDebugUtils 
                ? 'bg-accent-coral text-background' 
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
            onClick={() => setShowDebugUtils(true)}
          >
            Debug Utils
          </button>
        </div>

        {showDebugUtils ? (
          <MobileDebugUtils />
        ) : (
          <>
            {/* Debug Info */}
            <div className="mb-6 p-4 bg-accent-coral/10 rounded-lg border border-accent-coral/20">
              <h3 className="font-bold text-accent-coral mb-2">🧪 Mobile Navigation Test</h3>
              <div className="text-sm space-y-1">
                <p><strong>Current View:</strong> {currentView}</p>
                <p><strong>Sidebar Open:</strong> {sidebarOpen ? 'Yes' : 'No'}</p>
                <p><strong>User Agent:</strong> {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
              </div>
            </div>

            {/* View Content with Animation */}
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {getViewContent()}
            </motion.div>

            {/* Touch Test Area */}
            <div className="mt-8 p-4 bg-card rounded-lg border">
              <h3 className="font-bold mb-3">Touch Test Area</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  className="p-4 bg-accent-coral text-background rounded-lg active:scale-95 transition-transform"
                  onClick={() => toast.success('Touch test 1 works!')}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  Test Button 1
                </button>
                <button 
                  className="p-4 bg-accent-blue text-background rounded-lg active:scale-95 transition-transform"
                  onClick={() => toast.success('Touch test 2 works!')}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  Test Button 2
                </button>
              </div>
            </div>

            {/* Navigation Debug */}
            <div className="mt-8 p-4 bg-card rounded-lg border">
              <h3 className="font-bold mb-3">Manual Navigation Test</h3>
              <div className="grid grid-cols-2 gap-2">
                {['feed', 'discover', 'rooms', 'profile'].map((view) => (
                  <button
                    key={view}
                    className={`p-2 rounded text-sm transition-colors ${
                      currentView === view 
                        ? 'bg-accent-coral text-background' 
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                    onClick={() => handleViewChange(view)}
                  >
                    Go to {view}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation
        currentView={currentView}
        onViewChange={handleViewChange}
        onCreateClick={handleCreateClick}
      />
    </div>
  );
}