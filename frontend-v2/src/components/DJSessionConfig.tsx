import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  Settings, 
  Users, 
  Clock, 
  Music, 
  Shield, 
  Crown,
  Zap,
  Radio
} from 'lucide-react';

const DJ_SESSION_LIMITS = {
  free: {
    maxListeners: 50,
    maxQueueSize: 20,
    maxTrackDuration: 600, // 10 minutes
    canSetPrivate: false,
    canModerate: false
  },
  premium: {
    maxListeners: 200,
    maxQueueSize: 100,
    maxTrackDuration: 1200, // 20 minutes
    canSetPrivate: true,
    canModerate: true
  },
  artist: {
    maxListeners: 1000,
    maxQueueSize: 500,
    maxTrackDuration: 1800, // 30 minutes
    canSetPrivate: true,
    canModerate: true
  }
};

export function DJSessionConfig({ user, isOpen, onClose, onStart, room }) {
  const [config, setConfig] = useState({
    queuePermissions: 'anyone', // 'host-only', 'followers', 'anyone'
    maxListeners: DJ_SESSION_LIMITS[user.tier || 'free'].maxListeners,
    autoSkipThreshold: 50, // percentage of listeners needed to skip
    trackCooldown: 300, // 5 minutes between same user additions
    isPrivate: false,
    moderationEnabled: false,
    chatEnabled: true,
    voteSkipEnabled: true
  });

  const userLimits = DJ_SESSION_LIMITS[user.tier || 'free'];

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleStartSession = () => {
    onStart(config);
    onClose();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ring/10 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-ring" />
            </div>
            <div>
              <h2>DJ Session Settings</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Configure your live session for {room}
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Tier Info */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-ring" />
                <span className="font-medium">Your Plan: {user.tier || 'Free'}</span>
              </div>
              <Badge variant={user.tier === 'free' ? 'secondary' : 'default'}>
                {user.tier === 'artist' && <Zap className="w-3 h-3 mr-1" />}
                {(user.tier || 'free').toUpperCase()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Max Listeners:</span>
                <span className="ml-2 font-medium">{userLimits.maxListeners}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Queue Size:</span>
                <span className="ml-2 font-medium">{userLimits.maxQueueSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Track Length:</span>
                <span className="ml-2 font-medium">{formatDuration(userLimits.maxTrackDuration)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Moderation:</span>
                <span className="ml-2 font-medium">{userLimits.canModerate ? 'Available' : 'Unavailable'}</span>
              </div>
            </div>
          </div>

          {/* Queue Permissions */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Who can add tracks to queue?
            </Label>
            <Select 
              value={config.queuePermissions} 
              onValueChange={(value) => handleConfigChange('queuePermissions', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="host-only">Host only</SelectItem>
                <SelectItem value="followers">Followers only</SelectItem>
                <SelectItem value="anyone">Anyone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Auto-skip Threshold */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Auto-skip threshold: {config.autoSkipThreshold}% of listeners
            </Label>
            <Select 
              value={config.autoSkipThreshold.toString()} 
              onValueChange={(value) => handleConfigChange('autoSkipThreshold', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30% (Lenient)</SelectItem>
                <SelectItem value="50">50% (Balanced)</SelectItem>
                <SelectItem value="70">70% (Strict)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Track Cooldown */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Cooldown between user submissions
            </Label>
            <Select 
              value={config.trackCooldown.toString()} 
              onValueChange={(value) => handleConfigChange('trackCooldown', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No cooldown</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="600">10 minutes</SelectItem>
                <SelectItem value="900">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Session Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Private Session
                </Label>
                <p className="text-sm text-muted-foreground">Only people you invite can join</p>
              </div>
              <Switch
                checked={config.isPrivate}
                onCheckedChange={(value) => handleConfigChange('isPrivate', value)}
                disabled={!userLimits.canSetPrivate}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Chat Enabled</Label>
                <p className="text-sm text-muted-foreground">Allow listeners to chat during session</p>
              </div>
              <Switch
                checked={config.chatEnabled}
                onCheckedChange={(value) => handleConfigChange('chatEnabled', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Vote Skip Enabled</Label>
                <p className="text-sm text-muted-foreground">Allow listeners to vote to skip tracks</p>
              </div>
              <Switch
                checked={config.voteSkipEnabled}
                onCheckedChange={(value) => handleConfigChange('voteSkipEnabled', value)}
              />
            </div>

            {userLimits.canModerate && (
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Moderation</Label>
                  <p className="text-sm text-muted-foreground">Automatically filter inappropriate content</p>
                </div>
                <Switch
                  checked={config.moderationEnabled}
                  onCheckedChange={(value) => handleConfigChange('moderationEnabled', value)}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              className="flex-1 bg-ring text-white hover:bg-ring/90"
            >
              <Radio className="w-4 h-4 mr-2" />
              Start DJ Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}