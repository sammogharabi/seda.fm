import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  ShoppingBag,
  Ticket,
  Music,
  Plus,
  ExternalLink,
  Download,
  DollarSign,
  Shield,
  Clock,
  Edit3,
  Trash2,
  TrendingUp,
  Play,
  MoreVertical,
  Eye,
  Heart,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { MarketplaceRevenue } from './MarketplaceRevenue';
import { TrackUploadModal } from './TrackUploadModal';
import { TrackAnalytics } from './TrackAnalytics';
import { marketplaceApi, Product } from '../lib/api/marketplace';

// Helper to convert API Product to display format
const convertProductToDisplayItem = (product: Product) => ({
  id: product.id,
  title: product.title,
  description: product.description || '',
  price: `$${product.price.toFixed(2)}`,
  url: product.externalUrl || '',
  platform: product.externalPlatform || 'seda.fm',
  image: product.coverImage || '',
  date: product.publishedAt || product.createdAt,
  venue: '',
  city: '',
  formats: product.packContents?.formats || ['mp3-320'],
  copyrightConfirmed: true,
  status: product.status.toLowerCase(),
  genre: '',
  downloadCount: product.purchaseCount,
  revenue: product.purchaseCount * product.price,
  uploadDate: product.createdAt
});

interface ArtistMarketplaceProps {
  user: any;
  onUpdateUser?: (user: any) => void;
}

