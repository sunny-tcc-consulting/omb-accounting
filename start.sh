#!/bin/sh
# Application startup script
# Runs database migrations before starting the server

set -e

echo "🚀 Starting OMB Accounting..."
echo "DATABASE_PATH: ${DATABASE_PATH:-/app/data/omb-accounting.db}"

# Run database migrations
echo "📦 Running database migrations..."
node -e "
const { runMigrations } = require('./src/lib/database/migrations');
runMigrations()
  .then(() => console.log('✅ Migrations completed'))
  .catch((err) => {
    console.error('❌ Migration error:', err);
    process.exit(1);
  });
"

if [ $? -eq 0 ]; then
  echo "✅ Migrations successful, starting server..."
  exec node server.js
else
  echo "❌ Migrations failed, exiting..."
  exit 1
fi
