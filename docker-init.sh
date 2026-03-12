#!/bin/bash

# omb-accounting Docker/Podman Initialization Script
# Usage: ./docker-init.sh [empty|seed] [--no-compose]

set -e

echo "🚀 omb-accounting Container Initialization"
echo "==========================================="

# Configuration
COMPOSE_FILE="docker-compose.yml"
INIT_MODE="${1:-empty}"  # Default to empty initialization
USE_COMPOSE=true
CONTAINER_RUNTIME=""
COMPOSE_CMD=""

# Parse arguments
for arg in "$@"; do
    case $arg in
        --no-compose)
            USE_COMPOSE=false
            shift
            ;;
        empty|seed)
            INIT_MODE="$arg"
            shift
            ;;
        *)
            ;;
    esac
done

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
            
            if [ "$USE_COMPOSE" = true ]; then
                # Check for docker compose (v2) or docker-compose (v1)
                if docker compose version &> /dev/null 2>&1; then
                    COMPOSE_CMD="docker compose"
                    log_info "Using: docker compose"
                elif command -v docker-compose &> /dev/null; then
                    COMPOSE_CMD="docker-compose"
                    log_info "Using: docker-compose"
                else
                    log_warn "Docker Compose not found, will use pure docker commands"
                    USE_COMPOSE=false
                fi
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
            
            if [ "$USE_COMPOSE" = true ]; then
                # Check for podman-compose
                if command -v podman-compose &> /dev/null; then
                    COMPOSE_CMD="podman-compose"
                    log_info "Using: podman-compose"
                else
                    log_warn "podman-compose not found, will use pure podman commands"
                    USE_COMPOSE=false
                fi
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

# Container management functions for non-compose mode
build_image() {
    log_info "Building container image..."
    if [ "$CONTAINER_RUNTIME" = "docker" ]; then
        # Build and tag all stages
        docker build -t omb-accounting:latest \
            --target production \
            --build-arg BUILDKIT_INLINE_CACHE=1 \
            .
        # Also tag builder stage for database init
        docker build -t omb-accounting:builder \
            --target builder \
            .
    else
        # Build and tag all stages
        podman build -t localhost/omb-accounting:latest \
            --target production \
            .
        # Also tag builder stage for database init
        podman build -t localhost/omb-accounting:builder \
            --target builder \
            .
    fi
}

init_database() {
    log_info "Initializing database (mode: $INIT_MODE)..."
    
    # Create network if not exists
    if [ "$CONTAINER_RUNTIME" = "docker" ]; then
        docker network create omb-network 2>/dev/null || true
    else
        podman network create omb-network 2>/dev/null || true
    fi
    
    # Run initialization using builder image (has source code)
    if [ "$INIT_MODE" = "seed" ]; then
        local init_script="require('./src/lib/database/migrations').runMigrations(); require('./src/lib/database/seed').seedDatabase();"
    else
        local init_script="require('./src/lib/database/migrations').runMigrations();"
    fi
    
    if [ "$CONTAINER_RUNTIME" = "docker" ]; then
        docker run --rm \
            --workdir /app \
            -v omb-data:/app/data \
            -e DATABASE_PATH=/app/data/omb-accounting.db \
            -e INIT_MODE=$INIT_MODE \
            omb-accounting:builder \
            node -e "$init_script"
    else
        # For podman, create a temporary script file
        local temp_script="/tmp/db-init-$$.js"
        cat > "$temp_script" << 'EOF'
const { runMigrations } = require('/app/src/lib/database/migrations');
const { seedDatabase } = require('/app/src/lib/database/seed');

const mode = process.env.INIT_MODE || 'empty';

console.log('Initializing database (mode: ' + mode + ')...');

runMigrations().then(() => {
    console.log('Migrations complete');
    if (mode === 'seed') {
        return seedDatabase();
    }
}).then(() => {
    console.log('Database initialization complete');
    process.exit(0);
}).catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
});
EOF
        
        podman run --rm \
            -v omb-data:/app/data \
            -v "$temp_script:/tmp/db-init.js:ro" \
            -e DATABASE_PATH=/app/data/omb-accounting.db \
            -e INIT_MODE=$INIT_MODE \
            localhost/omb-accounting:builder \
            node /tmp/db-init.js
        
        rm -f "$temp_script"
    fi
}

start_container() {
    log_info "Starting omb-accounting container..."
    
    # Stop existing container if running
    if [ "$CONTAINER_RUNTIME" = "docker" ]; then
        docker stop omb-accounting 2>/dev/null || true
        docker rm omb-accounting 2>/dev/null || true
    else
        podman stop omb-accounting 2>/dev/null || true
        podman rm omb-accounting 2>/dev/null || true
    fi
    
    # Create volumes if not exist
    if [ "$CONTAINER_RUNTIME" = "docker" ]; then
        docker volume create omb-data 2>/dev/null || true
        docker volume create omb-logs 2>/dev/null || true
    else
        podman volume create omb-data 2>/dev/null || true
        podman volume create omb-logs 2>/dev/null || true
    fi
    
    # Start container
    local run_cmd="$CONTAINER_RUNTIME run -d"
    run_cmd="$run_cmd --name omb-accounting"
    run_cmd="$run_cmd -p 3000:3000"
    run_cmd="$run_cmd -e NODE_ENV=production"
    run_cmd="$run_cmd -e PORT=3000"
    run_cmd="$run_cmd -e DATABASE_PATH=/app/data/omb-accounting.db"
    run_cmd="$run_cmd -e JWT_SECRET=${JWT_SECRET:-change-this-secret}"
    run_cmd="$run_cmd -v omb-data:/app/data"
    run_cmd="$run_cmd -v omb-logs:/app/logs"
    run_cmd="$run_cmd --restart unless-stopped"
    
    if [ "$CONTAINER_RUNTIME" = "docker" ]; then
        run_cmd="$run_cmd omb-accounting:latest"
    else
        run_cmd="$run_cmd localhost/omb-accounting:latest"
    fi
    
    eval $run_cmd
}

# Build the container image
if [ "$USE_COMPOSE" = true ]; then
    log_info "Building container image with $CONTAINER_RUNTIME compose..."
    $COMPOSE_CMD build
else
    build_image
fi

# Initialize database
if [ "$USE_COMPOSE" = true ]; then
    log_info "Initializing database (mode: $INIT_MODE)..."
    export INIT_MODE=$INIT_MODE
    $COMPOSE_CMD --profile init up omb-init
else
    init_database
fi

# Start the application
if [ "$USE_COMPOSE" = true ]; then
    log_info "Starting omb-accounting..."
    $COMPOSE_CMD up -d
else
    start_container
fi

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
if [ "$USE_COMPOSE" = true ]; then
    echo "📊 Mode: Compose"
    echo ""
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
else
    echo "📊 Mode: Pure $CONTAINER_RUNTIME (no compose)"
    echo ""
    echo "📊 View logs:"
    echo "   $CONTAINER_RUNTIME logs -f omb-accounting"
    echo ""
    echo "🛑 Stop the application:"
    echo "   $CONTAINER_RUNTIME stop omb-accounting"
    echo "   $CONTAINER_RUNTIME rm omb-accounting"
    echo ""
    echo "🔄 Restart the application:"
    echo "   $CONTAINER_RUNTIME restart omb-accounting"
    echo ""
    echo "🗑️  Reset (remove all data):"
    echo "   $CONTAINER_RUNTIME stop omb-accounting"
    echo "   $CONTAINER_RUNTIME rm omb-accounting"
    echo "   $CONTAINER_RUNTIME volume rm omb-data omb-logs"
fi
echo ""
echo "======================================="
