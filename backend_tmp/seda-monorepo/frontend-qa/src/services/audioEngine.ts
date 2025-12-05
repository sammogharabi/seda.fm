// Custom EventEmitter implementation for browser compatibility
class CustomEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  off(event: string, listener: Function): this {
    if (!this.events[event]) return this;
    this.events[event] = this.events[event].filter(l => l !== listener);
    return this;
  }

  once(event: string, listener: Function): this {
    const onceListener = (...args: any[]) => {
      this.off(event, onceListener);
      listener.apply(this, args);
    };
    this.on(event, onceListener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) return false;
    this.events[event].forEach(listener => {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
    return true;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

// Type definitions
export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
  duration: number; // in seconds
  metadata?: {
    album?: string;
    genre?: string;
    year?: number;
    bitrate?: number;
  };
}

export interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  error: string | null;
  playbackRate: number;
  buffered: TimeRanges | null;
}

export interface AudioEvents {
  'stateChange': (state: AudioState) => void;
  'timeUpdate': (currentTime: number, duration: number) => void;
  'loadStart': () => void;
  'loadComplete': (track: Track) => void;
  'loadError': (error: string) => void;
  'play': () => void;
  'pause': () => void;
  'ended': () => void;
  'volumeChange': (volume: number) => void;
  'error': (error: string) => void;
  'progress': (buffered: TimeRanges) => void;
}

export class AudioEngine extends CustomEventEmitter {
  private audio: HTMLAudioElement;
  private state: AudioState;
  private updateInterval: number | null = null;
  private fadeInterval: number | null = null;

  constructor() {
    super();
    this.audio = new Audio();
    this.state = {
      currentTrack: null,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      volume: 0.75,
      muted: false,
      error: null,
      playbackRate: 1,
      buffered: null,
    };

    this.setupAudioEventListeners();
    this.setupAudioElement();
  }

  private setupAudioElement(): void {
    // Set initial audio properties
    this.audio.volume = this.state.volume;
    this.audio.preload = 'metadata';
    
    // Note: crossOrigin can cause issues with some audio sources
    // Only set it if we know the source supports CORS
    // this.audio.crossOrigin = 'anonymous';
    
    // Prevent auto-play on mobile
    this.audio.setAttribute('playsinline', 'true');
  }

  private setupAudioEventListeners(): void {
    // Loading events
    this.audio.addEventListener('loadstart', () => {
      this.updateState({ isLoading: true, error: null });
      this.emit('loadStart');
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.updateState({ 
        duration: this.audio.duration,
        isLoading: false 
      });
      
      if (this.state.currentTrack) {
        this.emit('loadComplete', this.state.currentTrack);
      }
    });

    this.audio.addEventListener('loadeddata', () => {
      this.updateState({ isLoading: false });
    });

    this.audio.addEventListener('canplay', () => {
      this.updateState({ isLoading: false });
    });

    this.audio.addEventListener('canplaythrough', () => {
      this.updateState({ isLoading: false });
    });

    // Playback events
    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true });
      this.startTimeTracking();
      this.emit('play');
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
      this.stopTimeTracking();
      this.emit('pause');
    });

    this.audio.addEventListener('ended', () => {
      this.updateState({ isPlaying: false, currentTime: 0 });
      this.stopTimeTracking();
      this.emit('ended');
    });

    // Time and progress events
    this.audio.addEventListener('timeupdate', () => {
      this.updateState({ currentTime: this.audio.currentTime });
      this.emit('timeUpdate', this.audio.currentTime, this.audio.duration);
    });

    this.audio.addEventListener('durationchange', () => {
      this.updateState({ duration: this.audio.duration });
    });

    this.audio.addEventListener('progress', () => {
      this.updateState({ buffered: this.audio.buffered });
      this.emit('progress', this.audio.buffered);
    });

    // Volume events
    this.audio.addEventListener('volumechange', () => {
      this.updateState({ 
        volume: this.audio.volume,
        muted: this.audio.muted 
      });
      this.emit('volumeChange', this.audio.volume);
    });

    // Error events
    this.audio.addEventListener('error', (event) => {
      const error = this.getAudioErrorMessage(this.audio.error);
      this.updateState({ 
        isLoading: false, 
        isPlaying: false,
        error 
      });
      this.emit('loadError', error);
      this.emit('error', error);
    });

    this.audio.addEventListener('stalled', () => {
      console.warn('Audio playback stalled');
    });

    this.audio.addEventListener('waiting', () => {
      this.updateState({ isLoading: true });
    });

    this.audio.addEventListener('seeking', () => {
      this.updateState({ isLoading: true });
    });

    this.audio.addEventListener('seeked', () => {
      this.updateState({ isLoading: false });
    });
  }

  private getAudioErrorMessage(error: MediaError | null): string {
    if (!error) return 'Unknown audio error';
    
    // Log detailed error info for debugging
    console.error('Audio error details:', {
      code: error.code,
      message: error.message || 'No message',
      src: this.audio.src,
      currentSrc: this.audio.currentSrc,
      networkState: this.audio.networkState,
      readyState: this.audio.readyState
    });
    
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Audio playback was aborted';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Network error occurred while loading audio. Check your internet connection.';
      case MediaError.MEDIA_ERR_DECODE:
        return 'Audio file could not be decoded. The file may be corrupted.';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Audio source is not supported. This may be due to CORS restrictions or an invalid URL.';
      default:
        return 'Unknown audio error occurred. Check the browser console for details.';
    }
  }

  private updateState(updates: Partial<AudioState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChange', this.state);
  }

  private startTimeTracking(): void {
    if (this.updateInterval) return;
    
    this.updateInterval = window.setInterval(() => {
      if (!this.audio.paused) {
        this.updateState({ currentTime: this.audio.currentTime });
      }
    }, 100); // Update every 100ms for smooth progress
  }

  private stopTimeTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Public API methods
  async loadTrack(track: Track): Promise<void> {
    console.log('[AudioEngine] loadTrack called:', track.title);
    
    try {
      this.updateState({ 
        currentTrack: track,
        isLoading: true,
        error: null,
        currentTime: 0,
        duration: 0
      });

      // Note: Setting src and calling load() will always stop current playback
      // The DJ Mode component will handle auto-play after loading
      this.pause();
      
      // Load new track
      console.log('[AudioEngine] Loading track:', track.title, 'from URL:', track.url);
      this.audio.src = track.url;
      this.audio.load();
      
      return new Promise((resolve, reject) => {
        let timeoutId: ReturnType<typeof setTimeout>;
        
        const onLoadComplete = () => {
          cleanup();
          console.log('Track loaded successfully:', track.title);
          resolve();
        };
        
        const onLoadError = (error: string) => {
          cleanup();
          console.error('Track load error:', error);
          reject(new Error(error));
        };
        
        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          this.off('loadComplete', onLoadComplete);
          this.off('loadError', onLoadError);
        };
        
        // Add timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          cleanup();
          this.updateState({ 
            isLoading: false, 
            error: 'Audio loading timed out. The audio file may be unavailable or blocked by CORS.' 
          });
          reject(new Error('Audio loading timed out after 10 seconds'));
        }, 10000); // 10 second timeout
        
        this.once('loadComplete', onLoadComplete);
        this.once('loadError', onLoadError);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load track';
      this.updateState({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw error;
    }
  }

  async play(): Promise<void> {
    console.log('[AudioEngine] play() called');
    console.log('[AudioEngine] Current track:', this.state.currentTrack?.title);
    console.log('[AudioEngine] Audio readyState:', this.audio.readyState);
    
    try {
      if (!this.state.currentTrack) {
        throw new Error('No track loaded');
      }

      await this.audio.play();
      console.log('[AudioEngine] play() successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play audio';
      console.error('[AudioEngine] play() error:', errorMessage);
      this.updateState({ 
        isPlaying: false, 
        error: errorMessage 
      });
      throw error;
    }
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.pause();
    this.audio.currentTime = 0;
    this.updateState({ currentTime: 0 });
  }

  seek(time: number): void {
    if (!this.state.currentTrack) return;
    
    const clampedTime = Math.max(0, Math.min(time, this.state.duration));
    this.audio.currentTime = clampedTime;
    this.updateState({ currentTime: clampedTime });
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audio.volume = clampedVolume;
    this.updateState({ volume: clampedVolume });
  }

  mute(): void {
    this.audio.muted = true;
    this.updateState({ muted: true });
  }

  unmute(): void {
    this.audio.muted = false;
    this.updateState({ muted: false });
  }

  toggleMute(): void {
    if (this.state.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  setPlaybackRate(rate: number): void {
    const clampedRate = Math.max(0.25, Math.min(4, rate));
    this.audio.playbackRate = clampedRate;
    this.updateState({ playbackRate: clampedRate });
  }

  // Fade methods for smooth transitions
  async fadeIn(duration: number = 1000): Promise<void> {
    const startVolume = 0;
    const targetVolume = this.state.volume;
    
    this.audio.volume = startVolume;
    
    return new Promise((resolve) => {
      const steps = 50;
      const stepTime = duration / steps;
      const volumeStep = (targetVolume - startVolume) / steps;
      let currentStep = 0;
      
      this.fadeInterval = window.setInterval(() => {
        currentStep++;
        const newVolume = startVolume + (volumeStep * currentStep);
        
        if (currentStep >= steps) {
          this.audio.volume = targetVolume;
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          resolve();
        } else {
          this.audio.volume = newVolume;
        }
      }, stepTime);
    });
  }

  async fadeOut(duration: number = 1000): Promise<void> {
    const startVolume = this.audio.volume;
    const targetVolume = 0;
    
    return new Promise((resolve) => {
      const steps = 50;
      const stepTime = duration / steps;
      const volumeStep = (startVolume - targetVolume) / steps;
      let currentStep = 0;
      
      this.fadeInterval = window.setInterval(() => {
        currentStep++;
        const newVolume = startVolume - (volumeStep * currentStep);
        
        if (currentStep >= steps) {
          this.audio.volume = targetVolume;
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          resolve();
        } else {
          this.audio.volume = newVolume;
        }
      }, stepTime);
    });
  }

  // Utility methods
  getState(): AudioState {
    return { ...this.state };
  }

  getCurrentTrack(): Track | null {
    return this.state.currentTrack;
  }

  isPlaying(): boolean {
    return this.state.isPlaying;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  getBufferedRanges(): { start: number; end: number }[] {
    if (!this.state.buffered) return [];
    
    const ranges: { start: number; end: number }[] = [];
    for (let i = 0; i < this.state.buffered.length; i++) {
      ranges.push({
        start: this.state.buffered.start(i),
        end: this.state.buffered.end(i),
      });
    }
    return ranges;
  }

  getProgress(): number {
    if (this.state.duration === 0) return 0;
    return (this.state.currentTime / this.state.duration) * 100;
  }

  // Format time utilities
  static formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // Cleanup method
  destroy(): void {
    this.stopTimeTracking();
    
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    
    this.pause();
    this.audio.src = '';
    this.audio.load();
    
    // Remove all listeners
    this.removeAllListeners();
    
    this.updateState({
      currentTrack: null,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      error: null,
      buffered: null,
    });
  }
}

// Export a singleton instance
export const audioEngine = new AudioEngine();