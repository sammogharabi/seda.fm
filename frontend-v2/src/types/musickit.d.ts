/**
 * MusicKit JS Type Declarations
 * @see https://developer.apple.com/documentation/musickitjs
 */

declare namespace MusicKit {
  interface ConfigureOptions {
    developerToken: string;
    app: {
      name: string;
      build: string;
      icon?: string;
    };
    bitrate?: MusicKit.PlaybackBitrate;
    storefrontId?: string;
  }

  interface MusicKitInstance {
    /** Authorize the user to access Apple Music */
    authorize(): Promise<string>;
    /** Unauthorize the user */
    unauthorize(): Promise<void>;
    /** Check if the user is authorized */
    isAuthorized: boolean;
    /** The current music user token */
    musicUserToken: string;
    /** The storefront country code */
    storefrontCountryCode: string;
    /** Current user info */
    me?: {
      attributes?: {
        name?: string;
      };
    };
    /** The player instance */
    player: Player;
    /** The API instance for making requests */
    api: API;
    /** Set the queue with media items */
    setQueue(options: SetQueueOptions): Promise<Queue>;
    /** Play the current queue */
    play(): Promise<void>;
    /** Pause playback */
    pause(): void;
    /** Stop playback */
    stop(): void;
    /** Skip to the next item */
    skipToNextItem(): Promise<void>;
    /** Skip to the previous item */
    skipToPreviousItem(): Promise<void>;
    /** Seek to a time in seconds */
    seekToTime(time: number): Promise<void>;
    /** Current playback state */
    playbackState: PlaybackStates;
    /** Current queue */
    queue: Queue;
    /** Add event listener */
    addEventListener(name: string, callback: (event: any) => void): void;
    /** Remove event listener */
    removeEventListener(name: string, callback: (event: any) => void): void;
  }

  interface Player {
    currentPlaybackTime: number;
    currentPlaybackDuration: number;
    currentPlaybackProgress: number;
    isPlaying: boolean;
    nowPlayingItem: MediaItem | null;
    repeatMode: PlayerRepeatMode;
    shuffleMode: PlayerShuffleMode;
    volume: number;
  }

  interface API {
    music(path: string, parameters?: Record<string, any>): Promise<any>;
  }

  interface Queue {
    items: MediaItem[];
    isEmpty: boolean;
    length: number;
    position: number;
  }

  interface SetQueueOptions {
    song?: string;
    songs?: string[];
    album?: string;
    playlist?: string;
    url?: string;
    startPosition?: number;
    startWith?: number;
  }

  interface MediaItem {
    id: string;
    type: string;
    href: string;
    attributes: {
      albumName?: string;
      artistName: string;
      artwork?: {
        url: string;
        width: number;
        height: number;
      };
      composerName?: string;
      discNumber?: number;
      durationInMillis: number;
      genreNames?: string[];
      hasLyrics?: boolean;
      isrc?: string;
      name: string;
      playParams?: {
        id: string;
        kind: string;
      };
      previews?: Array<{
        url: string;
      }>;
      releaseDate?: string;
      trackNumber?: number;
      url?: string;
    };
  }

  enum PlaybackStates {
    none = 0,
    loading = 1,
    playing = 2,
    paused = 3,
    stopped = 4,
    ended = 5,
    seeking = 6,
    waiting = 7,
    stalled = 8,
    completed = 9,
  }

  enum PlaybackBitrate {
    HIGH = 256,
    STANDARD = 64,
  }

  enum PlayerRepeatMode {
    none = 0,
    one = 1,
    all = 2,
  }

  enum PlayerShuffleMode {
    off = 0,
    songs = 1,
  }

  /** Configure MusicKit with your developer token */
  function configure(options: ConfigureOptions): Promise<MusicKitInstance>;

  /** Get the configured MusicKit instance */
  function getInstance(): MusicKitInstance;
}

declare global {
  interface Window {
    MusicKit: typeof MusicKit;
  }
}

export {};
