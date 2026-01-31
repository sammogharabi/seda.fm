import { useState, useEffect, useCallback, useRef } from 'react';
import { getAppleMusicDeveloperToken, getStreamingConnections } from '../lib/api/streaming';

// MusicKit is loaded globally from Apple's CDN
declare const MusicKit: any;

interface MusicKitState {
  isInitialized: boolean;
  isAuthorized: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  volume: number;
  error: string | null;
}

interface Track {
  id: string;
  title?: string;
  name?: string;
  artist?: string;
  source?: string;
  provider?: string;
  platform?: string;
}

export function useMusicKit() {
  const [state, setState] = useState<MusicKitState>({
    isInitialized: false,
    isAuthorized: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    volume: 1,
    error: null,
  });

  const musicKitRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize MusicKit
  const initialize = useCallback(async () => {
    if (typeof MusicKit === 'undefined') {
      console.warn('[useMusicKit] MusicKit SDK not loaded');
      setState(prev => ({ ...prev, error: 'MusicKit SDK not loaded' }));
      return false;
    }

    if (musicKitRef.current) {
      console.log('[useMusicKit] Already initialized');
      return true;
    }

    try {
      // Get developer token from backend
      const { developerToken } = await getAppleMusicDeveloperToken();

      // Configure MusicKit
      await MusicKit.configure({
        developerToken,
        app: {
          name: 'sedā.fm',
          build: '1.0.0',
        },
      });

      musicKitRef.current = MusicKit.getInstance();

      // Check if user is already authorized
      const isAuthorized = musicKitRef.current.isAuthorized;

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isAuthorized,
        error: null,
      }));

      // Set up event listeners
      setupEventListeners();

      console.log('[useMusicKit] Initialized successfully, authorized:', isAuthorized);
      return true;
    } catch (error: any) {
      console.error('[useMusicKit] Initialization failed:', error);
      setState(prev => ({ ...prev, error: error.message }));
      return false;
    }
  }, []);

  // Set up MusicKit event listeners
  const setupEventListeners = useCallback(() => {
    if (!musicKitRef.current) return;

    const music = musicKitRef.current;

    // Playback state change
    music.addEventListener('playbackStateDidChange', (event: any) => {
      const isPlaying = event.state === MusicKit.PlaybackStates.playing;
      setState(prev => ({ ...prev, isPlaying }));
    });

    // Playback time change
    music.addEventListener('playbackTimeDidChange', (event: any) => {
      const currentTime = event.currentPlaybackTime || 0;
      const duration = event.currentPlaybackDuration || 0;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

      setState(prev => ({
        ...prev,
        currentTime,
        duration,
        progress,
      }));
    });

    // Media item change
    music.addEventListener('mediaItemDidChange', () => {
      // Reset progress when track changes
      setState(prev => ({
        ...prev,
        currentTime: 0,
        progress: 0,
      }));
    });

    // Authorization status change
    music.addEventListener('authorizationStatusDidChange', (event: any) => {
      setState(prev => ({
        ...prev,
        isAuthorized: event.authorizationStatus === MusicKit.AuthorizationStatus.authorized,
      }));
    });
  }, []);

  // Check if a track is from Apple Music
  const isAppleMusicTrack = useCallback((track: Track | null): boolean => {
    if (!track) return false;
    const source = track.source || track.provider || track.platform || '';
    return source === 'apple-music' || source === 'apple';
  }, []);

  // Play a track
  const play = useCallback(async (track: Track) => {
    if (!isAppleMusicTrack(track)) {
      console.log('[useMusicKit] Not an Apple Music track, skipping playback');
      setState(prev => ({ ...prev, error: 'Not an Apple Music track' }));
      return false;
    }

    // Initialize if not already done
    if (!musicKitRef.current) {
      const initialized = await initialize();
      if (!initialized) return false;
    }

    const music = musicKitRef.current;

    // Check if authorized
    if (!music.isAuthorized) {
      console.log('[useMusicKit] Not authorized, attempting to authorize...');
      try {
        await music.authorize();
        setState(prev => ({ ...prev, isAuthorized: true }));
      } catch (error: any) {
        console.error('[useMusicKit] Authorization failed:', error);
        setState(prev => ({ ...prev, error: 'Authorization required' }));
        return false;
      }
    }

    try {
      // Set the queue with the track
      await music.setQueue({
        song: track.id,
      });

      // Start playback
      await music.play();

      setState(prev => ({
        ...prev,
        isPlaying: true,
        error: null,
      }));

      console.log('[useMusicKit] Playing track:', track.id);
      return true;
    } catch (error: any) {
      console.error('[useMusicKit] Play failed:', error);
      setState(prev => ({ ...prev, error: error.message, isPlaying: false }));
      return false;
    }
  }, [initialize, isAppleMusicTrack]);

  // Pause playback
  const pause = useCallback(() => {
    if (!musicKitRef.current) return;

    try {
      musicKitRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } catch (error: any) {
      console.error('[useMusicKit] Pause failed:', error);
    }
  }, []);

  // Resume playback
  const resume = useCallback(async () => {
    if (!musicKitRef.current) return;

    try {
      await musicKitRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    } catch (error: any) {
      console.error('[useMusicKit] Resume failed:', error);
    }
  }, []);

  // Stop playback
  const stop = useCallback(() => {
    if (!musicKitRef.current) return;

    try {
      musicKitRef.current.stop();
      setState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
        progress: 0,
      }));
    } catch (error: any) {
      console.error('[useMusicKit] Stop failed:', error);
    }
  }, []);

  // Seek to position (percentage 0-100)
  const seekTo = useCallback(async (percentage: number) => {
    if (!musicKitRef.current) return;

    try {
      const music = musicKitRef.current;
      const duration = music.player?.currentPlaybackDuration || 0;
      const seekTime = (percentage / 100) * duration;

      await music.seekToTime(seekTime);
    } catch (error: any) {
      console.error('[useMusicKit] Seek failed:', error);
    }
  }, []);

  // Set volume (0-1)
  const setVolume = useCallback((volume: number) => {
    if (!musicKitRef.current) return;

    try {
      musicKitRef.current.player.volume = Math.max(0, Math.min(1, volume));
      setState(prev => ({ ...prev, volume }));
    } catch (error: any) {
      console.error('[useMusicKit] Set volume failed:', error);
    }
  }, []);

  // Skip to next track
  const skipToNext = useCallback(async () => {
    if (!musicKitRef.current) return;

    try {
      await musicKitRef.current.skipToNextItem();
    } catch (error: any) {
      console.error('[useMusicKit] Skip to next failed:', error);
    }
  }, []);

  // Skip to previous track
  const skipToPrevious = useCallback(async () => {
    if (!musicKitRef.current) return;

    try {
      await musicKitRef.current.skipToPreviousItem();
    } catch (error: any) {
      console.error('[useMusicKit] Skip to previous failed:', error);
    }
  }, []);

  // Format time for display (seconds to mm:ss)
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Auto-initialize when connected to Apple Music
  useEffect(() => {
    const checkAndInitialize = async () => {
      try {
        const connections = await getStreamingConnections();
        if (connections.appleMusic?.connected && typeof MusicKit !== 'undefined') {
          await initialize();
        }
      } catch (error) {
        console.log('[useMusicKit] Failed to check connections:', error);
      }
    };

    // Only check if MusicKit is available
    if (typeof MusicKit !== 'undefined') {
      checkAndInitialize();
    }
  }, [initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    initialize,
    play,
    pause,
    resume,
    stop,
    seekTo,
    setVolume,
    skipToNext,
    skipToPrevious,
    formatTime,
    isAppleMusicTrack,
    musicKit: musicKitRef.current,
  };
}
