import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { ChannelView } from './components/ChannelView';
import { UserProfile } from './components/UserProfile';
import { Leaderboards } from './components/Leaderboards';
import { Playlists } from './components/Playlists';
import { DJMode } from './components/DJMode';
import { NowPlaying } from './components/NowPlaying';

export default function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState('channel');
  const [currentChannel, setCurrentChannel] = useState('#hiphop');
  const [isDJMode, setIsDJMode] = useState(false);
  const [nowPlaying, setNowPlaying] = useState(null);

  useEffect(() => {
    // Apply dark theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
    
    // Check for existing user session
    try {
      const savedUser = localStorage.getItem('seda_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setShowAuth(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setShowAuth(true);
    }
  }, []);

  const handleLogin = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('seda_user', JSON.stringify(userData));
      setShowAuth(false);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const handleLogout = () => {
    try {
      setUser(null);
      localStorage.removeItem('seda_user');
      setShowAuth(true);
      setCurrentView('channel');
      setCurrentChannel('#hiphop');
      setIsDJMode(false);
      setNowPlaying(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleChannelSelect = (channel) => {
    setCurrentChannel(channel);
    setCurrentView('channel');
    // Exit DJ mode when switching channels
    if (isDJMode) {
      setIsDJMode(false);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    // Exit DJ mode when switching views
    if (isDJMode && view !== 'channel') {
      setIsDJMode(false);
    }
  };

  const handleStartDJ = () => {
    setIsDJMode(true);
  };

  const handleToggleDJ = () => {
    setIsDJMode(!isDJMode);
  };

  const handleExitDJ = () => {
    setIsDJMode(false);
  };

  const handleNowPlaying = (track) => {
    setNowPlaying(track);
  };

  const renderMainContent = () => {
    if (isDJMode) {
      return (
        <DJMode 
          user={user}
          channel={currentChannel}
          onExit={handleExitDJ}
          onNowPlaying={handleNowPlaying}
        />
      );
    }

    switch (currentView) {
      case 'channel':
        return (
          <ChannelView 
            channel={currentChannel}
            user={user}
            onStartDJ={handleStartDJ}
            onNowPlaying={handleNowPlaying}
          />
        );
      case 'profile':
        return <UserProfile user={user} />;
      case 'leaderboards':
        return <Leaderboards user={user} />;
      case 'playlists':
        return <Playlists user={user} />;
      default:
        return (
          <ChannelView 
            channel={currentChannel}
            user={user}
            onStartDJ={handleStartDJ}
            onNowPlaying={handleNowPlaying}
          />
        );
    }
  };

  // Show auth modal if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-background dark">
        <AuthModal isOpen={showAuth} onLogin={handleLogin} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00ff88] to-[#00ccff] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold">S</span>
              </div>
              <h1 className="text-2xl bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
                sedā.fm
              </h1>
            </div>
            <p className="text-muted-foreground">Welcome to the music community</p>
          </div>
        </div>
        <Toaster theme="dark" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      {/* Main App Layout */}
      <div className="flex-1 flex">
        <Sidebar 
          user={user}
          currentChannel={currentChannel}
          currentView={currentView}
          onChannelSelect={handleChannelSelect}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          isDJMode={isDJMode}
        />
        
        <main className="flex-1 flex flex-col min-w-0">
          {renderMainContent()}
        </main>
      </div>

      {/* Persistent Now Playing Bar */}
      {nowPlaying && (
        <div className="sticky bottom-0">
          <NowPlaying 
            track={nowPlaying}
            onToggleDJ={handleToggleDJ}
          />
        </div>
      )}

      <Toaster theme="dark" />
    </div>
  );
}