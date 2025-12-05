import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  Download, 
  DollarSign, 
  Users, 
  Calendar,
  Music,
  BarChart3,
  PieChart,
  Play,
  Heart
} from 'lucide-react';
import { motion } from 'motion/react';

interface TrackAnalyticsProps {
  tracks: any[];
}

export function TrackAnalytics({ tracks }: TrackAnalyticsProps) {
  // Calculate aggregate metrics
  const totalTracks = tracks.length;
  const totalDownloads = tracks.reduce((sum, track) => sum + track.downloadCount, 0);
  const totalRevenue = tracks.reduce((sum, track) => sum + track.revenue, 0);
  const avgPrice = tracks.length > 0 ? totalRevenue / totalDownloads || 0 : 0;

  // Sort tracks by performance
  const topPerformingTracks = [...tracks]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const mostDownloadedTracks = [...tracks]
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 5);

  // Calculate pricing insights
  const pricingBreakdown = tracks.reduce((acc, track) => {
    if (track.pricingType === 'fixed') {
      acc.fixed++;
    } else {
      acc.pwyw++;
    }
    return acc;
  }, { fixed: 0, pwyw: 0 });

  const formatBreakdown = tracks.reduce((acc, track) => {
    track.formats?.forEach(format => {
      acc[format] = (acc[format] || 0) + 1;
    });
    return acc;
  }, {});

  const genreBreakdown = tracks.reduce((acc, track) => {
    if (track.genre) {
      acc[track.genre] = (acc[track.genre] || 0) + 1;
    }
    return acc;
  }, {});

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-2">No track data available</p>
        <p className="text-sm text-muted-foreground">Upload some tracks to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tracks</p>
              <p className="text-2xl font-semibold">{totalTracks}</p>
            </div>
            <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-accent-coral" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Downloads</p>
              <p className="text-2xl font-semibold">{totalDownloads.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-accent-blue" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent-mint/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-mint" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Price</p>
              <p className="text-2xl font-semibold">${avgPrice.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-accent-yellow/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-yellow" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Tracks */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top Performing Tracks
        </h3>
        <div className="space-y-3">
          {topPerformingTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
            >
              <div className="w-12 h-12 bg-cover bg-center rounded flex-shrink-0"
                   style={{ backgroundImage: `url(${track.artwork})` }} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{track.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {track.downloadCount} downloads • {track.genre}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-accent-coral">${track.revenue.toFixed(2)}</p>
                <div className="flex items-center gap-1">
                  {track.pricingType === 'pwyw' && (
                    <Badge variant="secondary" className="text-xs">PWYW</Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Most Downloaded */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Most Downloaded
        </h3>
        <div className="space-y-3">
          {mostDownloadedTracks.map((track, index) => (
            <div key={track.id} className="flex items-center justify-between py-2 border-b border-foreground/10 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-muted-foreground w-6">#{index + 1}</span>
                <div className="w-8 h-8 bg-cover bg-center rounded"
                     style={{ backgroundImage: `url(${track.artwork})` }} />
                <div>
                  <p className="font-medium">{track.title}</p>
                  <p className="text-sm text-muted-foreground">{track.genre}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{track.downloadCount} downloads</p>
                <p className="text-sm text-muted-foreground">${track.revenue.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pricing Strategy */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Pricing Strategy
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Fixed Price</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-2 bg-accent-coral rounded"></div>
                <span className="text-sm font-medium">{pricingBreakdown.fixed}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pay What You Want</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-2 bg-accent-mint rounded"></div>
                <span className="text-sm font-medium">{pricingBreakdown.pwyw}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            {pricingBreakdown.pwyw > 0 && (
              <p>PWYW tracks often generate 15-30% higher average revenue per download</p>
            )}
          </div>
        </Card>

        {/* Format Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Format Usage</h3>
          <div className="space-y-2">
            {Object.entries(formatBreakdown).map(([format, count]) => (
              <div key={format} className="flex items-center justify-between text-sm">
                <span>{format.toUpperCase().replace('-', ' ')}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Genre Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Genre Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(genreBreakdown).slice(0, 5).map(([genre, count]) => (
              <div key={genre} className="flex items-center justify-between text-sm">
                <span>{genre}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Revenue Optimization */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-mint" />
              Revenue Optimization
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {pricingBreakdown.pwyw === 0 && (
                <p>• Consider trying "Pay What You Want" pricing on some tracks</p>
              )}
              {avgPrice < 2 && (
                <p>• Your average price is low - consider raising minimum PWYW prices</p>
              )}
              <p>• Tracks with multiple formats tend to perform better</p>
              <p>• Adding FLAC increases perceived value</p>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent-coral" />
              Fan Engagement
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Share purchase links in your social media</p>
              <p>• Offer limited-time PWYW specials</p>
              <p>• Bundle tracks as EPs for higher revenue</p>
              <p>• Add personal stories to track descriptions</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}