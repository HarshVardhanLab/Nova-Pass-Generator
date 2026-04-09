#!/bin/bash

# Stop Nova Pass Generator Local Servers

echo "🛑 Stopping Nova Pass Generator..."
echo ""

# Kill backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null
    rm .backend.pid
    echo "✅ Backend stopped"
else
    # Try to find and kill uvicorn process
    pkill -f "uvicorn app.main:app"
    echo "✅ Backend stopped"
fi

# Kill frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
    echo "✅ Frontend stopped"
else
    # Try to find and kill vite process
    pkill -f "vite"
    echo "✅ Frontend stopped"
fi

echo ""
echo "All servers stopped."
