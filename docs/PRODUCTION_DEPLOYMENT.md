# Production Deployment Guide

> Complete guide for cleaning up and deploying omb-accounting to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Cleanup Old Deployment](#cleanup-old-deployment)
4. [Fresh Installation](#fresh-installation)
5. [Database Setup](#database-setup)
6. [Production Build](#production-build)
7. [Environment Configuration](#environment-configuration)
8. [Deployment Options](#deployment-options)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Rollback Procedure](#rollback-procedure)

---

## Prerequisites

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 core | 2+ cores |
| Memory | 1 GB | 2 GB |
| Storage | 500 MB | 1 GB+ |
| Node.js | 18.x | 20.x LTS |
| npm | 8+ | 10+ |

### Required Tools

```bash
# Check Node.js version
node --version  # Must be 18+

# Check npm version
npm --version   # Must be 8+

# Install git if not present
which git || sudo apt install git
```

---

## Pre-Deployment Checklist

Before starting deployment, verify:

- [ ] Node.js 18+ installed
- [ ] Git repository cloned
- [ ] Domain/URL configured (if applicable)
- [ ] SSL certificate prepared (for HTTPS)
- [ ] Backup of existing data completed
- [ ] Database migration plan reviewed
- [ ] Environment variables documented

### Quick Health Check

```bash
# Verify project is ready
cd /path/to/omb-accounting
npm test                    # Should pass 239/239 tests
npm run build               # Should complete without errors
git status                  # Should be clean or have intentional changes
```

---

## Cleanup Old Deployment

### Step 1: Stop Existing Services

```bash
# If running with pm2
pm2 stop all
pm2 delete all

# If running with systemctl
sudo systemctl stop omb-accounting

# If running manually (find and kill)
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Step 2: Backup Existing Data

**Critical: Always backup before cleanup!**

```bash
# Create backup directory
mkdir -p /backups/omb-accounting
cd /path/to/omb-accounting

# Backup database
cp data/omb-accounting.db /backups/omb-accounting/omb-accounting.db.$(date +%Y%m%d)

# Backup uploads if any
cp -r public/uploads /backups/omb-accounting/uploads.$(date +%Y%m%d) 2>/dev/null || true

# Backup environment file
cp .env.local /backups/omb-accounting/.env.local.$(date +%Y%m%d) 2>/dev/null || true

echo "✅ Backup completed to /backups/omb-accounting/"
```

### Step 3: Clear Caches and Build Artifacts

```bash
cd /path/to/omb-accounting

# Remove Next.js build cache
rm -rf .next

# Remove node_modules (will be reinstalled)
rm -rf node_modules

# Clear npm cache
npm cache clean --force

# Remove test results
rm -rf test-results

# Remove screenshots
rm -rf screenshots

# Clear package-lock.json (optional, for fresh install)
rm -f package-lock.json

echo "✅ Cleanup completed"
```

### Step 4: Verify Cleanup

```bash
# Check directories are clean
ls -la

# Should show:
# - .git/                    (git repository)
# - src/                     (source code)
# - package.json             (project config)
# - ...other source files...
# Should NOT show:
# - .next/                   (build cache)
# - node_modules/            (dependencies)
# - data/omb-accounting.db   (database - backup only!)
```

---

## Fresh Installation

### Step 1: Clone or Update Repository

**Option A: Fresh Clone**

```bash
cd /path/to
rm -rf omb-accounting
git clone https://github.com/sunny-tcc-consulting/omb-accounting.git
cd omb-accounting
```

**Option B: Update Existing**

```bash
cd /path/to/omb-accounting

# Fetch latest changes
git fetch origin

# Checkout main or openclaw branch
git checkout openclaw  # or main

# Pull latest changes
git pull origin openclaw

# Reset to clean state (discard local changes)
git reset --hard origin/openclaw
```

### Step 2: Install Dependencies

```bash
cd /path/to/omb-accounting

# Clean install (uses package.json only)
npm ci

# Or for fresh install (regenerates package-lock.json)
npm install

echo "✅ Dependencies installed"
```

### Step 3: Verify Installation

```bash
# Check installed packages
npm list --depth=0

# Should show all dependencies installed correctly
```

---

## Database Setup

### Option A: Initialize Fresh Database

```bash
cd /path/to/omb-accounting

# Run database initialization
npm run db:init

# Or manually
node scripts/init-database-full.js

echo "✅ Database initialized at data/omb-accounting.db"
```

### Option B: Restore from Backup

```bash
cd /path/to/omb-accounting

# Restore database from backup
cp /backups/omb-accounting/omb-accounting.db.[DATE] data/omb-accounting.db

# Set proper permissions
chmod 644 data/omb-accounting.db

echo "✅ Database restored from backup"
```

### Option C: Seed with Sample Data

```bash
cd /path/to/omb-accounting

# Seed database with sample data
npm run db:seed

# Or manually
node scripts/seed.js

echo "✅ Database seeded with sample data"
```

### Database Location

```
omb-accounting/
└── data/
    └── omb-accounting.db   # SQLite database file
```

---

## Production Build

### Step 1: Run Tests

```bash
cd /path/to/omb-accounting

# Run all tests
npm test

# Expected output:
# Test Suites: 15 passed, 15 total
# Tests:       239 passed, 239 total
# ✅ All tests must pass
```

### Step 2: Lint Code

```bash
cd /path/to/omb-accounting

# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

echo "✅ Linting passed"
```

### Step 3: Build for Production

```bash
cd /path/to/omb-accounting

# Build Next.js application
npm run build

# This creates .next/ directory with production build
# Output includes:
# - Static assets
# - Server-side rendered pages
# - API routes
# - Optimized bundles

echo "✅ Build completed"
```

### Step 4: Verify Build

```bash
# Check build output
ls -la .next/

# Should show:
# - cache/              (build cache)
# - server/             (server code)
# - static/             (static assets)
# - traces.txt          (dependency traces)

# Check build size
du -sh .next
```

---

## Environment Configuration

### Create Environment File

```bash
cd /path/to/omb-accounting

# Copy example environment file
cp .env.local.example .env.local

# Edit with production values
nano .env.local
```

### Required Environment Variables

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=omb-accounting
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database (SQLite - no config needed)
# Database file: data/omb-accounting.db

# Authentication (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# Session
SESSION_SECRET=your-session-secret-change-this
SESSION_TIMEOUT_MINUTES=30

# API (optional rate limiting)
API_RATE_LIMIT=100

# Logging
LOG_LEVEL=info
```

### Security Recommendations

```bash
# Generate secure random secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For SESSION_SECRET

# Set restrictive file permissions
chmod 600 .env.local
chmod 644 data/omb-accounting.db
```

---

## Deployment Options

### Option 1: Node.js Process Manager (PM2)

```bash
cd /path/to/omb-accounting

# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'omb-accounting',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/omb-accounting',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Setup PM2 startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs omb-accounting
pm2 status

echo "✅ PM2 deployment complete"
```

### Option 2: Systemd Service

```bash
# Create systemd service file
sudo nano /etc/systemd/system/omb-accounting.service
```

```ini
[Unit]
Description=omb-accounting Production Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/path/to/omb-accounting
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/path/to/omb-accounting/data

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable omb-accounting
sudo systemctl start omb-accounting

# Check status
sudo systemctl status omb-accounting

# View logs
sudo journalctl -u omb-accounting -f
```

### Option 3: Docker Deployment

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
EOF

# Build and run
docker build -t omb-accounting .
docker run -d \
  --name omb-accounting \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  omb-accounting
```

### Option 4: Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/omb-accounting
vercel --prod

# Or connect to Vercel GitHub integration
# Visit: https://vercel.com/new
```

### Option 5: Nginx Reverse Proxy

```bash
# Install nginx
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/omb-accounting
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/omb-accounting /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Post-Deployment Verification

### Step 1: Check Application Status

```bash
# If using PM2
pm2 status omb-accounting

# If using systemd
sudo systemctl status omb-accounting

# If using curl
curl -I http://localhost:3000
curl -I http://your-domain.com
```

### Step 2: Verify Key Endpoints

```bash
# Homepage
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
# Should return: 200

# API Health check
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/login
# Should return: 200 (or 405 for GET)

# Static assets
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/_next/static/css/app/layout.css
# Should return: 200
```

### Step 3: Check Logs

```bash
# PM2 logs
pm2 logs omb-accounting --lines 50

# Systemd logs
sudo journalctl -u omb-accounting -n 50 -f

# Application logs (if using file logging)
tail -f logs/app.log
```

### Step 4: Run Smoke Tests

```bash
# Create smoke test script
cat > smoke-test.sh << 'EOF'
#!/bin/bash

BASE_URL=${1:-http://localhost:3000}
FAILED=0

echo "Running smoke tests against $BASE_URL..."

# Test homepage
if curl -s -f "$BASE_URL/" > /dev/null; then
    echo "✅ Homepage accessible"
else
    echo "❌ Homepage failed"
    FAILED=1
fi

# Test customers page
if curl -s -f "$BASE_URL/customers" > /dev/null; then
    echo "✅ Customers page accessible"
else
    echo "❌ Customers page failed"
    FAILED=1
fi

# Test quotations page
if curl -s -f "$BASE_URL/quotations" > /dev/null; then
    echo "✅ Quotations page accessible"
else
    echo "❌ Quotations page failed"
    FAILED=1
fi

# Test login page
if curl -s -f "$BASE_URL/login" > /dev/null; then
    echo "✅ Login page accessible"
else
    echo "❌ Login page failed"
    FAILED=1
fi

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "✅ All smoke tests passed!"
    exit 0
else
    echo ""
    echo "❌ Some smoke tests failed"
    exit 1
fi
EOF

chmod +x smoke-test.sh
./smoke-test.sh http://localhost:3000
```

### Step 5: Test Playwright GUI Tests

```bash
cd /path/to/omb-accounting

# Run GUI tests
npm run e2e

# Expected: 7/13+ tests passing
```

---

## Rollback Procedure

### Rollback Database

```bash
# Stop application
pm2 stop omb-accounting
# or
sudo systemctl stop omb-accounting

# Restore database from backup
cp /backups/omb-accounting/omb-accounting.db.[DATE] data/omb-accounting.db

# Restart application
pm2 restart omb-accounting
# or
sudo systemctl start omb-accounting
```

### Rollback Application

```bash
# Checkout previous version
cd /path/to/omb-accounting
git checkout [previous-commit-hash]

# Rebuild
npm run build

# Restart
pm2 restart omb-accounting
# or
sudo systemctl restart omb-accounting
```

### Quick Rollback Script

```bash
cat > rollback.sh << 'EOF'
#!/bin/bash

# Usage: ./rollback.sh [commit-hash|backup-date]

COMMIT=${1:-HEAD~1}
cd /path/to/omb-accounting

echo "Rolling back to $COMMIT..."

# Stop application
pm2 stop omb-accounting 2>/dev/null || sudo systemctl stop omb-accounting 2>/dev/null

# Git rollback
git checkout $COMMIT

# Rebuild
npm ci
npm run build

# Restore database
cp /backups/omb-accounting/omb-accounting.db.[DATE] data/omb-accounting.db 2>/dev/null || true

# Restart
pm2 restart omb-accounting 2>/dev/null || sudo systemctl start omb-accounting 2>/dev/null

echo "✅ Rollback complete to $COMMIT"
EOF

chmod +x rollback.sh
```

---

## Maintenance Commands

### Daily Health Check

```bash
#!/bin/bash
# daily-health-check.sh

echo "=== Daily Health Check ==="
echo "Date: $(date)"

# Check PM2 status
pm2 status

# Check disk space
df -h

# Check memory
free -h

# Check database size
ls -lh data/omb-accounting.db

# Check recent logs
pm2 logs omb-accounting --lines 20 --nostream

echo "=== Health Check Complete ==="
```

### Database Backup Script

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR=/backups/omb-accounting
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp data/omb-accounting.db $BACKUP_DIR/omb-accounting.db.$DATE

# Keep only last 7 backups
ls -t $BACKUP_DIR/omb-accounting.db.* | tail -n +8 | xargs rm -f

echo "✅ Backup complete: $BACKUP_DIR/omb-accounting.db.$DATE"
```

### Add to crontab

```bash
# Edit crontab
crontab -e

# Add:
# Daily backup at 2 AM
0 2 * * * /path/to/omb-accounting/backup-database.sh

# Daily health check at 9 AM
0 9 * * * /path/to/omb-accounting/daily-health-check.sh
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | Node version mismatch | Use Node.js 18+ |
| Database locked | Multiple processes | Stop all instances before running |
| 502 Bad Gateway | App not running | Check PM2/systemd status |
| CSS not loading | CDN issue | Check `_next` static files |
| Login fails | JWT secret mismatch | Verify env variables |

### Debug Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check port availability
lsof -i :3000

# Check environment
cat .env.local | grep -v "^#" | grep -v "^$"

# Check build output
npm run build 2>&1 | tail -50

# Check application logs
pm2 logs omb-accounting --lines 100
```

---

## Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm test` | Run tests |
| `npm run db:init` | Initialize database |
| `npm run lint` | Run ESLint |

### File Locations

| Path | Description |
|------|-------------|
| `data/omb-accounting.db` | SQLite database |
| `.next/` | Production build |
| `screenshots/` | Test screenshots |
| `logs/` | Application logs |

### Default Login

After fresh deployment:

- **Username**: admin
- **Password**: admin123

> ⚠️ **Change default password immediately after first login!**

---

## Summary

### Deployment Checklist

- [ ] Backup existing data
- [ ] Stop old deployment
- [ ] Clear caches
- [ ] Clone/update repository
- [ ] Install dependencies
- [ ] Configure environment
- [ ] Initialize database
- [ ] Run tests
- [ ] Build production
- [ ] Start service
- [ ] Verify deployment
- [ ] Run smoke tests
- [ ] Monitor logs

### Support

For issues:
1. Check logs: `pm2 logs omb-accounting`
2. Run smoke tests: `./smoke-test.sh`
3. Check test results: `npm test`
4. Review deployment steps in this guide

---

**Document Version**: 1.0
**Last Updated**: 2026-02-24
**Maintained By**: omb-accounting Team
