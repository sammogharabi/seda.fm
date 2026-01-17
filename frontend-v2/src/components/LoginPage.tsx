import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Toaster } from './ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { profilesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  Music,
  Mail,
  Users,
  Mic,
  Headphones,
  Star,
  ArrowLeft,
  Volume2,
  Radio,
  Crown,
  Zap,
  Globe,
  Heart,
  Eye,
  EyeOff,
  Lock,
  UserPlus
} from 'lucide-react';
import { VerifyEmailPage } from './VerifyEmailPage';
import { http } from '@/lib/api/http';

const GENRES = [
  'Hip Hop', 'Electronic', 'Rock', 'Pop', 'Jazz', 'Classical', 
  'R&B', 'Country', 'Indie', 'Ambient', 'House', 'Techno',
  'Folk', 'Reggae', 'Punk', 'Soul', 'Funk', 'Blues'
];

const BACKSTAGE_PASSES = [
  { title: 'ARTIST ACCESS', color: 'accent-coral', icon: Star, desc: 'Create • Monetize • Connect' },
  { title: 'FAN PASS', color: 'accent-blue', icon: Users, desc: 'Discover • Support • Vibe' },
  { title: 'DJ BOOTH', color: 'accent-mint', icon: Radio, desc: 'Mix • Stream • Lead' },
  { title: 'COLLECTOR', color: 'accent-yellow', icon: Crown, desc: 'Curate • Archive • Share' }
];

interface LoginPageProps {
  onLogin: (user: any) => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const { signIn, signUp } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // login, signup, username, genres, rooms, welcome, artist-room, verify-email
  const [userType, setUserType] = useState<'fan' | 'artist'>('fan');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const usernameCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    selectedGenres: [],
    selectedRooms: [],
    bio: '',
    artistName: '',
    artistRoom: null, // { id, name, isNew, isClaimed }
    pinnedTrack: null, // { title, artist, url, platform }
    trackUrl: '',
    inviteEmails: []
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  // Suggested rooms for quick onboarding
  const suggestedRooms = [
    { id: 'hiphop', name: 'Hip Hop Central', members: 1247, isActive: true, description: 'Latest drops and classics' },
    { id: 'electronic', name: 'Electronic Underground', members: 892, isActive: true, description: 'House, techno, and experimental' },
    { id: 'indie', name: 'Indie Discoveries', members: 634, isActive: true, description: 'Hidden gems and new artists' },
    { id: 'jazz', name: 'Jazz Lounge', members: 445, isActive: true, description: 'Classic and contemporary jazz' },
    { id: 'rock', name: 'Rock Archives', members: 756, isActive: false, description: 'From classic to modern rock' },
    { id: 'rnb', name: 'R&B Soul', members: 523, isActive: true, description: 'Smooth vibes and soulful sounds' }
  ];

  // Mock existing artist profiles for claiming
  const existingArtistProfiles = [
    { id: 'daft-punk', name: 'Daft Punk', verified: true, followers: 2500000, claimed: false },
    { id: 'disclosure', name: 'Disclosure', verified: true, followers: 1200000, claimed: false },
    { id: 'kaytranada', name: 'KAYTRANADA', verified: true, followers: 850000, claimed: false },
    { id: 'flume', name: 'Flume', verified: true, followers: 1800000, claimed: true },
    { id: 'odesza', name: 'ODESZA', verified: true, followers: 950000, claimed: false },
    { id: 'porter-robinson', name: 'Porter Robinson', verified: true, followers: 750000, claimed: false }
  ];

  const clearErrors = () => {
    setErrors({});
    setApiError('');
  };

