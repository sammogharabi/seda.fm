import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { moderationApi, Room } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, ChevronLeft, ChevronRight, Users, MessageSquare, Search } from 'lucide-react';

export function RoomsPage() {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const limit = 20;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', offset, search],
    queryFn: () => moderationApi.listRooms({ limit, offset, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => moderationApi.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted');
    },
    onError: () => {
      toast.error('Failed to delete room');
    },
  });

  const handleDelete = (room: Room) => {
    if (confirm(`Are you sure you want to delete the room "${room.name}"?`)) {
      deleteMutation.mutate(room.id);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rooms</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
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
          <CardTitle>All Rooms ({data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-lg border p-4">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : data?.rooms?.length ? (
            <div className="space-y-3">
              {data.rooms.map((room) => (
                <div key={room.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{room.name}</span>
                        {room.genre && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {room.genre}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {room._count.memberships}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          {room._count.messages}
                        </span>
                      </div>
                      {room.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {room.description}
                        </p>
                      )}
                      <div className="mt-1 text-xs text-muted-foreground">
                        Created by{' '}
                        <span className="font-medium">
                          {room.creator?.profile?.displayName || room.creator?.profile?.username || room.creator?.email}
                        </span>
                        {' • '}
                        {new Date(room.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(room)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No rooms found</p>
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
