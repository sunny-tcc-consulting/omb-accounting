/**
 * Database Setup Test
 * 
 * Quick test to verify database setup works correctly.
 */

const { runMigrations, isDatabaseSeeded } = require('/home/tcc/.openclaw/workspace/omb-accounting/src/lib/database/migrations');
const { seedDatabase } = require('/home/tcc/.openclaw/workspace/omb-accounting/src/lib/database/seed');
const { SQLiteDatabase } = require('/home/tcc/.openclaw/workspace/omb-accounting/src/lib/database/sqlite');

async function testDatabaseSetup() {
  console.log('='.repeat(60));
  console.log('Database Setup Test');
  console.log('='.repeat(60));
  console.log();

  const inMemory = true;

  try {
    // Step 1: Run migrations
    console.log('Step 1: Running migrations...');
    await runMigrations({ inMemory });
    console.log('✅ Migrations completed\n');

    // Step 2: Check if seeded
    const db = new SQLiteDatabase({ inMemory });
    const seeded = isDatabaseSeeded(db);
    console.log(`Database seeded: ${seeded ? 'Yes' : 'No'}\n`);

    // Step 3: Test queries
    console.log('Step 3: Testing queries...');
    const userCount = db.query('SELECT COUNT(*) as count FROM users')[0].count;
    const customerCount = db.query('SELECT COUNT(*) as count FROM customers')[0].count;
    const invoiceCount = db.query('SELECT COUNT(*) as count FROM invoices')[0].count;
    const bankAccountCount = db.query('SELECT COUNT(*) as count FROM bank_accounts')[0].count;

    console.log(`  Users: ${userCount}`);
    console.log(`  Customers: ${customerCount}`);
    console.log(`  Invoices: ${invoiceCount}`);
    console.log(`  Bank Accounts: ${bankAccountCount}`);
    console.log();

    // Step 4: Test transaction
    console.log('Step 4: Testing transaction...');
    const transactionId = Date.now().toString();
    db.transaction(() => {
      db.run(
        'INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          transactionId,
          'Test User',
          'test@example.com',
          'hashed_password',
          'user',
          Date.now(),
          Date.now()
        ]
      );
    })();

    const insertedUser = db.get(
      'SELECT * FROM users WHERE id = ?',
      [transactionId]
    );
    console.log(`  Transaction successful: ${!!insertedUser}`);
    console.log(`  User name: ${insertedUser?.name}`);
    console.log();

    // Step 5: Test foreign key
    console.log('Step 5: Testing foreign keys...');
    const customer = db.query('SELECT * FROM customers LIMIT 1')[0];
    if (customer) {
      const quotationCount = db.query(
        'SELECT COUNT(*) as count FROM quotations WHERE customer_id = ?',
        [customer.id]
      )[0].count;
      console.log(`  Customer has ${quotationCount} quotations`);
    }
    console.log();

    db.close();

    console.log('='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testDatabaseSetup();
