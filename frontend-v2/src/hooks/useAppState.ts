import { useState, useCallback } from 'react';

export interface AppStateHook {
  // UI State
  currentView: string;
  setCurrentView: (view: string) => void;
  previousView: string;
  setPreviousView: (view: string) => void;
  currentRoom: string;
  setCurrentRoom: (room: string) => void;
  roomViewMode: 'member' | 'preview';
  setRoomViewMode: (mode: 'member' | 'preview') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;
  showGlobalSearch: boolean;
  setShowGlobalSearch: (show: boolean) => void;
  
  // Music State
  nowPlaying: any;
  setNowPlaying: (track: any) => void;
  djSession: any;
  setDJSession: (session: any) => void;
  djQueue: any[];
  setDJQueue: (queue: any[]) => void;
  isDJMinimized: boolean;
  setIsDJMinimized: (minimized: boolean) => void;
  activeSession: any;
  setActiveSession: (session: any) => void;
  
  // Data State
  posts: any[];
  setPosts: (posts: any[]) => void;
  followingList: any[];
  setFollowingList: (following: any[]) => void;
  userRooms: any[];  // Rooms the user owns/created
  setUserRooms: (rooms: any[]) => void;
  joinedRooms: any[];  // Rooms the user has joined as a member
  setJoinedRooms: (rooms: any[]) => void;
  userCrates: any[];
  setUserCrates: (crates: any[]) => void;
  
  // Profile State
  selectedArtist: any;
  setSelectedArtist: (artist: any) => void;
  selectedArtistForMarketplace: any;
  setSelectedArtistForMarketplace: (artist: any) => void;
  selectedFan: any;
  setSelectedFan: (fan: any) => void;
  
  // Utility functions
  handleViewChange: (view: string) => void;
  handleRoomSelect: (room: string) => void;
  handleRoomPreview: (room: string) => void;
  handleOpenSearch: () => void;
  handleCloseSearch: () => void;
}

