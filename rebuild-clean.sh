#!/bin/bash
# Complete rebuild script - removes all old containers, images, and volumes

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

# Build fresh image
echo "🏗️  Building fresh Docker image..."
./docker-init.sh empty --no-compose

echo ""
echo "✅ Complete rebuild finished!"
echo ""
echo "📍 Access the application at: http://localhost:3000"
echo "📧 Default login: admin@omb.com / admin123"
echo ""
