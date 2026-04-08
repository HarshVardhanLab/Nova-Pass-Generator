#!/bin/bash

# Deploy Backend with PM2 on EC2

set -e

echo "🚀 Nova Pass Generator - Backend Deployment with PM2"
echo "===================================================="
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

echo "${BLUE}Step 1: Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ""
echo "${BLUE}Step 2: Installing PM2...${NC}"
sudo npm install -g pm2

echo ""
echo "${BLUE}Step 3: Installing Python 3.11...${NC}"
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip

echo ""
echo "${BLUE}Step 4: Setting up backend...${NC}"
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
echo "${BLUE}Step 5: Creating PM2 ecosystem file...${NC}"

# Get current directory
CURRENT_DIR=$(pwd)

cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'nova-backend',
    script: '${CURRENT_DIR}/backend/venv/bin/python',
    args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8000',
    cwd: '${CURRENT_DIR}/backend',
    interpreter: 'none',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '${CURRENT_DIR}/logs/error.log',
    out_file: '${CURRENT_DIR}/logs/out.log',
    log_file: '${CURRENT_DIR}/logs/combined.log',
    time: true
  }]
};
EOF

echo ""
echo "${BLUE}Step 6: Creating logs directory...${NC}"
mkdir -p logs

echo ""
echo "${BLUE}Step 7: Starting backend with PM2...${NC}"
pm2 start ecosystem.config.js

echo ""
echo "${BLUE}Step 8: Saving PM2 configuration...${NC}"
pm2 save

echo ""
echo "${BLUE}Step 9: Setting up PM2 to start on boot...${NC}"
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# Note: You may need to run the command that PM2 outputs

echo ""
echo "${GREEN}✓ Backend deployment complete!${NC}"
echo ""

# Get public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_IP")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}Backend is now running with PM2!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backend URL: ${BLUE}http://$PUBLIC_IP:8000${NC}"
echo "API Docs:    ${BLUE}http://$PUBLIC_IP:8000/docs${NC}"
echo ""
echo "${YELLOW}Important: Make sure Security Group allows port 8000!${NC}"
echo ""
echo "PM2 Commands:"
echo "  Status:  ${GREEN}pm2 status${NC}"
echo "  Logs:    ${GREEN}pm2 logs nova-backend${NC}"
echo "  Restart: ${GREEN}pm2 restart nova-backend${NC}"
echo "  Stop:    ${GREEN}pm2 stop nova-backend${NC}"
echo "  Monitor: ${GREEN}pm2 monit${NC}"
echo ""
echo "Next Steps:"
echo "1. Test backend: ${GREEN}curl http://$PUBLIC_IP:8000/docs${NC}"
echo "2. Update Vercel env: ${GREEN}VITE_API_URL=http://$PUBLIC_IP:8000${NC}"
echo ""
