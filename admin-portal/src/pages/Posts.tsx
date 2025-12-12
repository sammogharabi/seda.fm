import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { moderationApi, Message } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// Posts page shows Messages since the backend has messages, not posts
export function PostsPage() {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['messages', offset, search],
    queryFn: () => moderationApi.listMessages({ limit, offset, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => moderationApi.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message deleted');
    },
    onError: () => {
      toast.error('Failed to delete message');
    },
  });

  const handleDelete = (message: Message) => {
    if (confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(message.id);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
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
          <CardTitle>All Messages ({data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : data?.messages?.length ? (
            <div className="space-y-3">
              {data.messages.map((message) => (
                <div key={message.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">{message.text}</p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        By{' '}
                        <span className="font-medium">
                          {message.user?.profile?.displayName || message.user?.profile?.username || message.user?.email || 'Unknown'}
                        </span>
                        {message.room && (
                          <>
                            {' in '}
                            <span className="font-medium">{message.room.name}</span>
                          </>
                        )}
                        {' • '}
                        {new Date(message.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(message)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No messages found</p>
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
    </div>
  );
}
