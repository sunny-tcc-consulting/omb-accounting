#!/bin/bash

# omb-accounting Docker Initialization Script
# Usage: ./docker-init.sh [empty|seed]

set -e

echo "🚀 omb-accounting Docker Initialization"
echo "======================================="

# Configuration
COMPOSE_FILE="docker-compose.yml"
INIT_MODE="${1:-empty}"  # Default to empty initialization

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env.docker ]; then
    log_warn ".env.docker not found. Creating from .env.local.example..."
    cp .env.local.example .env.docker
    
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-this-to-a-secure-random-string")
    echo "JWT_SECRET=$JWT_SECRET" >> .env.docker
    
    log_info "Created .env.docker with secure JWT_SECRET"
fi

# Load environment variables
if [ -f .env.docker ]; then
    export $(grep -v '^#' .env.docker | xargs)
fi

# Build the Docker image
log_info "Building Docker image..."
docker compose build

# Initialize database
log_info "Initializing database (mode: $INIT_MODE)..."
export INIT_MODE=$INIT_MODE
docker compose --profile init up omb-init

# Start the application
log_info "Starting omb-accounting..."
docker compose up -d

# Wait for health check
log_info "Waiting for application to be ready..."
sleep 5

# Check health
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        log_info "✅ Application is healthy!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log_warn "Waiting for application... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_error "Application failed to start. Check logs with: docker compose logs"
    exit 1
fi

# Display access information
echo ""
echo "======================================="
echo -e "${GREEN}✅ omb-accounting is running!${NC}"
echo "======================================="
echo ""
echo "📍 Access the application at:"
echo "   http://localhost:3000"
echo ""
echo "📊 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop the application:"
echo "   docker compose down"
echo ""
echo "🔄 Restart the application:"
echo "   docker compose restart"
echo ""
echo "🗑️  Reset (remove all data):"
echo "   docker compose down -v"
echo ""
echo "======================================="
