import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  Crown, 
  Music, 
  Globe, 
  Instagram, 
  Twitter, 
  Youtube, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { authService } from '../services/auth';
import { toast } from 'sonner';

const GENRES = [
  'Hip Hop', 'Electronic', 'Rock', 'Pop', 'Jazz', 'Classical', 
  'R&B', 'Country', 'Indie', 'Ambient', 'House', 'Techno',
  'Reggae', 'Folk', 'Blues', 'Punk', 'Metal', 'Soul'
];

const PLATFORM_OPTIONS = [
  { name: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
  { name: 'Bandcamp', icon: Music, placeholder: 'https://artistname.bandcamp.com' },
  { name: 'SoundCloud', icon: Music, placeholder: 'https://soundcloud.com/artistname' },
  { name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/artistname' },
  { name: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/artistname' },
  { name: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/artistname' },
];

export function ArtistVerification({ isOpen, onClose, user }) {
  const [step, setStep] = useState('form'); // form, submit, claim-code, pending
  const [loading, setLoading] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [formData, setFormData] = useState({
    artistName: '',
    bio: '',
    genres: [],
    socialLinks: [],
    verificationUrl: ''
  });

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const addSocialLink = (platform) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: platform.name, url: '', icon: platform.icon, placeholder: platform.placeholder }]
    }));
  };

  const updateSocialLink = (index, url) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, url } : link
      )
    }));
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitApplication = async () => {
    if (!formData.artistName || !formData.bio || formData.genres.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { claimCode, error } = await authService.requestArtistVerification({
        artistName: formData.artistName,
        bio: formData.bio,
        genres: formData.genres,
        socialLinks: formData.socialLinks.filter(link => link.url).map(link => link.url)
      });

      if (error) {
        toast.error('Failed to submit verification request');
        return;
      }

      if (claimCode) {
        setClaimCode(claimCode);
        setStep('claim-code');
        toast.success('Verification request submitted!');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  const copyClaimCode = () => {
    navigator.clipboard.writeText(claimCode);
    toast.success('Claim code copied to clipboard!');
  };

  const handleUrlSubmit = async () => {
    if (!formData.verificationUrl) {
      toast.error('Please enter the URL where you placed the claim code');
      return;
    }

    setLoading(true);
    try {
      // #COMPLETION_DRIVE: Using mock verification submission for demo
      // #SUGGEST_VERIFY: Replace with real backend API when available
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update verification request in localStorage
      const savedUser = localStorage.getItem('seda_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData.verificationRequest) {
            userData.verificationRequest.verificationUrl = formData.verificationUrl;
            userData.verificationRequest.status = 'under_review';
            userData.verificationRequest.submissionDate = new Date().toISOString();
            localStorage.setItem('seda_user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error updating verification request:', error);
        }
      }

      setStep('pending');
      toast.success('Verification submitted! We\'ll review your request within 24 hours.');
    } catch (error) {
      console.error('URL submission error:', error);
      toast.error('Failed to submit verification URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-background border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Crown className="w-6 h-6" style={{ color: '#00ff88' }} />
            <span className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] bg-clip-text text-transparent">
              Artist Verification
            </span>
          </DialogTitle>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Get verified to unlock exclusive artist features and build credibility
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="artistName">Artist Name *</Label>
                <Input
                  id="artistName"
                  value={formData.artistName}
                  onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
                  placeholder="Your stage or artist name"
                />
              </div>

              <div>
                <Label htmlFor="bio">Artist Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your music, background, and what makes you unique..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Genres * (Select at least 1)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {GENRES.map((genre) => (
                    <Button
                      key={genre}
                      type="button"
                      variant={formData.genres.includes(genre) ? 'default' : 'outline'}
                      onClick={() => handleGenreToggle(genre)}
                      className="h-8 text-xs"
                      style={{
                        backgroundColor: formData.genres.includes(genre) ? '#00ff88' : undefined,
                        borderColor: formData.genres.includes(genre) ? '#00ff88' : undefined,
                        color: formData.genres.includes(genre) ? '#000' : undefined
                      }}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {formData.genres.length}
                </p>
              </div>

              <div>
                <Label>Social Links & Platforms</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Add your official music and social media links
                </p>
                
                <div className="space-y-2">
                  {formData.socialLinks.map((link, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <link.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <Input
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, e.target.value)}
                          placeholder={link.placeholder}
                          className="flex-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSocialLink(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                {formData.socialLinks.length < 6 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {PLATFORM_OPTIONS.filter(platform => 
                      !formData.socialLinks.some(link => link.platform === platform.name)
                    ).map((platform) => (
                      <Button
                        key={platform.name}
                        type="button"
                        variant="outline"
                        onClick={() => addSocialLink(platform)}
                        className="h-8 text-xs"
                      >
                        <platform.icon className="w-3 h-3 mr-1" />
                        {platform.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSubmitApplication}
              disabled={loading || !formData.artistName || !formData.bio || formData.genres.length === 0}
              className="w-full"
              style={{ backgroundColor: '#00ff88', color: '#000' }}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Verification Request
            </Button>
          </div>
        )}

        {step === 'claim-code' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#00ff88' }} />
              <h3 className="text-lg font-semibold mb-2">Verification Request Submitted!</h3>
              <p className="text-muted-foreground">
                To complete verification, place this claim code on one of your public platforms
              </p>
            </div>

            <Card className="border-2" style={{ borderColor: '#00ff88' }}>
              <CardContent className="p-4">
                <div className="text-center space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Your Claim Code</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 p-3 bg-accent rounded font-mono text-lg text-center">
                        {claimCode}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyClaimCode}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-left space-y-2">
                    <p className="text-sm font-medium">How to verify:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Copy the claim code above</li>
                      <li>Add it to your bio, description, or post on one of these platforms:</li>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>Bandcamp profile bio</li>
                        <li>SoundCloud profile description</li>
                        <li>Website about page</li>
                        <li>Social media bio (Instagram, Twitter)</li>
                      </ul>
                      <li>Enter the URL where you placed the code below</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div>
                <Label htmlFor="verificationUrl">Verification URL *</Label>
                <Input
                  id="verificationUrl"
                  value={formData.verificationUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, verificationUrl: e.target.value }))}
                  placeholder="https://yourwebsite.com/about or https://bandcamp.com/artist"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL where we can find your claim code
                </p>
              </div>

              <Button
                onClick={handleUrlSubmit}
                disabled={loading || !formData.verificationUrl}
                className="w-full"
                style={{ backgroundColor: '#00ff88', color: '#000' }}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit for Review
              </Button>
            </div>
          </div>
        )}

        {step === 'pending' && (
          <div className="space-y-6 text-center">
            <div>
              <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#00ff88' }} />
              <h3 className="text-lg font-semibold mb-2">Verification Under Review</h3>
              <p className="text-muted-foreground">
                We're reviewing your verification request. You'll be notified within 24 hours.
              </p>
            </div>

            <Card className="text-left">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                    Under Review
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Artist Name</span>
                  <span className="text-sm">{formData.artistName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Claim Code</span>
                  <code className="text-sm bg-accent px-2 py-1 rounded">{claimCode}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification URL</span>
                  <a 
                    href={formData.verificationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}