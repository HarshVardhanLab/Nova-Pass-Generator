#!/bin/bash

# Nova Pass Generator - Stop Script
# This script stops both backend and frontend servers

echo "🛑 Stopping Nova Pass Generator..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Kill backend (uvicorn)
BACKEND_PIDS=$(pgrep -f "uvicorn app.main:app")
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "Stopping backend..."
    kill $BACKEND_PIDS 2>/dev/null
    echo "${GREEN}✓ Backend stopped${NC}"
else
    echo "Backend not running"
fi

# Kill frontend (vite)
FRONTEND_PIDS=$(pgrep -f "vite")
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "Stopping frontend..."
    kill $FRONTEND_PIDS 2>/dev/null
    echo "${GREEN}✓ Frontend stopped${NC}"
else
    echo "Frontend not running"
fi

echo ""
echo "${GREEN}All servers stopped${NC}"
