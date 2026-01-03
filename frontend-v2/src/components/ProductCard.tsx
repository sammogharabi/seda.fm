import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  ShoppingBag,
  Music,
  Ticket,
  Download,
  Package,
  Disc,
  Play,
  ExternalLink,
  DollarSign,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { TrackPurchaseModal } from './TrackPurchaseModal';

interface Product {
  id: string;
  type: 'DIGITAL_TRACK' | 'DIGITAL_ALBUM' | 'MERCHANDISE_LINK' | 'CONCERT_LINK' | 'PRESET_PACK' | 'SAMPLE_PACK';
  title: string;
  description?: string;
  price: number;
  coverImage?: string;
  fileUrl?: string;
  externalUrl?: string;
  externalPlatform?: string;
  artist: {
    id: string;
    artistProfile?: {
      artistName?: string;
    };
    profile?: {
      displayName?: string;
      username?: string;
      avatarUrl?: string;
    };
  };
}

interface ProductCardProps {
  product: Product;
  caption?: string;
  showArtistInfo?: boolean;
  variant?: 'feed' | 'room' | 'compact';
  currentUser?: any;
  onPurchaseComplete?: (purchaseData: any) => void;
}

// Product type icons and labels
const productTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  DIGITAL_TRACK: { icon: Music, label: 'Track', color: 'bg-accent-coral' },
  DIGITAL_ALBUM: { icon: Disc, label: 'Album', color: 'bg-accent-blue' },
  MERCHANDISE_LINK: { icon: ShoppingBag, label: 'Merch', color: 'bg-accent-mint' },
  CONCERT_LINK: { icon: Ticket, label: 'Ticket', color: 'bg-accent-yellow' },
  PRESET_PACK: { icon: Package, label: 'Preset Pack', color: 'bg-purple-500' },
  SAMPLE_PACK: { icon: Download, label: 'Sample Pack', color: 'bg-pink-500' },
};

