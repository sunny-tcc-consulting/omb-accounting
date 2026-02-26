#!/bin/bash

# ============================================
# omb-accounting Auto-Deployment Script
# Deploys to localhost at port 8000
# ============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT=8000
NODE_ENV=production

# Print banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           omb-accounting Auto-Deployment Script            ║"
echo "║                    Port: ${PORT}                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print status
status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Step 1: Check prerequisites
status "Step 1/5: Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 20+ first."
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    error "Node.js version 20+ required. Current: $(node -v)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    error "npm is not installed."
fi

success "Prerequisites check passed (Node.js $(node -v), npm $(npm -v))"

# Step 2: Install dependencies
status "Step 2/5: Installing dependencies..."
cd "$PROJECT_DIR"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    warn "node_modules exists. Running npm install to update..."
    npm install --prefer-offline --no-audit
else
    npm install --no-audit
fi

success "Dependencies installed"

# Step 3: Initialize database
status "Step 3/5: Checking database..."

# Create data directory if it doesn't exist
mkdir -p "$PROJECT_DIR/data"

# Check if database exists
if [ -f "data/omb-accounting.db" ]; then
    success "Database found at data/omb-accounting.db"
else
    warn "Database not found. A new database will be created on first run."
    # Create empty database file
    touch "data/omb-accounting.db"
fi

# Step 4: Build application
status "Step 4/5: Building application..."

# Run build
npm run build

success "Application built successfully"

# Step 5: Start application
status "Step 5/5: Starting application on port $PORT..."

# Kill any existing process on the port
if lsof -ti:${PORT} > /dev/null 2>&1; then
    warn "Port $PORT is in use. Killing existing process..."
    kill $(lsof -ti:${PORT}) 2>/dev/null || true
    sleep 2
fi

# Start the application
export PORT
export NODE_ENV

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Deployment Complete!                                  ║${NC}"
echo -e "${GREEN}║  🌐 Application running at: http://localhost:${PORT}       ║${NC}"
echo -e "${GREEN}║  📊 API available at: http://localhost:${PORT}/api        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Start Next.js production server in background
npm run start -- -p ${PORT} > logs/deployment.log 2>&1 &
DEPLOYMENT_PID=$!

# Wait for the server to start
sleep 5

# Check if the server is running
if kill -0 $DEPLOYMENT_PID 2>/dev/null; then
    success "Server started with PID: $DEPLOYMENT_PID"
    echo ""
    echo "To stop the server, run: kill $DEPLOYMENT_PID"
    echo "To view logs, run: tail -f logs/deployment.log"

    # Create a stop script
    cat > "$PROJECT_DIR/scripts/stop.sh" << EOF
#!/bin/bash
# Stop script for omb-accounting
kill $DEPLOYMENT_PID 2>/dev/null
echo "Server stopped"
EOF
    chmod +x "$PROJECT_DIR/scripts/stop.sh"

else
    error "Failed to start server. Check logs/deployment.log for details."
fi

echo ""
status "Deployment script completed successfully!"
