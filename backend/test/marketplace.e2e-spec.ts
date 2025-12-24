import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/config/prisma.service';
import { AuthGuard } from '../src/common/guards/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('Marketplace E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Use valid UUID v4 format
  const testArtistId = 'e1111111-1111-4111-a111-111111111131';
  const testBuyerId = 'e2222222-2222-4222-b222-222222222232';

  let currentUserId = testArtistId;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: currentUserId, email: 'test@test.com' };
          return true;
        },
      })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true }) // Disable rate limiting for tests
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Clean up test data
    await prisma.purchase.deleteMany({
      where: { buyerId: { in: [testArtistId, testBuyerId] } },
    });
    await prisma.marketplaceProduct.deleteMany({
      where: { artistId: { in: [testArtistId, testBuyerId] } },
    });
    await prisma.artistProfile.deleteMany({
      where: { userId: { in: [testArtistId, testBuyerId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testArtistId, testBuyerId] } },
    });

    // Create test users
    await prisma.user.createMany({
      data: [
        { id: testArtistId, email: 'artist@test.com', supabaseId: 'artist-supabase-1', role: 'ARTIST' },
        { id: testBuyerId, email: 'buyer@test.com', supabaseId: 'buyer-supabase-1', role: 'USER' },
      ],
    });

    // Create artist profile
    await prisma.artistProfile.create({
      data: {
        userId: testArtistId,
        artistName: 'Test Artist',
        verified: true,
        verifiedAt: new Date(),
      },
    });

    // Verify setup
    const artist = await prisma.user.findUnique({
      where: { id: testArtistId },
      include: { artistProfile: true },
    });
    console.log(`Marketplace test setup: Artist user created with artistProfile: ${!!artist?.artistProfile}`);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.purchase.deleteMany({
      where: { buyerId: { in: [testArtistId, testBuyerId] } },
    });
    await prisma.marketplaceProduct.deleteMany({
      where: { artistId: { in: [testArtistId, testBuyerId] } },
    });
    await prisma.artistProfile.deleteMany({
      where: { userId: { in: [testArtistId, testBuyerId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testArtistId, testBuyerId] } },
    });
    await app.close();
  });

  describe('Product Management', () => {
    it('should allow artist to create product', async () => {
      currentUserId = testArtistId;

      const response = await request(app.getHttpServer())
        .post('/marketplace/products')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Test Track',
          description: 'A great test track',
          price: 9.99,
          type: 'DIGITAL_TRACK', // ProductType enum uses DIGITAL_TRACK not TRACK
        });

      // Log response for debugging if it fails
      if (response.status !== 201) {
        console.log('Create product failed:', {
          status: response.status,
          body: response.body,
        });
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Track');
      expect(response.body.price).toBe(9.99);

      productId = response.body.id;
    });

    it('should reject product without required fields', async () => {
      currentUserId = testArtistId;

      const response = await request(app.getHttpServer())
        .post('/marketplace/products')
        .set('Authorization', 'Bearer test-token')
        .send({
          description: 'Missing title',
        });

      expect(response.status).toBe(400);
    });

    it('should list products', async () => {
      currentUserId = testBuyerId;

      const response = await request(app.getHttpServer())
        .get('/marketplace/products')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body) || response.body.products).toBeTruthy();
    });

    it('should get product by id', async () => {
      currentUserId = testBuyerId;

      const response = await request(app.getHttpServer())
        .get(`/marketplace/products/${productId}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
    });

    it('should allow artist to update their product', async () => {
      currentUserId = testArtistId;

      const response = await request(app.getHttpServer())
        .put(`/marketplace/products/${productId}`)
        .set('Authorization', 'Bearer test-token')
        .send({
          price: 14.99,
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.price).toBe(14.99);
    });

    it('should reject non-owner product update', async () => {
      currentUserId = testBuyerId;

      const response = await request(app.getHttpServer())
        .put(`/marketplace/products/${productId}`)
        .set('Authorization', 'Bearer test-token')
        .send({
          price: 0.99,
        });

      expect([403, 404]).toContain(response.status);
    });
  });

  describe('Purchase Flow', () => {
    it('should reject purchase without payment info', async () => {
      currentUserId = testBuyerId;

      const response = await request(app.getHttpServer())
        .post('/marketplace/purchases')
        .set('Authorization', 'Bearer test-token')
        .send({
          productId: productId,
        });

      // Should require payment method or return validation error
      expect([400, 402]).toContain(response.status);
    });

    it('should not allow artist to buy their own product', async () => {
      currentUserId = testArtistId;

      const response = await request(app.getHttpServer())
        .post('/marketplace/purchases')
        .set('Authorization', 'Bearer test-token')
        .send({
          productId: productId,
        });

      // Should be rejected
      expect([400, 403]).toContain(response.status);
    });
  });

  describe('Artist Revenue', () => {
    it('should get artist revenue summary', async () => {
      currentUserId = testArtistId;

      const response = await request(app.getHttpServer())
        .get('/marketplace/revenue')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      // Service returns totalRevenue, not total
      expect(response.body).toHaveProperty('totalRevenue');
    });

    it('should get revenue history', async () => {
      currentUserId = testArtistId;

      const response = await request(app.getHttpServer())
        .get('/marketplace/revenue/history')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
    });
  });

  describe('Product Deletion', () => {
    let deleteProductId: string;

    it('should create product for deletion test', async () => {
      currentUserId = testArtistId;
      const response = await request(app.getHttpServer())
        .post('/marketplace/products')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Product to Delete',
          price: 5.99,
          type: 'DIGITAL_TRACK', // Use correct ProductType enum value
        });

      if (response.status === 201) {
        deleteProductId = response.body.id;
      }
      expect([201, 429]).toContain(response.status);
    });

    it('should reject non-owner deletion', async () => {
      if (!deleteProductId) return; // Skip if rate limited
      currentUserId = testBuyerId;

      const response = await request(app.getHttpServer())
        .delete(`/marketplace/products/${deleteProductId}`)
        .set('Authorization', 'Bearer test-token');

      expect([403, 404]).toContain(response.status);
    });

    it('should allow owner to delete product', async () => {
      if (!deleteProductId) return; // Skip if rate limited
      currentUserId = testArtistId;

      const response = await request(app.getHttpServer())
        .delete(`/marketplace/products/${deleteProductId}`)
        .set('Authorization', 'Bearer test-token');

      expect([200, 204]).toContain(response.status);
    });
  });
});
