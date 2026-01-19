import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Settings, Music } from 'lucide-react';
import { Button } from './ui/button';
import { StreamingConnections } from './StreamingConnections';

interface SettingsViewProps {
  user: any;
  onBack?: () => void;
  onViewChange?: (view: string) => void;
}

export function SettingsView({ user, onBack, onViewChange }: SettingsViewProps) {
  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/v1';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onViewChange) {
      // Navigate back to appropriate view based on user type
      onViewChange(user?.userType === 'artist' ? 'artist-dashboard' : 'feed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent-coral" />
              <h1 className="text-xl font-semibold">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Streaming Connections Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-foreground/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-accent-coral" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Streaming Services</h2>
              <p className="text-sm text-muted-foreground">
                Connect your music accounts for full playback
              </p>
            </div>
          </div>

          <StreamingConnections apiBaseUrl={API_BASE} />
        </motion.section>

        {/* Account Section - Placeholder for future settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-foreground/10 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Username</p>
                <p className="text-sm text-muted-foreground">@{user?.username || 'unknown'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Account Type</p>
                <p className="text-sm text-muted-foreground capitalize">{user?.userType || 'Fan'}</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
