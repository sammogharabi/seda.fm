import React, { useState, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ShoppingBag,
  Ticket,
  Music,
  ExternalLink,
  DollarSign,
  Shield,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Zap,
  Timer
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { TrackPurchaseModal } from './TrackPurchaseModal';
import { dropsApi, Drop } from '../lib/api/drops';
import { DropCard } from './DropCard';
import { DropDetailView } from './DropDetailView';
import { marketplaceApi } from '../lib/api/marketplace';

// Mock data - same as artist view but from fan perspective
const MOCK_ARTIST_ITEMS = {
  merch: [
    {
      id: 1,
      title: 'Underground Vibes T-Shirt',
      price: '$25',
      description: 'Premium cotton tee with original artwork',
      url: 'https://artist.bandcamp.com/merch/tshirt',
      platform: 'Bandcamp',
      image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=300&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Limited Edition Vinyl',
      price: '$35',
      description: 'First pressing of debut album - only 100 copies',
      url: 'https://artist.bandcamp.com/album/debut',
      platform: 'Bandcamp',
      image: 'https://images.unsplash.com/photo-1629426958038-a4cb6e3830a0?w=300&h=300&fit=crop'
    }
  ],
  concerts: [
    {
      id: 1,
      title: 'Underground Sessions Vol. 3',
      date: '2024-12-15',
      venue: 'The Basement NYC',
      price: '$15',
      description: 'Intimate electronic set with live visuals',
      url: 'https://eventbrite.com/underground-sessions',
      platform: 'Eventbrite'
    },
    {
      id: 2,
      title: 'Brooklyn Music Festival',
      date: '2025-01-20',
      venue: 'Prospect Park',
      price: '$35',
      description: 'Outdoor festival featuring local electronic artists',
      url: 'https://ticketmaster.com/brooklyn-music-fest',
      platform: 'Ticketmaster'
    }
  ],
  tracks: [
    {
      id: 1,
      title: 'Digital Dreams',
      description: 'Deep house track with ambient elements',
      price: '$3.00',
      duration: '4:23',
      formats: ['MP3', 'FLAC'],
      artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
      pricingType: 'fixed',
      fixedPrice: '$3.00'
    },
    {
      id: 2,
      title: 'Neon Nights',
      description: 'Synthwave journey through digital landscapes',
      price: 'Pay What You Want',
      duration: '5:47',
      formats: ['MP3', 'WAV'],
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
      pricingType: 'pwyw',
      minimumPrice: '$1.00'
    },
    {
      id: 3,
      title: 'Underground Vibes',
      description: 'Raw electronic beats from the underground',
      price: '$2.50',
      duration: '3:56',
      formats: ['MP3', 'FLAC', 'WAV'],
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      pricingType: 'fixed',
      fixedPrice: '$2.50'
    },
    {
      id: 4,
      title: 'Bassline Revolution',
      description: 'Heavy bass experimental track',
      price: 'Pay What You Want',
      duration: '6:12',
      formats: ['MP3', 'FLAC'],
      artwork: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=300&h=300&fit=crop',
      pricingType: 'pwyw',
      minimumPrice: '$2.00'
    }
  ]
};

interface FanMarketplaceViewProps {
  artist: any;
  currentUser: any;
  onBack?: () => void;
  onNowPlaying?: (track: any) => void;
}

export function FanMarketplaceView({ artist, currentUser, onBack, onNowPlaying }: FanMarketplaceViewProps) {
  const [activeSection, setActiveSection] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loadingDrops, setLoadingDrops] = useState(false);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const [fullDropData, setFullDropData] = useState<Drop | null>(null);
  const [selectedDropProduct, setSelectedDropProduct] = useState<{product: any; customPrice?: number} | null>(null);
  const [showDropPurchaseModal, setShowDropPurchaseModal] = useState(false);

  // Fetch drops for this artist
  useEffect(() => {
    const fetchDrops = async () => {
      if (!artist?.id) return;

      try {
        setLoadingDrops(true);
        const artistDrops = await dropsApi.getArtistDrops(artist.id);
        // Only show live drops that are set to show on artist page
        const visibleDrops = artistDrops.filter(
          (drop) => drop.status === 'LIVE' && drop.showOnArtistPage
        );
        setDrops(visibleDrops);
      } catch (error) {
        console.error('Failed to load drops:', error);
      } finally {
        setLoadingDrops(false);
      }
    };

    fetchDrops();
  }, [artist?.id]);

  // Fetch full drop data when a drop is selected
  useEffect(() => {
    const fetchFullDrop = async () => {
      if (!selectedDropId) {
        setFullDropData(null);
        return;
      }

      try {
        const dropData = await dropsApi.getDrop(selectedDropId);
        setFullDropData(dropData);
      } catch (error) {
        console.error('Failed to load full drop data:', error);
      }
    };

    fetchFullDrop();
  }, [selectedDropId]);

  const handlePurchaseTrack = useCallback((track: any) => {
    setSelectedTrack(track);
    setShowPurchaseModal(true);
  }, []);

  const handlePurchaseComplete = useCallback((purchaseData: any) => {
    toast.success('Purchase successful!', {
      description: `"${purchaseData.trackTitle}" is now in your library`,
      duration: 4000
    });
    setShowPurchaseModal(false);
    setSelectedTrack(null);
  }, []);

  const handleExternalLink = useCallback((url: string, platform: string) => {
    window.open(url, '_blank');
    toast.success(`Opening ${platform}...`);
  }, []);

  // Handle purchase from drop detail view
  const handleDropPurchase = useCallback(async (productId: string) => {
    if (!fullDropData) return;

    // Find the item in the drop that matches this product
    const dropItem = fullDropData.items?.find((item: any) => item.product?.id === productId);

    if (dropItem?.product) {
      setSelectedDropProduct({
        product: dropItem.product,
        customPrice: dropItem.customPrice,
      });
      setShowDropPurchaseModal(true);
    } else {
      // If product not found in cached drop, fetch it
      try {
        const product = await marketplaceApi.getProduct(productId);
        setSelectedDropProduct({ product });
        setShowDropPurchaseModal(true);
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product details');
      }
    }
  }, [fullDropData]);

  const handleDropPurchaseComplete = useCallback((purchaseData: any) => {
    toast.success('Purchase successful!', {
      description: `"${purchaseData.trackTitle}" is now in your library`,
      duration: 4000
    });
    setShowDropPurchaseModal(false);
    setSelectedDropProduct(null);
  }, []);

  const handlePlayTrack = useCallback((track: any) => {
    if (onNowPlaying) {
      const trackData = {
        ...track,
        artist: artist.displayName || artist.username,
        artistId: artist.id
      };
      onNowPlaying(trackData);
      toast.success(`Now playing: ${track.title}`);
    }
  }, [artist, onNowPlaying]);

  const renderAllItems = () => (
    <div className="space-y-8">
      {/* Active Drops */}
      {drops.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-accent-coral" />
            <h3 className="text-lg font-medium">Limited Drops</h3>
            <Badge className="bg-accent-coral/20 text-accent-coral border-accent-coral/30">
              {drops.length} Active
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                onView={() => setSelectedDropId(drop.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Concerts */}
      {MOCK_ARTIST_ITEMS.concerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="w-5 h-5 text-accent-blue" />
            <h3 className="text-lg font-medium">Upcoming Shows</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_ARTIST_ITEMS.concerts.slice(0, 2).map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-foreground/10 rounded-lg p-4 space-y-3"
              >
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{event.venue}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-accent-coral font-medium">{event.price}</span>
                  <Button
                    onClick={() => handleExternalLink(event.url, event.platform)}
                    size="sm"
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    Get Tickets
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tracks */}
      {MOCK_ARTIST_ITEMS.tracks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-accent-mint" />
            <h3 className="text-lg font-medium">Music</h3>
          </div>
          <div className="space-y-3">
            {MOCK_ARTIST_ITEMS.tracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-foreground/10 rounded-lg overflow-hidden hover:border-accent-mint/50 transition-colors group"
              >
                <div className="flex">
                  <div className="w-20 h-20 bg-muted/50 flex-shrink-0 relative">
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${track.artwork})` }}
                    />
                    {onNowPlaying && (
                      <Button
                        size="sm"
                        onClick={() => handlePlayTrack(track)}
                        className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity w-full h-full rounded-none"
                      >
                        <Music className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4 space-y-2">
                    <div>
                      <h4 className="font-medium">{track.title}</h4>
                      <p className="text-sm text-muted-foreground">{track.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{track.duration}</span>
                      </div>
                      <span className="text-accent-coral font-medium">{track.price}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {track.formats.map((format) => (
                        <Badge key={format} variant="secondary" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      onClick={() => handlePurchaseTrack(track)}
                      className="w-full"
                      size="sm"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {track.pricingType === 'fixed' ? `Buy ${track.fixedPrice}` : 
                       track.pricingType === 'pwyw' ? `Pay What You Want (${track.minimumPrice || '0'}+)` : 
                       'Buy Now'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Merchandise */}
      {MOCK_ARTIST_ITEMS.merch.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-accent-yellow" />
            <h3 className="text-lg font-medium">Merchandise</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_ARTIST_ITEMS.merch.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-foreground/10 rounded-lg p-4 space-y-3"
              >
                <div className="w-full h-32 bg-muted/50">
                  <div 
                    className="w-full h-full bg-cover bg-center rounded"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                </div>
                
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-accent-coral font-medium">{item.price}</span>
                  <Button
                    onClick={() => handleExternalLink(item.url, item.platform)}
                    size="sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Buy on {item.platform}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const hasAnyItems = MOCK_ARTIST_ITEMS.tracks.length > 0 || 
                     MOCK_ARTIST_ITEMS.merch.length > 0 || 
                     MOCK_ARTIST_ITEMS.concerts.length > 0;

  if (!hasAnyItems) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
          <div className="flex items-center justify-between p-4">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="font-mono uppercase tracking-wide font-black border-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <div className="font-mono text-sm text-muted-foreground">
              {artist.displayName || artist.username} • MARKETPLACE
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12 border border-dashed border-foreground/20 rounded-lg">
            <ShoppingBag className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No items available</p>
            <p className="text-sm text-muted-foreground">
              {artist.displayName || artist.username} hasn't added any items to their marketplace yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show drop detail view if a drop is selected
  if (selectedDropId) {
    return (
      <>
        <DropDetailView
          dropId={selectedDropId}
          user={currentUser}
          onBack={() => {
            setSelectedDropId(null);
            setFullDropData(null);
          }}
          onPurchase={handleDropPurchase}
        />
        {/* Drop Product Purchase Modal */}
        {selectedDropProduct && (
          <TrackPurchaseModal
            isOpen={showDropPurchaseModal}
            onClose={() => {
              setShowDropPurchaseModal(false);
              setSelectedDropProduct(null);
            }}
            track={{
              id: selectedDropProduct.product.id,
              title: selectedDropProduct.product.title,
              artwork: selectedDropProduct.product.coverImage || selectedDropProduct.product.images?.[0],
              fixedPrice: (selectedDropProduct.customPrice ?? selectedDropProduct.product.price)?.toFixed(2),
              formats: ['MP3 320kbps', 'WAV', 'FLAC'],
              pricingType: 'fixed',
            }}
            artist={artist}
            onPurchaseComplete={handleDropPurchaseComplete}
            currentUser={currentUser}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
        <div className="flex items-center justify-between p-4">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="font-mono uppercase tracking-wide font-black border-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="font-mono text-sm text-muted-foreground">
            {artist.displayName || artist.username} • MARKETPLACE
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Support Artist Banner */}
        <div className="bg-gradient-to-r from-accent-coral/10 to-accent-mint/10 border border-accent-coral/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-coral/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-coral" />
            </div>
            <div>
              <h3 className="font-medium">Support {artist.displayName || artist.username}</h3>
              <p className="text-sm text-muted-foreground">
                Artists receive 90% of proceeds minus payment processing fees
              </p>
            </div>
          </div>
        </div>

        {/* All Items View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderAllItems()}
        </motion.div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-4 bg-muted/30 rounded-lg">
          <Shield className="w-4 h-4" />
          <span>All purchases are secure and protected by buyer protection policies</span>
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedTrack && (
        <TrackPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedTrack(null);
          }}
          track={selectedTrack}
          artist={artist}
          onPurchaseComplete={handlePurchaseComplete}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}