// Link parser utility for extracting metadata from music platform URLs
export interface LinkMetadata {
  type: 'youtube' | 'bandcamp' | 'spotify' | 'soundcloud' | 'apple_music' | 'generic';
  url: string;
  title?: string;
  artist?: string;
  description?: string;
  thumbnail?: string;
  platform: string;
  embedId?: string;
  duration?: string;
  price?: string;
  isPlayable?: boolean;
}

export interface ParsedContent {
  text: string;
  links: LinkMetadata[];
}

// Platform detection patterns
const PLATFORM_PATTERNS = {
  youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  bandcamp: /(?:https?:\/\/)?([a-zA-Z0-9_-]+\.bandcamp\.com\/(?:track|album)\/[a-zA-Z0-9_-]+)/,
  spotify: /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|album|artist|playlist)\/([a-zA-Z0-9]+)/,
  soundcloud: /(?:https?:\/\/)?soundcloud\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/,
  apple_music: /(?:https?:\/\/)?music\.apple\.com\/[a-z]{2}\/(?:album|song)\/[^\/]+\/([0-9]+)/,
  // Add more platforms as needed
  generic: /https?:\/\/[^\s]+/
};

// Mock metadata database (in a real app, this would be fetched from APIs)
const MOCK_METADATA: Record<string, Partial<LinkMetadata>> = {
  // YouTube examples
  'dQw4w9WgXcQ': {
    title: 'Rick Astley - Never Gonna Give You Up',
    artist: 'Rick Astley',
    description: 'The official video for "Never Gonna Give You Up" by Rick Astley',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
    duration: '3:33',
    isPlayable: true
  },
  // Bandcamp examples
  'artist1.bandcamp.com/track/midnight-vibes': {
    title: 'Midnight Vibes',
    artist: 'Underground Collective',
    description: 'Deep house track with ambient elements',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=200&fit=crop',
    price: '$1.00',
    isPlayable: true
  },
  // Spotify examples (would be fetched via Spotify API in real app)
  'spotify_track_123': {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    description: 'From the album "After Hours"',
    thumbnail: 'https://images.unsplash.com/photo-1573247318234-d0d48ba00c7f?w=300&h=200&fit=crop',
    duration: '3:20',
    isPlayable: false // External link
  }
};

export function extractLinksFromText(text: string): ParsedContent {
  const links: LinkMetadata[] = [];
  let cleanText = text;
  
  // Extract YouTube links
  const youtubeMatches = text.match(new RegExp(PLATFORM_PATTERNS.youtube.source, 'g'));
  if (youtubeMatches) {
    youtubeMatches.forEach(match => {
      const videoIdMatch = match.match(PLATFORM_PATTERNS.youtube);
      if (videoIdMatch) {
        const videoId = videoIdMatch[1];
        const metadata = MOCK_METADATA[videoId] || {};
        
        links.push({
          type: 'youtube',
          url: match,
          platform: 'YouTube',
          embedId: videoId,
          ...metadata
        });
        
        // Remove the link from the text
        cleanText = cleanText.replace(match, '').trim();
      }
    });
  }
  
  // Extract Bandcamp links
  const bandcampMatches = text.match(new RegExp(PLATFORM_PATTERNS.bandcamp.source, 'g'));
  if (bandcampMatches) {
    bandcampMatches.forEach(match => {
      const cleanMatch = match.replace(/^https?:\/\//, '');
      const metadata = MOCK_METADATA[cleanMatch] || {};
      
      links.push({
        type: 'bandcamp',
        url: match.startsWith('http') ? match : `https://${match}`,
        platform: 'Bandcamp',
        ...metadata
      });
      
      cleanText = cleanText.replace(match, '').trim();
    });
  }
  
  // Extract Spotify links
  const spotifyMatches = text.match(new RegExp(PLATFORM_PATTERNS.spotify.source, 'g'));
  if (spotifyMatches) {
    spotifyMatches.forEach(match => {
      const typeMatch = match.match(PLATFORM_PATTERNS.spotify);
      if (typeMatch) {
        const [, contentType, spotifyId] = typeMatch;
        const metadata = MOCK_METADATA[`spotify_${contentType}_${spotifyId}`] || MOCK_METADATA['spotify_track_123'] || {};
        
        links.push({
          type: 'spotify',
          url: match,
          platform: 'Spotify',
          embedId: spotifyId,
          ...metadata
        });
        
        cleanText = cleanText.replace(match, '').trim();
      }
    });
  }
  
  // Extract SoundCloud links
  const soundcloudMatches = text.match(new RegExp(PLATFORM_PATTERNS.soundcloud.source, 'g'));
  if (soundcloudMatches) {
    soundcloudMatches.forEach(match => {
      const metadata = {
        title: 'Deep House Mix',
        artist: 'DJ Underground',
        description: 'Latest mix featuring underground house tracks',
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
        duration: '45:20',
        isPlayable: true
      };
      
      links.push({
        type: 'soundcloud',
        url: match,
        platform: 'SoundCloud',
        ...metadata
      });
      
      cleanText = cleanText.replace(match, '').trim();
    });
  }
  
  // Extract generic links (for merch stores, etc.)
  const genericMatches = text.match(new RegExp(PLATFORM_PATTERNS.generic.source, 'g'));
  if (genericMatches) {
    genericMatches.forEach(match => {
      // Skip if already processed by specific platform
      if (!links.some(link => link.url === match)) {
        const domain = match.replace(/^https?:\/\//, '').split('/')[0];
        
        links.push({
          type: 'generic',
          url: match,
          platform: domain,
          title: `Link to ${domain}`,
          description: 'External link',
          isPlayable: false
        });
        
        cleanText = cleanText.replace(match, '').trim();
      }
    });
  }
  
  return {
    text: cleanText,
    links
  };
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    'YouTube': 'bg-red-500',
    'Bandcamp': 'bg-blue-500',
    'Spotify': 'bg-green-500',
    'SoundCloud': 'bg-orange-500',
    'Apple Music': 'bg-gray-900',
    default: 'bg-accent-coral'
  };
  
  return colors[platform] || colors.default;
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    'YouTube': '▶️',
    'Bandcamp': '🎵',
    'Spotify': '🎵',
    'SoundCloud': '☁️',
    'Apple Music': '🍎',
    default: '🔗'
  };
  
  return icons[platform] || icons.default;
}