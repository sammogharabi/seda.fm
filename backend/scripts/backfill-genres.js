#!/usr/bin/env node

/**
 * Backfill script to migrate existing user genres from Supabase user_metadata to profiles table
 *
 * This script:
 * 1. Fetches all users from Supabase Auth who have genres in their user_metadata
 * 2. Creates or updates their profile records with the genres
 * 3. Sets genresCompleted = true and genresCompletedAt timestamp
 */

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  console.error('Missing required environment variables:');
  console.error('- SUPABASE_URL:', !!SUPABASE_URL);
  console.error('- SUPABASE_SERVICE_KEY:', !!SUPABASE_SERVICE_KEY);
  console.error('- DATABASE_URL:', !!DATABASE_URL);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const prisma = new PrismaClient();

async function backfillUserGenres() {
  console.log('🎵 Starting Seda Genres Backfill Script');
  console.log('=====================================');

  let processedCount = 0;
  let updatedCount = 0;
  let createdCount = 0;
  let errorCount = 0;

  try {
    // Fetch users from Supabase Auth with pagination
    let page = 1;
    const perPage = 50;
    let hasMore = true;

    while (hasMore) {
      console.log(`\n📄 Processing page ${page} (${perPage} users per page)...`);

      const { data: users, error } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: perPage
      });

      if (error) {
        console.error('❌ Error fetching users from Supabase:', error);
        break;
      }

      if (!users || users.users.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`   Found ${users.users.length} users on this page`);

      // Process each user
      for (const user of users.users) {
        processedCount++;

        const userMetadata = user.user_metadata || {};
        const genres = userMetadata.genres;

        // Skip users who don't have genres in their metadata
        if (!genres || !Array.isArray(genres) || genres.length === 0) {
          continue;
        }

        console.log(`   👤 Processing user ${user.id} with ${genres.length} genres: [${genres.join(', ')}]`);

        try {
          // Check if user already has a profile
          let profile = await prisma.profile.findFirst({
            where: { userId: user.id }
          });

          const genresData = {
            genres: genres,
            genresCompleted: true,
            genresCompletedAt: new Date(), // Mark as completed now during backfill
          };

          if (profile) {
            // Update existing profile
            await prisma.profile.update({
              where: { id: profile.id },
              data: genresData
            });
            updatedCount++;
            console.log(`   ✅ Updated existing profile for user ${user.id}`);
          } else {
            // Create new profile
            const username = userMetadata.username || user.email?.split('@')[0] || `user_${user.id.slice(-8)}`;

            await prisma.profile.create({
              data: {
                userId: user.id,
                username: username.toLowerCase(),
                displayName: userMetadata.displayName || null,
                bio: userMetadata.bio || null,
                avatarUrl: userMetadata.avatar || null,
                ...genresData
              }
            });
            createdCount++;
            console.log(`   ✨ Created new profile for user ${user.id} with username "${username}"`);
          }

        } catch (error) {
          errorCount++;
          console.error(`   ❌ Error processing user ${user.id}:`, error.message);

          // If it's a username conflict, try with a suffix
          if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
            try {
              const fallbackUsername = `user_${user.id.slice(-12)}`;
              await prisma.profile.create({
                data: {
                  userId: user.id,
                  username: fallbackUsername,
                  displayName: userMetadata.displayName || null,
                  bio: userMetadata.bio || null,
                  avatarUrl: userMetadata.avatar || null,
                  ...genresData
                }
              });
              createdCount++;
              errorCount--; // Undo the error count since we recovered
              console.log(`   ✨ Created profile with fallback username "${fallbackUsername}"`);
            } catch (fallbackError) {
              console.error(`   ❌ Fallback also failed for user ${user.id}:`, fallbackError.message);
            }
          }
        }
      }

      page++;

      // Check if there are more pages
      if (users.users.length < perPage) {
        hasMore = false;
      }
    }

  } catch (error) {
    console.error('❌ Script failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🎯 Backfill Complete!');
  console.log('====================');
  console.log(`📊 Summary:`);
  console.log(`   • Total users processed: ${processedCount}`);
  console.log(`   • Profiles updated: ${updatedCount}`);
  console.log(`   • Profiles created: ${createdCount}`);
  console.log(`   • Errors encountered: ${errorCount}`);
  console.log(`   • Total profiles with genres: ${updatedCount + createdCount}`);

  if (errorCount > 0) {
    console.log(`\n⚠️  There were ${errorCount} errors. Please review the logs above.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All users with genres have been successfully migrated!`);
  }
}

// Run the backfill
backfillUserGenres().catch(console.error);