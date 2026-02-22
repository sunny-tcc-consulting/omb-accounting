# Scripts

This directory contains utility scripts for the omb-accounting application.

## Scripts

### `init-database.js`

Initialize the SQLite database with migrations and sample data.

**Usage:**

```bash
node scripts/init-database.js
```

**What it does:**

1. Runs database migrations (creates tables and indexes)
2. Seeds sample data (users, customers, invoices, etc.)
3. Verifies data was inserted correctly

**Environment Variables:**

- `DATABASE_MODE`: `development` (in-memory) or `production` (file-based)
- `SEED_DATA`: `true` to seed sample data, `false` to skip

**Example:**

```bash
# Development mode with seeding
DATABASE_MODE=development SEED_DATA=true node scripts/init-database.js

# Production mode with seeding
DATABASE_MODE=production SEED_DATA=true node scripts/init-database.js

# Production mode without seeding
DATABASE_MODE=production SEED_DATA=false node scripts/init-database.js
```

## Running Scripts

All scripts use Node.js and require the project to be in the root directory.

```bash
# Run any script
node scripts/<script-name>.js
```

## Future Scripts

Potential scripts to add:

- `reset-database.js` - Drop and recreate database
- `export-data.js` - Export data to CSV/JSON
- `import-data.js` - Import data from CSV/JSON
- `backup-database.js` - Create database backup
- `migrate-to-postgres.js` - Migrate to PostgreSQL
