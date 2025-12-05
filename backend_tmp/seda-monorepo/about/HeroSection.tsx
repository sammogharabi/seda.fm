import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChevronRight, Mail, Shield, Users } from 'lucide-react';

interface HeroSectionProps {
  onSignup: (email: string) => void;
  onLearnMorePBC: () => void;
}

export function HeroSection({ onSignup, onLearnMorePBC }: HeroSectionProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSignup(email);
      setIsSubmitted(true);
    }
  };

  return (
    <section className="min-h-screen flex flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <motion.div 
          className="flex items-center justify-center gap-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-br from-primary to-ring rounded-xl flex items-center justify-center shadow-2xl"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-primary-foreground font-medium text-2xl">S</span>
          </motion.div>
          <h1 className="text-4xl text-foreground font-medium">
            sedā.fm
          </h1>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover music made by{' '}
          <span className="bg-gradient-to-r from-primary via-muted-foreground to-primary bg-clip-text text-transparent">
            people, not AI
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p 
          className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          sedā.fm is powered by artists, fans, and scenes who create, share, and curate music together. 
          Real songs, real playlists, real connections — and every time you join in or buy from artists, you can unlock ad-free Premium.
        </motion.p>

        {/* Beta Signup Form */}
        <motion.div 
          className="max-w-md mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="sr-only">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email for beta access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-input-background border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              >
                <Mail className="w-4 h-4 mr-2" />
                Join the Beta (Humans Only)
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <motion.div 
              className="p-6 bg-card border border-border rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">You're on the list!</h3>
              <p className="text-muted-foreground">We'll notify you when beta access opens.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Secondary CTA */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button 
            variant="ghost" 
            onClick={onLearnMorePBC}
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Learn about our Public Benefit mission
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Trust Microcopy */}
        <motion.div 
          className="text-center text-sm text-muted-foreground max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p>
            No spam. No AI playlists called "Songs to Eat Cereal To." Just beta updates.
          </p>
        </motion.div>
      </div>
    </section>
  );
}