  // Debounced username availability check
  const checkUsernameAvailability = async (username: string) => {
    // Only check if username meets basic requirements
    if (!username || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username) || /^[0-9_]+$/.test(username)) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);

    try {
      // Call the real API endpoint
      const response = await profilesApi.checkUsername(username);
      setUsernameAvailable(response.available);
    } catch (error) {
      console.error('Error checking username:', error);
      // On error, assume available (fail open) to not block signup
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Effect to check username availability with debouncing
  useEffect(() => {
    if (authMode !== 'signup' || !formData.username) {
      setUsernameAvailable(null);
      return;
    }

    // Clear previous timeout
    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current);
    }

    // Set new timeout for debounced check
    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(formData.username);
    }, 600); // 600ms debounce

    return () => {
      if (usernameCheckTimeout.current) {
        clearTimeout(usernameCheckTimeout.current);
      }
    };
  }, [formData.username, authMode]);

  const validateForm = () => {
    const newErrors = {};
    setApiError('');

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Signup-specific validation
    if (authMode === 'signup') {
      // Username validation
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (formData.username.length > 20) {
        newErrors.username = 'Username must be less than 20 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      } else if (/^[0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username must contain at least one letter';
      } else if (['admin', 'support', 'help', 'api', 'www', 'mail', 'root', 'test', 'demo'].includes(formData.username.toLowerCase())) {
        newErrors.username = 'This username is not available';
      } else if (usernameAvailable === false) {
        newErrors.username = 'This username is already taken';
      } else if (isCheckingUsername) {
        newErrors.username = 'Checking username availability...';
      }

      // Password confirmation validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return false;
    }

    return true;
  };

  const validateUsername = () => {
    const newErrors = {};
    setApiError('');

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else if (/^[0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username must contain at least one letter';
    } else if (['admin', 'support', 'help', 'api', 'www', 'mail', 'root', 'test', 'demo'].includes(formData.username.toLowerCase())) {
      newErrors.username = 'This username is not available';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return false;
    }

    return true;
  };

  const simulateApiError = () => {
    // Error simulation disabled for stable demo experience
    // In production, real API errors would be handled by the actual authentication service
    return;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    clearErrors();

    try {
      if (authMode === 'login') {
        // Real Supabase login
        const { user, error } = await signIn(formData.email, formData.password);

        if (error) {
          throw error;
        }

        if (user) {
          // Create user object for onLogin callback
          const loginUser = {
            id: user.id,
            username: user.user_metadata?.username || formData.email.split('@')[0],
            displayName: user.user_metadata?.username || formData.email.split('@')[0],
            email: formData.email,
            verified: user.email_confirmed_at != null,
            points: 0,
            accentColor: 'coral',
            bio: 'sedā.fm user',
            location: '',
            joinedDate: new Date(user.created_at),
            genres: [],
            connectedServices: ['Email'],
            isArtist: user.user_metadata?.userType === 'artist',
            website: ''
          };

          toast.success('Welcome back to sedā.fm!');
          onLogin(loginUser);
        }
      } else {
        // Real Supabase signup
        const { user, error } = await signUp(
          formData.email,
          formData.password,
          {
            username: formData.username,
            userType: userType
          }
        );

        if (error) {
          throw error;
        }

        // After signup, redirect to email verification page
        clearErrors();
        setPendingUserId(user?.id || null);
        toast.success('Account created! Please verify your email to continue.');
        setAuthMode('verify-email');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error) => {
    const errorMessage = error.message || error.toString();

    console.log('Authentication error:', errorMessage);

    // Check for duplicate email errors
    if (errorMessage.includes('User already registered') ||
        errorMessage.includes('email already exists') ||
        errorMessage.includes('duplicate key value violates unique constraint') && errorMessage.includes('email')) {
      setErrors({ email: 'An account with this email already exists' });
      setApiError('An account with this email already exists. Try logging in instead.');
      toast.error('Email already registered. Try logging in instead.');
      return;
    }

    // Check for duplicate username errors (from profile creation)
    if (errorMessage.includes('Username already taken') ||
        errorMessage.includes('username') && errorMessage.includes('already exists') ||
        errorMessage.includes('duplicate key value violates unique constraint') && errorMessage.includes('username')) {
      setErrors({ username: 'This username is already taken' });
      setApiError('This username is already taken. Please try a different one.');
      toast.error('Username is already taken. Try another one.');
      return;
    }

    // Check for authentication failures
    if (errorMessage.includes('Authentication failed')) {
      setApiError('Unable to create account. The username or email may already be in use.');
      toast.error('Unable to create account. Please check your username and email.');
      return;
    }

    switch (errorMessage) {
      case 'NETWORK_ERROR':
        setApiError('Connection failed. Please check your internet connection and try again.');
        toast.error('Connection failed. Please check your internet connection.');
        break;

      case 'SERVER_ERROR':
        setApiError('Our servers are currently experiencing issues. Please try again in a few minutes.');
        toast.error('Server error. Please try again in a few minutes.');
        break;

      case 'RATE_LIMITED':
        setApiError('Too many attempts. Please wait a few minutes before trying again.');
        toast.error('Too many attempts. Please wait before trying again.');
        break;

      case 'INVALID_CREDENTIALS':
      case 'Invalid login credentials':
        setApiError('Invalid email or password. Please check your credentials and try again.');
        toast.error('Invalid credentials. Please check your email and password.');
        break;

      case 'EMAIL_NOT_VERIFIED':
        setApiError('Please check your email and click the verification link before logging in.');
        toast.error('Please verify your email address first.');
        break;

      case 'ACCOUNT_SUSPENDED':
        setApiError('Your account has been suspended. Please contact support for assistance.');
        toast.error('Account suspended. Please contact support.');
        break;

      default:
        if (errorMessage.includes('password')) {
          setErrors({ password: 'Password is incorrect' });
          setApiError('Incorrect password. Please try again.');
          toast.error('Incorrect password.');
        } else if (errorMessage.includes('email')) {
          setErrors({ email: 'Email address not found' });
          setApiError('No account found with this email address.');
          toast.error('Email address not found.');
        } else {
          setApiError('Something went wrong. Please try again.');
          toast.error('Authentication failed. Please try again.');
        }
        break;
    }
  };

  const handleUsernameSubmit = async () => {
    if (!validateUsername()) return;
    
    setIsLoading(true);
    clearErrors();
    
    try {
      // Simulate username availability check
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Username availability simulation disabled for demo
      // In production, this would be a real API call to check username availability
      
      toast.success('Username is available!');
      
      // Different flow for artists vs fans
      if (userType === 'artist') {
        setAuthMode('artist-room');
      } else {
        setAuthMode('genres');
      }
    } catch (error) {
      console.log('Demo username validation - handling simulated error:', error.message);
      
      if (error.message === 'USERNAME_TAKEN') {
        setErrors({ username: 'This username is already taken' });
        setApiError('This username is already taken. Please try a different one.');
        toast.error('Username is already taken. Try another one.');
      } else {
        setApiError('Unable to check username availability. Please try again.');
        toast.error('Unable to verify username. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreSubmit = () => {
    if (formData.selectedGenres.length < 3) {
      toast.error('Please select at least 3 genres to continue');
      return;
    }
    
    toast.success('Great taste! Now let\'s find you some rooms.');
    setAuthMode('rooms');
  };

  const handleRoomSelection = (room) => {
    setFormData(prev => ({
      ...prev,
      selectedRooms: prev.selectedRooms.includes(room.id)
        ? prev.selectedRooms.filter(id => id !== room.id)
        : [...prev.selectedRooms, room.id]
    }));
  };

  const handleRoomSubmit = () => {
    // Rooms are now optional - users can skip this step
    if (formData.selectedRooms.length > 0) {
      toast.success(`Great! You'll be added to ${formData.selectedRooms.length} room${formData.selectedRooms.length > 1 ? 's' : ''}.`);
    } else {
      toast.success('No worries! You can join rooms anytime from the platform.');
    }
    
    setAuthMode('welcome');
  };

  const handleArtistRoomSubmit = () => {
    if (!formData.artistRoom) {
      toast.error('Please claim an existing room or create a new one');
      return;
    }

    if (formData.artistRoom.isNew) {
      toast.success(`Created "${formData.artistRoom.name}" room successfully!`);
    } else {
      toast.success(`Claimed "${formData.artistRoom.name}" room successfully!`);
    }

    // Skip track and invite steps - go directly to welcome
    setAuthMode('welcome');
  };

  const handleClaimRoom = (profile) => {
    setFormData(prev => ({
      ...prev,
      artistRoom: {
        id: profile.id,
        name: profile.name,
        isNew: false,
        isClaimed: true
      }
    }));
  };

  const handleCreateNewRoom = () => {
    const roomName = formData.artistName || formData.username;
    setFormData(prev => ({
      ...prev,
      artistRoom: {
        id: `artist-${Date.now()}`,
        name: roomName,
        isNew: true,
        isClaimed: false
      }
    }));
  };

  const validateTrackUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    // Trim the URL and convert to lowercase for checking
    const cleanUrl = url.trim().toLowerCase();
    
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;
    if (!urlPattern.test(cleanUrl)) return false;
    
    // Platform-specific patterns
    const spotifyPattern = /(open\.)?spotify\.com\/(track|album|playlist|artist)/;
    const youtubePattern = /(youtube\.com\/watch|youtu\.be\/|music\.youtube\.com)/;
    const soundcloudPattern = /soundcloud\.com\/[^\/]+\/[^\/]+/;
    const appleMusicPattern = /music\.apple\.com\/[^\/]+\/(album|song|playlist)/;
    const bandcampPattern = /[^\/]+\.bandcamp\.com\/(track|album)/;
    
    return spotifyPattern.test(cleanUrl) || 
           youtubePattern.test(cleanUrl) || 
           soundcloudPattern.test(cleanUrl) || 
           appleMusicPattern.test(cleanUrl) ||
           bandcampPattern.test(cleanUrl);
  };

  const handleTrackSubmit = async () => {
    // Clear any existing errors
    clearErrors();
    
    if (!formData.trackUrl.trim()) {
      setErrors({ trackUrl: 'Please enter a track URL' });
      toast.error('Please enter a track URL');
      return;
    }

    if (!validateTrackUrl(formData.trackUrl.trim())) {
      setErrors({ trackUrl: 'Please enter a valid link from Spotify, YouTube, SoundCloud, Apple Music, or Bandcamp' });
      toast.error('Please enter a valid music platform URL');
      return;
    }

    setIsLoading(true);
    clearErrors();
    
    try {
      // Simulate track metadata extraction
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate potential API errors for testing
      if (Math.random() < 0.1) { // 10% chance of failure for testing
        throw new Error('TRACK_NOT_FOUND');
      }
      
      // Mock track data extraction
      const trackData = {
        title: 'One More Time',
        artist: formData.username,
        url: formData.trackUrl.trim(),
        platform: formData.trackUrl.includes('spotify') ? 'Spotify' : 
                 formData.trackUrl.includes('youtube') ? 'YouTube' :
                 formData.trackUrl.includes('soundcloud') ? 'SoundCloud' : 'Apple Music',
        artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
      };
      
      setFormData(prev => ({ ...prev, pinnedTrack: trackData }));
      toast.success('Track pinned successfully!');
      setAuthMode('artist-invite');
    } catch (error) {
      console.error('Track processing error:', error);
      
      const errorMessage = error.message || error.toString();
      
      if (errorMessage === 'TRACK_NOT_FOUND') {
        setErrors({ trackUrl: 'Track not found on this platform' });
        setApiError('We couldn\'t find this track. Please check the URL and try again.');
        toast.error('Track not found. Please check your URL.');
      } else {
        setApiError('Unable to process track URL. Please check the link and try again.');
        toast.error('Unable to process track URL. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipTrack = () => {
    toast.success('You can pin a track later from your artist room.');
    setAuthMode('artist-invite');
  };

  const handleInviteSubmit = () => {
    if (formData.inviteEmails.length > 0) {
      toast.success(`Invites sent to ${formData.inviteEmails.length} email${formData.inviteEmails.length > 1 ? 's' : ''}!`);
    } else {
      toast.success('You can invite fans anytime from your artist room.');
    }
    setAuthMode('welcome');
  };

  const handleAddInviteEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (formData.inviteEmails.includes(email)) {
      toast.error('Email already added');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      inviteEmails: [...prev.inviteEmails, email]
    }));
  };

  const handleRemoveInviteEmail = (email) => {
    setFormData(prev => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter(e => e !== email)
    }));
  };

  // Handler for resending verification email
  const handleResendVerificationEmail = async () => {
    try {
      // First sign in to get a session token for the API call
      const { user, error } = await signIn(formData.email, formData.password);

      if (error) {
        throw new Error('Unable to resend email. Please try logging in again.');
      }

      // Call the resend verification endpoint
      await http.post('/auth/resend-verification-email', {}, { auth: true });
    } catch (error: any) {
      console.error('Failed to resend verification email:', error);
      throw error;
    }
  };

  // Handler for when email is verified
  const handleEmailVerified = async () => {
    // After verification, sign the user in and continue to onboarding
    try {
      const { user, error } = await signIn(formData.email, formData.password);

      if (error) {
        // If sign in fails, go to login page
        toast.error('Please log in to continue.');
        setAuthMode('login');
        return;
      }

      if (user) {
        toast.success('Email verified! Let\'s complete your profile.');
        // Continue to username selection/onboarding
        setAuthMode('username');
      }
    } catch (error) {
      console.error('Error after verification:', error);
      setAuthMode('login');
    }
  };

  const completeFanOnboarding = async () => {
    try {
      // Sign in the user with Supabase
      const { user, error } = await signIn(formData.email, formData.password);

      if (error) {
        toast.error('Failed to sign in. Please try logging in manually.');
        console.error('Sign-in error:', error);
        return;
      }

      if (user) {
        const loginUser = {
          id: user.id,
          username: formData.username,
          displayName: formData.username,
          email: formData.email,
          verified: user.email_confirmed_at != null,
          verificationStatus: user.email_confirmed_at != null ? 'verified' : 'pending',
          points: 0,
          accentColor: 'blue',
          bio: 'Music fan on sedā.fm',
          location: '',
          joinedDate: new Date(user.created_at),
          genres: formData.selectedGenres,
          connectedServices: ['Supabase'],
          isArtist: false,
          userType: 'fan' as const,
          website: ''
        };

        toast.success('Welcome to the community! 🎵');
        onLogin(loginUser);
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Something went wrong. Please try logging in.');
    }
  };

  const completeArtistOnboarding = async () => {
    try {
      // Sign in the user with Supabase
      const { user, error } = await signIn(formData.email, formData.password);

      if (error) {
        toast.error('Failed to sign in. Please try logging in manually.');
        console.error('Sign-in error:', error);
        return;
      }

      if (user) {
        const loginUser = {
          id: user.id,
          username: formData.username,
          displayName: formData.username,
          email: formData.email,
          verified: user.email_confirmed_at != null,
          verificationStatus: user.email_confirmed_at != null ? 'verified' : 'pending',
          points: 0,
          accentColor: 'coral',
          bio: formData.bio || `Artist on sedā.fm`,
          location: '',
          joinedDate: new Date(user.created_at),
          genres: [],
          connectedServices: ['Supabase'],
          isArtist: true,
          userType: 'artist' as const,
          website: ''
        };

        toast.success('Welcome to sedā.fm! Your artist profile is live. 🎵');
        onLogin(loginUser);
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Something went wrong. Please try logging in.');
    }
  };

  const handleGenreSelection = (genre) => {
    setFormData(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter(g => g !== genre)
        : [...prev.selectedGenres, genre]
    }));
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      // Create profile in backend
      const profileData = {
        username: formData.username,
        displayName: formData.username,
        bio: formData.bio || `${userType === 'artist' ? 'Artist' : 'Music lover'} on sedā.fm`,
        userType: userType,
        genres: formData.selectedGenres,
      };

      const createdProfile = await profilesApi.create(profileData);

      const newUser = {
        id: createdProfile.id || pendingUserId || Date.now().toString(),
        username: createdProfile.username || formData.username,
        displayName: createdProfile.displayName || formData.username,
        email: formData.email,
        verified: false,
        verificationStatus: 'not-requested',
        points: 0,
        accentColor: userType === 'artist' ? 'coral' : 'blue',
        bio: createdProfile.bio || formData.bio || `${userType === 'artist' ? 'Artist' : 'Music lover'} on sedā.fm`,
        location: '',
        joinedDate: new Date(),
        genres: createdProfile.genres || formData.selectedGenres,
        connectedServices: ['Email'],
        isArtist: userType === 'artist',
        userType: userType,
        website: ''
      };

      toast.success('Welcome to the underground music community!');
      onLogin(newUser);
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      toast.error(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding/Atmosphere */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background via-card to-background relative overflow-hidden">
        {/* Main Branding */}
        <div className="flex flex-col justify-center px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div>
                  <h1 className="text-5xl font-black text-foreground">
                    sedā<span className="text-accent-coral">.</span>fm
                  </h1>
                  <div className="w-24 h-1 bg-accent-coral mt-2"></div>
                </div>
              </div>
            </div>

            {/* Value Props */}
            <div className="space-y-6 mb-12">
              <div>
                <h3 className="font-black text-lg mb-2">Artists Keep 90%</h3>
                <p className="text-muted-foreground">No corporate middlemen. Your music, your profits, your audience.</p>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2">Human Discovery</h3>
                <p className="text-muted-foreground">Find music through real people, not algorithmic manipulation.</p>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2">Global Community</h3>
                <p className="text-muted-foreground">Connect with music lovers worldwide in authentic communities.</p>
              </div>
            </div>

            {/* Philosophy */}
            <div className="border-l-4 border-accent-coral pl-6">
              <p className="text-foreground font-mono text-sm uppercase tracking-wider mb-2">
                Our Mission
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                "To create a music platform that serves artists and fans, not shareholders and surveillance capitalism."
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {(authMode === 'login' || authMode === 'signup') && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div>
                      <h1 className="text-3xl font-black text-foreground">
                        sedā<span className="text-accent-coral">.</span>fm
                      </h1>
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center">
                  <h2 className="text-3xl font-black text-foreground mb-4">
                    {authMode === 'login' ? 'WELCOME BACK' : 'JOIN THE MOVEMENT'}
                  </h2>
                  <div className="w-16 h-1 bg-accent-coral mx-auto mb-6"></div>

                </div>

                {/* User Type Selection - Only for Signup */}
                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.button
                      onClick={() => setUserType('fan')}
                      className={`p-4 border-2 transition-all relative text-center ${
                        userType === 'fan'
                          ? 'border-accent-blue bg-accent-blue/20'
                          : 'border-foreground/20 hover:border-accent-blue/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-black text-xs mb-1">FAN</div>
                      <div className="text-xs text-muted-foreground font-mono">DISCOVER</div>
                      {userType === 'fan' && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-accent-blue rounded-full"></div>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={() => setUserType('artist')}
                      className={`p-4 border-2 transition-all relative text-center ${
                        userType === 'artist'
                          ? 'border-accent-coral bg-accent-coral/20'
                          : 'border-foreground/20 hover:border-accent-coral/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-black text-xs mb-1">ARTIST</div>
                      <div className="text-xs text-muted-foreground font-mono">CREATE</div>
                      {userType === 'artist' && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-accent-coral rounded-full"></div>
                      )}
                    </motion.button>
                  </div>
                )}

                {/* Authentication Form */}
                <Card className="border-2 border-foreground/20 bg-card/50">
                  <CardContent className="p-6 space-y-4">
                    {/* Email Field */}
                    <div>
                      <Label htmlFor="email" className="font-mono text-sm uppercase tracking-wide flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, email: e.target.value }));
                          if (errors.email) {
                            setErrors(prev => ({ ...prev, email: '' }));
                          }
                          setApiError('');
                        }}
                        placeholder="your.email@domain.com"
                        className={`border-2 focus:border-accent-coral font-mono h-12 mt-2 ${
                          errors.email ? 'border-destructive' : 'border-foreground/20'
                        }`}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-destructive text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Username Field - Only for Signup */}
                    {authMode === 'signup' && (
                      <div>
                        <Label htmlFor="username" className="font-mono text-sm uppercase tracking-wide flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, username: e.target.value }));
                            setUsernameAvailable(null); // Reset availability status when typing
                            if (errors.username) {
                              setErrors(prev => ({ ...prev, username: '' }));
                            }
                            setApiError('');
                          }}
                          placeholder="your_username"
                          className={`border-2 focus:border-accent-coral font-mono h-12 mt-2 ${
                            errors.username
                              ? 'border-destructive'
                              : usernameAvailable === false
                                ? 'border-destructive'
                                : usernameAvailable === true && formData.username && /^[a-zA-Z0-9_]{3,20}$/.test(formData.username) && /[a-zA-Z]/.test(formData.username)
                                  ? 'border-green-500'
                                  : 'border-foreground/20'
                          }`}
                          disabled={isLoading}
                        />
                        {errors.username ? (
                          <p className="text-destructive text-xs mt-1">{errors.username}</p>
                        ) : (
                          <div className="mt-1">
                            {isCheckingUsername ? (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="inline-block w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></span>
                                Checking availability...
                              </p>
                            ) : usernameAvailable === false ? (
                              <p className="text-destructive text-xs">
                                ✗ Username is already taken
                              </p>
                            ) : usernameAvailable === true ? (
                              <p className="text-green-500 text-xs">
                                ✓ Username is available
                              </p>
                            ) : (
                              <p className={`text-xs ${formData.username && /^[a-zA-Z0-9_]{3,20}$/.test(formData.username) && /[a-zA-Z]/.test(formData.username) ? 'text-green-500' : 'text-muted-foreground'}`}>
                                3-20 characters • Letters, numbers, and underscores only • Must contain at least one letter
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Password Field */}
                    <div>
                      <Label htmlFor="password" className="font-mono text-sm uppercase tracking-wide flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </Label>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, password: e.target.value }));
                            if (errors.password) {
                              setErrors(prev => ({ ...prev, password: '' }));
                            }
                            setApiError('');
                          }}
                          placeholder={authMode === 'signup' ? "Create a strong password" : "Enter your password"}
                          className={`border-2 focus:border-accent-coral font-mono h-12 pr-12 ${
                            errors.password ? 'border-destructive' : formData.password && formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) && /[0-9]/.test(formData.password) ? 'border-green-500' : 'border-foreground/20'
                          }`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password ? (
                        <p className="text-destructive text-xs mt-1">{errors.password}</p>
                      ) : authMode === 'signup' && (
                        <div className="mt-1 space-y-1">
                          <p className={`text-xs ${formData.password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {formData.password.length >= 8 ? '✓' : '•'} At least 8 characters
                          </p>
                          <p className={`text-xs ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {/[A-Z]/.test(formData.password) ? '✓' : '•'} One uppercase letter
                          </p>
                          <p className={`text-xs ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {/[a-z]/.test(formData.password) ? '✓' : '•'} One lowercase letter
                          </p>
                          <p className={`text-xs ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {/[0-9]/.test(formData.password) ? '✓' : '•'} One number
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field - Only for Signup */}
                    {authMode === 'signup' && (
                      <div>
                        <Label htmlFor="confirmPassword" className="font-mono text-sm uppercase tracking-wide flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (errors.confirmPassword) {
                              setErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }
                            setApiError('');
                          }}
                          placeholder="Confirm your password"
                          className={`border-2 focus:border-accent-coral font-mono h-12 mt-2 ${
                            errors.confirmPassword ? 'border-destructive' : formData.confirmPassword && formData.confirmPassword === formData.password && formData.password.length > 0 ? 'border-green-500' : 'border-foreground/20'
                          }`}
                          disabled={isLoading}
                        />
                        {errors.confirmPassword ? (
                          <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                        ) : formData.confirmPassword && (
                          <p className={`text-xs mt-1 ${formData.confirmPassword === formData.password && formData.password.length > 0 ? 'text-green-500' : 'text-destructive'}`}>
                            {formData.confirmPassword === formData.password && formData.password.length > 0 ? '✓ Passwords match' : '✗ Passwords do not match'}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* API Error Display */}
                {apiError && (
                  <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
                    <p className="text-destructive text-sm mb-3">{apiError}</p>
                    {(apiError.includes('Connection failed') || apiError.includes('Server') || apiError.includes('try again')) && (
                      <Button
                        onClick={handleAuth}
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-background"
                        disabled={isLoading}
                      >
                        Try Again
                      </Button>
                    )}
                    {apiError.includes('email already exists') && (
                      <Button
                        onClick={() => setAuthMode('login')}
                        variant="outline"
                        size="sm"
                        className="border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-background"
                      >
                        Log In Instead
                      </Button>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  onClick={handleAuth}
                  disabled={isLoading}
                  className="w-full bg-accent-coral text-background hover:bg-accent-coral/90 border-2 border-accent-coral h-12 font-black uppercase tracking-wide disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                      {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                    </div>
                  ) : (
                    'Enter'
                  )}
                </Button>

                {/* Auth Mode Toggle */}
                <div className="text-center">
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-accent-coral hover:text-accent-coral/80 font-mono text-sm uppercase tracking-wide font-black"
                    disabled={isLoading}
                  >
                    {authMode === 'login' ? 'Sign Up' : 'Log In'}
                  </button>
                </div>

                {/* Philosophy */}
                <div className="text-center pt-4 border-t border-foreground/10">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                    Artist-First • Fan-Supported
                  </p>
                </div>
              </motion.div>
            )}

            {authMode === 'verify-email' && (
              <VerifyEmailPage
                email={formData.email}
                userType={userType}
                onVerified={handleEmailVerified}
                onBack={() => setAuthMode('login')}
                onResendEmail={handleResendVerificationEmail}
              />
            )}

            {authMode === 'username' && (
              <motion.div
                key="username"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <h1 className="text-2xl font-black text-foreground mb-2">
                    sedā<span className="text-accent-coral">.</span>fm
                  </h1>
                  <div className="w-12 h-px bg-foreground/20 mx-auto"></div>
                </div>

                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-black text-foreground mb-2">
                    Choose Username
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your identity across all rooms and conversations
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-1 mb-8">
                  <div className="w-6 h-px bg-accent-blue"></div>
                  <div className="w-6 h-px bg-foreground/10"></div>
                  <div className="w-6 h-px bg-foreground/10"></div>
                  <div className="w-6 h-px bg-foreground/10"></div>
                </div>

                {/* Username Input */}
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, username: e.target.value }));
                      if (errors.username) {
                        setErrors(prev => ({ ...prev, username: '' }));
                      }
                      setApiError('');
                    }}
                    placeholder="your_username"
                    className={`h-12 text-base focus:border-accent-blue ${
                      errors.username ? 'border-destructive' : ''
                    }`}
                    autoFocus
                    disabled={isLoading}
                  />
                  {errors.username ? (
                    <p className="text-destructive text-xs mt-1">{errors.username}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      3-20 characters • Letters, numbers, and underscores only
                    </p>
                  )}
                </div>

                {/* API Error Display */}
                {apiError && (
                  <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
                    <p className="text-destructive text-sm mb-3">{apiError}</p>
                    {(apiError.includes('Unable to check') || apiError.includes('try again')) && (
                      <Button
                        onClick={handleUsernameSubmit}
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-background"
                        disabled={isLoading || !formData.username}
                      >
                        Try Again
                      </Button>
                    )}
                  </div>
                )}

                {/* Continue Button */}
                <Button 
                  onClick={handleUsernameSubmit}
                  disabled={!formData.username || isLoading}
                  className="w-full bg-accent-blue text-background hover:bg-accent-blue/90 h-12 font-semibold disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                      Checking availability...
                    </div>
                  ) : (
                    'Continue'
                  )}
                </Button>

                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => setAuthMode('signup')}
                  className="w-full text-sm"
                >
                  ← Back
                </Button>
              </motion.div>
            )}

            {authMode === 'genres' && (
              <motion.div
                key="genres-quick"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <h1 className="text-2xl font-black text-foreground mb-2">
                    sedā<span className="text-accent-coral">.</span>fm
                  </h1>
                  <div className="w-12 h-px bg-foreground/20 mx-auto"></div>
                </div>

                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-black text-foreground mb-2">
                    Musical Preferences
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Select at least 3 genres to discover your community
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-1 mb-8">
                  <div className="w-6 h-px bg-accent-blue"></div>
                  <div className="w-6 h-px bg-accent-mint"></div>
                  <div className="w-6 h-px bg-foreground/10"></div>
                  <div className="w-6 h-px bg-foreground/10"></div>
                </div>

                {/* Genre Selection Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {GENRES.map((genre, index) => (
                    <motion.button
                      key={genre}
                      onClick={() => handleGenreSelection(genre)}
                      className={`p-3 border transition-all text-sm relative ${
                        formData.selectedGenres.includes(genre)
                          ? 'border-accent-mint bg-accent-mint/10 text-accent-mint' 
                          : 'border-foreground/20 hover:border-accent-mint/50 text-foreground hover:bg-accent-mint/5'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {genre}
                      {formData.selectedGenres.includes(genre) && (
                        <motion.div 
                          className="absolute top-2 right-2 w-2 h-2 bg-accent-mint rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Progress Counter */}
                <div className="text-center py-4">
                  <p className="text-sm">
                    <span className={`font-semibold ${formData.selectedGenres.length >= 3 ? 'text-accent-mint' : 'text-muted-foreground'}`}>
                      {formData.selectedGenres.length}/3
                    </span>
                    <span className="text-muted-foreground"> genres selected</span>
                  </p>
                </div>

                {/* Continue Button */}
                <Button
                  onClick={handleGenreSubmit}
                  disabled={formData.selectedGenres.length < 3}
                  className="w-full bg-accent-mint text-background hover:bg-accent-mint/90 h-12 font-semibold disabled:opacity-50"
                >
                  {formData.selectedGenres.length < 3 
                    ? `Select ${3 - formData.selectedGenres.length} More` 
                    : 'Continue'
                  }
                </Button>

                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => setAuthMode('username')}
                  className="w-full text-sm"
                >
                  ← Back
                </Button>
              </motion.div>
            )}

            {authMode === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <h1 className="text-2xl font-black text-foreground mb-2">
                    sedā<span className="text-accent-coral">.</span>fm
                  </h1>
                  <div className="w-12 h-px bg-foreground/20 mx-auto"></div>
                </div>

                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-black text-foreground mb-2">
                    Join Communities
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Choose rooms to join or skip to explore later
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-1 mb-8">
                  <div className="w-6 h-px bg-accent-blue"></div>
                  <div className="w-6 h-px bg-accent-mint"></div>
                  <div className="w-6 h-px bg-accent-coral"></div>
                  <div className="w-6 h-px bg-foreground/10"></div>
                </div>

                {/* Room Selection */}
                <div className="space-y-2">
                  {suggestedRooms.filter(room => 
                    formData.selectedGenres.some(genre => 
                      room.name.toLowerCase().includes(genre.toLowerCase()) ||
                      room.id.toLowerCase().includes(genre.toLowerCase())
                    ) || room.isActive
                  ).slice(0, 4).map((room) => (
                    <motion.button
                      key={room.id}
                      onClick={() => handleRoomSelection(room)}
                      className={`w-full p-4 border transition-all text-left ${
                        formData.selectedRooms.includes(room.id)
                          ? 'border-accent-coral bg-accent-coral/10' 
                          : 'border-foreground/20 hover:border-accent-coral/50 hover:bg-accent-coral/5'
                      }`}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{room.name}</h3>
                            {room.isActive && (
                              <span className="w-1.5 h-1.5 bg-accent-mint rounded-full"></span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{room.description}</p>
                          <span className="text-xs text-muted-foreground">{room.members} members</span>
                        </div>
                        {formData.selectedRooms.includes(room.id) && (
                          <div className="w-5 h-5 bg-accent-coral text-background rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Continue Button */}
                <Button
                  onClick={handleRoomSubmit}
                  className="w-full bg-accent-coral text-background hover:bg-accent-coral/90 h-12 font-semibold"
                >
                  {formData.selectedRooms.length === 0 
                    ? 'Skip for Now' 
                    : `Join ${formData.selectedRooms.length} Room${formData.selectedRooms.length > 1 ? 's' : ''}`
                  }
                </Button>

                {/* Optional: Add a secondary skip button for clarity */}
                {formData.selectedRooms.length > 0 && (
                  <Button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, selectedRooms: [] }));
                      handleRoomSubmit();
                    }}
                    variant="ghost"
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    Skip and join rooms later
                  </Button>
                )}

                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => setAuthMode('genres')}
                  className="w-full text-sm"
                >
                  ← Back
                </Button>
              </motion.div>
            )}

            {authMode === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center"
              >
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-2">
                    Welcome, {formData.username}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your profile is ready
                  </p>
                </div>

                {/* Progress Complete */}
                <div className="flex items-center justify-center gap-1 mb-8">
                  <div className="w-6 h-px bg-accent-blue"></div>
                  <div className="w-6 h-px bg-accent-mint"></div>
                  <div className="w-6 h-px bg-accent-coral"></div>
                  <div className="w-6 h-px bg-accent-yellow"></div>
                </div>

                {/* Summary */}
                <div className="border border-foreground/10 p-6 text-left">
                  <h3 className="font-semibold text-base mb-4">Setup Complete</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username</span>
                      <span className="font-medium">{formData.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Genres</span>
                      <span className="font-medium">{formData.selectedGenres.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Communities</span>
                      <span className="font-medium">
                        {formData.selectedRooms.length > 0 
                          ? `${formData.selectedRooms.length} joined` 
                          : 'Ready to explore'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Ready to discover new music and connect with the community?
                  </p>
                  
                  <Button
                    onClick={userType === 'artist' ? completeArtistOnboarding : completeFanOnboarding}
                    className="w-full bg-accent-mint text-background hover:bg-accent-mint/90 h-12 font-semibold"
                  >
                    Enter sedā.fm
                  </Button>
                </div>
              </motion.div>
            )}

            {authMode === 'artist-room' && (
              <motion.div
                key="artist-room"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Mobile Logo */}
                <div className="lg:hidden text-center mb-8">
                  <h1 className="text-2xl font-black text-foreground mb-2">
                    sedā<span className="text-accent-coral">.</span>fm
                  </h1>
                  <div className="w-12 h-px bg-foreground/20 mx-auto"></div>
                </div>

                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-black text-foreground mb-2">
                    Claim Your Artist Room
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Search for your existing profile or create a new artist room
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-1 mb-8">
                  <div className="w-6 h-px bg-accent-blue"></div>
                  <div className="w-6 h-px bg-accent-coral"></div>
                  <div className="w-6 h-px bg-foreground/10"></div>
                  <div className="w-6 h-px bg-foreground/10"></div>
                </div>

                {/* Search for existing artist */}
                <div className="space-y-3">
                  <Label htmlFor="artistSearch" className="text-sm font-medium">
                    Search for Your Artist Profile
                  </Label>
                  <Input
                    id="artistSearch"
                    value={formData.artistName}
                    onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
                    placeholder="Enter your artist name..."
                    className="h-12 text-base"
                  />
                </div>

                {/* Existing Artist Profiles */}
                {formData.artistName && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Existing Artist Profiles</h3>
                    {existingArtistProfiles
                      .filter(profile => 
                        profile.name.toLowerCase().includes(formData.artistName.toLowerCase()) && !profile.claimed
                      )
                      .slice(0, 3)
                      .map((profile) => (
                        <motion.button
                          key={profile.id}
                          onClick={() => handleClaimRoom(profile)}
                          className={`w-full p-4 border transition-all text-left ${
                            formData.artistRoom?.id === profile.id
                              ? 'border-accent-coral bg-accent-coral/10' 
                              : 'border-foreground/20 hover:border-accent-coral/50 hover:bg-accent-coral/5'
                          }`}
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm">{profile.name}</h3>
                                {profile.verified && (
                                  <Star className="w-4 h-4 text-accent-coral fill-current" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {profile.followers.toLocaleString()} followers
                              </p>
                            </div>
                            {formData.artistRoom?.id === profile.id && (
                              <div className="w-5 h-5 bg-accent-coral text-background rounded-full flex items-center justify-center">
                                <span className="text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                  </div>
                )}

                {/* Create New Room Option */}
                <div className="border-t border-foreground/10 pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Or Create New Room</h3>
                  <motion.button
                    onClick={handleCreateNewRoom}
                    className={`w-full p-4 border transition-all text-left ${
                      formData.artistRoom?.isNew
                        ? 'border-accent-coral bg-accent-coral/10' 
                        : 'border-foreground/20 hover:border-accent-coral/50 hover:bg-accent-coral/5'
                    }`}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">
                          Create "{formData.artistName || formData.username}" Room
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Start fresh with a new artist profile
                        </p>
                      </div>
                      {formData.artistRoom?.isNew && (
                        <div className="w-5 h-5 bg-accent-coral text-background rounded-full flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </motion.button>
                </div>

                {/* Continue Button */}
                <Button
                  onClick={handleArtistRoomSubmit}
                  disabled={!formData.artistRoom}
                  className="w-full bg-accent-coral text-background hover:bg-accent-coral/90 h-12 font-semibold disabled:opacity-50"
                >
                  {formData.artistRoom?.isNew ? 'Create Room' : 'Claim Room'}
                </Button>

                {/* Back Button */}
                <Button
                  variant="ghost"
                  onClick={() => setAuthMode('username')}
                  className="w-full text-sm"
                >
                  ← Back
                </Button>
              </motion.div>
            )}

{/* REMOVED: artist-track step - artists no longer need to pin a track during onboarding */}

            {/* REMOVED: artist-invite step - artists no longer need to invite fans during onboarding */}

            {authMode === 'onboarding' && (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center">
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 font-mono text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Registration
                  </button>
                  
                  <div className="bg-accent-yellow text-background p-2 inline-block mb-3 font-mono text-xs border-2 border-accent-yellow">
                    TASTE PROFILE SETUP
                  </div>
                  <h2 className="text-2xl font-black text-foreground mb-2">
                    PICK YOUR SOUND
                  </h2>
                  <div className="w-16 h-1 bg-accent-yellow mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground font-mono">
                    Choose at least 3 genres • Build your musical identity
                  </p>
                </div>

                {/* Genre Selection Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {GENRES.map((genre, index) => (
                    <motion.button
                      key={genre}
                      onClick={() => handleGenreSelection(genre)}
                      className={`p-3 border-2 transition-all text-xs font-mono uppercase tracking-wide relative ${
                        formData.selectedGenres.includes(genre)
                          ? 'border-accent-coral bg-accent-coral text-background' 
                          : 'border-foreground/20 hover:border-accent-coral/50 text-foreground hover:bg-accent-coral/10'
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {genre}
                      {formData.selectedGenres.includes(genre) && (
                        <motion.div 
                          className="absolute -top-1 -right-1 w-3 h-3 bg-background rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Progress */}
                <Card className="border-2 border-foreground/20">
                  <CardContent className="p-4 font-mono text-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span>SELECTED GENRES:</span>
                      <span className={`font-black ${formData.selectedGenres.length >= 3 ? 'text-accent-mint' : 'text-muted-foreground'}`}>
                        {formData.selectedGenres.length}/3
                      </span>
                    </div>
                    <div className="w-full bg-foreground/10 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-accent-mint"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((formData.selectedGenres.length / 3) * 100, 100)}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    {formData.selectedGenres.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-muted-foreground">Your taste: </span>
                        <span className="text-foreground">{formData.selectedGenres.join(', ')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Complete Button */}
                <Button
                  onClick={completeOnboarding}
                  disabled={formData.selectedGenres.length < 3}
                  className="w-full bg-accent-mint text-background hover:bg-accent-mint/90 border-2 border-accent-mint h-12 font-black uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formData.selectedGenres.length < 3 
                    ? `Pick ${3 - formData.selectedGenres.length} More` 
                    : 'Enter the Underground'
                  }
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to About Button */}
          <div className="text-center mt-8">
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground font-mono text-xs uppercase tracking-wider transition-colors"
            >
              ← Back to About
            </button>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}