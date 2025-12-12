import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsApi } from '@/lib/api';
import { Users, DollarSign, TrendingUp, MessageSquare, Music, Home, Clock } from 'lucide-react';

export function DashboardPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: analyticsApi.getOverview,
  });

  const { data: verificationStats } = useQuery({
    queryKey: ['verification-stats'],
    queryFn: analyticsApi.getVerificationStats,
  });

  const stats = [
    {
      title: 'Total Users',
      value: overview?.users.total ?? '-',
      icon: Users,
      description: `+${overview?.users.thisWeek ?? 0} this week`,
      trend: overview?.users.growthToday,
    },
    {
      title: 'Artists',
      value: overview?.users.artists ?? '-',
      icon: Music,
      description: 'Registered artists',
    },
    {
      title: 'Total Purchases',
      value: overview?.revenue.totalPurchases ?? '-',
      icon: DollarSign,
      description: `${overview?.revenue.conversionRate ?? 0}% conversion`,
    },
    {
      title: 'Pending Verifications',
      value: verificationStats?.awaitingAdmin ?? '-',
      icon: Clock,
      description: `${verificationStats?.total ?? 0} total requests`,
    },
  ];

  const contentStats = [
    {
      title: 'Rooms',
      total: overview?.content.rooms.total ?? 0,
      today: overview?.content.rooms.today ?? 0,
      icon: Home,
    },
    {
      title: 'Playlists',
      total: overview?.content.playlists.total ?? 0,
      today: overview?.content.playlists.today ?? 0,
      icon: Music,
    },
    {
      title: 'Messages',
      total: overview?.content.messages.total ?? 0,
      today: overview?.content.messages.today ?? 0,
      icon: MessageSquare,
    },
    {
      title: 'Comments',
      total: overview?.content.comments.total ?? 0,
      today: overview?.content.comments.today ?? 0,
      icon: TrendingUp,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Main stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
                {stat.trend !== undefined && stat.trend !== 0 && (
                  <span className={stat.trend > 0 ? 'text-green-500' : 'text-red-500'}>
                    {' '}({stat.trend > 0 ? '+' : ''}{stat.trend}% today)
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {contentStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{stat.today} today
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Purchases</span>
                <span className="font-medium">{overview?.revenue.totalPurchases ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium text-green-500">{overview?.revenue.completedPurchases ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today</span>
                <span className="font-medium">{overview?.revenue.purchasesToday ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Conversion Rate</span>
                <span className="font-medium">{overview?.revenue.conversionRate ?? 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Awaiting Admin</span>
                <span className="font-medium text-yellow-500">{verificationStats?.awaitingAdmin ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">{verificationStats?.pending ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Approved</span>
                <span className="font-medium text-green-500">{verificationStats?.approved ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Denied</span>
                <span className="font-medium text-red-500">{verificationStats?.denied ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
