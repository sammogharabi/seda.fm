import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Music, Mail, Globe } from 'lucide-react';

const STREAMING_SERVICES = [
  { name: 'Spotify', color: '#1DB954', icon: '🎵' },
  { name: 'Apple Music', color: '#FA233B', icon: '🍎' },
  { name: 'YouTube Music', color: '#FF0000', icon: '📺' },
  { name: 'Tidal', color: '#000000', icon: '🌊' },
  { name: 'Amazon Music', color: '#FF9900', icon: '📦' },
  { name: 'Deezer', color: '#FEAA2D', icon: '🎶' },
  { name: 'Pandora', color: '#005483', icon: '📻' },
  { name: 'Bandcamp', color: '#629AA0', icon: '🎪' }
];

const GENRES = [
  'Hip Hop', 'Electronic', 'Rock', 'Pop', 'Jazz', 'Classical', 
  'R&B', 'Country', 'Indie', 'Ambient', 'House', 'Techno'
];

export function AuthModal({ isOpen, onLogin }) {
  const [step, setStep] = useState('login'); // login, onboarding, artist-setup
  const [loginMethod, setLoginMethod] = useState('email');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    userType: 'fan', // fan or artist
    selectedGenres: [],
    bio: '',
    streamingServices: []
  });

  const handleStreamingLogin = (service) => {
    // Mock authentication - in real app would OAuth with the service
    const mockUser = {
      id: Date.now(),
      username: `user_${Date.now()}`,
      email: `user@${service.name.toLowerCase()}.com`,
      userType: 'fan',
      djPoints: 0,
      badges: [],
      connectedServices: [service.name],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
      joinedDate: new Date().toISOString(),
      genres: []
    };
    
    setFormData(prev => ({ ...prev, ...mockUser }));
    setStep('onboarding');
  };

  const handleEmailSignup = () => {
    if (!formData.email || !formData.username) return;
    
    const mockUser = {
      id: Date.now(),
      username: formData.username,
      email: formData.email,
      userType: formData.userType,
      djPoints: 0,
      badges: [],
      connectedServices: ['Email'],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
      joinedDate: new Date().toISOString(),
      genres: []
    };
    
    setFormData(prev => ({ ...prev, ...mockUser }));
    setStep('onboarding');
  };

  const handleGenreSelection = (genre) => {
    setFormData(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genre)
        ? prev.selectedGenres.filter(g => g !== genre)
        : [...prev.selectedGenres, genre]
    }));
  };

  const completeOnboarding = () => {
    const finalUser = {
      ...formData,
      genres: formData.selectedGenres,
      isArtist: formData.userType === 'artist',
      verified: formData.userType === 'artist',
      tier: formData.userType === 'artist' ? 'artist' : (Math.random() > 0.7 ? 'premium' : 'free'),
      fanLeaderboard: [],
      playlists: [],
      trophyCase: []
    };
    
    onLogin(finalUser);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Music className="w-6 h-6 text-primary" />
            <span className="font-medium text-foreground">
              sedā.fm
            </span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Connect with the music community, discover new tracks, and share your favorite music with fellow fans and artists.
          </DialogDescription>
        </DialogHeader>

        {step === 'login' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground">Join the music community</p>
            </div>

            {loginMethod === 'email' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Choose a username"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={formData.userType === 'fan' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'fan' }))}
                    className="flex-1"
                  >
                    Fan
                  </Button>
                  <Button
                    variant={formData.userType === 'artist' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'artist' }))}
                    className="flex-1"
                  >
                    Artist
                  </Button>
                </div>
                <Button onClick={handleEmailSignup} className="w-full">
                  Continue
                </Button>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">Or connect with</p>
              <div className="grid grid-cols-2 gap-2">
                {STREAMING_SERVICES.map((service) => (
                  <Button
                    key={service.name}
                    variant="outline"
                    onClick={() => handleStreamingLogin(service)}
                    className="h-12 border-2 hover:border-ring transition-colors"
                  >
                    <span className="mr-2">{service.icon}</span>
                    {service.name}
                  </Button>
                ))}
              </div>
            </div>

            {loginMethod !== 'email' && (
              <Button
                variant="ghost"
                onClick={() => setLoginMethod('email')}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Use Email Instead
              </Button>
            )}
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

                >
                  {genre}
                </Button>
              ))}
            </div>

            <Button
              onClick={completeOnboarding}
              disabled={formData.selectedGenres.length < 3}
              className="w-full"

            >
              Complete Setup ({formData.selectedGenres.length}/3)
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}