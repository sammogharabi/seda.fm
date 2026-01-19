import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Clock,
  Lock,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Heart,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { dropsApi, Drop, CreateDropData, DropGatingType } from '../lib/api/drops';
import { marketplaceApi, Product } from '../lib/api/marketplace';

interface CreateDropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (drop: Drop) => void;
  artistId: string;
}

export function CreateDropModal({
  open,
  onOpenChange,
  onCreated,
  artistId,
}: CreateDropModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'items' | 'timing'>('details');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [gatingType, setGatingType] = useState<DropGatingType>('PUBLIC');
  const [roomId, setRoomId] = useState('');
  const [earlyAccessDays, setEarlyAccessDays] = useState(1);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [showCountdown, setShowCountdown] = useState(true);
  const [showOnArtistPage, setShowOnArtistPage] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [customPrices, setCustomPrices] = useState<Record<string, number | undefined>>({});

  // Products for selection
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load products when modal opens
  useEffect(() => {
    if (open && artistId) {
      loadProducts();
    }
  }, [open, artistId]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await marketplaceApi.getArtistProducts(artistId, true);
      setProducts(data.filter(p => p.status === 'PUBLISHED'));
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setStep('details');
    setTitle('');
    setDescription('');
    setGatingType('PUBLIC');
    setRoomId('');
    setEarlyAccessDays(1);
    setStartsAt('');
    setEndsAt('');
    setShowCountdown(true);
    setShowOnArtistPage(true);
    setSelectedProducts([]);
    setCustomPrices({});
    onOpenChange(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    try {
      setLoading(true);

      const data: CreateDropData = {
        title: title.trim(),
        description: description.trim() || undefined,
        gatingType,
        roomId: gatingType === 'ROOM_ONLY' ? roomId : undefined,
        earlyAccessDays: gatingType === 'FOLLOWERS_EARLY_ACCESS' ? earlyAccessDays : undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        showCountdown,
        showOnArtistPage,
        items: selectedProducts.map((productId, index) => ({
          productId,
          provider: 'native',
          sortOrder: index,
          customPrice: customPrices[productId],
        })),
      };

      const newDrop = await dropsApi.createDrop(data);
      onCreated(newDrop);
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create drop');
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Helper component for tooltips
  const InfoTooltip = ({ content }: { content: React.ReactNode }) => (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle size={14} className="text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="top" sideOffset={5}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Label htmlFor="title">Title *</Label>
          <InfoTooltip
            content={
              <p>
                Make it catchy and descriptive. This is what fans will see first when your drop appears on your page.
              </p>
            }
          />
        </div>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summer Collection Drop"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Exclusive limited edition items..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Label>Access</Label>
          <InfoTooltip
            content={
              <p>
                <strong>Public:</strong> Anyone can view and purchase<br />
                <strong>Room Only:</strong> Only room members can access<br />
                <strong>Followers Only:</strong> Only your followers can access<br />
                <strong>Followers Early Access:</strong> Followers get early access
              </p>
            }
          />
        </div>
        <Select value={gatingType} onValueChange={(v) => setGatingType(v as DropGatingType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLIC">
              <div className="flex items-center gap-2">
                <Globe size={14} />
                Public - Everyone can access
              </div>
            </SelectItem>
            <SelectItem value="ROOM_ONLY">
              <div className="flex items-center gap-2">
                <Lock size={14} />
                Room Only - Room members only
              </div>
            </SelectItem>
            <SelectItem value="FOLLOWERS_ONLY">
              <div className="flex items-center gap-2">
                <Heart size={14} />
                Followers Only - Your followers only
              </div>
            </SelectItem>
            <SelectItem value="FOLLOWERS_EARLY_ACCESS">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                Followers Early Access - Followers get first look
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {gatingType === 'FOLLOWERS_EARLY_ACCESS' && (
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="earlyAccess">Early Access (days before public)</Label>
            <InfoTooltip
              content={
                <p>
                  How many days before public access should your followers get exclusive access? This creates urgency and rewards your most loyal fans.
                </p>
              }
            />
          </div>
          <Input
            id="earlyAccess"
            type="number"
            value={earlyAccessDays}
            onChange={(e) => setEarlyAccessDays(parseInt(e.target.value) || 1)}
            min={1}
            max={30}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            1-30 days recommended
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={() => setStep('items')}>
          Next: Select Items
        </Button>
      </div>
    </div>
  );

  const renderItemsStep = () => (
    <div className="space-y-4">
      <div>
        <Label>Select Products for This Drop</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Choose which products to include in this drop
        </p>

        {loadingProducts ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No published products found.</p>
            <p className="text-sm mt-1">Create some products in your store first.</p>
          </div>
        ) : (
          <div className="grid gap-2 max-h-[300px] overflow-auto">
            {products.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              return (
                <div key={product.id} className="space-y-2">
                  <div
                    onClick={() => toggleProduct(product.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-foreground/50'
                    }`}
                  >
                    <div className="w-12 h-12 rounded bg-muted flex-shrink-0">
                      {product.coverImage ? (
                        <img
                          src={product.coverImage}
                          alt={product.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={16} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Original: ${product.price}
                        {customPrices[product.id] !== undefined && (
                          <span className="ml-2 text-accent-mint">
                            → Drop price: ${customPrices[product.id]}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-foreground bg-foreground'
                        : 'border-muted-foreground'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-background" />
                      )}
                    </div>
                  </div>
                  {/* Custom price input when selected */}
                  {isSelected && (
                    <div className="ml-4 flex items-center gap-2">
                      <DollarSign size={14} className="text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={`Drop price (default: $${product.price})`}
                        value={customPrices[product.id] ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomPrices(prev => ({
                            ...prev,
                            [product.id]: value ? parseFloat(value) : undefined,
                          }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Leave empty for original price
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-2">
          {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setStep('details')}>
          Back
        </Button>
        <Button onClick={() => setStep('timing')} disabled={selectedProducts.length === 0}>
          Next: Set Timing
        </Button>
      </div>
    </div>
  );

  const renderTimingStep = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Label htmlFor="startsAt">Start Date & Time</Label>
          <InfoTooltip
            content={
              <p>
                Schedule your drop for maximum impact. Consider when your fans are most active—evening drops often perform best.
              </p>
            }
          />
        </div>
        <Input
          id="startsAt"
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave empty to start immediately when published
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <Label htmlFor="endsAt">End Date & Time</Label>
          <InfoTooltip
            content={
              <p>
                Limited-time drops create urgency. 24-48 hour windows tend to drive the most engagement. Leave empty for an ongoing drop.
              </p>
            }
          />
        </div>
        <Input
          id="endsAt"
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Leave empty for no end time
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Label htmlFor="countdown">Show Countdown Timer</Label>
            <InfoTooltip
              content={
                <p>
                  Countdown timers create excitement and FOMO. Fans are more likely to act when they see time ticking away.
                </p>
              }
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Display a live countdown on the drop page
          </p>
        </div>
        <Switch
          id="countdown"
          checked={showCountdown}
          onCheckedChange={setShowCountdown}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="showOnPage">Show on Artist Page</Label>
          <p className="text-sm text-muted-foreground">
            Display this drop on your public profile
          </p>
        </div>
        <Switch
          id="showOnPage"
          checked={showOnArtistPage}
          onCheckedChange={setShowOnArtistPage}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setStep('items')}>
          Back
        </Button>
        <Button onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create Drop'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg overflow-visible">
        <DialogHeader>
          <DialogTitle>
            {step === 'details' && 'Create a Drop'}
            {step === 'items' && 'Select Products'}
            {step === 'timing' && 'Set Timing'}
          </DialogTitle>
          <DialogDescription>
            {step === 'details' && 'Set up your time-limited release'}
            {step === 'items' && 'Choose which products to include'}
            {step === 'timing' && 'Configure when your drop goes live'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-4">
          {['details', 'items', 'timing'].map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full ${
                ['details', 'items', 'timing'].indexOf(step) >= i
                  ? 'bg-foreground'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 'details' && renderDetailsStep()}
        {step === 'items' && renderItemsStep()}
        {step === 'timing' && renderTimingStep()}
      </DialogContent>
    </Dialog>
  );
}
