import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Music, Mail, Globe, Loader2, Eye, EyeOff } from 'lucide-react';
import { authService, User } from '../services/auth';
import { toast } from 'sonner';

const STREAMING_SERVICES = [
  { name: 'Spotify', color: '#1DB954', icon: '🎵', provider: 'spotify' },
  { name: 'Google', color: '#4285F4', icon: '🔍', provider: 'google' },
  { name: 'Apple', color: '#000000', icon: '🍎', provider: 'apple' },
  { name: 'YouTube Music', color: '#FF0000', icon: '📺' },
  { name: 'Tidal', color: '#000000', icon: '🌊' },
  { name: 'Amazon Music', color: '#FF9900', icon: '📦' },
  { name: 'Deezer', color: '#FEAA2D', icon: '🎶' },
  { name: 'Bandcamp', color: '#629AA0', icon: '🎪' }
];

const GENRES = [
  'Hip Hop', 'Electronic', 'Rock', 'Pop', 'Jazz', 'Classical', 
  'R&B', 'Country', 'Indie', 'Ambient', 'House', 'Techno'
];

export function AuthModal({ isOpen, onLogin }) {
  const [step, setStep] = useState('login'); // login, signup, onboarding, artist-setup
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    userType: 'fan', // fan or artist
    selectedGenres: [],
    bio: '',
    streamingServices: []
  });

  const handleStreamingLogin = async (service) => {
    if (!service.provider) {
      toast.error(`${service.name} login coming soon!`);
      return;
    }

    setLoading(true);
    try {
      await authService.signInWithProvider(service.provider as any);
      // OAuth will redirect, so no need to continue here
    } catch (error) {
      console.error('OAuth login error:', error);
      toast.error(`Failed to login with ${service.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill in email and password');
      return;
    }
    
    if (isSignup) {
      if (!formData.username) {
        toast.error('Please enter a username');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }
    
    setLoading(true);
    try {
      let result;
      
      if (isSignup) {
        result = await authService.signUpWithEmail(
          formData.email, 
          formData.password, 
          formData.username,
          formData.userType
        );
        
        if (result.error) {
          toast.error(result.error.message || 'Failed to create account');
          return;
        }
        
        if (result.user) {
          // Merge user data with formData to preserve all fields
          setFormData(prev => ({ 
            ...prev, 
            ...result.user,
            id: result.user.id,
            email: result.user.email,
            username: result.user.username
          }));
          setStep('onboarding');
          toast.success('Account created! Please complete your profile.');
        }
      } else {
        result = await authService.signInWithEmail(
          formData.email, 
          formData.password
        );
        
        if (result.error) {
          toast.error(result.error.message || 'Failed to sign in');
          return;
        }
        
        if (result.user) {
          // Skip onboarding if user already has preferences
          if (result.user.genres && result.user.genres.length > 0) {
            onLogin(result.user);
          } else {
            setFormData(prev => ({ ...prev, ...result.user }));
            setStep('onboarding');
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(isSignup ? 'Failed to create account' : 'Failed to sign in');
    } finally {
      setLoading(false);
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
    if (formData.selectedGenres.length < 3) {
      toast.error('Please select at least 3 genres');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with preferences
      // Include email and username from formData if we have them
      const updates = {
        genres: formData.selectedGenres,
        userType: formData.userType,
        bio: formData.bio || '',
        email: formData.email,
        username: formData.username
      };
      
      console.log('Onboarding - Updating profile with:', updates);
      const { user, error } = await authService.updateProfile(updates);
      
      if (error) {
        console.error('Profile update error:', error);
        toast.error(`Failed to update profile: ${error.message}`);
        return;
      }
      
      if (!user) {
        toast.error('Failed to update profile: No user data returned');
        return;
      }
      
      const finalUser = {
        ...user,
        genres: formData.selectedGenres,
        isArtist: formData.userType === 'artist',
        verified: false, // Will be set through verification flow
        fanLeaderboard: [],
        playlists: [],
        trophyCase: []
      };
      
      onLogin(finalUser);
      toast.success('Welcome to sedā.fm!');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Music className="w-6 h-6 text-primary" style={{ color: '#00ff88' }} />
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
              sedā.fm
            </span>
          </DialogTitle>
        </DialogHeader>

        {step === 'login' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground">
                {isSignup ? 'Create your account' : 'Welcome back to the music community'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              {isSignup && (
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Choose a username"
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {isSignup && (
                <>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your password"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.userType === 'fan' ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, userType: 'fan' }))}
                      className="flex-1"
                      disabled={loading}
                    >
                      Fan
                    </Button>
                    <Button
                      type="button"
                      variant={formData.userType === 'artist' ? 'default' : 'outline'}
                      onClick={() => setFormData(prev => ({ ...prev, userType: 'artist' }))}
                      className="flex-1"
                      disabled={loading}
                    >
                      Artist
                    </Button>
                  </div>
                </>
              )}

              <Button 
                onClick={handleEmailAuth} 
                className="w-full" 
                disabled={loading}
                style={{ backgroundColor: '#00ff88', color: '#000' }}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSignup ? 'Create Account' : 'Sign In'}
              </Button>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm"
                disabled={loading}
              >
                {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">Or continue with</p>
              <div className="grid grid-cols-2 gap-2">
                {STREAMING_SERVICES.slice(0, 6).map((service) => (
                  <Button
                    key={service.name}
                    variant="outline"
                    onClick={() => handleStreamingLogin(service)}
                    className="h-12 border-2 hover:border-[#00ff88] transition-colors"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <span className="mr-2">{service.icon}</span>}
                    {service.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'onboarding' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3>Pick Your Genres</h3>
              <p className="text-sm text-muted-foreground">Choose at least 3 genres you love</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {GENRES.map((genre) => (
                <Button
                  key={genre}
                  variant={formData.selectedGenres.includes(genre) ? 'default' : 'outline'}
                  onClick={() => handleGenreSelection(genre)}
                  className="h-10 text-xs"
                  disabled={loading}
                  style={{
                    backgroundColor: formData.selectedGenres.includes(genre) ? '#00ff88' : undefined,
                    borderColor: formData.selectedGenres.includes(genre) ? '#00ff88' : undefined
                  }}
                >
                  {genre}
                </Button>
              ))}
            </div>

            <Button
              onClick={completeOnboarding}
              disabled={formData.selectedGenres.length < 3 || loading}
              className="w-full"
              style={{ backgroundColor: '#00ff88', color: '#000' }}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Complete Setup ({formData.selectedGenres.length}/3)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}