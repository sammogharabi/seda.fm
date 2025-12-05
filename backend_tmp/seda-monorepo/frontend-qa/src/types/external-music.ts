// External Music Integration Types for sedā.fm

export interface ExternalTrack {
  trackId: string;
  source: 'spotify' | 'apple' | 'upload';
  title: string;
  artist: string;
  album?: string;
  albumArtUrl?: string;
  duration: number; // in seconds
  isrc?: string;
  explicit?: boolean;
  popularity?: number;
  previewUrl?: string;
  externalUrl?: string;
  addedAt: Date;
}

export interface UploadedTrack extends ExternalTrack {
  source: 'upload';
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  copyrightAttestation: boolean;
}

export interface ExternalLibrary {
  provider: 'spotify' | 'apple';
  isConnected: boolean;
  tracks: ExternalTrack[];
  lastSyncAt?: Date;
  totalTracks: number;
}

export interface LibraryConnection {
  provider: 'spotify' | 'apple';
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  userId: string;
  displayName?: string;
  email?: string;
}

export interface TrackUploadRequest {
  file: File;
  artist: string;
  title: string;
  album?: string;
  duration?: number;
  attestCopyright: boolean;
}

export interface TrackUploadResponse {
  trackId: string;
  status: 'processing' | 'completed' | 'failed';
  track?: UploadedTrack;
  error?: string;
}

export interface PlaylistAddRequest {
  trackId: string;
  source: 'spotify' | 'apple' | 'upload';
  playlistId: string;
}

export interface DJQueueRequest {
  trackId: string;
  source: 'spotify' | 'apple' | 'upload';
  sessionId: string;
  requestedBy: string;
}

export interface ExternalMusicState {
  libraries: {
    spotify: ExternalLibrary;
    apple: ExternalLibrary;
    uploads: ExternalLibrary;
  };
  connections: LibraryConnection[];
  isLoading: boolean;
  error: string | null;
  selectedProvider: 'spotify' | 'apple' | 'uploads' | null;
}