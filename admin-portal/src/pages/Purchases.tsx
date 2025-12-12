import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { moderationApi, Purchase, PurchaseStatus } from '@/lib/api';
import { toast } from 'sonner';
import { RefreshCcw, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PurchasesPage() {
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | undefined>(undefined);
  const limit = 20;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', offset, statusFilter],
    queryFn: () => moderationApi.listPurchases({ limit, offset, status: statusFilter }),
  });

  const refundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      moderationApi.refundPurchase(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success('Refund issued successfully');
    },
    onError: () => {
      toast.error('Failed to issue refund');
    },
  });

  const handleRefund = (purchase: Purchase) => {
    const reason = prompt('Enter refund reason:');
    if (reason) {
      refundMutation.mutate({ id: purchase.id, reason });
    }
  };

  const statusColors: Record<PurchaseStatus, string> = {
    COMPLETED: 'bg-green-500/10 text-green-500',
    PENDING: 'bg-yellow-500/10 text-yellow-500',
    REFUNDED: 'bg-blue-500/10 text-blue-500',
    FAILED: 'bg-red-500/10 text-red-500',
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Purchases</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter || ''}
            onChange={(e) => {
              setStatusFilter((e.target.value as PurchaseStatus) || undefined);
              setOffset(0);
            }}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchases ({data?.total ?? 0})</CardTitle>
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
          ) : data?.purchases?.length ? (
            <div className="space-y-3">
              {data.purchases.map((purchase) => (
                <div key={purchase.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${purchase.amount.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">
                          {purchase.product?.type || 'Unknown'}
                        </span>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            statusColors[purchase.status] || 'bg-gray-500/10 text-gray-500'
                          )}
                        >
                          {purchase.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {purchase.product?.title || 'Unknown Product'}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Buyer:{' '}
                        <span className="font-medium">
                          {purchase.buyer?.profile?.displayName || purchase.buyer?.profile?.username || purchase.buyer?.email || 'Unknown'}
                        </span>
                        {' • '}
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {purchase.status === 'COMPLETED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefund(purchase)}
                        disabled={refundMutation.isPending}
                      >
                        <RefreshCcw className="mr-1 h-4 w-4" />
                        Refund
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No purchases found</p>
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
