#!/bin/bash

# Nova Pass Generator - Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting Nova Pass Generator..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "${RED}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Check if Python 3.11 is available
if ! command -v python3.11 &> /dev/null; then
    echo "${RED}Error: Python 3.11 is required but not found${NC}"
    echo "Please install Python 3.11 first"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "${RED}Error: Node.js is required but not found${NC}"
    echo "Please install Node.js first"
    exit 1
fi

# Start Backend
echo "${BLUE}📦 Starting Backend (FastAPI)...${NC}"
cd backend

# Activate virtual environment if it exists, otherwise create it
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3.11 -m venv venv
fi

source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Start backend server
python3.11 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!

cd ..

echo "${GREEN}✓ Backend started on http://localhost:8000${NC}"
echo "  API Docs: http://localhost:8000/docs"
echo ""

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo "${BLUE}📦 Starting Frontend (React + Vite)...${NC}"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend server
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

cd ..

echo "${GREEN}✓ Frontend started on http://localhost:5173${NC}"
echo ""

# Show status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✨ Nova Pass Generator is running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Frontend: ${BLUE}http://localhost:5173${NC}"
echo "Backend:  ${BLUE}http://localhost:8000${NC}"
echo "API Docs: ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo "Admin Login:"
echo "  Username: ${GREEN}admin${NC}"
echo "  Password: ${GREEN}admin123${NC}"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "${RED}Press Ctrl+C to stop all servers${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait for processes
wait
