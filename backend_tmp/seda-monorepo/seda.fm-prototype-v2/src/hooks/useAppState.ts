import { useState, useCallback } from 'react';

export interface AppStateHook {
  // UI State
  currentView: string;
  setCurrentView: (view: string) => void;
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
    // Pre-populate with some demo joined rooms that don't overlap with static data
    { id: '#user-room-1', name: 'My Indie Mix', members: 42, isPrivate: false, activity: [] },
    { id: '#user-room-2', name: 'Synthwave Collective', members: 156, isPrivate: false, activity: [] }
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