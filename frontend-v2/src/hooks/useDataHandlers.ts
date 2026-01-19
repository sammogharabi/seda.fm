import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { User } from './useAuth';

export interface DataHandlersHook {
  // User Management
  handleFollowUser: (user: any) => void;
  handleUnfollowUser: (userId: string) => void;
  isFollowing: (userId: string | undefined | null) => boolean;
  
  // Block Management
  handleBlockUser: (userId: string) => void;
  handleUnblockUser: (userId: string) => void;
  isBlocked: (userId: string | undefined | null) => boolean;
  getBlockedUsers: () => any[];
  
  // Content Creation
  handleCreatePost: (post: any) => void;
  handleCreateRoom: (room: any) => void;
  handleCreateCrate: (crate: any) => void;
  handleJoinRoom: (room: any) => void;
  
  // Room Management
  handleRoomPreview: (room: any) => void;
  
  // Profile Navigation
  handleViewArtistProfile: (artist: any) => void;
  handleBackFromArtistProfile: () => void;
  handleFollowArtist: (artistId: string) => void;
  handleViewArtistMarketplace: (artist: any) => void;
  handleBackFromMarketplace: () => void;
  handleViewFanProfile: (fan: any) => void;
  handleBackFromFanProfile: () => void;
  handleFollowFan: (fan: any) => void;
  
  // User Data Access
  getUserData: (userId: string) => any;
  syncFollowingList: () => void;
}