export function ArtistMarketplace({ user, onUpdateUser }: ArtistMarketplaceProps) {
  const [activeSection, setActiveSection] = useState('merch');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showTrackUpload, setShowTrackUpload] = useState(false);
  const [itemType, setItemType] = useState('merch');
  const [itemData, setItemData] = useState({
    title: '',
    description: '',
    price: '',
    url: '',
    platform: '',
    date: '',
    venue: '',
    city: '',
    formats: ['MP3 320kbps'],
    copyrightConfirmed: false
  });

  // State for items from API
  const [merchItems, setMerchItems] = useState<any[]>([]);
  const [concertItems, setConcertItems] = useState<any[]>([]);
  const [trackItems, setTrackItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const products = await marketplaceApi.getArtistProducts(user.id, true);

        // Categorize products by type
        const merch = products
          .filter(p => p.type === 'MERCHANDISE_LINK')
          .map(convertProductToDisplayItem);
        const concerts = products
          .filter(p => p.type === 'CONCERT_LINK')
          .map(convertProductToDisplayItem);
        const tracks = products
          .filter(p => p.type === 'DIGITAL_TRACK' || p.type === 'DIGITAL_ALBUM')
          .map(convertProductToDisplayItem);

        setMerchItems(merch);
        setConcertItems(concerts);
        setTrackItems(tracks);
      } catch (error) {
        console.error('[ArtistMarketplace] Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user?.id]);

  const handleAddItem = useCallback(() => {
    if (activeSection === 'tracks') {
      setShowTrackUpload(true);
    } else {
      setItemType(activeSection);
      setItemData({
        title: '',
        description: '',
        price: '',
        url: '',
        platform: '',
        date: '',
        venue: '',
        city: '',
        formats: ['MP3 320kbps'],
        copyrightConfirmed: false
      });
      setShowAddItem(true);
    }
  }, [activeSection]);

  const handleSaveItem = useCallback(() => {
    if (!itemData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const newItem = {
      id: Date.now(),
      ...itemData,
      status: itemType === 'tracks' ? 'published' : undefined
    };

    switch (itemType) {
      case 'merch':
        setMerchItems(prev => [newItem, ...prev]);
        break;
      case 'concerts':
        setConcertItems(prev => [newItem, ...prev]);
        break;
      case 'tracks':
        if (!itemData.copyrightConfirmed) {
          toast.error('Please confirm copyright ownership');
          return;
        }
        setTrackItems(prev => [newItem, ...prev]);
        break;
    }

    setShowAddItem(false);
    toast.success(`${itemType === 'merch' ? 'Merch item' : itemType === 'concerts' ? 'Concert' : 'Track'} added successfully!`);
  }, [itemData, itemType]);

  const handleRemoveItem = useCallback((id: number, type: string) => {
    switch (type) {
      case 'merch':
        setMerchItems(prev => prev.filter(item => item.id !== id));
        break;
      case 'concerts':
        setConcertItems(prev => prev.filter(item => item.id !== id));
        break;
      case 'tracks':
        setTrackItems(prev => prev.filter(item => item.id !== id));
        break;
    }
    toast.success('Item removed');
  }, []);

  const handleUploadTrack = useCallback((newTrack: any) => {
    setTrackItems(prev => [newTrack, ...prev]);
    setShowTrackUpload(false);
    toast.success('Track uploaded successfully!', {
      description: 'Your track is now available for purchase'
    });
  }, []);

  const renderMerchSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Merchandise</h3>
          <p className="text-sm text-muted-foreground">External links to your merch stores</p>
        </div>
        <Button onClick={handleAddItem} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {merchItems.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-foreground/20 rounded-lg">
          <ShoppingBag className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No merchandise listed</p>
          <p className="text-sm text-muted-foreground">Add links to your merch stores</p>
        </div>
      ) : (
        <div className="space-y-4">
          {merchItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-foreground/10 rounded-lg overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                {/* Product Image */}
                <div className="w-full sm:w-24 aspect-square bg-muted/50 relative rounded-lg overflow-hidden flex-shrink-0">
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id, 'merch')}
                    className="absolute top-1 right-1 text-white hover:text-destructive bg-black/50 hover:bg-black/70 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                {/* Product Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                      <span className="text-accent-coral font-medium">{item.price}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open(item.url, '_blank')}
                    className="w-full sm:w-auto"
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on {item.platform}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderConcertsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Concerts & Events</h3>
          <p className="text-sm text-muted-foreground">External links to ticket platforms</p>
        </div>
        <Button onClick={handleAddItem} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {concertItems.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-foreground/20 rounded-lg">
          <Ticket className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No events listed</p>
          <p className="text-sm text-muted-foreground">Add links to your ticket sales</p>
        </div>
      ) : (
        <div className="space-y-4">
          {concertItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-foreground/10 rounded-lg p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id, 'concerts')}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>{item.venue}</span>
                    <span>•</span>
                    <span>{item.city}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{item.platform}</Badge>
                      <span className="text-accent-coral font-medium">{item.price}</span>
                    </div>
                    <Button
                      onClick={() => window.open(item.url, '_blank')}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Buy Tickets
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTracksSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Direct Track Sales</h3>
          <p className="text-sm text-muted-foreground">Sell your music directly to fans</p>
        </div>
        <Button onClick={handleAddItem} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Upload Track
        </Button>
      </div>

      {trackItems.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-foreground/20 rounded-lg">
          <Music className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No tracks uploaded yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Start selling your music directly to fans with our secure platform
          </p>
          <div className="space-y-3 max-w-md mx-auto text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-accent-mint" />
                <span className="font-medium">Secure & Protected</span>
              </div>
              <p className="text-muted-foreground">DRM protection and watermarking included</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-accent-coral" />
                <span className="font-medium">100% Your Revenue</span>
              </div>
              <p className="text-muted-foreground">Keep all earnings minus payment fees</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trackItems.map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-foreground/10 rounded-lg overflow-hidden"
            >
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Track Artwork */}
                  <div className="w-16 h-16 bg-muted/50 rounded-lg overflow-hidden flex-shrink-0">
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${track.artwork})` }}
                    />
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1 mr-2">
                        <h4 className="font-medium truncate">{track.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{track.description}</p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-start gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(track.id, 'tracks')}
                          className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Track Stats */}
                    <div className="flex items-center gap-4 text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{track.downloadCount} downloads</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-accent-coral" />
                        <span className="text-accent-coral font-medium">${track.revenue.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Pricing Display */}
                      {track.pricingType === 'fixed' ? (
                        <Badge variant="secondary" className="text-xs">
                          Fixed: ${track.fixedPrice}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          PWYW: ${track.minimumPrice || '0'}+ (${track.suggestedPrice})
                        </Badge>
                      )}
                      
                      {/* Formats */}
                      <div className="flex gap-1">
                        {track.formats.slice(0, 2).map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format.toUpperCase().replace('-', ' ')}
                          </Badge>
                        ))}
                        {track.formats.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{track.formats.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>DRM Protected • Watermarked • 5 download limit</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <TrackUploadModal
        isOpen={showTrackUpload}
        onClose={() => setShowTrackUpload(false)}
        onUploadTrack={handleUploadTrack}
        user={user}
      />
    </div>
  );

  const renderAddItemModal = () => (
    <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
      <DialogContent className="max-w-md border border-foreground/10" aria-describedby="add-marketplace-item-description">
        <DialogHeader>
          <DialogTitle>
            Add {itemType === 'merch' ? 'Merchandise' : itemType === 'concerts' ? 'Event' : 'Track'}
          </DialogTitle>
          <DialogDescription id="add-marketplace-item-description">
            {itemType === 'merch' && 'Add a link to your merch store'}
            {itemType === 'concerts' && 'Add a link to ticket sales'}
            {itemType === 'tracks' && 'Upload a track for direct sale'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={itemData.title}
              onChange={(e) => setItemData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`${itemType === 'merch' ? 'Product' : itemType === 'concerts' ? 'Event' : 'Track'} name`}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={itemData.description}
              onChange={(e) => setItemData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description"
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label>Price</Label>
            <Input
              value={itemData.price}
              onChange={(e) => setItemData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="$25"
              className="mt-1"
            />
          </div>

          <div>
            <Label>External URL</Label>
            <Input
              value={itemData.url}
              onChange={(e) => setItemData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
              className="mt-1"
            />
          </div>

          <div>
            <Label>Platform</Label>
            <Select value={itemData.platform} onValueChange={(value) => setItemData(prev => ({ ...prev, platform: value }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose platform" />
              </SelectTrigger>
              <SelectContent>
                {itemType === 'merch' && (
                  <>
                    <SelectItem value="Bandcamp">Bandcamp</SelectItem>
                    <SelectItem value="Etsy">Etsy</SelectItem>
                    <SelectItem value="Big Cartel">Big Cartel</SelectItem>
                    <SelectItem value="Square">Square Store</SelectItem>
                  </>
                )}
                {itemType === 'concerts' && (
                  <>
                    <SelectItem value="Eventbrite">Eventbrite</SelectItem>
                    <SelectItem value="Ticketmaster">Ticketmaster</SelectItem>
                    <SelectItem value="StubHub">StubHub</SelectItem>
                    <SelectItem value="Facebook Events">Facebook Events</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {itemType === 'concerts' && (
            <>
              <div>
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={itemData.date}
                  onChange={(e) => setItemData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Venue</Label>
                <Input
                  value={itemData.venue}
                  onChange={(e) => setItemData(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="Venue name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  value={itemData.city}
                  onChange={(e) => setItemData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City, State"
                  className="mt-1"
                />
              </div>
            </>
          )}

          {itemType === 'tracks' && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 border border-foreground/10 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Copyright Confirmation</h4>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="copyright"
                    checked={itemData.copyrightConfirmed}
                    onChange={(e) => setItemData(prev => ({ ...prev, copyrightConfirmed: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <label htmlFor="copyright" className="text-sm text-muted-foreground">
                    I confirm that I own the copyright to this track or have proper licensing rights to sell it
                  </label>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Files will be automatically watermarked for anti-piracy</p>
                <p>• Download links expire after 5 uses for security</p>
                <p>• 100% revenue goes to you (minus payment processing fees)</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveItem} className="flex-1">
              Add {itemType === 'merch' ? 'Item' : itemType === 'concerts' ? 'Event' : 'Track'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddItem(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="artist-marketplace min-h-screen bg-background">
      <div className="max-w-screen-sm mx-auto px-4 py-6 space-y-6">
        
        {/* Section Navigation - Mobile Optimized */}
        <div className="border-b border-foreground/10">
          <div className="flex overflow-x-auto scrollbar-hide space-x-1 md:space-x-8 pb-4">
            {[
              { id: 'merch', label: 'Merch', icon: ShoppingBag },
              { id: 'concerts', label: 'Concerts', icon: Ticket },
              { id: 'tracks', label: 'Tracks', icon: Music },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'revenue', label: 'Revenue', icon: DollarSign }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-b-2 transition-colors whitespace-nowrap min-w-fit ${
                  activeSection === id
                    ? 'border-accent-coral text-foreground bg-accent-coral/10'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation'
                }}
                type="button"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm md:text-base">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Section Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-0"
        >
          {activeSection === 'merch' && renderMerchSection()}
          {activeSection === 'concerts' && renderConcertsSection()}
          {activeSection === 'tracks' && renderTracksSection()}
          {activeSection === 'analytics' && <TrackAnalytics tracks={trackItems} />}
          {activeSection === 'revenue' && <MarketplaceRevenue user={user} />}
        </motion.div>

        {/* Add Item Modal */}
        {renderAddItemModal()}
      </div>
    </div>
  );
}