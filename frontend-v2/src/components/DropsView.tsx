import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Plus,
  Clock,
  Zap,
  Calendar,
  Users,
  Lock,
  Eye,
  ShoppingBag,
  MoreVertical,
  ArrowLeft,
  Trash2,
  Edit3,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { dropsApi, Drop, DropStatus } from '../lib/api/drops';
import { CreateDropModal } from './CreateDropModal';
import { DropCard } from './DropCard';

interface DropsViewProps {
  user: any;
  onBack?: () => void;
  onViewDrop?: (drop: Drop) => void;
}

export function DropsView({ user, onBack, onViewDrop }: DropsViewProps) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'scheduled' | 'draft'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load drops on mount and tab change
  useEffect(() => {
    loadDrops();
  }, [activeTab]);

  const loadDrops = useCallback(async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? undefined : activeTab.toUpperCase() as DropStatus;
      const data = await dropsApi.getMyDrops(statusFilter);
      setDrops(data);
    } catch (error) {
      console.error('Failed to load drops:', error);
      toast.error('Failed to load drops');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const handleCreateDrop = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleDropCreated = useCallback((newDrop: Drop) => {
    setDrops(prev => [newDrop, ...prev]);
    setShowCreateModal(false);
    toast.success('Drop created');
  }, []);

  const handleDeleteDrop = useCallback(async (dropId: string) => {
    try {
      await dropsApi.deleteDrop(dropId);
      setDrops(prev => prev.filter(d => d.id !== dropId));
      toast.success('Drop deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete drop');
    }
  }, []);

  const handlePublishDrop = useCallback(async (dropId: string) => {
    try {
      const updatedDrop = await dropsApi.publishDrop(dropId);
      setDrops(prev => prev.map(d => d.id === dropId ? updatedDrop : d));
      toast.success('Drop published');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish drop');
    }
  }, []);

  const handleCancelDrop = useCallback(async (dropId: string) => {
    try {
      await dropsApi.cancelDrop(dropId);
      setDrops(prev => prev.map(d => d.id === dropId ? { ...d, status: 'CANCELLED' as DropStatus } : d));
      toast.success('Drop cancelled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel drop');
    }
  }, []);

  // Filter drops based on tab
  const filteredDrops = drops.filter(drop => {
    if (activeTab === 'all') return true;
    if (activeTab === 'live') return drop.status === 'LIVE';
    if (activeTab === 'scheduled') return drop.status === 'SCHEDULED';
    if (activeTab === 'draft') return drop.status === 'DRAFT';
    return true;
  });

  const getStatusBadge = (status: DropStatus) => {
    switch (status) {
      case 'LIVE':
        return <Badge className="bg-accent-mint text-background">Live</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-accent-blue text-background">Scheduled</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>;
      case 'ENDED':
        return <Badge variant="outline">Ended</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Empty state component with specific microcopy for each tab
  const EmptyState = () => {
    const getEmptyStateContent = () => {
      switch (activeTab) {
        case 'live':
          return {
            icon: <Zap className="w-8 h-8 text-accent-mint" />,
            title: "No live drops right now",
            description: "When you publish a drop, it'll appear here. Drops create urgency with countdown timers and exclusive access.",
            buttonText: "Create a drop to go live"
          };
        case 'scheduled':
          return {
            icon: <Calendar className="w-8 h-8 text-accent-blue" />,
            title: "No scheduled drops",
            description: "Plan ahead by scheduling drops for the perfect moment. Your fans will see a countdown to build anticipation.",
            buttonText: "Schedule your next drop"
          };
        case 'draft':
          return {
            icon: <Edit3 className="w-8 h-8 text-muted-foreground" />,
            title: "No drafts",
            description: "Drafts let you prepare drops before they go live. Start creating and publish when you're ready.",
            buttonText: "Start a new draft"
          };
        default:
          return {
            icon: <Zap className="w-8 h-8 text-accent-coral" />,
            title: "Create your first drop",
            description: "Drops are time-limited releases that create urgency. Add countdown timers, exclusive access for scene members, and watch engagement soar.",
            buttonText: "Create your first drop"
          };
      }
    };

    const content = getEmptyStateContent();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {content.icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {content.description}
        </p>
        <Button onClick={handleCreateDrop} className="gap-2">
          <Plus size={16} />
          {content.buttonText}
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold">Drops</h1>
            <p className="text-sm text-muted-foreground">
              Time-limited releases for your fans
            </p>
          </div>
        </div>
        <Button onClick={handleCreateDrop} className="gap-2">
          <Plus size={16} />
          New Drop
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <div className="px-4 border-b border-border">
          <TabsList className="h-12">
            <TabsTrigger value="all" className="gap-2">
              All
              {drops.length > 0 && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{drops.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2">
              <Zap size={14} />
              Live
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="gap-2">
              <Calendar size={14} />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-2">
              <Edit3 size={14} />
              Drafts
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
            </div>
          ) : filteredDrops.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDrops.map((drop, index) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DropCard
                    drop={drop}
                    isOwner
                    onView={() => {
                      console.log('[DropsView] Card clicked, drop:', drop);
                      onViewDrop?.(drop);
                    }}
                    onEdit={() => {/* TODO: Edit modal */}}
                    onPublish={() => handlePublishDrop(drop.id)}
                    onCancel={() => handleCancelDrop(drop.id)}
                    onDelete={() => handleDeleteDrop(drop.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Create Drop Modal */}
      <CreateDropModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreated={handleDropCreated}
        artistId={user?.id}
      />
    </div>
  );
}
