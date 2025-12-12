/**
 * Seed script to create the initial admin user for the admin portal.
 *
 * Usage:
 *   npx ts-node scripts/seed-admin.ts
 *
 * Environment variables (optional):
 *   ADMIN_EMAIL - Admin email (default: admin@seda.fm)
 *   ADMIN_PASSWORD - Admin password (required, or will prompt)
 *   ADMIN_NAME - Admin display name (default: Super Admin)
 *
 * Or pass as arguments:
 *   npx ts-node scripts/seed-admin.ts --email admin@seda.fm --password yourpassword --name "Super Admin"
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface AdminConfig {
  email: string;
  password: string;
  name: string;
}

function parseArgs(): Partial<AdminConfig> {
  const args = process.argv.slice(2);
  const config: Partial<AdminConfig> = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--email':
      case '-e':
        config.email = args[++i];
        break;
      case '--password':
      case '-p':
        config.password = args[++i];
        break;
      case '--name':
      case '-n':
        config.name = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: npx ts-node scripts/seed-admin.ts [options]

Options:
  -e, --email <email>       Admin email (default: admin@seda.fm)
  -p, --password <password> Admin password (required)
  -n, --name <name>         Admin display name (default: Super Admin)
  -h, --help                Show this help message

Environment variables:
  ADMIN_EMAIL               Admin email
  ADMIN_PASSWORD            Admin password
  ADMIN_NAME                Admin display name

Example:
  npx ts-node scripts/seed-admin.ts --email admin@seda.fm --password MySecurePass123! --name "Super Admin"
`);
        process.exit(0);
    }
  }

  return config;
}

async function seedAdmin() {
  const args = parseArgs();

  const config: AdminConfig = {
    email: args.email || process.env.ADMIN_EMAIL || 'admin@seda.fm',
    password: args.password || process.env.ADMIN_PASSWORD || '',
    name: args.name || process.env.ADMIN_NAME || 'Super Admin',
  };

  // Validate password
  if (!config.password) {
    console.error('Error: Password is required.');
    console.error('Provide via --password argument or ADMIN_PASSWORD environment variable.');
    console.error('Run with --help for usage information.');
    process.exit(1);
  }

  if (config.password.length < 8) {
    console.error('Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  const normalizedEmail = config.email.toLowerCase().trim();

  console.log('Seeding admin user...');
  console.log(`  Email: ${normalizedEmail}`);
  console.log(`  Name: ${config.name}`);
  console.log(`  Role: SUPER_ADMIN`);

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      console.log('\nAdmin user already exists with this email.');
      console.log(`  ID: ${existingAdmin.id}`);
      console.log(`  Role: ${existingAdmin.role}`);
      console.log(`  Active: ${existingAdmin.isActive}`);

      // Ask if we should update the password
      const updatePassword = process.env.ADMIN_FORCE_UPDATE === 'true';
      if (updatePassword) {
        const passwordHash = await bcrypt.hash(config.password, 12);
        await prisma.adminUser.update({
          where: { id: existingAdmin.id },
          data: { passwordHash, name: config.name },
        });
        console.log('\nPassword and name updated successfully.');
      } else {
        console.log('\nTo update the password, set ADMIN_FORCE_UPDATE=true');
      }

      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(config.password, 12);

    // Create the admin user
    const admin = await prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: config.name,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('\nAdmin user created successfully!');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    console.log('\nYou can now login to the admin portal with these credentials.');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
