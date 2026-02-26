#!/bin/bash

# omb-accounting Stop Script
# Stops the locally deployed application

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping omb-accounting..."

# Check for PID file
if [ -f "$PROJECT_DIR/.server.pid" ]; then
    PID=$(cat "$PROJECT_DIR/.server.pid")
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        rm "$PROJECT_DIR/.server.pid"
        echo "Stopped server (PID: $PID)"
    else
        echo "Server not running (stale PID file)"
        rm "$PROJECT_DIR/.server.pid"
    fi
else
    # Try to find and kill by port
    PORT=8000
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        kill $PID
        echo "Stopped server (PID: $PID)"
    else
        echo "No server found running on port $PORT"
    fi
fi

echo "Done!"
