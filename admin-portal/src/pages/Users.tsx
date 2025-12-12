import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { moderationApi, User, UserDetails } from '@/lib/api';
import { toast } from 'sonner';
import {
  Search,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function UsersPage() {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const limit = 20;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', offset, search],
    queryFn: () => moderationApi.listUsers({ limit, offset, search: search || undefined }),
  });

  const { data: userDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['user-details', selectedUserId],
    queryFn: () => (selectedUserId ? moderationApi.getUserDetails(selectedUserId) : null),
    enabled: !!selectedUserId,
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      moderationApi.deactivateUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-details'] });
      toast.success('User deactivated');
    },
    onError: () => {
      toast.error('Failed to deactivate user');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => moderationApi.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-details'] });
      toast.success('User reactivated');
    },
    onError: () => {
      toast.error('Failed to reactivate user');
    },
  });

  const isDeactivated = (user: User | UserDetails) => {
    if (!user.mutedUntil) return false;
    return new Date(user.mutedUntil) > new Date();
  };

  const handleToggleStatus = (user: User | UserDetails, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isDeactivated(user)) {
      reactivateMutation.mutate(user.id);
    } else {
      deactivateMutation.mutate({ id: user.id, reason: 'Deactivated by admin' });
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const currentPage = Math.floor(offset / limit) + 1;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : data?.users?.length ? (
            <div className="space-y-3">
              {data.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {user.profile?.displayName || user.profile?.username || user.email}
                      </span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
                            ? 'bg-red-500/10 text-red-500'
                            : user.role === 'ARTIST'
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-blue-500/10 text-blue-500'
                        )}
                      >
                        {user.role}
                      </span>
                      {isDeactivated(user) && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Deactivated
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email} • @{user.profile?.username || 'no-username'} • Joined{' '}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant={isDeactivated(user) ? 'default' : 'destructive'}
                    size="sm"
                    onClick={(e) => handleToggleStatus(user, e)}
                    disabled={deactivateMutation.isPending || reactivateMutation.isPending}
                  >
                    {isDeactivated(user) ? (
                      <>
                        <UserCheck className="mr-1 h-4 w-4" />
                        Reactivate
                      </>
                    ) : (
                      <>
                        <UserX className="mr-1 h-4 w-4" />
                        Deactivate
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No users found</p>
          )}

          {data && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset((o) => Math.max(0, o - limit))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset((o) => o + limit)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {userDetails && (
                <>
                  <span>
                    {userDetails.profile?.displayName ||
                      userDetails.profile?.username ||
                      userDetails.email}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      userDetails.role === 'ADMIN' || userDetails.role === 'SUPER_ADMIN'
                        ? 'bg-red-500/10 text-red-500'
                        : userDetails.role === 'ARTIST'
                        ? 'bg-purple-500/10 text-purple-500'
                        : 'bg-blue-500/10 text-blue-500'
                    )}
                  >
                    {userDetails.role}
                  </span>
                  {isDeactivated(userDetails) && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      Deactivated
                    </span>
                  )}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-4 py-8">
              <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-40 animate-pulse rounded bg-muted" />
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span className="font-medium">{userDetails.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Username:</span>{' '}
                  <span className="font-medium">
                    @{userDetails.profile?.username || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Joined:</span>{' '}
                  <span className="font-medium">{formatDate(userDetails.createdAt)}</span>
                </div>
                {userDetails.artistProfile && (
                  <div>
                    <span className="text-muted-foreground">Artist:</span>{' '}
                    <span className="font-medium">
                      {userDetails.artistProfile.artistName}
                      {userDetails.artistProfile.verified && ' (Verified)'}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-5 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{userDetails._count.posts}</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{userDetails._count.comments}</div>
                  <div className="text-xs text-muted-foreground">Comments</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{userDetails._count.messages}</div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{userDetails._count.rooms}</div>
                  <div className="text-xs text-muted-foreground">Rooms</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{userDetails._count.purchases}</div>
                  <div className="text-xs text-muted-foreground">Purchases</div>
                </div>
              </div>

              {/* Tabs for history */}
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="posts" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Chat Messages
                  </TabsTrigger>
                  <TabsTrigger value="purchases" className="flex items-center gap-1">
                    <ShoppingBag className="h-4 w-4" />
                    Purchases
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-4 max-h-64 overflow-y-auto">
                  {userDetails.profile?.posts?.length ? (
                    <div className="space-y-2">
                      {userDetails.profile.posts.map((post) => (
                        <div
                          key={post.id}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="rounded bg-muted px-2 py-0.5 text-xs">
                              {post.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {post.content || '(No text content)'}
                          </p>
                          <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                            <span>{post._count.likes} likes</span>
                            <span>{post._count.comments} comments</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No posts found
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="mt-4 max-h-64 overflow-y-auto">
                  {userDetails.profile?.comments?.length ? (
                    <div className="space-y-2">
                      {userDetails.profile.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              On {comment.post.type} post
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="line-clamp-2">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No comments found
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="messages" className="mt-4 max-h-64 overflow-y-auto">
                  {userDetails.messages?.length ? (
                    <div className="space-y-2">
                      {userDetails.messages.map((message) => (
                        <div
                          key={message.id}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">
                              {message.room.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {message.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No chat messages found
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="purchases" className="mt-4 max-h-64 overflow-y-auto">
                  {userDetails.purchases?.length ? (
                    <div className="space-y-2">
                      {userDetails.purchases.map((purchase) => (
                        <div
                          key={purchase.id}
                          className="rounded-lg border p-3 text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">
                                {purchase.product.title}
                              </span>
                              <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">
                                {purchase.product.type}
                              </span>
                            </div>
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                purchase.status === 'COMPLETED'
                                  ? 'bg-green-500/10 text-green-500'
                                  : purchase.status === 'REFUNDED'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-yellow-500/10 text-yellow-500'
                              )}
                            >
                              {purchase.status}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>${(purchase.amount / 100).toFixed(2)}</span>
                            <span>{formatDate(purchase.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No purchases found
                    </p>
                  )}
                </TabsContent>
              </Tabs>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant={isDeactivated(userDetails) ? 'default' : 'destructive'}
                  onClick={() => handleToggleStatus(userDetails)}
                  disabled={deactivateMutation.isPending || reactivateMutation.isPending}
                >
                  {isDeactivated(userDetails) ? (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Reactivate User
                    </>
                  ) : (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Deactivate User
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
