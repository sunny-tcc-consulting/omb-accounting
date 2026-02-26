/**
 * Database Initialization Script
 * 
 * Run this script to initialize the database:
 *   node scripts/init-database.js
 */

import { runMigrations, seedDatabase, isDatabaseSeeded } from '../src/lib/database/migrations';
import { seedDatabase as seed } from '../src/lib/database/seed';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function initializeDatabase() {
  const inMemory = process.env.DATABASE_MODE === 'development';

  console.log('='.repeat(60));
  console.log('Database Initialization');
  console.log('='.repeat(60));
  console.log(`Mode: ${inMemory ? 'Development (In-Memory)' : 'Production (File-Based)'}`);
  console.log('='.repeat(60));
  console.log();

  try {
    // Run migrations
    console.log('Step 1: Running migrations...');
    await runMigrations({ inMemory });
    console.log('✅ Migrations completed\n');

    // Import database for seeding
    const { SQLiteDatabase } = await import('../src/lib/database/sqlite');
    const db = new SQLiteDatabase({ inMemory });

    // Check if database is already seeded
    if (isDatabaseSeeded(db)) {
      console.log('Database already contains data. Skipping seed...');
    } else if (process.env.SEED_DATA === 'true') {
      // Seed data
      console.log('Step 2: Seeding database with sample data...');
      await seed({ inMemory });
      console.log('✅ Seeding completed\n');
    } else {
      console.log('⚠️  SEED_DATA=false. Database is empty.');
      console.log('Run with SEED_DATA=true to seed sample data.');
    }

    // Verify data
    console.log('Step 3: Verifying data...');
    const userCount = db.query('SELECT COUNT(*) as count FROM users').get().count;
    const customerCount = db.query('SELECT COUNT(*) as count FROM customers').get().count;
    const invoiceCount = db.query('SELECT COUNT(*) as count FROM invoices').get().count;
    const bankAccountCount = db.query('SELECT COUNT(*) as count FROM bank_accounts').get().count;

    console.log(`  Users: ${userCount}`);
    console.log(`  Customers: ${customerCount}`);
    console.log(`  Invoices: ${invoiceCount}`);
    console.log(`  Bank Accounts: ${bankAccountCount}`);
    console.log();

    db.close();

    console.log('='.repeat(60));
    console.log('✅ Database initialized successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