export const useAppState = (): AppStateHook => {
  // UI State
  const [currentView, setCurrentView] = useState('feed');
  const [previousView, setPreviousView] = useState('feed');
  const [currentRoom, setCurrentRoom] = useState('#hiphop');
  const [roomViewMode, setRoomViewMode] = useState('member');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  
  // Music State
  const [nowPlaying, setNowPlaying] = useState(null);
  const [djSession, setDJSession] = useState(null);
  const [djQueue, setDJQueue] = useState([]);
  const [isDJMinimized, setIsDJMinimized] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  
  // Data State
  const [posts, setPosts] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [userRooms, setUserRooms] = useState([]);  // Rooms user owns/created - start empty
  const [joinedRooms, setJoinedRooms] = useState([
    // Mock joined rooms with session data
    {
      id: '#hiphop',
      name: 'Hip Hop',
      description: 'Underground hip hop beats, boom bap, and lyrical fire',
      memberCount: 1247,
      isActive: true,
      unreadCount: 3,
      type: 'genre',
      region: 'Global',
      tags: ['boom-bap', 'underground', 'freestyle'],
      pinnedTrack: {
        title: 'C.R.E.A.M.',
        artist: 'Wu-Tang Clan',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
      },
      session: {
        id: 'session-hiphop',
        activeListeners: 234,
        isActive: true,
        nowPlaying: {
          title: 'C.R.E.A.M.',
          artist: 'Wu-Tang Clan',
          addedBy: 'mc_lyricist'
        },
        queueLength: 8
      }
    },
    {
      id: '#electronic',
      name: 'Electronic',
      description: 'Electronic music from ambient to hardcore techno',
      memberCount: 892,
      isActive: false,
      unreadCount: 0,
      type: 'genre',
      region: 'Europe',
      tags: ['techno', 'house', 'ambient'],
      pinnedTrack: {
        title: 'Strobe',
        artist: 'Deadmau5',
        artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300'
      },
      session: {
        id: 'session-electronic',
        activeListeners: 0,
        isActive: false,
        queueLength: 0
      }
    },
    {
      id: '#ambient',
      name: 'Ambient',
      description: 'Atmospheric soundscapes and meditative music',
      memberCount: 234,
      isActive: true,
      unreadCount: 12,
      type: 'genre',
      region: 'Global',
      tags: ['meditative', 'soundscape', 'drone'],
      pinnedTrack: {
        title: 'Music for Airports',
        artist: 'Brian Eno',
        artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
      },
      session: {
        id: 'session-ambient',
        activeListeners: 87,
        isActive: true,
        nowPlaying: {
          title: 'Music for Airports',
          artist: 'Brian Eno',
          addedBy: 'ambient_soul'
        },
        queueLength: 5
      }
    },
    {
      id: '#jazz',
      name: 'Jazz',
      description: 'Classic and contemporary jazz for serious listeners',
      memberCount: 567,
      isActive: false,
      unreadCount: 1,
      type: 'genre',
      region: 'North America',
      tags: ['bebop', 'fusion', 'contemporary'],
      pinnedTrack: {
        title: 'Kind of Blue',
        artist: 'Miles Davis',
        artwork: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
      },
      session: {
        id: 'session-jazz',
        activeListeners: 0,
        isActive: false,
        queueLength: 0
      }
    },
    {
      id: '@diplo',
      name: 'Diplo',
      description: 'Official artist room for Diplo and Major Lazer vibes',
      memberCount: 15643,
      isActive: true,
      unreadCount: 5,
      isArtist: true,
      type: 'artist',
      region: 'Global',
      tags: ['moombahton', 'trap', 'edm'],
      isVerified: true,
      pinnedTrack: {
        title: 'Lean On',
        artist: 'Major Lazer ft. MØ',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtfGVufDF8fHx8MTc1NTUyMzY3OHww&ixlib=rb-4.1.0&q=80&w=300'
      },
      session: {
        id: 'session-diplo',
        activeListeners: 1543,
        isActive: true,
        nowPlaying: {
          title: 'Lean On',
          artist: 'Major Lazer ft. MØ',
          addedBy: 'diplo'
        },
        queueLength: 15
      }
    },
    {
      id: '@flume',
      name: 'Flume',
      description: 'Future bass and experimental electronic sounds',
      memberCount: 8932,
      isActive: false,
      unreadCount: 0,
      isArtist: true,
      type: 'artist',
      region: 'Oceania',
      tags: ['future-bass', 'experimental', 'electronic'],
      isVerified: true,
      pinnedTrack: {
        title: 'Never Be Like You',
        artist: 'Flume ft. Kai',
        artwork: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxlbGVjdHJvbmljJTIwbXVzaWN8ZW58MXx8fHwxNzU1NTIzNjc4fDA&ixlib=rb-4.1.0&q=80&w=300'
      },
      session: {
        id: 'session-flume',
        activeListeners: 0,
        isActive: false,
        queueLength: 0
      }
    }
  ]);
  const [userCrates, setUserCrates] = useState([]);
  
  // Profile State
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedArtistForMarketplace, setSelectedArtistForMarketplace] = useState(null);
  const [selectedFan, setSelectedFan] = useState(null);

  // Utility functions
  const handleViewChange = useCallback((view: string) => {
    setCurrentView(view);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleRoomSelect = useCallback((room: string) => {
    setCurrentRoom(room);
    setRoomViewMode('member');
    setCurrentView('room');
  }, []);

  const handleRoomPreview = useCallback((room: string) => {
    setCurrentRoom(room);
    setRoomViewMode('preview');
    setCurrentView('room');
  }, []);

  const handleOpenSearch = useCallback(() => {
    setShowGlobalSearch(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowGlobalSearch(false);
  }, []);

  return {
    // UI State
    currentView,
    setCurrentView,
    previousView,
    setPreviousView,
    currentRoom,
    setCurrentRoom,
    roomViewMode,
    setRoomViewMode,
    sidebarOpen,
    setSidebarOpen,
    isMobile,
    setIsMobile,
    showGlobalSearch,
    setShowGlobalSearch,
    
    // Music State
    nowPlaying,
    setNowPlaying,
    djSession,
    setDJSession,
    djQueue,
    setDJQueue,
    isDJMinimized,
    setIsDJMinimized,
    activeSession,
    setActiveSession,
    
    // Data State
    posts,
    setPosts,
    followingList,
    setFollowingList,
    userRooms,
    setUserRooms,
    joinedRooms,
    setJoinedRooms,
    userCrates,
    setUserCrates,
    
    // Profile State
    selectedArtist,
    setSelectedArtist,
    selectedArtistForMarketplace,
    setSelectedArtistForMarketplace,
    selectedFan,
    setSelectedFan,
    
    // Utility functions
    handleViewChange,
    handleRoomSelect,
    handleRoomPreview,
    handleOpenSearch,
    handleCloseSearch,
  };
};