export const mockFans = [
  {
    id: 'fan-1',
    username: 'beat_seeker',
    displayName: 'Beat Seeker',
    verified: false,
    verificationStatus: 'not-requested',
    points: 892,
    accentColor: 'blue',
    bio: 'Always hunting for the perfect beat. Love discovering underground artists and sharing rare finds.',
    location: 'Chicago, IL',
    joinedDate: new Date('2024-02-20'),
    genres: ['House', 'Techno', 'Ambient'],
    connectedServices: ['Spotify', 'SoundCloud'],
    isArtist: false,
    userType: 'fan',
    website: '',
    followers: ['fan-2', 'fan-3', 'artist-1'],
    following: ['artist-1', 'artist-2', 'fan-2'],
    blockedUsers: []
  },
  {
    id: 'fan-2',
    username: 'vinyl_collector',
    displayName: 'Vinyl Collector',
    verified: false,
    verificationStatus: 'not-requested',
    points: 1456,
    accentColor: 'mint',
    bio: 'Analog soul in a digital world. Collecting records since the 90s and sharing the stories behind the grooves.',
    location: 'Portland, OR',
    joinedDate: new Date('2024-01-05'),
    genres: ['Jazz', 'Soul', 'Hip Hop'],
    connectedServices: ['Bandcamp', 'Discogs'],
    isArtist: false,
    userType: 'fan',
    website: 'https://diggin-deep.blog',
    followers: ['fan-1', 'fan-3', 'artist-2'],
    following: ['fan-1', 'artist-1', 'artist-3'],
    blockedUsers: []
  },
  {
    id: 'fan-3',
    username: 'bass_head',
    displayName: 'Bass Head',
    verified: false,
    verificationStatus: 'not-requested',
    points: 674,
    accentColor: 'yellow',
    bio: 'If it doesn\'t have sub-bass, I\'m not interested. Festival goer, bass music enthusiast, and sound design lover.',
    location: 'Denver, CO',
    joinedDate: new Date('2024-03-10'),
    genres: ['Dubstep', 'Bass', 'Trap'],
    connectedServices: ['SoundCloud', 'Spotify'],
    isArtist: false,
    userType: 'fan',
    website: '',
    followers: ['fan-1', 'fan-2'],
    following: ['artist-1', 'artist-3'],
    blockedUsers: []
  }
];

export const mockArtists = [
  {
    id: 'artist-1',
    username: 'underground_beats',
    displayName: 'Underground Beats',
    verified: true,
    accentColor: 'coral',
    bio: 'Electronic music producer from Brooklyn. Creating beats that move the underground scene. 🎵',
    location: 'Brooklyn, NY',
    genres: ['Electronic', 'House', 'Techno'],
    website: 'https://undergroundbeats.bandcamp.com',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    socialLinks: {
      instagram: 'https://instagram.com/undergroundbeats',
      youtube: 'https://youtube.com/@undergroundbeats'
    },
    followers: ['fan-1', 'fan-2', 'fan-3', 'artist-2'],
    following: ['artist-2', 'artist-3'],
    userType: 'artist',
    isArtist: true,
    blockedUsers: []
  },
  {
    id: 'artist-2', 
    username: 'neon_waves',
    displayName: 'Neon Waves',
    verified: false,
    accentColor: 'blue',
    bio: 'Synthwave artist crafting nostalgic sounds for the digital age. Live shows that transport you to the 80s.',
    location: 'Los Angeles, CA',
    genres: ['Synthwave', 'Electronic', 'Ambient'],
    website: 'https://neonwaves.com',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=400&fit=crop',
    socialLinks: {
      youtube: 'https://youtube.com/@neonwaves'
    },
    followers: ['fan-2', 'artist-1'],
    following: ['artist-1', 'artist-3', 'fan-1'],
    userType: 'artist',
    isArtist: true,
    blockedUsers: []
  },
  {
    id: 'artist-3',
    username: 'bass_collective',
    displayName: 'Bass Collective',
    verified: true,
    accentColor: 'mint',
    bio: 'Experimental bass music collective pushing boundaries. Four artists, one sound, infinite possibilities.',
    location: 'London, UK',
    genres: ['Bass', 'Dubstep', 'Experimental'],
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop',
    socialLinks: {
      instagram: 'https://instagram.com/basscollective',
      youtube: 'https://youtube.com/@basscollective'
    },
    followers: ['fan-2', 'fan-3', 'artist-2'],
    following: ['artist-1', 'artist-2'],
    userType: 'artist',
    blockedUsers: [],
    isArtist: true
  }
];