export const useDataHandlers = (
  currentUser: User | null,
  followingList: any[],
  setFollowingList: (following: any[]) => void,
  posts: any[],
  setPosts: (posts: any[]) => void,
  userRooms: any[],
  setUserRooms: (rooms: any[]) => void,
  joinedRooms: any[],
  setJoinedRooms: (rooms: any[]) => void,
  userCrates: any[],
  setUserCrates: (crates: any[]) => void,
  setCurrentView: (view: string) => void,
  setCurrentRoom: (room: string) => void,
  setRoomViewMode: (mode: 'member' | 'preview') => void,
  setSelectedArtist: (artist: any) => void,
  setSelectedArtistForMarketplace: (artist: any) => void,
  setSelectedFan: (fan: any) => void,
  selectedArtistForMarketplace: any,
  mockArtists: any[],
  mockFans: any[]
): DataHandlersHook => {
  
  // Local state to manage updated user data (simulating a global user store)
  const [updatedUsers, setUpdatedUsers] = useState<Map<string, any>>(new Map());

  // Helper function to get the most up-to-date user data
  const getUserData = useCallback((userId: string) => {
    // Check if we have an updated version
    if (updatedUsers.has(userId)) {
      return updatedUsers.get(userId);
    }
    
    // Otherwise, get from mock data
    const fan = mockFans.find(f => f.id === userId);
    if (fan) return fan;
    
    const artist = mockArtists.find(a => a.id === userId);
    if (artist) return artist;
    
    return null;
  }, [updatedUsers, mockFans, mockArtists]);

  // Helper function to update user data
  const updateUserData = useCallback((userId: string, updates: any) => {
    const currentData = getUserData(userId);
    if (currentData) {
      const updatedData = { ...currentData, ...updates };
      setUpdatedUsers(prev => new Map(prev).set(userId, updatedData));
      return updatedData;
    } else {
      // If user doesn't exist, create new entry
      setUpdatedUsers(prev => new Map(prev).set(userId, updates));
      return updates;
    }
  }, [getUserData]);

  // Sync following list with actual follow relationships
  const syncFollowingList = useCallback(() => {
    if (!currentUser) return;
    
    console.log('🔄 Syncing following list...');
    
    // Get all users that the current user is following based on their followers lists
    const allUsers = [...mockFans, ...mockArtists];
    const actuallyFollowing = [];
    
    // Check mock data users
    for (const user of allUsers) {
      const userData = getUserData(user.id);
      if (userData?.followers?.includes(currentUser.id)) {
        actuallyFollowing.push(userData);
      }
    }
    
    // Check updated users that might not be in mock data
    for (const [userId, userData] of updatedUsers) {
      if (userData?.followers?.includes(currentUser.id)) {
        const isAlreadyAdded = actuallyFollowing.some(u => u.id === userId);
        if (!isAlreadyAdded) {
          actuallyFollowing.push(userData);
        }
      }
    }
    
    // Also include users from the current followingList that might not have been synced yet
    for (const user of followingList) {
      const isAlreadyAdded = actuallyFollowing.some(u => u.id === user.id);
      if (!isAlreadyAdded) {
        actuallyFollowing.push(user);
      }
    }
    
    console.log('🔄 Actually following:', actuallyFollowing.map(u => u.id));
    console.log('🔄 Current following list:', followingList.map(u => u.id));
    
    // Update following list if it's different
    const currentIds = followingList.map(u => u.id).sort();
    const actualIds = actuallyFollowing.map(u => u.id).sort();
    
    if (currentIds.join(',') !== actualIds.join(',')) {
      console.log('🔄 Updating following list to match actual relationships');
      setFollowingList(actuallyFollowing);
    }
  }, [currentUser, mockFans, mockArtists, getUserData, updatedUsers, followingList, setFollowingList]);

  // Define isFollowing FIRST before other functions that use it
  const isFollowing = useCallback((userId: string | undefined | null) => {
    // Handle edge cases: undefined, null, or non-string values
    if (!userId || typeof userId !== 'string') {
      console.log('🔗 isFollowing: Invalid userId provided:', userId);
      return false;
    }
    
    // Check if current user exists
    if (!currentUser?.id) {
      console.log('🔗 isFollowing: No current user');
      return false;
    }
    
    // Check followingList first (for immediate UI updates)
    const inFollowingList = followingList.some(user => user?.id === userId);
    
    // Also check if the current user appears in the target user's followers list
    const targetUser = getUserData(userId);
    const followers = targetUser?.followers;
    const inTargetFollowers = Array.isArray(followers) && followers.includes(currentUser.id);
    
    console.log('🔗 isFollowing check for:', userId);
    console.log('🔗 In followingList:', inFollowingList);
    console.log('🔗 In target followers:', inTargetFollowers);
    console.log('🔗 Target user followers:', targetUser?.followers);
    console.log('🔗 Current user ID:', currentUser.id);
    
    // Return true if found in either location
    return inFollowingList || inTargetFollowers;
  }, [followingList, getUserData, currentUser]);

  // Sync following list when updated users change or on mount
  React.useEffect(() => {
    if (currentUser && updatedUsers.size > 0) {
      console.log('🔄 Updated users changed, syncing following list');
      syncFollowingList();
    }
  }, [currentUser, updatedUsers, syncFollowingList]);

  // User Management with proper follower system
  const handleFollowUser = useCallback((user: any) => {
    if (!currentUser) return;
    
    console.log('🔗 Following user:', user.id, user.displayName || user.username);
    
    // Check if already following to avoid duplicates
    if (isFollowing(user.id)) {
      console.log('🔗 Already following user:', user.id);
      return;
    }
    
    // Update following list for UI (avoid duplicates)
    const isAlreadyInList = followingList.some(u => u.id === user.id);
    if (!isAlreadyInList) {
      setFollowingList([...followingList, user]);
    }
    
    // Update the target user's followers array
    const targetUser = getUserData(user.id);
    if (targetUser) {
      const currentFollowers = targetUser.followers || [];
      if (!currentFollowers.includes(currentUser.id)) {
        updateUserData(user.id, {
          followers: [...currentFollowers, currentUser.id]
        });
        console.log('🔗 Added', currentUser.id, 'to', user.id, 'followers list');
      }
    } else {
      // If target user not found in mock data, create a minimal entry
      updateUserData(user.id, {
        ...user,
        followers: [currentUser.id]
      });
      console.log('🔗 Created new user entry with followers:', [currentUser.id]);
    }
    
    toast.success(`Now following ${user.displayName || user.username}`);
  }, [currentUser, followingList, setFollowingList, getUserData, updateUserData, isFollowing]);

  const handleUnfollowUser = useCallback((userId: string) => {
    if (!currentUser) return;
    
    const userToUnfollow = followingList.find(user => user.id === userId);
    console.log('🔗 Unfollowing user:', userId, userToUnfollow?.displayName || userToUnfollow?.username);
    
    // Update following list for UI
    setFollowingList(followingList.filter(user => user.id !== userId));
    
    // Update the target user's followers array
    const targetUser = getUserData(userId);
    if (targetUser) {
      const currentFollowers = targetUser.followers || [];
      const updatedFollowers = currentFollowers.filter(id => id !== currentUser.id);
      updateUserData(userId, {
        ...targetUser,
        followers: updatedFollowers
      });
      console.log('🔗 Removed', currentUser.id, 'from', userId, 'followers list');
      console.log('🔗 Updated followers array:', updatedFollowers);
    }
    
    if (userToUnfollow) {
      toast.success(`Unfollowed ${userToUnfollow.displayName || userToUnfollow.username}`);
    } else {
      // Try to get the user's display name from updated data
      const targetUser = getUserData(userId);
      if (targetUser) {
        toast.success(`Unfollowed ${targetUser.displayName || targetUser.username}`);
      }
    }
  }, [currentUser, followingList, setFollowingList, getUserData, updateUserData]);

  // Block Management
  const handleBlockUser = useCallback((userId: string) => {
    if (!currentUser) return;
    
    const userToBlock = getUserData(userId);
    console.log('🚫 Blocking user:', userId, userToBlock?.displayName || userToBlock?.username);
    
    // Get current user's blocked list
    const currentUserData = getUserData(currentUser.id) || currentUser;
    const currentBlocked = currentUserData.blockedUsers || [];
    
    // Add to blocked list if not already blocked
    if (!currentBlocked.includes(userId)) {
      const updatedBlocked = [...currentBlocked, userId];
      updateUserData(currentUser.id, {
        ...currentUserData,
        blockedUsers: updatedBlocked
      });
      
      // Also unfollow if currently following
      if (isFollowing(userId)) {
        handleUnfollowUser(userId);
      }
      
      // Remove from following list if present
      setFollowingList(followingList.filter(user => user.id !== userId));
      
      console.log('🚫 Updated blocked list:', updatedBlocked);
      toast.success(`Blocked ${userToBlock?.displayName || userToBlock?.username || 'user'}`, {
        description: 'You will no longer see their content'
      });
    }
  }, [currentUser, getUserData, updateUserData, isFollowing, handleUnfollowUser, followingList, setFollowingList]);

  const handleUnblockUser = useCallback((userId: string) => {
    if (!currentUser) return;
    
    const userToUnblock = getUserData(userId);
    console.log('✅ Unblocking user:', userId, userToUnblock?.displayName || userToUnblock?.username);
    
    // Get current user's blocked list
    const currentUserData = getUserData(currentUser.id) || currentUser;
    const currentBlocked = currentUserData.blockedUsers || [];
    
    // Remove from blocked list
    const updatedBlocked = currentBlocked.filter(id => id !== userId);
    updateUserData(currentUser.id, {
      ...currentUserData,
      blockedUsers: updatedBlocked
    });
    
    console.log('✅ Updated blocked list:', updatedBlocked);
    toast.success(`Unblocked ${userToUnblock?.displayName || userToUnblock?.username || 'user'}`, {
      description: 'You can now see their content again'
    });
  }, [currentUser, getUserData, updateUserData]);

  const isBlocked = useCallback((userId: string | undefined | null) => {
    if (!userId || typeof userId !== 'string' || !currentUser?.id) {
      return false;
    }
    
    const currentUserData = getUserData(currentUser.id) || currentUser;
    const blockedUsers = currentUserData.blockedUsers || [];
    return blockedUsers.includes(userId);
  }, [currentUser, getUserData]);

  const getBlockedUsers = useCallback(() => {
    if (!currentUser) return [];
    
    const currentUserData = getUserData(currentUser.id) || currentUser;
    const blockedUserIds = currentUserData.blockedUsers || [];
    
    // Get full user objects for blocked users
    return blockedUserIds.map(userId => getUserData(userId)).filter(Boolean);
  }, [currentUser, getUserData]);

  // Content Creation
  const handleCreatePost = useCallback((post: any) => {
    const newPost = {
      ...post,
      id: Date.now(),
      user: currentUser,
      timestamp: new Date(),
      likes: 0,
      reposts: 0,
      comments: 0,
      isLiked: false,
      isReposted: false
    };
    setPosts([newPost, ...posts]);
  }, [currentUser, posts, setPosts]);

  const handleCreateRoom = useCallback((room: any) => {
    setUserRooms([room, ...userRooms]);
    
    // Auto-navigate to the newly created room
    setCurrentRoom(room.id);
    setCurrentView('room');
    
    console.log('Room created:', room);
  }, [userRooms, setUserRooms, setCurrentRoom, setCurrentView]);

  const handleCreateCrate = useCallback((crate: any) => {
    setUserCrates([crate, ...userCrates]);
    
    // Navigate to crates view to show the new crate
    setCurrentView('crates');
    
    console.log('Crate created:', crate);
  }, [userCrates, setUserCrates, setCurrentView]);

  const handleJoinRoom = useCallback((room: any) => {
    // Check if user is already a member to avoid duplicates
    const isAlreadyMember = joinedRooms.some(r => r.id === room.id);
    
    if (!isAlreadyMember) {
      // Add the room to joined rooms (not owned rooms)
      setJoinedRooms(prevRooms => [...prevRooms, room]);
    }
    
    // Navigate to the room
    setCurrentRoom(room.id);
    setRoomViewMode('member'); // Set to member mode when joining
    setCurrentView('room');
    
    // Add visual feedback
    toast.success(`Welcome to ${room.name}!`, {
      description: 'You can now participate in discussions and share music.',
      duration: 4000
    });
  }, [joinedRooms, setJoinedRooms, setCurrentRoom, setRoomViewMode, setCurrentView]);

  // Room Management
  const handleRoomPreview = useCallback((room: any) => {
    setCurrentRoom(room.id);
    setRoomViewMode('preview'); // Set to preview mode
    setCurrentView('room');
    
    console.log('Previewing room:', room);
    
    // Add visual feedback
    toast.success(`Previewing ${room.name}`, {
      description: 'Join the room to participate in discussions.',
      duration: 3000
    });
  }, [setCurrentRoom, setRoomViewMode, setCurrentView]);

  // Profile Navigation
  const handleViewArtistProfile = useCallback((artist: any) => {
    setSelectedArtist(artist);
    setCurrentView('artist-profile');
  }, [setSelectedArtist, setCurrentView]);

  const handleBackFromArtistProfile = useCallback(() => {
    setSelectedArtist(null);
    setCurrentView('discover'); // Navigate back to discover view
  }, [setSelectedArtist, setCurrentView]);

  const handleFollowArtist = useCallback((artistId: string) => {
    if (isFollowing(artistId)) {
      handleUnfollowUser(artistId);
    } else {
      const artist = mockArtists.find(a => a.id === artistId);
      if (artist) {
        handleFollowUser(artist);
      }
    }
  }, [mockArtists, handleFollowUser, handleUnfollowUser, isFollowing]);

  const handleFollowFan = useCallback((fan: any) => {
    console.log('🔗 handleFollowFan called with fan:', fan);
    console.log('🔗 fan ID:', fan?.id);
    console.log('🔗 isFollowing result:', isFollowing(fan?.id));
    
    if (!fan?.id) {
      console.log('❌ No fan ID provided');
      return;
    }
    
    if (isFollowing(fan.id)) {
      console.log('🔗 Unfollowing fan:', fan.displayName || fan.username);
      handleUnfollowUser(fan.id);
    } else {
      console.log('🔗 Following fan:', fan.displayName || fan.username);
      handleFollowUser(fan);
    }
  }, [handleFollowUser, handleUnfollowUser, isFollowing]);

  const handleViewArtistMarketplace = useCallback((artist: any) => {
    setSelectedArtistForMarketplace(artist);
    setCurrentView('artist-marketplace');
  }, [setSelectedArtistForMarketplace, setCurrentView]);

  const handleBackFromMarketplace = useCallback(() => {
    // Keep the same artist selected for the profile view
    setSelectedArtist(selectedArtistForMarketplace);
    setSelectedArtistForMarketplace(null);
    setCurrentView('artist-profile'); // Go back to the artist profile
  }, [selectedArtistForMarketplace, setSelectedArtist, setSelectedArtistForMarketplace, setCurrentView]);

  const handleViewFanProfile = useCallback((fan: any) => {
    // Validate fan data
    if (!fan || !fan.id) {
      console.error('🚨 handleViewFanProfile: Invalid fan data provided:', fan);
      return;
    }
    
    // Sync following list before viewing profile to ensure accurate follow state
    syncFollowingList();
    
    // Get the most up-to-date fan data (including updated followers)
    const updatedFan = getUserData(fan.id);
    const fanToView = updatedFan || fan;
    
    // Ensure the fan data has required properties
    const sanitizedFan = {
      ...fanToView,
      id: fanToView.id || fan.id,
      displayName: fanToView.displayName || fan.displayName || fan.username || 'Unknown User',
      username: fanToView.username || fan.username || fanToView.displayName || 'unknown',
      followers: fanToView.followers || []
    };
    
    console.log('🔗 Viewing fan profile:', sanitizedFan.id, sanitizedFan.displayName);
    console.log('🔗 Fan followers:', sanitizedFan.followers);
    
    setSelectedFan(sanitizedFan);
    setCurrentView('fan-profile');
  }, [setSelectedFan, setCurrentView, getUserData, syncFollowingList]);

  const handleBackFromFanProfile = useCallback(() => {
    setSelectedFan(null);
    setCurrentView('discover'); // Navigate back to discover view
  }, [setSelectedFan, setCurrentView]);

  return {
    // User Management
    handleFollowUser,
    handleUnfollowUser,
    isFollowing,
    
    // Block Management
    handleBlockUser,
    handleUnblockUser,
    isBlocked,
    getBlockedUsers,
    
    // Content Creation
    handleCreatePost,
    handleCreateRoom,
    handleCreateCrate,
    handleJoinRoom,
    
    // Room Management
    handleRoomPreview,
    
    // Profile Navigation
    handleViewArtistProfile,
    handleBackFromArtistProfile,
    handleFollowArtist,
    handleViewArtistMarketplace,
    handleBackFromMarketplace,
    handleViewFanProfile,
    handleBackFromFanProfile,
    handleFollowFan,
    
    // User Data Access
    getUserData,
    syncFollowingList,
  };
};