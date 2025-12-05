import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Music, Mail, Globe, X, Users, Mic, Headphones, Star } from 'lucide-react';
import { motion } from 'motion/react';

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

export function AuthModal({ isOpen, onClose, onLogin }) {
  const [step, setStep] = useState('welcome'); // welcome, login, onboarding
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
      // Removed avatar for cleaner underground aesthetic
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
      // Removed avatar for cleaner underground aesthetic
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background border-2 border-foreground shadow-2xl p-0 overflow-hidden" aria-describedby="auth-modal-description">
        {/* Screen reader description */}
        <DialogDescription id="auth-modal-description" className="sr-only">
          Authentication modal for sedā.fm - Join the underground music community by creating an account or logging in.
        </DialogDescription>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center hover:bg-foreground/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'welcome' && (
          <motion.div 
            className="p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Zine Header */}
            <div className="text-center mb-8">
              <div className="bg-accent-coral text-background p-3 inline-block mb-4 font-mono text-sm border-2 border-accent-coral">
                {"[UNDERGROUND MUSIC COLLECTIVE]"}
              </div>
              <h1 className="text-4xl font-black text-foreground mb-2">
                sedā<span className="text-accent-coral">.</span>fm
              </h1>
              <div className="w-16 h-1 bg-accent-coral mx-auto mb-4"></div>
              <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
                Where artists get paid • Fans find gems
              </p>
            </div>

            {/* Value Props - Backstage Pass Style */}
            <div className="space-y-4 mb-8">
              <div className="bg-accent-mint/20 border-l-4 border-accent-mint p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Mic className="w-5 h-5 text-accent-mint" />
                  <span className="font-black text-foreground">FOR ARTISTS</span>
                </div>
                <p className="text-sm text-foreground">Keep 90% of sales • Own your music forever • Direct fan connection</p>
              </div>
              
              <div className="bg-accent-blue/20 border-l-4 border-accent-blue p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Headphones className="w-5 h-5 text-accent-blue" />
                  <span className="font-black text-foreground">FOR FANS</span>
                </div>
                <p className="text-sm text-foreground">Discover through humans, not robots • Support artists directly • Real connections</p>
              </div>
            </div>

            {/* Entry Options */}
            <div className="space-y-3">
              <Button
                onClick={() => setStep('login')}
                className="w-full bg-accent-coral text-background hover:bg-accent-coral/90 border-2 border-accent-coral h-12 font-black uppercase tracking-wide"
              >
                Join the Movement
              </Button>
              
              <Button
                onClick={onLogin}
                variant="outline"
                className="w-full border-2 border-foreground hover:bg-foreground hover:text-background font-black uppercase tracking-wide h-12"
              >
                Demo Access (No Signup)
              </Button>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs text-muted-foreground font-mono">
                ANTI-CORPORATE • ARTIST-FIRST • FAN-SUPPORTED
              </p>
            </div>
          </motion.div>
        )}

        {step === 'login' && (
          <motion.div 
            className="p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-foreground mb-2">JOIN THE COLLECTIVE</h2>
              <div className="w-12 h-1 bg-accent-coral mx-auto mb-4"></div>
              <p className="text-muted-foreground font-mono text-sm">Choose your path in the underground</p>
            </div>

            {loginMethod === 'email' && (
              <div className="space-y-4">
                {/* User Type Selection - Ticket Style */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <motion.button
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'fan' }))}
                    className={`p-4 border-2 transition-all relative ${
                      formData.userType === 'fan' 
                        ? 'border-accent-blue bg-accent-blue/20' 
                        : 'border-foreground/20 hover:border-accent-blue/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Users className="w-6 h-6 mx-auto mb-2 text-accent-blue" />
                    <div className="font-black text-sm">FAN</div>
                    <div className="text-xs text-muted-foreground font-mono">DISCOVER • SUPPORT</div>
                    {formData.userType === 'fan' && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-accent-blue rounded-full"></div>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'artist' }))}
                    className={`p-4 border-2 transition-all relative ${
                      formData.userType === 'artist' 
                        ? 'border-accent-coral bg-accent-coral/20' 
                        : 'border-foreground/20 hover:border-accent-coral/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Star className="w-6 h-6 mx-auto mb-2 text-accent-coral" />
                    <div className="font-black text-sm">ARTIST</div>
                    <div className="text-xs text-muted-foreground font-mono">CREATE • EARN</div>
                    {formData.userType === 'artist' && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-accent-coral rounded-full"></div>
                    )}
                  </motion.button>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="font-mono text-sm uppercase tracking-wide">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@domain.com"
                      className="border-2 border-foreground/20 focus:border-accent-coral font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username" className="font-mono text-sm uppercase tracking-wide">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="your_username"
                      className="border-2 border-foreground/20 focus:border-accent-coral font-mono"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleEmailSignup} 
                  className="w-full bg-accent-coral text-background hover:bg-accent-coral/90 border-2 border-accent-coral h-12 font-black uppercase tracking-wide"
                  disabled={!formData.email || !formData.username}
                >
                  Continue Setup
                </Button>
              </div>
            )}

            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-foreground/20"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground font-mono">Or quick connect</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Access */}
            <div className="space-y-3">
              <Button
                onClick={onLogin}
                variant="outline"
                className="w-full border-2 border-accent-mint hover:bg-accent-mint hover:text-background font-black uppercase tracking-wide h-12"
              >
                <Music className="w-4 h-4 mr-2" />
                Demo the Platform
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setStep('welcome')}
                className="w-full font-mono text-xs uppercase tracking-wide"
              >
                ← Back to Start
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'onboarding' && (
          <motion.div 
            className="p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header - Band Sticker Collection Style */}
            <div className="text-center mb-6">
              <div className="bg-accent-yellow text-background p-2 inline-block mb-3 font-mono text-xs border-2 border-accent-yellow">
                TASTE PROFILE SETUP
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">
                PICK YOUR SOUND
              </h3>
              <div className="w-12 h-1 bg-accent-yellow mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground font-mono">
                Choose at least 3 genres • Build your musical identity
              </p>
            </div>

            {/* Genre Stickers Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
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
                  transition={{ duration: 0.2, delay: index * 0.05 }}
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

            {/* Progress Indicator */}
            <div className="bg-card border border-foreground/20 p-4 mb-6 font-mono text-xs">
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
            </div>

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

            <Button
              variant="ghost"
              onClick={() => setStep('login')}
              className="w-full mt-3 font-mono text-xs uppercase tracking-wide"
            >
              ← Back to Login
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}