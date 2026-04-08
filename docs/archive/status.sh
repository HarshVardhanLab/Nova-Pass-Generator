#!/bin/bash

# Nova Pass Generator - Status Check Script

echo "🔍 Checking Nova Pass Generator status..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check backend
BACKEND_PIDS=$(pgrep -f "uvicorn app.main:app")
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "${GREEN}✓ Backend is running${NC} (PID: $BACKEND_PIDS)"
    echo "  URL: ${BLUE}http://localhost:8000${NC}"
else
    echo "${RED}✗ Backend is not running${NC}"
fi

# Check frontend
FRONTEND_PIDS=$(pgrep -f "vite")
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "${GREEN}✓ Frontend is running${NC} (PID: $FRONTEND_PIDS)"
    echo "  URL: ${BLUE}http://localhost:5173${NC}"
else
    echo "${RED}✗ Frontend is not running${NC}"
fi

echo ""

# Check if ports are in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port 8000 (Backend): ${GREEN}In use${NC}"
else
    echo "Port 8000 (Backend): ${RED}Available${NC}"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Port 5173 (Frontend): ${GREEN}In use${NC}"
else
    echo "Port 5173 (Frontend): ${RED}Available${NC}"
fi
