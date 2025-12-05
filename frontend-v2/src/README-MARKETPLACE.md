# Marketplace - README

## Overview
The Marketplace is sedā.fm's artist monetization platform where artists can sell tracks, albums, merch, and digital goods directly to fans. It emphasizes fair compensation and direct artist-to-fan relationships without traditional streaming platforms.

## Component Location
- **Artist Marketplace**: `/components/ArtistMarketplace.tsx`
- **Fan Marketplace View**: `/components/FanMarketplaceView.tsx`
- **Track Purchase Modal**: `/components/TrackPurchaseModal.tsx`
- **Store Analytics**: `/components/StoreAnalytics.tsx`
- **Marketplace Revenue**: `/components/MarketplaceRevenue.tsx`

## Feature Description
The Marketplace provides:
- Direct track sales (full quality downloads)
- Digital album sales
- Merchandise listings
- Exclusive content
- Pre-orders and early access
- Bundle deals
- Pay-what-you-want options
- Fan support tips

## User Flows

### Artist Flow
1. Upload track with pricing
2. Set sale options (fixed/PWYW/free)
3. Add merch items
4. Track sales and revenue
5. Manage inventory
6. View analytics
7. Withdraw earnings

### Fan Flow
1. Browse artist marketplace
2. Preview tracks
3. Add to cart
4. Checkout
5. Download purchases
6. Access exclusive content
7. Review purchases

## Marketplace Structure

### Product Types

#### 1. Tracks
```typescript
interface TrackProduct {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  price: number;
  pricingType: 'fixed' | 'pwyw' | 'free';
  minimumPrice?: number;
  format: 'mp3' | 'wav' | 'flac' | 'all';
  artwork: string;
  description: string;
  releaseDate: string;
  salesCount: number;
  revenue: number;
}
```

#### 2. Albums
```typescript
interface AlbumProduct {
  id: string;
  title: string;
  artist: string;
  tracks: TrackProduct[];
  price: number;
  bundleDiscount?: number;
  artwork: string;
  description: string;
  releaseDate: string;
  totalDuration: number;
}
```

#### 3. Merchandise
```typescript
interface MerchProduct {
  id: string;
  name: string;
  type: 'shirt' | 'vinyl' | 'poster' | 'sticker' | 'other';
  price: number;
  images: string[];
  description: string;
  sizes?: string[];
  colors?: string[];
  stock: number;
  shippingRequired: boolean;
}
```

#### 4. Digital Goods
```typescript
interface DigitalProduct {
  id: string;
  name: string;
  type: 'sample_pack' | 'preset' | 'stems' | 'artwork' | 'other';
  price: number;
  description: string;
  fileSize: string;
  format: string;
  downloads: number;
}
```

## Pricing Models

### Fixed Price
Standard pricing model:
```tsx
<ProductCard>
  <Price>${product.price}</Price>
  <BuyButton>Buy Now</BuyButton>
</ProductCard>
```

### Pay What You Want (PWYW)
Flexible pricing:
```tsx
<ProductCard>
  <PriceInput 
    min={product.minimumPrice || 0}
    defaultValue={product.suggestedPrice}
  />
  <BuyButton>Support Artist</BuyButton>
</ProductCard>
```

### Free + Optional Support
Free downloads with tip option:
```tsx
<ProductCard>
  <Price>Free</Price>
  <DownloadButton>Download</DownloadButton>
  <TipButton>Support Artist</TipButton>
</ProductCard>
```

## Artist Marketplace Component

