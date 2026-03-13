#!/bin/bash
# Complete rebuild script - removes all old containers, images, and volumes
# Uses --no-cache to ensure fresh build with latest code

set -e

echo "🔄 Complete Rebuild Script"
echo "=========================="
echo ""

# Stop and remove containers
echo "📦 Stopping and removing containers..."
docker stop omb-accounting 2>/dev/null || true
docker rm omb-accounting 2>/dev/null || true

# Remove volumes
echo "🗑️  Removing volumes..."
docker volume rm omb-data 2>/dev/null || true
docker volume rm omb-logs 2>/dev/null || true

# Remove old images
echo "🗑️  Removing old images..."
docker rmi localhost/omb-accounting:latest 2>/dev/null || true
docker rmi localhost/omb-accounting:builder 2>/dev/null || true

# Remove Docker build cache (IMPORTANT!)
echo "🧹 Clearing Docker build cache..."
docker builder prune -f

# Build fresh image with NO CACHE
echo "🏗️  Building fresh Docker image (no cache)..."
echo "   This may take a few minutes..."

# Build builder stage first
echo "   Building builder stage..."
docker build --no-cache --progress=plain \
  --target builder \
  -t localhost/omb-accounting:builder \
  .

# Build production stage
echo "   Building production stage..."
docker build --no-cache --progress=plain \
  --target production \
  -t localhost/omb-accounting:latest \
  .

# Start application
echo "🚀 Starting application..."
docker run -d \
  --name omb-accounting \
  -p 3000:3000 \
  -e DATABASE_PATH=/app/data/omb-accounting.db \
  -e NODE_ENV=production \
  -v omb-data:/app/data \
  -v omb-logs:/app/logs \
  --restart unless-stopped \
  localhost/omb-accounting:latest

# Wait for app to start
echo "⏳ Waiting for application to start..."
sleep 5

echo ""
echo "✅ Complete rebuild finished!"
echo ""
echo "📍 Access the application at: http://localhost:3000"
echo "📧 Default login: admin@omb.com / admin123"
echo ""
echo "📋 To view debug logs:"
echo "   docker logs omb-accounting --tail 100 | grep -E '\[DATABASE\]|\[BANK API\]'"
echo ""
echo "🔍 To view all logs:"
echo "   docker logs omb-accounting --tail 200"
echo ""
