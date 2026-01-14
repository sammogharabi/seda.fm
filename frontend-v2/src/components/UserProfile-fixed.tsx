import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { 
  Music, 
  Calendar, 
  Radio,
  Share,
  Download,
  PlayCircle,
  Users,
  Edit3,
  ShoppingCart,
  TrendingUp,
  Award,
  Coins,
  Zap,
  ArrowLeft,
  UserPlus,
  UserMinus,
  MessageCircle,
  Shield,
  Ban,
  Activity,
  BarChart3,
  Package,
  Disc3,
  DoorOpen,
  Compass,
  Eye,
  MousePointerClick,
  ExternalLink,
  ChevronDown,
  Heart,
  Repeat,
  Play,
  CheckCircle,
  Settings
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { ArtistMarketplace } from './ArtistMarketplace';
import { FanMarketplaceView } from './FanMarketplaceView';
import { ProgressBar } from './ProgressBar';
import { CreditsWallet } from './CreditsWallet';
import { StreamingConnections } from './StreamingConnections';
import { FanSupportActions } from './FanSupportActions';
import { XPNotificationSystem } from './XPNotificationSystem';
import { FanMessageModal } from './FanMessageModal';
import { ArtistProfileCustomization } from './ArtistProfileCustomization';
import { progressionService } from '../utils/progressionService';
import { calculateLevel, formatXP } from '../utils/progression';
import { format } from 'date-fns';
import { profilesApi, playlistsApi, roomsApi, type UserProfile as UserProfileType } from '../lib/api';

// Helper function to format timestamps
const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
  
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 2592000)}mo`;
};

const MOCK_STATS = [
  { label: 'Tracks Played', value: 1247 },
  { label: 'Sessions Hosted', value: 89 },
  { label: 'Followers', value: 156 },
  { label: 'Member Since', value: 2023 }
];

// Mock data for public fan profiles
const MOCK_CRATES = [
  { 
    id: 'crate-1', 
    name: 'Late Night Vibes', 
    trackCount: 23, 
    isPublic: true,
    description: 'Chill beats for those 2am sessions',
    artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
  },
  { 
    id: 'crate-2', 
    name: 'Underground Gems', 
    trackCount: 31, 
    isPublic: true,
    description: 'Hidden tracks from emerging artists',
    artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop'
  },
  { 
    id: 'crate-3', 
    name: 'Workout Mix', 
    trackCount: 18, 
    isPublic: false,
    description: 'High energy tracks for training',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'
  }
];

const MOCK_JOINED_ROOMS = [
  { id: 'room-1', name: '#hiphop', memberCount: 2847, isActive: true },
  { id: 'room-2', name: '#electronic', memberCount: 1923, isActive: true },
  { id: 'room-3', name: '#jazz', memberCount: 876, isActive: false },
  { id: 'room-4', name: '#underground', memberCount: 1205, isActive: true }
];

// Helper function to create mock posts for a user
const createMockPosts = (user: any) => [
  {
    id: 'post-1',
    type: 'music_share',
    content: 'This track has been on repeat all week! Perfect vibes for late night sessions 🌙',
    track: {
      title: 'Midnight Dreams',
      artist: 'Unknown Artist',
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      duration: '3:45'
    },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    likes: 45,
    reposts: 8,
    comments: 12
  },
  {
    id: 'post-2',
    type: 'text_post',
    content: 'Just discovered this amazing artist! Their sound is so unique and refreshing. Can\'t stop listening 🎵',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    likes: 32,
    reposts: 5,
    comments: 8
  },
  {
    id: 'post-3',
    type: 'link_share',
    content: 'Check out this incredible live session! The energy is unreal',
    links: [{
      type: 'youtube',
      url: 'https://youtube.com/watch',
      platform: 'YouTube',
      title: 'Live Session',
      description: 'Amazing performance',
      thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop'
    }],
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    likes: 67,
    reposts: 12,
    comments: 19
  }
];

// Helper function to create mock comment history for a user
const createMockCommentHistory = (user: any) => [
  {
    id: 'comment-1',
    content: 'This is absolutely amazing! Can\'t stop listening to this 🔥',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    likes: 8,
    postContext: {
      id: 'other-post-1',
      author: { username: 'another_user', displayName: 'Another User', accentColor: 'blue' },
      content: 'Just dropped a new track, check it out!',
      type: 'music_share'
    }
  },
  {
    id: 'comment-2',
    content: 'Love this! Added to my crate 💯',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    likes: 5,
    postContext: {
      id: 'other-post-2',
      author: { username: 'music_lover', displayName: 'Music Lover', accentColor: 'mint' },
      content: 'Found this hidden gem today',
      type: 'music_share'
    }
  },
  {
    id: 'comment-3',
    content: 'Thanks for sharing! This made my day',
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    likes: 3,
    postContext: {
      id: 'other-post-3',
      author: { username: 'dj_vibes', displayName: 'DJ Vibes', accentColor: 'coral' },
      content: 'Sharing my latest playlist with you all',
      type: 'text_post'
    }
  }
];

export function UserProfile({ user, onUpdateUser, viewingUser = null, isOwnProfile = true, defaultTab = 'activity', onBack = null, onFollowToggle = null, isFollowing = false, onSendMessage = null, onFollowUser = null, isFollowingUser = null, onViewChange = null, onBlockUser = null, onUnblockUser = null, isBlocked = null, getBlockedUsers = null }) {
  console.log('🔍 UserProfile render - user:', user, 'isOwnProfile:', isOwnProfile, 'defaultTab:', defaultTab);
  console.log('🔍 UserProfile follow props - onFollowToggle:', !!onFollowToggle, 'isFollowing:', isFollowing);
  
  // Safety check for user object
  if (!user) {
    console.log('❌ UserProfile: No user provided');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">User profile not found</p>
        </div>
      </div>
    );
  }

  // Sanitize user data to prevent errors
  const safeUser = {
    ...user,
    username: user.username || 'Unknown',
    displayName: user.displayName || user.username || 'Unknown User',
    bio: user.bio || '',
    followers: Array.isArray(user.followers) ? user.followers : [],
    following: Array.isArray(user.following) ? user.following : [],
    points: typeof user.points === 'number' ? user.points : 0,
    id: user.id || user.username || 'unknown',
    connectedServices: Array.isArray(user.connectedServices) ? user.connectedServices : [],
    isArtist: Boolean(user.isArtist),
    verified: Boolean(user.verified),
    location: user.location || '',
    website: user.website || ''
  };
  
  console.log('🔍 UserProfile: Sanitized user data:', {
    id: safeUser.id,
    username: safeUser.username,
    followersLength: safeUser.followers.length,
    followingLength: safeUser.following.length
  });

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userProgression, setUserProgression] = useState(null);
  const [progressionLoading, setProgressionLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [profileTimeRange, setProfileTimeRange] = useState<'day' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [profileDateRange, setProfileDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [profileData, setProfileData] = useState({
    bio: safeUser.bio || '',
    displayName: safeUser.displayName || safeUser.username,
    location: safeUser.location || '',
    website: safeUser.website || ''
  });

  // API data state
  const [apiProfile, setApiProfile] = useState<UserProfileType | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userCrates, setUserCrates] = useState<any[]>([]);
  const [userRooms, setUserRooms] = useState<any[]>([]);

  // Fetch profile data from API
  useEffect(() => {
    async function fetchProfileData() {
      if (!safeUser.username) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        setProfileError(null);

        // Fetch profile from API
        const profile = await profilesApi.getMe();
        setApiProfile(profile);

        // Update profile data state with API data
        setProfileData({
          bio: profile.bio || '',
          displayName: profile.displayName || profile.username,
          location: profile.location || '',
          website: profile.website || ''
        });

        // Fetch user's crates (playlists)
        try {
          const crates = await playlistsApi.getMyPlaylists();
          setUserCrates(crates);
        } catch (err) {
          console.error('Error fetching crates:', err);
        }

        // Fetch user's rooms
        try {
          const rooms = await roomsApi.getAll();
          // Filter to rooms where user is a member
          const memberRooms = rooms.filter(room =>
            room.memberships?.some(m => m.userId === safeUser.id)
          );
          setUserRooms(memberRooms);
        } catch (err) {
          console.error('Error fetching rooms:', err);
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileError('Failed to load profile');
        toast.error('Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfileData();
  }, [safeUser.username, safeUser.id]);

  const getProfileTimeRangeLabel = () => {
    switch (profileTimeRange) {
      case 'day': return 'Last 24 hours';
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'year': return 'Last 12 months';
      case 'custom':
        if (profileDateRange.from && profileDateRange.to) {
          return `${format(profileDateRange.from, 'MMM dd')} - ${format(profileDateRange.to, 'MMM dd, yyyy')}`;
        }
        return 'Custom range';
      default: return 'Last 30 days';
    }
  };

  // Generate profile analytics data based on selected timeframe
  const MOCK_PROFILE_ANALYTICS = useMemo(() => {
    // Base multipliers for different timeframes (month is baseline)
    const multipliers = {
      day: 0.033, // ~1/30th of month
      week: 0.23,  // ~1/4.3 of month
      month: 1,
      year: 12,
      custom: profileDateRange.from && profileDateRange.to 
        ? Math.max(0.033, (profileDateRange.to.getTime() - profileDateRange.from.getTime()) / (1000 * 60 * 60 * 24 * 30))
        : 1
    };

    const activeTimeframe = (profileDateRange.from && profileDateRange.to) ? 'custom' : profileTimeRange;
    const multiplier = multipliers[activeTimeframe as keyof typeof multipliers];

    const baseViews = 2847;
    const totalViews = Math.round(baseViews * multiplier);

    return {
      totalViews: totalViews,
      viewsThisWeek: Math.round(342 * multiplier),
      viewGrowth: 15.3,
      trafficSources: [
        { source: 'Feed', views: Math.round(1245 * multiplier), percentage: 43.7, color: 'bg-accent-coral' },
        { source: 'Discover', views: Math.round(892 * multiplier), percentage: 31.3, color: 'bg-accent-mint' },
        { source: 'Search', views: Math.round(456 * multiplier), percentage: 16.0, color: 'bg-accent-blue' },
        { source: 'Direct Link', views: Math.round(254 * multiplier), percentage: 8.9, color: 'bg-accent-yellow' }
      ],
      topViewers: [
        { username: 'musiclover23', views: Math.round(47 * multiplier) },
        { username: 'beatsmaster', views: Math.round(39 * multiplier) },
        { username: 'djspinner', views: Math.round(31 * multiplier) }
      ]
    };
  }, [profileTimeRange, profileDateRange]);

  useEffect(() => {
    // Only load progression for fans - artists don't have XP/points system
    if (safeUser.userType === 'artist') {
      console.log('🎨 UserProfile: Skipping progression for artist');
      setUserProgression(null);
      setProgressionLoading(false);
      return;
    }
    
    try {
      console.log('🔍 UserProfile: Initializing progression for user:', safeUser.id);
      setProgressionLoading(true);
      
      // Initialize progression for user
      const progression = progressionService.getProgression(safeUser.id);
      console.log('✅ UserProfile: Progression loaded:', progression);
      setUserProgression(progression);
    } catch (error) {
      console.error('❌ UserProfile: Error loading progression:', error);
      // Set a default progression if there's an error
      setUserProgression({
        totalXP: safeUser.points || 0,
        djPoints: 0,
        fanSupportXP: 0,
        level: 1,
        currentBadge: 'Bronze Note',
        creditsBalance: 0,
        creditsEarned: 0,
        creditsSpent: 0,
        seasonCredits: 0,
        badges: ['Bronze Note'],
        lastXPDecay: new Date()
      });
    } finally {
      setProgressionLoading(false);
    }
  }, [safeUser.id, safeUser.points, safeUser.userType]);

  const handleProgressionUpdate = () => {
    const updatedProgression = progressionService.getProgression(safeUser.id);
    setUserProgression(updatedProgression);
  };

  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [verificationData, setVerificationData] = useState({
    targetUrl: '',
    platform: 'bandcamp',
    claimCode: '',
    status: safeUser.verificationStatus || 'not-requested' // not-requested, pending, approved, denied
  });
  
  const userPoints = safeUser.points || 0;
  const topGenres = (safeUser.genres || []).slice(0, 3);
  const joinDate = new Date(safeUser.joinedDate || new Date()).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  const handleSaveProfile = useCallback(async () => {
    if (!apiProfile?.username) {
      toast.error('Unable to save profile');
      return;
    }

    try {
      setProfileLoading(true);

      // Update profile via API
      const updatedProfile = await profilesApi.update(apiProfile.username, {
        bio: profileData.bio,
        displayName: profileData.displayName,
        location: profileData.location,
        website: profileData.website
      });

      // Update local state
      setApiProfile(updatedProfile);

      // Call parent callback if provided
      if (onUpdateUser) {
        onUpdateUser({ ...safeUser, ...profileData });
      }

      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  }, [apiProfile, profileData, safeUser, onUpdateUser]);

  const shareProfile = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `${safeUser.username} on sedā.fm`,
        text: `Check out ${safeUser.username}'s music profile on sedā.fm!`,
        url: `https://seda.fm/user/${safeUser.username}`
      });
    } else {
      navigator.clipboard.writeText(`https://seda.fm/user/${safeUser.username}`);
      toast.success('Profile link copied to clipboard!');
    }
  }, [safeUser.username]);

  const downloadProfileData = useCallback(() => {
    const data = {
      username: safeUser.username,
      points: userPoints,
      stats: MOCK_STATS,
      genres: topGenres,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seda-fm-profile-${safeUser.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Profile data downloaded!');
  }, [safeUser, userPoints, topGenres]);

  const generateClaimCode = useCallback(() => {
    // Generate a unique 8-character claim code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SEDA-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  const handleRequestVerification = useCallback(() => {
    const claimCode = generateClaimCode();
    setVerificationData(prev => ({ 
      ...prev, 
      claimCode,
      status: 'pending'
    }));
    
    // In a real app, this would make an API call
    // For now, we'll just update the local state and user
    onUpdateUser({ 
      ...safeUser, 
      verificationStatus: 'pending',
      verificationClaimCode: claimCode
    });
    
    toast.success('Verification request created! Follow the instructions to complete verification.');
  }, [generateClaimCode, onUpdateUser, safeUser]);

  const handleVerificationSubmit = useCallback(() => {
    if (!verificationData.targetUrl.trim()) {
      toast.error('Please enter the URL where you placed the claim code.');
      return;
    }

    // In a real app, this would trigger a crawl or admin review
    // For demo purposes, we'll simulate this process
    setVerificationData(prev => ({ ...prev, status: 'pending' }));
    setShowVerificationModal(false);
    
    toast.success("Verification submitted! We'll review your request within 24-48 hours.");
    
    // Simulate approval after 3 seconds for demo purposes
    setTimeout(() => {
      onUpdateUser({ 
        ...safeUser, 
        verified: true,
        verificationStatus: 'approved'
      });
      toast.success("🎉 Verification approved! You're now verified on sedā.fm");
    }, 3000);
  }, [verificationData.targetUrl, onUpdateUser, safeUser]);

  // Show loading screen if progression or profile is still loading
  if (progressionLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-coral border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if profile failed to load
  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <p className="text-red-500 mb-4">Failed to load profile</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-accent-coral hover:bg-accent-coral/90"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        {/* Clean Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {/* Back Button for Public Profiles */}
          {!isOwnProfile && onBack && (
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-2 -ml-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          )}
          
          <div className="border-b border-foreground/10 pb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                  <h1 className="text-3xl font-semibold text-foreground">
                    {profileData.displayName}
                  </h1>
                  <div className="flex items-center gap-2">
                    {safeUser.verified && (
                      <div className="w-4 h-4 bg-foreground rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-background rounded-full"></div>
                      </div>
                    )}
                    {safeUser.isArtist && (
                      <Badge variant="outline" className="text-xs">
                        Artist
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  @{safeUser.username}
                </p>
                
                <p className="text-foreground mb-6 leading-relaxed">
                  {profileData.bio || 'Music enthusiast exploring the underground scene'}
                </p>
                
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {joinDate}</span>
                  </div>
                  {profileData.location && (
                    <div className="flex items-center gap-2">
                      <span>📍 {profileData.location}</span>
                    </div>
                  )}
                  {(safeUser.connectedServices && safeUser.connectedServices.length > 0) && (
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span>{safeUser.connectedServices.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Primary Action Row */}
                  <div className="flex flex-wrap gap-2">
                    {isOwnProfile ? (
                      <>
                        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md border border-foreground/10" aria-describedby="edit-profile-description">
                            <DialogHeader>
                              <DialogTitle>Edit Profile</DialogTitle>
                              <DialogDescription id="edit-profile-description">
                                Update your profile information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Display Name</Label>
                                <Input
                                  value={profileData.displayName}
                                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                                  placeholder="Your display name"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Bio</Label>
                                <Textarea
                                  value={profileData.bio}
                                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                  placeholder="Tell us about yourself"
                                  rows={3}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Location</Label>
                                <Input
                                  value={profileData.location}
                                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                                  placeholder="Your location"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Website</Label>
                                <Input
                                  value={profileData.website}
                                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                                  placeholder="https://your-website.com"
                                  className="mt-1"
                                />
                              </div>
                              <div className="flex gap-3 pt-4">
                                <Button onClick={handleSaveProfile} className="flex-1 bg-accent-coral hover:bg-accent-coral/90">
                                  Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {/* Verification Button - Only show for artists on own profile */}
                        {safeUser.isArtist && !safeUser.verified && verificationData.status === 'not-requested' && (
                          <Button 
                            variant="outline" 
                            onClick={() => setShowVerificationModal(true)} 
                            size="sm"
                            className="border-2"
                          >
                            Get Verified
                          </Button>
                        )}
                        
                        {/* Verification Status Button - Show current status on own profile */}
                        {safeUser.isArtist && verificationData.status !== 'not-requested' && (
                          <Button 
                            variant="outline" 
                            onClick={() => setShowVerificationModal(true)} 
                            size="sm"
                            className="border-2"
                          >
                            {verificationData.status === 'approved' ? 'Verified' : 
                             verificationData.status === 'pending' ? 'Pending' : 
                             'Verification'}
                          </Button>
                        )}
                      </>
                    ) : (
                      // Follow/Unfollow and Message buttons for public profiles
                      <>
                        {onFollowToggle && (
                          <Button 
                            variant={isFollowing ? "outline" : "default"}
                            onClick={() => onFollowToggle(safeUser)}
                            size="sm"
                            className={isFollowing ? "border-2" : "bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral"}
                          >
                            {isFollowing ? (
                              <>
                                <UserMinus className="w-4 h-4 mr-2" />
                                Unfollow
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}
                        
                        {/* Message Button */}
                        <Button 
                          variant="outline" 
                          onClick={() => setShowMessageModal(true)}
                          size="sm"
                          className="border-2"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        
                        {/* Block/Unblock Button */}
                        {onBlockUser && onUnblockUser && isBlocked && (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              if (isBlocked(safeUser.id)) {
                                onUnblockUser(safeUser.id);
                              } else {
                                onBlockUser(safeUser.id);
                              }
                            }}
                            size="sm"
                            className={isBlocked(safeUser.id) ? "border-2 border-accent-coral text-accent-coral" : "border-2"}
                          >
                            {isBlocked(safeUser.id) ? (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Unblock
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Block
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Secondary Action Row - Only show for own profile */}
                  {isOwnProfile && (
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="ghost" 
                        onClick={shareProfile} 
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        onClick={downloadProfileData} 
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progression Overview - Only for fans (artists don't have XP/points) */}
        {userProgression && safeUser.userType !== 'artist' && (
          <div className="mb-8">
            <ProgressBar
              totalXP={userProgression.totalXP || 0}
              level={userProgression.level || 1}
              currentLevelXP={calculateLevel(userProgression.totalXP || 0).currentLevelXP}
              nextLevelXP={calculateLevel(userProgression.totalXP || 0).nextLevelXP}
              progress={calculateLevel(userProgression.totalXP || 0).progress}
              badge={userProgression.currentBadge || 'Bronze Note'}
              size="lg"
              className="bg-gradient-to-r from-accent-coral/10 to-accent-mint/10 border-accent-coral/20"
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Activity - Always visible */}
            <Button
              variant={activeTab === 'activity' ? 'default' : 'outline'}
              onClick={() => setActiveTab('activity')}
              size="sm"
              className={activeTab === 'activity' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </Button>
            
            {/* Following - Own profile only */}
            {isOwnProfile && (
              <Button
                variant={activeTab === 'following' ? 'default' : 'outline'}
                onClick={() => setActiveTab('following')}
                size="sm"
                className={activeTab === 'following' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
              >
                <Users className="w-4 h-4 mr-2" />
                Following
              </Button>
            )}
            
            {/* Blocked - Own profile only */}
            {isOwnProfile && (
              <Button
                variant={activeTab === 'blocked' ? 'default' : 'outline'}
                onClick={() => setActiveTab('blocked')}
                size="sm"
                className={activeTab === 'blocked' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
              >
                <Ban className="w-4 h-4 mr-2" />
                Blocked
              </Button>
            )}
            
            {/* Crates - Always visible */}
            <Button
              variant={activeTab === 'crates' ? 'default' : 'outline'}
              onClick={() => setActiveTab('crates')}
              size="sm"
              className={activeTab === 'crates' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
            >
              <Package className="w-4 h-4 mr-2" />
              Crates
            </Button>
            
            {/* Rooms - Always visible */}
            <Button
              variant={activeTab === 'rooms' ? 'default' : 'outline'}
              onClick={() => setActiveTab('rooms')}
              size="sm"
              className={activeTab === 'rooms' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
            >
              <DoorOpen className="w-4 h-4 mr-2" />
              Rooms
            </Button>
            
            {/* Posts - Always visible for public profiles */}
            <Button
              variant={activeTab === 'posts' ? 'default' : 'outline'}
              onClick={() => setActiveTab('posts')}
              size="sm"
              className={activeTab === 'posts' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Posts
            </Button>
            
            {/* Comments - Always visible for public profiles */}
            <Button
              variant={activeTab === 'comments' ? 'default' : 'outline'}
              onClick={() => setActiveTab('comments')}
              size="sm"
              className={activeTab === 'comments' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Comments
            </Button>
            
            {/* Customize - Artists on own profile only */}
            {isOwnProfile && safeUser.isArtist && (
              <Button
                variant={activeTab === 'customize' ? 'default' : 'outline'}
                onClick={() => setActiveTab('customize')}
                size="sm"
                className={activeTab === 'customize' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Customize
              </Button>
            )}
            
            {/* Progression - Fans on own profile only */}
            {isOwnProfile && safeUser.userType !== 'artist' && (
              <Button
                variant={activeTab === 'progression' ? 'default' : 'outline'}
                onClick={() => setActiveTab('progression')}
                size="sm"
                className={activeTab === 'progression' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
              >
                <Award className="w-4 h-4 mr-2" />
                Progress
              </Button>
            )}
            
            {/* Credits - Fans on own profile only */}
            {isOwnProfile && safeUser.userType !== 'artist' && (
              <Button
                variant={activeTab === 'credits' ? 'default' : 'outline'}
                onClick={() => setActiveTab('credits')}
                size="sm"
                className={activeTab === 'credits' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
              >
                <Coins className="w-4 h-4 mr-2" />
                Credits
              </Button>
            )}

            {/* Settings - Own profile only */}
            {isOwnProfile && (
              <Button
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                onClick={() => setActiveTab('settings')}
                size="sm"
                className={activeTab === 'settings' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}

            {/* Followers - Public profile only */}
            {!isOwnProfile && (
              <Button
                variant={activeTab === 'followers' ? 'default' : 'outline'}
                onClick={() => setActiveTab('followers')}
                size="sm"
                className={activeTab === 'followers' ? 'bg-accent-coral hover:bg-accent-coral/90 text-background border-2 border-accent-coral' : 'border-2'}
              >
                <Users className="w-4 h-4 mr-2" />
                Followers
              </Button>
            )}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'activity' && (
          <div className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Profile Analytics - Only for artists on own profile */}
              {isOwnProfile && safeUser.isArtist && (
                <div className="border-2 border-foreground/10 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-accent-coral" />
                      <h3 className="text-lg font-medium">Profile Analytics</h3>
                    </div>
                    <Badge variant="outline" className="border-accent-coral/50 text-accent-coral">
                      Last 30 days
                    </Badge>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-foreground/10 bg-accent-coral/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-accent-coral" />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Views</span>
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {MOCK_PROFILE_ANALYTICS.totalViews.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="p-4 border border-foreground/10 bg-accent-mint/5">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-accent-mint" />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">This Week</span>
                      </div>
                      <div className="text-2xl font-semibold text-foreground">
                        {MOCK_PROFILE_ANALYTICS.viewsThisWeek}
                      </div>
                    </div>
                    
                    <div className="p-4 border border-foreground/10 bg-accent-blue/5 col-span-2 md:col-span-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-accent-blue" />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">Growth</span>
                      </div>
                      <div className="text-2xl font-semibold text-accent-mint">
                        +{MOCK_PROFILE_ANALYTICS.viewGrowth}%
                      </div>
                    </div>
                  </div>

                  {/* Traffic Sources */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-medium">Where your profile views came from</h4>
                    </div>
                    <div className="space-y-3">
                      {MOCK_PROFILE_ANALYTICS.trafficSources.map((source) => (
                        <div key={source.source} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 ${source.color} rounded-full`}></div>
                              <span className="font-medium">{source.source}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">{source.views.toLocaleString()} views</span>
                              <span className="font-medium min-w-[3rem] text-right">{source.percentage}%</span>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-foreground/5 h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${source.color}`}
                              style={{ width: `${source.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Viewer Demographics */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-medium">Who's viewing your profile</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {MOCK_PROFILE_ANALYTICS.topViewers.map((viewer) => (
                        <div key={viewer.type} className="p-4 border border-foreground/10">
                          <div className="text-lg font-semibold text-foreground mb-1">
                            {viewer.count.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                            {viewer.type}
                          </div>
                          <div className="text-sm font-medium text-accent-coral">
                            {viewer.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action */}
                  <div className="pt-2 border-t border-foreground/10">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={() => toast.info('Full analytics coming soon')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View detailed analytics
                    </Button>
                  </div>
                </div>
              )}

              {/* Minimal Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">{userPoints.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">{MOCK_STATS[1].value}</div>
                  <div className="text-sm text-muted-foreground">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">{MOCK_STATS[2].value}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-foreground">{MOCK_STATS[0].value}</div>
                  <div className="text-sm text-muted-foreground">Tracks</div>
                </div>
              </div>

              {/* Top Genres */}
              {topGenres.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Top Genres</h3>
                  <div className="space-y-2">
                    {topGenres.map((genre, index) => (
                      <div key={genre} className="flex items-center justify-between py-2 border-b border-foreground/10 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-muted-foreground w-6">#{index + 1}</span>
                          <span className="font-medium">{genre}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full"></div>
                    <span className="text-sm">Joined sedā.fm community</span>
                    <span className="text-xs text-muted-foreground ml-auto">{joinDate}</span>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-2 h-2 bg-foreground/40 rounded-full"></div>
                    <span className="text-sm">Created profile</span>
                    <span className="text-xs text-muted-foreground ml-auto">{joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Following Tab - Only for own profile */}
          {isOwnProfile && activeTab === 'following' && (
            <div className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Following</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // This would typically open a follow suggestions view
                      toast.success('Find more artists in Discover');
                    }}
                  >
                    Find More
                  </Button>
                </div>
                
                {/* Following Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 border border-foreground/10 rounded-lg">
                    <div className="text-2xl font-semibold text-foreground">{(safeUser.following || []).length}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center p-4 border border-foreground/10 rounded-lg">
                    <div className="text-2xl font-semibold text-foreground">{(safeUser.followers || []).length}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                </div>

                {/* Following List */}
                {safeUser.following && safeUser.following.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-3">Artists & Fans You Follow</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {safeUser.following.map((following) => {
                        // Handle both string IDs and user objects
                        const followingId = typeof following === 'string' ? following : (following?.id || following?.username || 'Unknown');
                        const displayName = typeof following === 'string' ? following : (following?.displayName || following?.username || 'Unknown User');
                        const firstChar = typeof followingId === 'string' && followingId.length > 0 ? followingId.charAt(0).toUpperCase() : 'U';
                        
                        return (
                          <div key={followingId} className="flex items-center gap-3 p-3 border border-foreground/10 rounded-lg hover:border-foreground/20 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{displayName}</p>
                              <p className="text-sm text-muted-foreground">Music enthusiast</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="text-xs">
                                View
                              </Button>
                              {onFollowUser && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs text-muted-foreground hover:text-destructive"
                                  onClick={() => {
                                    // Handle unfollow
                                    if (typeof onFollowUser === 'function') {
                                      onFollowUser(followingId, false);
                                    }
                                  }}
                                >
                                  Unfollow
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded border border-foreground/10 flex items-center justify-center">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <p className="mb-2">Not following anyone yet</p>
                    <p className="text-sm">Discover and follow artists and fans to see their latest updates</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        // This would typically navigate to discover
                        toast.success('Check out the Discover tab to find artists');
                      }}
                    >
                      Find Artists to Follow
                    </Button>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-lg">
                    <h4 className="font-medium text-accent-coral mb-2">Start a DJ Session</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Share your music taste with your followers in real-time
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full bg-accent-coral hover:bg-accent-coral/90 text-background"
                      onClick={() => {
                        // This would navigate to sessions view
                        if (typeof onViewChange === 'function') {
                          toast.success('Starting DJ session...');
                        }
                      }}
                    >
                      Start DJ Session
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-accent-mint/10 border border-accent-mint/20 rounded-lg">
                    <h4 className="font-medium text-accent-mint mb-2">Discover New Music</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Find emerging artists and underground tracks
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full border-accent-mint/40 hover:bg-accent-mint/10"
                      onClick={() => {
                        // This would navigate to discover
                        if (typeof onViewChange === 'function') {
                          toast.success('Exploring discover...');
                        }
                      }}
                    >
                      Explore Discover
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progression Tab - Only for own profile */}
          {isOwnProfile && activeTab === 'progression' && (
            <div className="space-y-6 mt-6">
              {progressionLoading ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading progression data...</div>
                </div>
              ) : userProgression ? (
                <>
                  {/* Current Level Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-lg text-center">
                      <div className="text-2xl font-black text-accent-coral">
                        {userProgression.level}
                      </div>
                      <div className="text-sm text-muted-foreground">Current Level</div>
                      <div className="text-xs text-accent-coral mt-1">{userProgression.currentBadge}</div>
                    </div>
                    
                    <div className="p-4 bg-accent-mint/10 border border-accent-mint/20 rounded-lg text-center">
                      <div className="text-2xl font-black text-accent-mint">
                        {formatXP(userProgression.totalXP || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total XP</div>
                      <div className="text-xs text-accent-mint mt-1">Combined Progress</div>
                    </div>
                    
                    <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-center">
                      <div className="text-2xl font-black text-accent-blue">
                        {userProgression.creditsBalance || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Credits Available</div>
                      <div className="text-xs text-accent-blue mt-1">For Premium Upgrades</div>
                    </div>
                  </div>

                  {/* XP Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Music className="w-4 h-4 text-accent-coral" />
                        <h4 className="font-medium">DJ Progression</h4>
                      </div>
                      <div className="text-2xl font-bold text-accent-coral mb-1">
                        {formatXP(userProgression.djPoints || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Earned from public DJ sessions, audience votes, and track plays
                      </p>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-accent-mint" />
                        <h4 className="font-medium">Fan Support</h4>
                      </div>
                      <div className="text-2xl font-bold text-accent-mint mb-1">
                        {formatXP(userProgression.fanSupportXP || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Earned from supporting artists through tips, purchases, and engagement
                      </p>
                    </div>
                  </div>

                  {/* Badges Collection */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Badges Earned
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(userProgression.badges || []).length > 0 ? (
                        (userProgression.badges || []).map((badge, index) => (
                          <Badge 
                            key={badge}
                            variant="outline" 
                            className="px-3 py-1"
                          >
                            {badge}
                          </Badge>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground py-2">
                          No badges earned yet. Keep engaging to unlock your first badge!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Demo Actions for Testing */}
                  {isOwnProfile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-accent-coral/10 border border-accent-coral/20 rounded-lg">
                        <h4 className="font-medium text-accent-coral mb-3">Test DJ Session</h4>
                        <div className="space-y-2">
                          <Button
                            onClick={() => {
                              progressionService.simulateDJSession(safeUser.id, true);
                              handleProgressionUpdate();
                            }}
                            size="sm"
                            className="w-full bg-accent-coral hover:bg-accent-coral/90 text-background"
                          >
                            Simulate Public DJ Session
                          </Button>
                          <Button
                            onClick={() => {
                              progressionService.simulateDJSession(safeUser.id, false);
                              handleProgressionUpdate();
                            }}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            Try Private Session (No XP)
                          </Button>
                        </div>
                      </div>
                      
                      <FanSupportActions
                        userId={safeUser.id}
                        artistName="Demo Artist"
                        onXPUpdate={handleProgressionUpdate}
                        className="h-fit"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Unable to load progression data</div>
                  <p className="text-sm text-muted-foreground mt-2">Please refresh the page to try again</p>
                </div>
              )}
            </div>
          )}

          {/* Credits Wallet Tab - Only for own profile */}
          {isOwnProfile && activeTab === 'credits' && (
            <div className="space-y-6 mt-6">
              {progressionLoading ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading credits data...</div>
                </div>
              ) : userProgression ? (
                <>
                  <CreditsWallet
                    userId={safeUser.id}
                    creditsBalance={userProgression.creditsBalance || 0}
                    creditsEarned={userProgression.creditsEarned || 0}
                    seasonCredits={userProgression.seasonCredits || 0}
                    onCreditsUpdate={handleProgressionUpdate}
                  />

                  {/* Credits History */}
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-medium mb-4">Credits Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Earned:</span>
                        <span className="font-medium">{userProgression.creditsEarned || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Spent:</span>
                        <span className="font-medium">{userProgression.creditsSpent || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Season Credits:</span>
                        <span className="font-medium">{userProgression.seasonCredits || 0}/125</span>
                      </div>
                    </div>
                  </div>

                  {/* Premium Info */}
                  <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Coins className="w-4 h-4 text-accent-yellow mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-accent-yellow mb-1">
                          Credits & Rewards
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          <li>• Credits can be used to support artists</li>
                          <li>• Earn credits through platform engagement</li>
                          <li>• Seasonal cap of 125 credits per season</li>
                          <li>• No cash value</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Unable to load credits data</div>
                  <p className="text-sm text-muted-foreground mt-2">Please refresh the page to try again</p>
                </div>
              )}
            </div>
          )}

          {/* Blocked Users Tab - Only for own profile */}
          {isOwnProfile && getBlockedUsers && activeTab === 'blocked' && (
            <div className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Blocked Users</h3>
                  <Badge variant="outline" className="bg-muted">
                    {getBlockedUsers().length}
                  </Badge>
                </div>

                {getBlockedUsers().length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-foreground/10 rounded-lg">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">No blocked users</p>
                    <p className="text-sm text-muted-foreground">
                      Users you block will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getBlockedUsers().map((blockedUser) => (
                      <div
                        key={blockedUser.id}
                        className="flex items-center justify-between p-4 border border-foreground/10 rounded-lg bg-muted/30"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {blockedUser.displayName || blockedUser.username}
                            </p>
                            {blockedUser.verified && (
                              <Badge className="bg-accent-blue text-background border-0 px-1.5 py-0 text-xs flex-shrink-0">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            @{blockedUser.username}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUnblockUser && onUnblockUser(blockedUser.id)}
                          className="flex-shrink-0 border-accent-coral text-accent-coral hover:bg-accent-coral hover:text-background"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Unblock
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Information about blocking */}
                <div className="p-4 bg-muted border border-foreground/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Ban className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">About blocking</p>
                      <ul className="text-xs space-y-1">
                        <li>• Blocked users won't see your posts in their feed</li>
                        <li>• You won't see their posts or activity</li>
                        <li>• They won't be able to message you</li>
                        <li>• Blocking is private - they won't be notified</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab - Own profile only */}
          {isOwnProfile && activeTab === 'settings' && (
            <div className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-accent-coral" />
                  <h3 className="text-lg font-medium">Settings</h3>
                </div>

                {/* Streaming Connections Section */}
                <div className="border border-foreground/10 rounded-lg p-6">
                  <StreamingConnections apiBaseUrl={import.meta.env.VITE_API_URL || '/api'} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-medium">Platform Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_STATS.map((stat) => (
                  <div key={stat.label} className="p-4 border border-foreground/10 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-semibold mt-1">{stat.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Additional Stats */}
              <div>
                <h4 className="text-base font-medium mb-3">Engagement</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-foreground/10">
                    <span className="text-muted-foreground">Average session length</span>
                    <span>45 min</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-foreground/10">
                    <span className="text-muted-foreground">Most active genre</span>
                    <span>{topGenres[0] || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Profile views this month</span>
                    <span>23</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crates' && (
            <div className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {isOwnProfile ? 'Your Crates' : `${safeUser.displayName || safeUser.username}'s Crates`}
                </h3>
                {isOwnProfile && (
                  <Button variant="outline" size="sm">Create Crate</Button>
                )}
              </div>
              
              {/* Show public crates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCrates
                  .filter(crate => isOwnProfile || crate.isPublic)
                  .map((crate) => (
                    <motion.div
                      key={crate.id}
                      className="border border-foreground/10 rounded-lg p-4 hover:border-foreground/20 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-muted rounded border border-foreground/10 overflow-hidden flex-shrink-0">
                          <img
                            src={crate.coverImage || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'}
                            alt={crate.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">{crate.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {crate.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{crate._count?.items || 0} tracks</span>
                            <span>•</span>
                            <span>{crate.isPublic ? 'Public' : 'Private'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>

              {userCrates.filter(crate => isOwnProfile || crate.isPublic).length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded border border-foreground/10 flex items-center justify-center">
                    <Music className="w-6 h-6" />
                  </div>
                  <p className="mb-2">
                    {isOwnProfile ? 'No crates created yet' : 'No public crates to show'}
                  </p>
                  <p className="text-sm">
                    {isOwnProfile ? 'Start curating your music collections' : 'This user hasn\'t shared any public crates yet'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {isOwnProfile ? 'Joined Rooms' : 'Rooms'}
                </h3>
              </div>
              
              {/* Show joined rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    className="border border-foreground/10 rounded-lg p-4 hover:border-foreground/20 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${room.isActive ? 'bg-accent-mint' : 'bg-muted-foreground'}`}></div>
                        <div>
                          <h4 className="font-medium text-foreground">{room.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {room._count?.memberships || 0} members
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {room.isActive ? 'Active' : 'Quiet'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {userRooms.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded border border-foreground/10 flex items-center justify-center">
                    <Radio className="w-6 h-6" />
                  </div>
                  <p className="mb-2">
                    {isOwnProfile ? 'No rooms joined yet' : 'No rooms to show'}
                  </p>
                  <p className="text-sm">
                    {isOwnProfile ? 'Join some rooms to connect with the community' : 'This user hasn\'t joined any public rooms'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-medium">Post History</h3>
              <div className="space-y-4">
                {createMockPosts(safeUser).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-foreground/10 rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-black border-2"
                        style={{
                          backgroundColor: `var(--color-accent-${safeUser.accentColor || 'coral'})`,
                          borderColor: `var(--color-accent-${safeUser.accentColor || 'coral'})`
                        }}
                      >
                        {(safeUser.displayName || safeUser.username)[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black">{safeUser.displayName || safeUser.username}</span>
                          {safeUser.verified && <CheckCircle className="w-4 h-4 text-accent-blue" />}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">@{safeUser.username} • {formatTimestamp(post.timestamp)}</p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-foreground mb-3">{post.content}</p>

                    {/* Track Preview */}
                    {post.track && (
                      <div className="border border-foreground/10 rounded-lg p-3 mb-3 flex items-center gap-3">
                        <img
                          src={post.track.artwork}
                          alt={post.track.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-black text-sm">{post.track.title}</p>
                          <p className="text-xs text-muted-foreground">{post.track.artist} • {post.track.duration}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="hover:bg-accent-coral/10">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Post Stats */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground pt-3 border-t border-foreground/10">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Repeat className="w-4 h-4" />
                        <span>{post.reposts}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6 mt-6">
              <h3 className="text-lg font-medium">Comment History</h3>
              <div className="space-y-4">
                {createMockCommentHistory(safeUser).map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-foreground/10 rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Original Post Context */}
                    <div className="bg-muted/30 rounded-lg p-3 mb-3 border-l-4 border-accent-blue">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border"
                          style={{
                            backgroundColor: `var(--color-accent-${comment.postContext.author.accentColor})`,
                            borderColor: `var(--color-accent-${comment.postContext.author.accentColor})`
                          }}
                        >
                          {comment.postContext.author.displayName[0]}
                        </div>
                        <span className="font-black text-sm">{comment.postContext.author.displayName}</span>
                        <span className="text-xs text-muted-foreground">posted:</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{comment.postContext.content}</p>
                    </div>

                    {/* Comment */}
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2"
                        style={{
                          backgroundColor: `var(--color-accent-${safeUser.accentColor || 'coral'})`,
                          borderColor: `var(--color-accent-${safeUser.accentColor || 'coral'})`
                        }}
                      >
                        {(safeUser.displayName || safeUser.username)[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-sm">{safeUser.displayName || safeUser.username}</span>
                          {safeUser.verified && <CheckCircle className="w-3 h-3 text-accent-blue" />}
                          <span className="text-xs text-muted-foreground">• {formatTimestamp(comment.timestamp)}</span>
                        </div>
                        <p className="text-foreground">{comment.content}</p>
                        
                        {/* Comment Stats */}
                        <div className="flex items-center gap-4 mt-2">
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent-coral transition-colors">
                            <Heart className="w-3 h-3" />
                            <span>{comment.likes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Customize Tab - Only for artists on own profile */}
          {isOwnProfile && safeUser.isArtist && activeTab === 'customize' && (
            <div className="space-y-6 mt-6">
              <ArtistProfileCustomization user={user} onUpdateUser={onUpdateUser} />
            </div>
          )}

          {!isOwnProfile && activeTab === 'followers' && (
            <div className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Followers & Following
                  </h3>
                </div>
                
                {/* Followers and Following Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 border border-foreground/10 rounded-lg">
                    <div className="text-2xl font-semibold text-foreground">{(safeUser.followers || []).length}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center p-4 border border-foreground/10 rounded-lg">
                    <div className="text-2xl font-semibold text-foreground">{(safeUser.following || []).length}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                </div>

                {/* Followers List */}
                {safeUser.followers && safeUser.followers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Recent Followers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {safeUser.followers.slice(0, 6).map((follower) => {
                        // Handle both string IDs and user objects
                        const followerId = typeof follower === 'string' ? follower : (follower?.id || follower?.username || 'Unknown');
                        const displayName = typeof follower === 'string' ? follower : (follower?.displayName || follower?.username || 'Unknown User');
                        const firstChar = typeof followerId === 'string' && followerId.length > 0 ? followerId.charAt(0).toUpperCase() : 'U';
                        
                        return (
                          <div key={followerId} className="flex items-center gap-3 p-3 border border-foreground/10 rounded-lg">
                            <div className="w-10 h-10 bg-secondary border border-foreground/10 flex items-center justify-center font-medium">
                              {firstChar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{displayName}</p>
                              <p className="text-sm text-muted-foreground">Music enthusiast</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {safeUser.followers.length > 6 && (
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          View All {safeUser.followers.length} Followers
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Following List */}
                {safeUser.following && safeUser.following.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Following</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {safeUser.following.slice(0, 6).map((following) => {
                        // Handle both string IDs and user objects
                        const followingId = typeof following === 'string' ? following : (following?.id || following?.username || 'Unknown');
                        const displayName = typeof following === 'string' ? following : (following?.displayName || following?.username || 'Unknown User');
                        const firstChar = typeof followingId === 'string' && followingId.length > 0 ? followingId.charAt(0).toUpperCase() : 'U';
                        
                        return (
                          <div key={followingId} className="flex items-center gap-3 p-3 border border-foreground/10 rounded-lg">
                            <div className="w-10 h-10 bg-secondary border border-foreground/10 flex items-center justify-center font-medium">
                              {firstChar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">{displayName}</p>
                              <p className="text-sm text-muted-foreground">Music enthusiast</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {safeUser.following.length > 6 && (
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          View All {safeUser.following.length} Following
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state */}
                {(!safeUser.followers || safeUser.followers.length === 0) && (!safeUser.following || safeUser.following.length === 0) && (
                  <div className="text-center text-muted-foreground py-12">
                    <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded border border-foreground/10 flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="mb-2">No followers or following yet</p>
                    <p className="text-sm">This user is just getting started</p>
                  </div>
                )}
              </div>
            </div>
          )}
        
        {/* Verification Request Modal */}
        <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
          <DialogContent className="max-w-xl border border-foreground/10" aria-describedby="artist-verification-description">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">
                Artist Verification
              </DialogTitle>
              <DialogDescription id="artist-verification-description" className="text-sm text-muted-foreground">
                Prove ownership of your public presence
              </DialogDescription>
            </DialogHeader>
            
            {verificationData.status === 'not-requested' ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Process</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex gap-3">
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">01</span>
                        <span>Generate unique claim code</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">02</span>
                        <span>Place code on platform you control</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded font-mono">03</span>
                        <span>Submit URL for verification</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Supported Platforms</h3>
                    <p className="text-xs text-muted-foreground">
                      Bandcamp, personal website, SoundCloud, social media, newsletter
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={handleRequestVerification}
                    className="flex-1 h-11"
                  >
                    Generate Claim Code
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowVerificationModal(false)}
                    className="px-4"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {verificationData.claimCode && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Claim Code</h3>
                    <div className="bg-secondary/50 border border-foreground/10 rounded-lg p-4">
                      <code className="text-base font-mono text-foreground tracking-wider">
                        {verificationData.claimCode}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add this code to your bio, about section, or any public text on your platform
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label htmlFor="verificationUrl" className="text-sm font-medium">
                    Platform URL
                  </Label>
                  <Input
                    id="verificationUrl"
                    value={verificationData.targetUrl}
                    onChange={(e) => setVerificationData(prev => ({ 
                      ...prev, 
                      targetUrl: e.target.value 
                    }))}
                    placeholder="https://artist.bandcamp.com"
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="platform" className="text-sm font-medium">
                    Platform Type
                  </Label>
                  <select
                    id="platform"
                    value={verificationData.platform}
                    onChange={(e) => setVerificationData(prev => ({ 
                      ...prev, 
                      platform: e.target.value 
                    }))}
                    className="w-full h-11 px-3 border border-foreground/20 rounded-md bg-background text-sm"
                  >
                    <option value="bandcamp">Bandcamp</option>
                    <option value="website">Personal Website</option>
                    <option value="soundcloud">SoundCloud</option>
                    <option value="social">Social Media</option>
                    <option value="newsletter">Newsletter/Blog</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {verificationData.status === 'pending' && (
                  <div className="p-4 bg-muted/50 border border-foreground/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-foreground/60 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Review in progress</span>
                    </div>
                  </div>
                )}
                
                {verificationData.status === 'approved' && (
                  <div className="p-4 bg-muted/50 border border-foreground/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-foreground rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-background rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">Verification complete</span>
                    </div>
                  </div>
                )}
                
                {verificationData.status === 'denied' && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-destructive">Could not verify code</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setVerificationData(prev => ({ 
                          ...prev, 
                          status: 'not-requested',
                          claimCode: '',
                          targetUrl: ''
                        }))}
                        className="text-xs h-7"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-2">
                  {verificationData.status === 'pending' && verificationData.claimCode && (
                    <Button 
                      onClick={handleVerificationSubmit}
                      disabled={!verificationData.targetUrl.trim()}
                      className="flex-1 h-11 disabled:opacity-50"
                    >
                      Submit for Review
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setShowVerificationModal(false)}
                    className={verificationData.status === 'pending' && verificationData.claimCode ? "px-4" : "flex-1"}
                  >
                    {verificationData.status === 'approved' ? 'Close' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Message Modal for Public Profiles */}
        {!isOwnProfile && (
          <FanMessageModal
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            fan={safeUser}
            currentUser={viewingUser}
            onSendMessage={onSendMessage}
            onFollowUser={onFollowUser}
            isFollowing={isFollowingUser}
          />
        )}

        {/* XP Notification System - Only for fans (artists don't have XP/points) */}
        <XPNotificationSystem 
          userId={safeUser.id} 
          enabled={isOwnProfile && safeUser.userType !== 'artist'} 
        />
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ UserProfile render error:', error);
    
    // Simple fallback profile if there's an error
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-secondary border border-foreground/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-foreground font-medium text-xl">{safeUser.username[0]?.toUpperCase() || 'U'}</span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {safeUser.displayName || safeUser.username}
            </h1>
            <p className="text-muted-foreground">@{safeUser.username}</p>
            <p className="text-foreground mt-4 leading-relaxed">
              {safeUser.bio || 'Music enthusiast exploring the underground scene'}
            </p>
          </div>
          
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Profile features are temporarily unavailable</p>
            <p className="text-xs mt-1">Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }
}
