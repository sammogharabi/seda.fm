import { PrismaClient, ProductType, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, check if we have any existing artist user
  let user = await prisma.user.findFirst({
    where: { role: 'ARTIST' },
  });

  if (!user) {
    const timestamp = new Date().getTime();
    user = await prisma.user.create({
      data: {
        email: 'testartist@seda.com',
        supabaseId: 'test-artist-' + timestamp.toString(),
        role: 'ARTIST',
        emailVerified: true,
        userType: 'artist',
      },
    });
    console.log('Created new user:', user.id);
  } else {
    console.log('Using existing artist user:', user.id, user.email);
  }

  const products = [
    {
      title: 'Summer Vibes EP',
      description: 'A collection of warm, uplifting tracks perfect for summer',
      price: 9.99,
      type: ProductType.DIGITAL_ALBUM,
      coverImage: 'https://picsum.photos/seed/album1/400/400',
      status: ProductStatus.PUBLISHED,
    },
    {
      title: 'Midnight Dreams - Single',
      description: 'An atmospheric track exploring the space between waking and sleep',
      price: 1.99,
      type: ProductType.DIGITAL_TRACK,
      coverImage: 'https://picsum.photos/seed/track1/400/400',
      status: ProductStatus.PUBLISHED,
    },
    {
      title: 'Limited Edition T-Shirt',
      description: 'Exclusive merch featuring custom artwork',
      price: 29.99,
      type: ProductType.MERCHANDISE_LINK,
      coverImage: 'https://picsum.photos/seed/merch1/400/400',
      status: ProductStatus.PUBLISHED,
      externalUrl: 'https://example.com/merch',
    },
    {
      title: 'Producer Sample Pack Vol. 1',
      description: '50+ royalty-free samples and loops',
      price: 14.99,
      type: ProductType.SAMPLE_PACK,
      coverImage: 'https://picsum.photos/seed/samples1/400/400',
      status: ProductStatus.PUBLISHED,
    },
    {
      title: 'Synth Preset Collection',
      description: 'Custom presets for Serum and Vital',
      price: 19.99,
      type: ProductType.PRESET_PACK,
      coverImage: 'https://picsum.photos/seed/presets1/400/400',
      status: ProductStatus.PUBLISHED,
    },
  ];

  for (const product of products) {
    const existing = await prisma.marketplaceProduct.findFirst({
      where: { artistId: user.id, title: product.title },
    });

    if (!existing) {
      await prisma.marketplaceProduct.create({
        data: {
          ...product,
          artistId: user.id,
        },
      });
      console.log('Created product:', product.title);
    } else {
      console.log('Product already exists:', product.title);
    }
  }

  const allProducts = await prisma.marketplaceProduct.findMany({
    where: { artistId: user.id },
  });

  console.log('');
  console.log('=== Test Artist Info ===');
  console.log('User ID:', user.id);
  console.log('Email:', user.email);
  console.log('Products:', allProducts.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
