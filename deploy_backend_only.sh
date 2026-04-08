#!/bin/bash

# Deploy Backend Only (for Vercel + EC2 setup)

set -e

echo "🚀 Nova Pass Generator - Backend Only Deployment"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if in correct directory
if [ ! -f "backend/app/main.py" ]; then
    echo "${RED}Error: backend/app/main.py not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "${BLUE}Step 1: Installing Python 3.11...${NC}"
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip

echo ""
echo "${BLUE}Step 2: Setting up backend...${NC}"
cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

deactivate
cd ..

echo ""
echo "${BLUE}Step 3: Creating systemd service...${NC}"

# Get current directory
CURRENT_DIR=$(pwd)

sudo tee /etc/systemd/system/nova-backend.service > /dev/null <<EOF
[Unit]
Description=Nova Pass Generator Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=${CURRENT_DIR}/backend
Environment="PATH=${CURRENT_DIR}/backend/venv/bin"
ExecStart=${CURRENT_DIR}/backend/venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "${BLUE}Step 4: Starting backend service...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable nova-backend
sudo systemctl start nova-backend

# Wait a moment
sleep 3

echo ""
echo "${BLUE}Step 5: Checking status...${NC}"
sudo systemctl status nova-backend --no-pager

echo ""
echo "${GREEN}✓ Backend deployment complete!${NC}"
echo ""

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_IP")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}Backend is now running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend URL: ${BLUE}http://$PUBLIC_IP:8000${NC}"
echo "API Docs:    ${BLUE}http://$PUBLIC_IP:8000/docs${NC}"
echo ""
echo "${YELLOW}Important: Make sure Security Group allows port 8000!${NC}"
echo ""
echo "Next Steps:"
echo "1. Test backend: ${GREEN}curl http://$PUBLIC_IP:8000/docs${NC}"
echo "2. Deploy frontend on Vercel with:"
echo "   ${GREEN}VITE_API_URL=http://$PUBLIC_IP:8000${NC}"
echo ""
echo "Service Management:"
echo "  Status:  ${GREEN}sudo systemctl status nova-backend${NC}"
echo "  Restart: ${GREEN}sudo systemctl restart nova-backend${NC}"
echo "  Logs:    ${GREEN}sudo journalctl -u nova-backend -f${NC}"
echo ""
