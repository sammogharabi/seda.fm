// External Music Service for sedā.fm
// Handles Spotify, Apple Music integration and track uploads

import { 
  ExternalTrack, 
  UploadedTrack, 
  ExternalLibrary, 
  LibraryConnection,
  TrackUploadRequest,
  TrackUploadResponse,
  PlaylistAddRequest,
  DJQueueRequest 
} from '../types/external-music';
import { Track } from '../services/audioEngine';

// Mock implementation for development - replace with real APIs in production
class ExternalMusicService {
  private connections: LibraryConnection[] = [];
  private mockSpotifyTracks: ExternalTrack[] = [];
  private mockAppleTracks: ExternalTrack[] = [];
  private uploadedTracks: UploadedTrack[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock Spotify tracks
    this.mockSpotifyTracks = [
      {
        trackId: 'spotify:track:4iV5W9uYEdYUVa79Axb7Rh',
        source: 'spotify',
        title: 'Watermelon Sugar',
        artist: 'Harry Styles',
        album: 'Fine Line',
        albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
        duration: 174,
        popularity: 85,
        previewUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        externalUrl: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
        addedAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        trackId: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b',
        source: 'spotify',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        albumArtUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        duration: 200,
        popularity: 95,
        previewUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        externalUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
        addedAt: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];

    // Mock Apple Music tracks
    this.mockAppleTracks = [
      {
        trackId: 'apple:track:1549779727',
        source: 'apple',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        albumArtUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/82/0e/19/820e19b7-4c8a-da45-ede6-3aeb1a4e6de2/190295084646.jpg/400x400cc.jpg',
        duration: 203,
        popularity: 88,
        previewUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
        externalUrl: 'https://music.apple.com/us/album/levitating/1549779664?i=1549779727',
        addedAt: new Date(Date.now() - 259200000) // 3 days ago
      }
    ];
  }

  // Connection Management
  async connectProvider(provider: 'spotify' | 'apple'): Promise<LibraryConnection> {
    console.log(`[ExternalMusic] Connecting to ${provider}...`);
    
    // Mock OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1000));

    const connection: LibraryConnection = {
      provider,
      accessToken: `mock_${provider}_token_${Date.now()}`,
      refreshToken: `mock_${provider}_refresh_${Date.now()}`,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      userId: `mock_${provider}_user_123`,
      displayName: `Mock ${provider} User`,
      email: `user@${provider}.com`
    };

    this.connections.push(connection);
    return connection;
  }

  async disconnectProvider(provider: 'spotify' | 'apple'): Promise<void> {
    console.log(`[ExternalMusic] Disconnecting from ${provider}...`);
    this.connections = this.connections.filter(c => c.provider !== provider);
  }

  isConnected(provider: 'spotify' | 'apple'): boolean {
    return this.connections.some(c => c.provider === provider);
  }

  getConnection(provider: 'spotify' | 'apple'): LibraryConnection | null {
    return this.connections.find(c => c.provider === provider) || null;
  }

  // Library Management
  async syncLibrary(provider: 'spotify' | 'apple'): Promise<ExternalLibrary> {
    console.log(`[ExternalMusic] Syncing ${provider} library...`);
    
    if (!this.isConnected(provider)) {
      throw new Error(`Not connected to ${provider}`);
    }

    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const tracks = provider === 'spotify' ? this.mockSpotifyTracks : this.mockAppleTracks;
    
    return {
      provider,
      isConnected: true,
      tracks,
      lastSyncAt: new Date(),
      totalTracks: tracks.length
    };
  }

  async getLibrary(provider: 'spotify' | 'apple' | 'uploads'): Promise<ExternalLibrary> {
    if (provider === 'uploads') {
      return {
        provider: 'uploads' as any,
        isConnected: true,
        tracks: this.uploadedTracks,
        lastSyncAt: new Date(),
        totalTracks: this.uploadedTracks.length
      };
    }

    if (!this.isConnected(provider)) {
      return {
        provider,
        isConnected: false,
        tracks: [],
        totalTracks: 0
      };
    }

    return this.syncLibrary(provider);
  }

  // Track Upload
  async uploadTrack(request: TrackUploadRequest): Promise<TrackUploadResponse> {
    console.log('[ExternalMusic] Uploading track:', request.title);

    if (!request.attestCopyright) {
      throw new Error('Copyright attestation required');
    }

    if (request.file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File size exceeds 100MB limit');
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac'];
    if (!allowedTypes.includes(request.file.type)) {
      throw new Error('Unsupported file format. Please use MP3, WAV, or FLAC.');
    }

    // Mock upload process
    await new Promise(resolve => setTimeout(resolve, 3000));

    const trackId = `upl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const uploadedTrack: UploadedTrack = {
      trackId,
      source: 'upload',
      title: request.title,
      artist: request.artist,
      album: request.album,
      albumArtUrl: `https://cdn.seda.fm/uploads/${trackId}/artwork.jpg`,
      duration: request.duration || Math.floor(Math.random() * 240) + 120, // Random 2-6 minutes
      fileUrl: `https://cdn.seda.fm/uploads/${trackId}/audio.mp3`,
      fileSize: request.file.size,
      mimeType: request.file.type,
      uploadedBy: 'current_user_id',
      copyrightAttestation: true,
      addedAt: new Date()
    };

    this.uploadedTracks.push(uploadedTrack);

    return {
      trackId,
      status: 'completed',
      track: uploadedTrack
    };
  }

  // Playlist Integration
  async addTrackToPlaylist(request: PlaylistAddRequest): Promise<void> {
    console.log('[ExternalMusic] Adding track to playlist:', request);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In real implementation, this would:
    // 1. Verify track exists and user has access
    // 2. Check for duplicates
    // 3. Add to playlist via API
    // 4. Return success/error
  }

  // DJ Session Integration
  async addTrackToDJQueue(request: DJQueueRequest): Promise<void> {
    console.log('[ExternalMusic] Adding track to DJ queue:', request);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In real implementation, this would:
    // 1. Verify track exists and user has access
    // 2. Check session permissions
    // 3. Add to queue with proper position
    // 4. Emit real-time update
  }

  // Utility Methods
  convertExternalTrackToAudioTrack(externalTrack: ExternalTrack): Track {
    // For testing, use the exact same URL as sample track 1
    const testUrl = 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3';
    
    console.log('[ExternalMusic] Converting track:', {
      title: externalTrack.title,
      source: externalTrack.source,
      previewUrl: externalTrack.previewUrl,
      usingTestUrl: testUrl
    });

    const track: Track = {
      id: externalTrack.trackId,
      title: externalTrack.title,
      artist: externalTrack.artist,
      artwork: externalTrack.albumArtUrl || '',
      url: testUrl, // Use exact same URL as working sample
      duration: 180, // Use exact same duration as working sample
      metadata: {
        album: externalTrack.album || 'External Album',
        genre: externalTrack.source === 'spotify' ? 'Spotify Track' : 
               externalTrack.source === 'apple' ? 'Apple Music Track' : 'User Upload',
        year: 2024,
        bitrate: 320
      }
    };

    console.log('[ExternalMusic] Final converted track:', track);
    return track;
  }

  async searchTracks(query: string, provider?: 'spotify' | 'apple'): Promise<ExternalTrack[]> {
    console.log(`[ExternalMusic] Searching tracks: "${query}" in ${provider || 'all providers'}`);
    
    // Mock search - filter existing tracks by title or artist
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let tracks: ExternalTrack[] = [];
    
    if (!provider || provider === 'spotify') {
      tracks.push(...this.mockSpotifyTracks);
    }
    
    if (!provider || provider === 'apple') {
      tracks.push(...this.mockAppleTracks);
    }
    
    if (!provider) {
      tracks.push(...this.uploadedTracks);
    }

    return tracks.filter(track => 
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Playback Support
  async getPlaybackUrl(trackId: string, source: 'spotify' | 'apple' | 'upload'): Promise<string> {
    if (source === 'upload') {
      const uploadedTrack = this.uploadedTracks.find(t => t.trackId === trackId);
      if (!uploadedTrack) {
        throw new Error('Uploaded track not found');
      }
      return uploadedTrack.fileUrl;
    }
    
    // For Spotify/Apple, return preview URL (in production, use SDK)
    const allTracks = [...this.mockSpotifyTracks, ...this.mockAppleTracks];
    const track = allTracks.find(t => t.trackId === trackId);
    
    if (!track || !track.previewUrl) {
      throw new Error('Track preview not available');
    }
    
    return track.previewUrl;
  }
}

// Export singleton instance
export const externalMusicService = new ExternalMusicService();
export default externalMusicService;