### Layout
```
┌─────────────────────────────────────────┐
│  Artist Store Header                    │
│  [Cover Image]                          │
│  Artist Name                            │
│  "Supporting independent music"         │
├─────────────────────────────────────────┤
│  [Featured]  [Tracks]  [Merch]  [All]   │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ Track 1  │  │ Track 2  │            │
│  │ $2.99    │  │ $2.99    │            │
│  └──────────┘  └──────────┘            │
│                                         │
│  ┌──────────┐  ┌──────────┐            │
│  │ T-Shirt  │  │ Vinyl    │            │
│  │ $25.00   │  │ $30.00   │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Implementation
```typescript
export function ArtistMarketplace({ artistId }: { artistId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'tracks' | 'merch' | 'featured'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);

  return (
    <div className="artist-marketplace">
      <MarketplaceHeader artist={artist} />
      
      <FilterTabs 
        active={filter}
        onChange={setFilter}
      />
      
      <ProductGrid>
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
          />
        ))}
      </ProductGrid>
      
      {cart.length > 0 && (
        <FloatingCart 
          items={cart}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}
```

## Purchase Flow

### 1. Product Selection
```typescript
const handleAddToCart = (product: Product) => {
  setCart([...cart, {
    productId: product.id,
    quantity: 1,
    price: product.price
  }]);
  
  toast.success('Added to cart');
};
```

### 2. Cart Review
```tsx
<Cart>
  {cart.map(item => (
    <CartItem key={item.id}>
      <ItemInfo>{item.name}</ItemInfo>
      <ItemPrice>${item.price}</ItemPrice>
      <RemoveButton onClick={() => removeFromCart(item.id)} />
    </CartItem>
  ))}
  <CartTotal>${calculateTotal(cart)}</CartTotal>
  <CheckoutButton>Proceed to Checkout</CheckoutButton>
</Cart>
```

### 3. Checkout
```tsx
<CheckoutModal>
  <BillingInfo />
  <PaymentMethod />
  <OrderSummary />
  <CompleteButton>Complete Purchase</CompleteButton>
</CheckoutModal>
```

### 4. Confirmation
```tsx
<PurchaseConfirmation>
  <SuccessIcon />
  <Message>Purchase Complete!</Message>
  <DownloadLinks products={purchasedItems} />
  <Receipt orderId={order.id} />
</PurchaseConfirmation>
```

## Payment Integration

### Stripe Integration (Planned)
```typescript
const handleCheckout = async (cart: CartItem[]) => {
  try {
    const session = await createCheckoutSession({
      items: cart,
      artistId: artist.id,
      successUrl: '/purchase/success',
      cancelUrl: '/marketplace'
    });
    
    // Redirect to Stripe Checkout
    window.location.href = session.url;
  } catch (error) {
    toast.error('Checkout failed');
  }
};
```

### Revenue Split
- Artist: 85%
- Platform: 10%
- Payment Processing: 5%

```typescript
const calculateRevenue = (salePrice: number) => {
  const platformFee = salePrice * 0.10;
  const processingFee = salePrice * 0.05;
  const artistRevenue = salePrice - platformFee - processingFee;
  
  return {
    artistRevenue,
    platformFee,
    processingFee
  };
};
```

## Store Analytics

### Metrics Tracked
```typescript
interface StoreAnalytics {
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
  topProducts: Product[];
  salesByDay: { date: string; revenue: number }[];
  salesByProduct: { productId: string; count: number }[];
  conversionRate: number;
  cartAbandonmentRate: number;
}
```

### Analytics Dashboard
```tsx
<StoreAnalytics>
  <MetricCard>
    <Label>Total Revenue</Label>
    <Value>${analytics.totalRevenue.toFixed(2)}</Value>
    <Change>+12% from last month</Change>
  </MetricCard>
  
  <RevenueChart data={analytics.salesByDay} />
  
  <TopProducts products={analytics.topProducts} />
  
  <ConversionFunnel
    views={1000}
    addToCarts={250}
    checkouts={100}
    purchases={75}
  />
</StoreAnalytics>
```

## Fan Support Features

### Direct Tips
```tsx
<TipButton onClick={() => setShowTipModal(true)}>
  Support Artist
</TipButton>

<TipModal>
  <PresetAmounts amounts={[5, 10, 25, 50]} />
  <CustomAmount />
  <Message>Leave a message (optional)</Message>
  <SubmitButton>Send Tip</SubmitButton>
</TipModal>
```

### Fan Subscriptions
```typescript
interface Subscription {
  tier: 'basic' | 'supporter' | 'patron';
  price: number;
  benefits: string[];
  exclusiveContent: Content[];
}

const subscriptionTiers = {
  basic: {
    price: 5,
    benefits: [
      'Early access to new releases',
      '10% discount on merch',
      'Exclusive updates'
    ]
  },
  supporter: {
    price: 10,
    benefits: [
      'All Basic benefits',
      'Exclusive tracks',
      'Behind-the-scenes content',
      '20% discount on merch'
    ]
  },
  patron: {
    price: 25,
    benefits: [
      'All Supporter benefits',
      'Monthly exclusive release',
      'Direct messaging',
      'Name in credits',
      '30% discount on merch'
    ]
  }
};
```

## Digital Downloads

### Download Management
```typescript
interface Download {
  id: string;
  purchaseId: string;
  productId: string;
  userId: string;
  format: string;
  downloadUrl: string;
  expiresAt: string;
  downloadsRemaining: number;
}

const generateDownloadLink = async (purchaseId: string) => {
  const link = await createSignedUrl(purchaseId, {
    expiresIn: 3600, // 1 hour
    maxDownloads: 3
  });
  
  return link;
};
```

### File Formats
- **MP3**: 320kbps, widely compatible
- **WAV**: Lossless, highest quality
- **FLAC**: Lossless, compressed
- **Stems**: Individual track layers (premium)

## Mobile Experience

### Mobile Marketplace
```tsx
<MobileMarketplace>
  <StickyHeader>
    <ArtistInfo />
    <CartIcon badge={cart.length} />
  </StickyHeader>
  
  <CategoryScroll>
    <CategoryChip>All</CategoryChip>
    <CategoryChip>Tracks</CategoryChip>
    <CategoryChip>Merch</CategoryChip>
  </CategoryScroll>
  
  <ProductList>
    {products.map(product => (
      <MobileProductCard key={product.id} product={product} />
    ))}
  </ProductList>
  
  {cart.length > 0 && (
    <FloatingCartButton onClick={() => setShowCart(true)}>
      View Cart ({cart.length})
    </FloatingCartButton>
  )}
</MobileMarketplace>
```

## Design System

### Product Card
```tsx
<Card className="product-card bg-[#1a1a1a] border-[#333]">
  <AspectRatio ratio={1}>
    <img src={product.image} alt={product.name} />
  </AspectRatio>
  
  <div className="p-4">
    <h3>{product.name}</h3>
    <p className="font-mono text-sm opacity-70">{product.artist}</p>
    
    <div className="flex items-center justify-between mt-4">
      <span className="text-[#ff6b6b]">${product.price}</span>
      <Button className="bg-[#ff6b6b]">
        Add to Cart
      </Button>
    </div>
  </div>
</Card>
```

### Colors
- Product cards: `#1a1a1a`
- Price: `#ff6b6b` (coral)
- Buttons: `#ff6b6b`
- Sold out: `#666`
- On sale: `#f9ca24` (yellow)

## Inventory Management

### Stock Tracking
```typescript
interface Inventory {
  productId: string;
  stock: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  autoRestock: boolean;
}

const checkStock = (productId: string, quantity: number) => {
  const inventory = getInventory(productId);
  
  if (inventory.available < quantity) {
    throw new Error('Insufficient stock');
  }
  
  return true;
};
```

### Low Stock Alerts
```tsx
{inventory.available <= inventory.lowStockThreshold && (
  <Alert variant="warning">
    Only {inventory.available} left in stock!
  </Alert>
)}
```

## Pre-orders

### Pre-order System
```typescript
interface PreOrder {
  productId: string;
  releaseDate: string;
  preOrderPrice: number;
  estimatedDelivery: string;
  maxPreOrders?: number;
  currentPreOrders: number;
}
```

### Pre-order Card
```tsx
<PreOrderCard>
  <PreOrderBadge>Pre-Order</PreOrderBadge>
  <ProductInfo />
  <ReleaseDate>Releases {releaseDate}</ReleaseDate>
  <PreOrderPrice>${price} <s>${regularPrice}</s></PreOrderPrice>
  <PreOrderButton>Pre-Order Now</PreOrderButton>
  <Note>You'll be charged when item ships</Note>
</PreOrderCard>
```

## Discounts & Promotions

### Discount Types
```typescript
interface Discount {
  code: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'bundle';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  expiresAt: string;
  applicableTo: string[]; // product IDs
}
```

### Applying Discounts
```typescript
const applyDiscount = (cart: CartItem[], code: string) => {
  const discount = getDiscount(code);
  
  if (!discount || !isValidDiscount(discount)) {
    throw new Error('Invalid discount code');
  }
  
  const subtotal = calculateSubtotal(cart);
  
  switch (discount.type) {
    case 'percentage':
      return subtotal * (1 - discount.value / 100);
    case 'fixed':
      return Math.max(0, subtotal - discount.value);
    case 'bundle':
      return calculateBundleDiscount(cart, discount);
  }
};
```

## Testing Checklist

### Functionality
- [ ] Add to cart works
- [ ] Cart updates correctly
- [ ] Checkout flow completes
- [ ] Downloads accessible after purchase
- [ ] Discounts apply correctly
- [ ] Stock tracking accurate
- [ ] Pre-orders process correctly

### UI/UX
- [ ] Product cards display properly
- [ ] Images load correctly
- [ ] Mobile responsive
- [ ] Cart animations smooth
- [ ] Loading states display
- [ ] Error handling clear

### Payment
- [ ] Test mode works
- [ ] Payment successful
- [ ] Failed payment handled
- [ ] Refunds process
- [ ] Receipt generated

## Future Enhancements

### Planned Features
1. **Auction System**
   - Limited edition auctions
   - Timed bidding
   - Reserve prices

2. **NFT Integration**
   - Music NFTs
   - Exclusive digital collectibles
   - Proof of ownership

3. **Physical Distribution**
   - Vinyl pressing
   - CD manufacturing
   - Cassette production

4. **Wholesale**
   - Bulk pricing
   - Distribution deals
   - Retailer accounts

5. **Gift Cards**
   - Artist-specific gift cards
   - Platform gift cards
   - Custom amounts

6. **Wishlist**
   - Save for later
   - Price drop alerts
   - Share wishlist

## Related Features
- **Artist Profiles**: Marketplace access
- **Fan Support Actions**: Direct support
- **Store Analytics**: Performance tracking
- **Track Upload**: Product creation

## Related Documentation
- `ARCHITECTURE.md` - System design
- `COMPONENT-GUIDE.md` - Components
- `README-ARTIST-PROFILES.md` - Artist features
- `STATE-MANAGEMENT.md` - State patterns

## Quick Reference

### Add Product to Cart
```typescript
const addToCart = (product: Product) => {
  setCart([
    ...cart,
    {
      id: generateId(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    }
  ]);
};
```

### Calculate Cart Total
```typescript
const calculateTotal = (items: CartItem[]) => {
  return items.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );
};
```

## Status
✅ **Current**: UI complete with mock data  
⏳ **Next**: Payment integration (Stripe)  
🚀 **Future**: NFTs, subscriptions, auctions
