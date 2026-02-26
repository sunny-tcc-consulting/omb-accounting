#!/bin/bash

# ============================================
# omb-accounting Stop Script
# Stops the running server
# ============================================

PORT=8000

echo "Stopping omb-accounting server on port $PORT..."

# Find and kill process on port 8000
PID=$(lsof -ti:${PORT} 2>/dev/null)

if [ -n "$PID" ]; then
    kill $PID
    echo "✅ Server stopped (PID: $PID)"
else
    echo "⚠️  No server found on port $PORT"
fi

# Also kill any node processes running next.js
pkill -f "next-server" 2>/dev/null && echo "Cleaned up next-server processes"

echo "Done!"
