import { useEffect, useState, useCallback, useRef } from 'react';
import { audioEngine, AudioState, Track } from '../services/audioEngine';

export interface UseAudioEngineReturn {
  // State
  audioState: AudioState;
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  progress: number;
  error: string | null;
  
  // Controls
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  loadTrack: (track: Track) => Promise<void>;
  
  // Utilities
  formatTime: (seconds: number) => string;
  getBufferedRanges: () => { start: number; end: number }[];
}

export const useAudioEngine = (): UseAudioEngineReturn => {
  const [audioState, setAudioState] = useState<AudioState>(audioEngine.getState());
  const audioStateRef = useRef(audioState);
  
  // Update ref when state changes
  useEffect(() => {
    audioStateRef.current = audioState;
  }, [audioState]);

  // Set up audio engine event listeners
  useEffect(() => {
    const handleStateChange = (newState: AudioState) => {
      setAudioState(newState);
    };

    const handleLoadStart = () => {
      console.log('Audio loading started');
    };

    const handleLoadComplete = (track: Track) => {
      console.log('Audio loaded:', track.title);
    };

    const handleLoadError = (error: string) => {
      console.error('Audio load error:', error);
    };

    const handlePlay = () => {
      console.log('Audio playback started');
    };

    const handlePause = () => {
      console.log('Audio playback paused');
    };

    const handleEnded = () => {
      console.log('Audio playback ended');
    };

    const handleError = (error: string) => {
      console.error('Audio error:', error);
    };

    // Add event listeners
    audioEngine.on('stateChange', handleStateChange);
    audioEngine.on('loadStart', handleLoadStart);
    audioEngine.on('loadComplete', handleLoadComplete);
    audioEngine.on('loadError', handleLoadError);
    audioEngine.on('play', handlePlay);
    audioEngine.on('pause', handlePause);
    audioEngine.on('ended', handleEnded);
    audioEngine.on('error', handleError);

    // Cleanup listeners on unmount
    return () => {
      audioEngine.off('stateChange', handleStateChange);
      audioEngine.off('loadStart', handleLoadStart);
      audioEngine.off('loadComplete', handleLoadComplete);
      audioEngine.off('loadError', handleLoadError);
      audioEngine.off('play', handlePlay);
      audioEngine.off('pause', handlePause);
      audioEngine.off('ended', handleEnded);
      audioEngine.off('error', handleError);
    };
  }, []);

  // Control functions
  const play = useCallback(async (): Promise<void> => {
    try {
      await audioEngine.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }, []);

  const pause = useCallback((): void => {
    audioEngine.pause();
  }, []);

  const stop = useCallback((): void => {
    audioEngine.stop();
  }, []);

  const seek = useCallback((time: number): void => {
    audioEngine.seek(time);
  }, []);

  const setVolume = useCallback((volume: number): void => {
    audioEngine.setVolume(volume);
  }, []);

  const toggleMute = useCallback((): void => {
    audioEngine.toggleMute();
  }, []);

  const loadTrack = useCallback(async (track: Track): Promise<void> => {
    try {
      await audioEngine.loadTrack(track);
    } catch (error) {
      console.error('Failed to load track:', error);
      throw error;
    }
  }, []);

  // Utility functions
  const formatTime = useCallback((seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getBufferedRanges = useCallback((): { start: number; end: number }[] => {
    return audioEngine.getBufferedRanges();
  }, []);

  // Computed values
  const progress = audioState.duration > 0 ? 
    (audioState.currentTime / audioState.duration) * 100 : 0;

  return {
    // State
    audioState,
    currentTrack: audioState.currentTrack,
    isPlaying: audioState.isPlaying,
    isLoading: audioState.isLoading,
    currentTime: audioState.currentTime,
    duration: audioState.duration,
    volume: audioState.volume,
    progress,
    error: audioState.error,
    
    // Controls
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    loadTrack,
    
    // Utilities
    formatTime,
    getBufferedRanges,
  };
};