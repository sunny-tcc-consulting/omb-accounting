#!/bin/bash

# omb-accounting Auto Deployment Script
# Deploys to localhost:8000

set -e

echo "🚀 Starting omb-accounting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project directory
cd "$(dirname "$0")"

# Function to check if port is in use
check_port() {
    if lsof -i:$1 > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    echo -e "${YELLOW}Stopping existing process on port $1...${NC}"
    lsof -i:$1 | awk 'NR>1 {print $2}' | xargs kill -9 2>/dev/null || true
    sleep 2
}

# Check if port 8000 is already in use
if check_port 8000; then
    echo -e "${YELLOW}Port 8000 is already in use.${NC}"
    read -p "Kill existing process and continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_port 8000
    else
        echo -e "${RED}Deployment cancelled.${NC}"
        exit 1
    fi
fi

# Install dependencies (only if node_modules doesn't exist)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Run tests
echo ""
echo -e "${YELLOW}Running tests...${NC}"
npm test
if [ $? -ne 0 ]; then
    echo -e "${RED}Tests failed! Deployment aborted.${NC}"
    exit 1
fi

# Build the application
echo ""
echo -e "${YELLOW}Building application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Deployment aborted.${NC}"
    exit 1
fi

# Start the application
echo ""
echo -e "${GREEN}Starting application on port 8000...${NC}"
echo ""
echo "======================================"
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo "======================================"
echo ""
echo "Access the application at:"
echo -e "  ${GREEN}http://localhost:8000${NC}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Set environment variables and start
export NODE_ENV=production
export PORT=8000

npm run start
