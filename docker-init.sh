#!/bin/bash

# omb-accounting Docker/Podman Initialization Script
# Usage: ./docker-init.sh [empty|seed]

set -e

echo "🚀 omb-accounting Container Initialization"
echo "==========================================="

# Configuration
COMPOSE_FILE="docker-compose.yml"
INIT_MODE="${1:-empty}"  # Default to empty initialization
CONTAINER_RUNTIME=""
COMPOSE_CMD=""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Detect container runtime and compose command
detect_runtime() {
    log_info "Detecting container runtime..."
    
    # Check if Docker is available and running
    if command -v docker &> /dev/null; then
        if docker info &> /dev/null; then
            log_info "Docker daemon is running"
            CONTAINER_RUNTIME="docker"
            
            # Check for docker compose (v2) or docker-compose (v1)
            if docker compose version &> /dev/null 2>&1; then
                COMPOSE_CMD="docker compose"
                log_info "Using: docker compose"
            elif command -v docker-compose &> /dev/null; then
                COMPOSE_CMD="docker-compose"
                log_info "Using: docker-compose"
            else
                log_error "Docker Compose is not installed. Please install Docker Compose."
                exit 1
            fi
            return 0
        else
            log_warn "Docker is installed but daemon is not running"
        fi
    fi
    
    # Check if Podman is available
    if command -v podman &> /dev/null; then
        if podman info &> /dev/null; then
            log_info "Podman daemon is running"
            CONTAINER_RUNTIME="podman"
            
            # Check for podman-compose
            if command -v podman-compose &> /dev/null; then
                COMPOSE_CMD="podman-compose"
                log_info "Using: podman-compose"
            else
                log_error "podman-compose is not installed. Please install it:"
                echo "   pip install podman-compose"
                echo "   or: sudo dnf install podman-compose (Fedora/RHEL)"
                echo "   or: sudo apt install podman-compose (Debian/Ubuntu)"
                exit 1
            fi
            return 0
        else
            log_warn "Podman is installed but not properly configured"
        fi
    fi
    
    # No runtime found
    log_error "No container runtime found!"
    echo ""
    echo "Please install one of the following:"
    echo ""
    echo "Option 1: Docker"
    echo "  Ubuntu/Debian: curl -fsSL https://get.docker.com | sh"
    echo "  Fedora/RHEL:   dnf install docker docker-compose"
    echo "  macOS:         brew install --cask docker"
    echo ""
    echo "Option 2: Podman (rootless)"
    echo "  Ubuntu/Debian: apt install podman podman-compose"
    echo "  Fedora/RHEL:   dnf install podman podman-compose"
    echo "  macOS:         brew install podman podman-compose"
    echo ""
    exit 1
}

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

# Build the container image
log_info "Building container image with $CONTAINER_RUNTIME..."
$COMPOSE_CMD build

# Initialize database
log_info "Initializing database (mode: $INIT_MODE)..."
export INIT_MODE=$INIT_MODE
$COMPOSE_CMD --profile init up omb-init

# Start the application
log_info "Starting omb-accounting..."
$COMPOSE_CMD up -d

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
    log_error "Application failed to start. Check logs with: $COMPOSE_CMD logs"
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
echo "🔧 Container runtime: $CONTAINER_RUNTIME"
echo "📊 View logs:"
echo "   $COMPOSE_CMD logs -f"
echo ""
echo "🛑 Stop the application:"
echo "   $COMPOSE_CMD down"
echo ""
echo "🔄 Restart the application:"
echo "   $COMPOSE_CMD restart"
echo ""
echo "🗑️  Reset (remove all data):"
echo "   $COMPOSE_CMD down -v"
echo ""
echo "======================================="
