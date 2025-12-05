import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  Radio, 
  Music, 
  Users, 
  TrendingUp, 
  Bell, 
  MessageCircle,
  Home,
  Search,
  List,
  User,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

export function ArtistExperienceGuide() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <motion.div 
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">🎵 Artist Mobile Experience</h1>
        <p className="text-muted-foreground">Designed specifically for artists to manage their music career</p>
      </motion.div>

      {/* Navigation Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-accent-coral/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Radio className="w-5 h-5 text-accent-coral" />
              Bottom Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Fan Navigation */}
              <div className="space-y-2">
                <Badge variant="outline" className="w-full">Fan Experience</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-accent-blue" />
                    <span>Home Feed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-accent-blue" />
                    <span>Sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 bg-accent-coral text-background rounded-full p-0.5" />
                    <span>Create</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4 text-accent-blue" />
                    <span>Crates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-accent-blue" />
                    <span>Profile</span>
                  </div>
                </div>
              </div>

              {/* Artist Navigation */}
              <div className="space-y-2">
                <Badge className="w-full bg-accent-coral text-background">Artist Experience</Badge>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent-coral" />
                    <span>Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-accent-coral" />
                    <span>Live</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 bg-accent-coral text-background rounded-full p-0.5" />
                    <span>Create</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-accent-coral" />
                    <span>Content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent-coral" />
                    <span>Fans</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Header Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-accent-mint/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent-mint" />
              Header Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm">Quick Analytics Access</span>
              <TrendingUp className="w-4 h-4 text-accent-mint" />
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm">Live Session Indicator</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-accent-coral rounded-full animate-pulse"></div>
                <span className="text-xs text-accent-coral">LIVE</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <span className="text-sm">Notifications & Messages</span>
              <div className="flex gap-2">
                <Bell className="w-4 h-4 text-accent-yellow" />
                <MessageCircle className="w-4 h-4 text-accent-coral" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Views */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-accent-yellow/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-yellow" />
              Artist Dashboard Views
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="font-medium text-accent-coral">Dashboard</div>
              <div className="text-sm text-muted-foreground">
                Overview stats, quick actions, recent activity, upcoming events
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-accent-blue">Analytics</div>
              <div className="text-sm text-muted-foreground">
                Track performance, audience insights, live session metrics
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-accent-mint">Content Manager</div>
              <div className="text-sm text-muted-foreground">
                Upload tracks, manage crates, content performance
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-accent-yellow">Fan Community</div>
              <div className="text-sm text-muted-foreground">
                Top fans, recent interactions, fan engagement tools
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Design Philosophy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="text-lg">🎨 Design Philosophy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="font-medium">Artist-First Interface</div>
              <div className="text-sm text-muted-foreground">
                Prioritizes tools artists need most: analytics, content management, fan engagement
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Underground Aesthetic</div>
              <div className="text-sm text-muted-foreground">
                Clean, minimal design that focuses on content over corporate UI patterns
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Mobile-Optimized</div>
              <div className="text-sm text-muted-foreground">
                Touch-friendly controls, optimized for on-the-go music career management
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Try It Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <div className="p-4 bg-accent-coral/10 rounded-lg border border-accent-coral/20">
          <div className="font-medium text-accent-coral mb-2">Ready to explore?</div>
          <div className="text-sm text-muted-foreground">
            Use the switcher in the top-right to toggle between fan and artist experiences!
          </div>
        </div>
      </motion.div>

      {/* Bottom Spacing for Mobile Navigation */}
      <div className="h-20"></div>
    </div>
  );
}