export function ProductCard({
  product,
  caption,
  showArtistInfo = true,
  variant = 'feed',
  currentUser,
  onPurchaseComplete,
}: ProductCardProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = productTypeConfig[product.type] || productTypeConfig.TRACK;
  const TypeIcon = typeConfig.icon;

  const artistName = product.artist?.artistProfile?.artistName ||
                     product.artist?.profile?.displayName ||
                     product.artist?.profile?.username ||
                     'Artist';

  const artistAvatar = product.artist?.profile?.avatarUrl;

  const handleBuyClick = () => {
    if (product.externalUrl) {
      window.open(product.externalUrl, '_blank');
    } else {
      setShowPurchaseModal(true);
    }
  };

  const handlePurchaseComplete = (purchaseData: any) => {
    setShowPurchaseModal(false);
    onPurchaseComplete?.(purchaseData);
  };

  // Compact variant for room messages
  if (variant === 'compact') {
    return (
      <>
        <motion.div
          className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors cursor-pointer"
          onClick={handleBuyClick}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Product Image */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
            {product.coverImage ? (
              <img
                src={product.coverImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TypeIcon className="w-6 h-6 text-neutral-500" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white truncate">{product.title}</span>
              <Badge variant="secondary" className={`${typeConfig.color} text-white text-xs px-1.5 py-0`}>
                {typeConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span>{artistName}</span>
              <span>-</span>
              <span className="text-accent-coral font-medium">${product.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Buy Button */}
          <Button
            size="sm"
            className="bg-accent-coral hover:bg-accent-coral/90 text-white flex-shrink-0"
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Buy
          </Button>
        </motion.div>

        {/* Purchase Modal for digital products */}
        {showPurchaseModal && !product.externalUrl && (
          <TrackPurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            track={{
              id: product.id,
              title: product.title,
              coverArt: product.coverImage,
              price: product.price,
              formats: ['MP3 320kbps', 'WAV', 'FLAC'],
              pricingType: 'fixed',
            }}
            artist={{
              name: artistName,
              avatarUrl: artistAvatar,
            }}
            onPurchaseComplete={handlePurchaseComplete}
            currentUser={currentUser}
          />
        )}
      </>
    );
  }

  // Room variant - slightly more detailed
  if (variant === 'room') {
    return (
      <>
        <Card
          className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleBuyClick}
        >
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              {/* Product Image */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                {product.coverImage ? (
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TypeIcon className="w-8 h-8 text-neutral-500" />
                  </div>
                )}
                {(product.type === 'DIGITAL_TRACK' || product.type === 'DIGITAL_ALBUM') && isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 text-white fill-white" />
                  </motion.div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className={`${typeConfig.color} text-white text-xs`}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {typeConfig.label}
                  </Badge>
                </div>
                <h4 className="font-semibold text-white truncate">{product.title}</h4>
                {showArtistInfo && (
                  <p className="text-sm text-neutral-400 truncate">by {artistName}</p>
                )}
                {caption && (
                  <p className="text-sm text-neutral-300 mt-2 line-clamp-2">{caption}</p>
                )}
              </div>

              {/* Price & Buy */}
              <div className="flex flex-col items-end justify-between">
                <span className="text-lg font-bold text-accent-coral">
                  ${product.price.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  className="bg-accent-coral hover:bg-accent-coral/90 text-white"
                >
                  {product.externalUrl ? (
                    <>
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-3 h-3 mr-1" />
                      Buy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Modal */}
        {showPurchaseModal && !product.externalUrl && (
          <TrackPurchaseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            track={{
              id: product.id,
              title: product.title,
              coverArt: product.coverImage,
              price: product.price,
              formats: ['MP3 320kbps', 'WAV', 'FLAC'],
              pricingType: 'fixed',
            }}
            artist={{
              name: artistName,
              avatarUrl: artistAvatar,
            }}
            onPurchaseComplete={handlePurchaseComplete}
            currentUser={currentUser}
          />
        )}
      </>
    );
  }

  // Feed variant - full card display
  return (
    <>
      <Card
        className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-all overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          {/* Product Image - larger for feed */}
          <div className="relative aspect-square w-full overflow-hidden bg-neutral-800">
            {product.coverImage ? (
              <img
                src={product.coverImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TypeIcon className="w-16 h-16 text-neutral-600" />
              </div>
            )}

            {/* Type Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className={`${typeConfig.color} text-white`}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {typeConfig.label}
              </Badge>
            </div>

            {/* Play overlay for audio products */}
            {(product.type === 'DIGITAL_TRACK' || product.type === 'DIGITAL_ALBUM' || product.type === 'SAMPLE_PACK') && isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </motion.div>
            )}

            {/* Price Badge */}
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/80 text-white text-lg font-bold px-3 py-1">
                ${product.price.toFixed(2)}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{product.title}</h3>

            {showArtistInfo && (
              <div className="flex items-center gap-2 mb-3">
                {artistAvatar ? (
                  <img
                    src={artistAvatar}
                    alt={artistName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center">
                    <User className="w-3 h-3 text-neutral-400" />
                  </div>
                )}
                <span className="text-sm text-neutral-400">{artistName}</span>
              </div>
            )}

            {product.description && (
              <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{product.description}</p>
            )}

            {caption && (
              <p className="text-sm text-neutral-300 mb-4 italic">"{caption}"</p>
            )}

            {/* Buy Button */}
            <Button
              className="w-full bg-accent-coral hover:bg-accent-coral/90 text-white font-semibold"
              onClick={handleBuyClick}
            >
              {product.externalUrl ? (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on {product.externalPlatform || 'Store'}
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Buy Now - ${product.price.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Modal */}
      {showPurchaseModal && !product.externalUrl && (
        <TrackPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          track={{
            id: product.id,
            title: product.title,
            coverArt: product.coverImage,
            price: product.price,
            formats: ['MP3 320kbps', 'WAV', 'FLAC'],
            pricingType: 'fixed',
          }}
          artist={{
            name: artistName,
            avatarUrl: artistAvatar,
          }}
          onPurchaseComplete={handlePurchaseComplete}
          currentUser={currentUser}
        />
      )}
    </>
  );
}

export default ProductCard;
