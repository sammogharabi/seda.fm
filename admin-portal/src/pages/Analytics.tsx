import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsApi, TopItem } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export function AnalyticsPage() {
  const { data: userGrowth, isLoading: userGrowthLoading } = useQuery({
    queryKey: ['analytics-user-growth'],
    queryFn: () => analyticsApi.getUserGrowth(30),
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => analyticsApi.getRevenueTimeSeries(30),
  });

  const { data: topArtists, isLoading: topArtistsLoading } = useQuery({
    queryKey: ['analytics-top-artists'],
    queryFn: () => analyticsApi.getTopArtists(10),
  });

  // Helper to get metadata value safely
  const getMetadataValue = (artist: TopItem, key: string): string | number | undefined => {
    return artist.metadata?.[key] as string | number | undefined;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowthLoading ? (
              <div className="h-64 animate-pulse rounded bg-muted" />
            ) : userGrowth?.length ? (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="New Users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="h-64 animate-pulse rounded bg-muted" />
            ) : revenue?.length ? (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="value" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Artists */}
      <Card>
        <CardHeader>
          <CardTitle>Top Artists by Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {topArtistsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : topArtists?.length ? (
            <div className="space-y-2">
              {topArtists.map((artist, index) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-medium">{artist.name}</span>
                      {getMetadataValue(artist, 'verified') && (
                        <span className="ml-2 text-xs text-green-500">Verified</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{artist.count} sales</div>
                    <div className="text-xs text-muted-foreground">
                      {getMetadataValue(artist, 'products')} products
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
