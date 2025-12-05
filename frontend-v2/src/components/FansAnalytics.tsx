import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Heart,
  MessageCircle,
  Globe,
  Crown,
  Star
} from 'lucide-react';

interface FansAnalyticsProps {
  fansList: any[];
  className?: string;
}

export function FansAnalytics({ fansList, className = '' }: FansAnalyticsProps) {
  if (!fansList || fansList.length === 0) {
    return null;
  }

  // Calculate analytics
  const totalFans = fansList.length;
  const mutualConnections = fansList.filter(f => f.isFollowedByCurrentUser).length;
  const artistFans = fansList.filter(f => f.isArtist).length;
  const verifiedFans = fansList.filter(f => f.verified).length;
  const recentFollowers = fansList.filter(f => 
    new Date(f.followDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  
  // Top countries (mock data for demo)
  const topCountries = [
    { name: 'United States', count: Math.floor(totalFans * 0.4), flag: '🇺🇸' },
    { name: 'United Kingdom', count: Math.floor(totalFans * 0.2), flag: '🇬🇧' },
    { name: 'Canada', count: Math.floor(totalFans * 0.15), flag: '🇨🇦' },
    { name: 'Germany', count: Math.floor(totalFans * 0.1), flag: '🇩🇪' },
    { name: 'Australia', count: Math.floor(totalFans * 0.08), flag: '🇦🇺' }
  ].filter(country => country.count > 0);

  // Activity insights
  const avgActivityScore = Math.round(
    fansList.reduce((sum, fan) => sum + (fan.activityScore || 0), 0) / totalFans
  );

  const analyticsData = [
    {
      label: 'Total Fans',
      value: totalFans,
      icon: <Users className="w-5 h-5" />,
      color: 'text-accent-coral',
      bgColor: 'bg-accent-coral/10'
    },
    {
      label: 'Mutual Connections',
      value: mutualConnections,
      icon: <Heart className="w-5 h-5" />,
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue/10'
    },
    {
      label: 'Artist Fans',
      value: artistFans,
      icon: <Crown className="w-5 h-5" />,
      color: 'text-accent-mint',
      bgColor: 'bg-accent-mint/10'
    },
    {
      label: 'This Week',
      value: recentFollowers,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-accent-yellow',
      bgColor: 'bg-accent-yellow/10'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {analyticsData.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${item.bgColor} border-foreground/10`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={item.color}>{item.icon}</div>
              <span className={`text-2xl font-black ${item.color}`}>
                {item.value}
              </span>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-mono">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card className="border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-accent-coral" />
              <h4 className="font-black text-sm">Top Locations</h4>
            </div>
            <div className="space-y-2">
              {topCountries.slice(0, 3).map((country, index) => (
                <div key={country.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span className="truncate">{country.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {country.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement Insights */}
        <Card className="border-foreground/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-accent-mint" />
              <h4 className="font-black text-sm">Engagement</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Avg. Activity Score</span>
                <Badge className="bg-accent-mint/20 text-accent-mint border-accent-mint/30">
                  {avgActivityScore}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Verified Fans</span>
                <Badge className="bg-accent-blue/20 text-accent-blue border-accent-blue/30">
                  {verifiedFans}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Growth Rate</span>
                <Badge className="bg-accent-coral/20 text-accent-coral border-accent-coral/30">
                  +{Math.round((recentFollowers / totalFans) * 100)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fan Quality Indicators */}
      <Card className="border-foreground/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-accent-yellow" />
            <h4 className="font-black text-sm">Fan Quality Metrics</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-black text-accent-coral">
                {Math.round((mutualConnections / totalFans) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Mutual Rate
              </p>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-accent-blue">
                {Math.round((verifiedFans / totalFans) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Verified Rate
              </p>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-accent-mint">
                {Math.round((artistFans / totalFans) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Artist Rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}