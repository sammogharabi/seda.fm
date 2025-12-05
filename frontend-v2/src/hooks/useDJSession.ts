import { useState, useCallback } from 'react';

export interface DJSessionHook {
  // DJ Session State
  djSession: any;
  djQueue: any[];
  isDJMinimized: boolean;
  
  // DJ Session Actions
  setDJSession: (session: any) => void;
  setDJQueue: (queue: any[]) => void;
  setIsDJMinimized: (minimized: boolean) => void;
  
  // DJ Session Handlers
  handleStartDJ: (start?: boolean, sessionData?: any) => void;
  handleJoinSession: (sessionData: any) => void;
  handleMinimizeDJ: () => void;
  handleExpandDJ: () => void;
  handleEndDJSession: () => void;
}

export const useDJSession = (
  currentView: string,
  setCurrentView: (view: string) => void,
  nowPlaying: any,
  setNowPlaying: (track: any) => void
): DJSessionHook => {
  // DJ Session State
  const [djSession, setDJSession] = useState(null);
  const [djQueue, setDJQueue] = useState([]);
  const [isDJMinimized, setIsDJMinimized] = useState(false);

  // DJ Session Handlers
  const handleStartDJ = useCallback((start = true, sessionData = null) => {
    if (start) {
      // When starting DJ mode, clear any minimized session and navigate to DJ view
      setIsDJMinimized(false);
      setCurrentView('dj');
      if (sessionData) {
        setDJSession(sessionData);
      } else {
        // Clear any existing session when starting fresh DJ mode
        setDJSession(null);
      }
    } else {
      setIsDJMinimized(false);
      setDJSession(null);
      setCurrentView('feed');
      setDJQueue([]);
    }
  }, [setCurrentView]);

  const handleJoinSession = useCallback((sessionData) => {
    console.log('🎵 Joining session:', sessionData);
    // Only set session if we have valid session data
    if (sessionData && sessionData.title) {
      setDJSession(sessionData);
      setIsDJMinimized(false); // Show full session interface
      setCurrentView('dj'); // Navigate to DJ session page
    }
  }, [setCurrentView, setDJSession, setIsDJMinimized]);

  const handleMinimizeDJ = useCallback(() => {
    console.log('🎵 Minimizing DJ session...', { djSession, nowPlaying });

    // Ensure we have a DJ session object when minimizing
    if (!djSession) {
      const defaultSession = {
        title: 'Live DJ Session',
        listeners: [
          {id: 1, name: 'music_lover'},
          {id: 2, name: 'beat_seeker'},
          {id: 3, name: 'vinyl_collector'}
        ]
      };
      setDJSession(defaultSession);
      console.log('🎵 Created default DJ session:', defaultSession);
    }

    // Ensure nowPlaying is set when minimizing DJ so MiniPlayer shows
    if (!nowPlaying) {
      const defaultTrack = {
        title: 'One More Time',
        artist: 'Daft Punk',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        duration: '5:20'
      };
      setNowPlaying(defaultTrack);
      console.log('🎵 Set default now playing track:', defaultTrack);
    }

    setIsDJMinimized(true);
    // Don't automatically change view - let the caller decide where to navigate

    console.log('🎵 DJ minimized - should show MiniPlayer with DJ session');
  }, [nowPlaying, djSession, setNowPlaying, setDJSession, setIsDJMinimized]);

  const handleExpandDJ = useCallback(() => {
    setIsDJMinimized(false);
    setCurrentView('dj');
  }, [setCurrentView]);

  const handleEndDJSession = useCallback(() => {
    console.log('Ending DJ session');
    setIsDJMinimized(false);
    setDJSession(null);
    setDJQueue([]);
    setNowPlaying(null); // Clear now playing when ending DJ session
    if (currentView === 'dj') {
      setCurrentView('feed');
    }
  }, [currentView, setCurrentView, setNowPlaying]);

  return {
    // DJ Session State
    djSession,
    djQueue,
    isDJMinimized,
    
    // DJ Session Actions
    setDJSession,
    setDJQueue,
    setIsDJMinimized,
    
    // DJ Session Handlers
    handleStartDJ,
    handleJoinSession,
    handleMinimizeDJ,
    handleExpandDJ,
    handleEndDJSession,
  };
};