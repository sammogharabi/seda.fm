import { Track } from '../services/audioEngine';

// Sample tracks with royalty-free audio for testing
// Using publicly available MP3 files that work cross-browser
export const SAMPLE_TRACKS: Track[] = [
  {
    id: 'sample-1',
    title: 'Chill Lofi Beat',
    artist: 'LoFi Producer',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
    duration: 180, // 3 minutes
    metadata: {
      album: 'Chill Vibes Vol. 1',
      genre: 'Lo-fi Hip Hop',
      year: 2024,
      bitrate: 320
    }
  },
  {
    id: 'sample-2',
    title: 'Electronic Dreams',
    artist: 'Synth Master',
    artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    duration: 240, // 4 minutes
    metadata: {
      album: 'Digital Soundscapes',
      genre: 'Electronic',
      year: 2024,
      bitrate: 320
    }
  },
  {
    id: 'sample-3',
    title: 'Smooth Jazz Vibes',
    artist: 'Jazz Collective',
    artwork: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    duration: 300, // 5 minutes
    metadata: {
      album: 'Smooth Sessions',
      genre: 'Jazz',
      year: 2024,
      bitrate: 320
    }
  },
  {
    id: 'sample-4',
    title: 'Ambient Atmosphere',
    artist: 'Ambient Artist',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    duration: 360, // 6 minutes
    metadata: {
      album: 'Atmospheric Journeys',
      genre: 'Ambient',
      year: 2024,
      bitrate: 192
    }
  },
  {
    id: 'sample-5',
    title: 'Hip Hop Groove',
    artist: 'Beat Maker',
    artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
    duration: 220, // 3:40
    metadata: {
      album: 'Urban Beats',
      genre: 'Hip Hop',
      year: 2024,
      bitrate: 320
    }
  }
];

// Mock queue data using sample tracks
export const MOCK_QUEUE_WITH_AUDIO = SAMPLE_TRACKS.map((track, index) => ({
  id: index + 1,
  track,
  addedBy: {
    username: ['daft_lover', 'edm_king', 'classic_raver', 'beat_seeker', 'melody_hunter'][index] || 'music_lover',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${track.id}`,
    verified: index === 1 // Make second user verified
  },
  status: ['ready', 'ready', 'buffering', 'ready', 'ready'][index] as 'ready' | 'buffering' | 'error',
  votes: { 
    up: [15, 8, 12, 6, 9][index] || 5, 
    down: [2, 0, 3, 1, 0][index] || 0 
  },
  addedAt: new Date(Date.now() - (600000 * (index + 1))) // Staggered times
}));

// Test track for immediate playback
export const TEST_TRACK: Track = SAMPLE_TRACKS[0];

// Utility function to get a random track
export const getRandomTrack = (): Track => {
  const randomIndex = Math.floor(Math.random() * SAMPLE_TRACKS.length);
  return SAMPLE_TRACKS[randomIndex];
};

// Utility function to convert duration to display format
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// For development - use actual test audio files if available
// These URLs should be replaced with actual audio files in your public directory
export const DEV_AUDIO_FILES = {
  'sample-1': '/audio/sample-1.mp3',
  'sample-2': '/audio/sample-2.mp3', 
  'sample-3': '/audio/sample-3.mp3',
  'sample-4': '/audio/sample-4.mp3',
  'sample-5': '/audio/sample-5.mp3'
};

// Updated tracks with local development URLs
export const SAMPLE_TRACKS_WITH_LOCAL_AUDIO: Track[] = SAMPLE_TRACKS.map(track => ({
  ...track,
  url: DEV_AUDIO_FILES[track.id as keyof typeof DEV_AUDIO_FILES] || track.url
}));