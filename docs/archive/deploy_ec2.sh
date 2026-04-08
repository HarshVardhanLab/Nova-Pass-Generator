#!/bin/bash

# Nova Pass Generator - AWS EC2 Deployment Script
# This script sets up the application on a fresh Ubuntu EC2 instance

set -e  # Exit on error

echo "🚀 Nova Pass Generator - EC2 Deployment"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
APP_DIR="/home/ubuntu/nova-pass-generator"
BACKEND_PORT=8000
FRONTEND_PORT=5173

echo "${BLUE}Step 1: Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

echo ""
echo "${BLUE}Step 2: Installing Python 3.11...${NC}"
sudo apt-get install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip

echo ""
echo "${BLUE}Step 3: Installing Node.js 18.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ""
echo "${BLUE}Step 4: Installing Nginx...${NC}"
sudo apt-get install -y nginx

echo ""
echo "${BLUE}Step 5: Installing system dependencies...${NC}"
sudo apt-get install -y build-essential libssl-dev libffi-dev git

echo ""
echo "${BLUE}Step 6: Setting up application directory...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

echo ""
echo "${BLUE}Step 7: Installing backend dependencies...${NC}"
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

echo ""
echo "${BLUE}Step 8: Installing frontend dependencies...${NC}"
cd ../frontend
npm install

echo ""
echo "${BLUE}Step 9: Building frontend for production...${NC}"
npm run build

echo ""
echo "${BLUE}Step 10: Setting up systemd services...${NC}"

# Create backend service
sudo tee /etc/systemd/system/nova-backend.service > /dev/null <<EOF
[Unit]
Description=Nova Pass Generator Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/venv/bin"
ExecStart=$APP_DIR/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create frontend service (for dev mode)
sudo tee /etc/systemd/system/nova-frontend.service > /dev/null <<EOF
[Unit]
Description=Nova Pass Generator Frontend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR/frontend
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "${BLUE}Step 11: Configuring Nginx...${NC}"

# Get EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

sudo tee /etc/nginx/sites-available/nova > /dev/null <<EOF
server {
    listen 80;
    server_name $PUBLIC_IP _;

    # Frontend (serve built files)
    location / {
        root $APP_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files (QR codes, passes)
    location /static {
        alias $APP_DIR/backend/static;
        autoindex off;
    }

    # API docs
    location /docs {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /redoc {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /openapi.json {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/nova /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

echo ""
echo "${BLUE}Step 12: Setting up firewall...${NC}"
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
echo "y" | sudo ufw enable

echo ""
echo "${BLUE}Step 13: Starting services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable nova-backend
sudo systemctl start nova-backend
sudo systemctl restart nginx

echo ""
echo "${GREEN}✓ Deployment completed successfully!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}Nova Pass Generator is now running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access your application at:"
echo "  ${BLUE}http://$PUBLIC_IP${NC}"
echo ""
echo "API Documentation:"
echo "  ${BLUE}http://$PUBLIC_IP/docs${NC}"
echo ""
echo "Admin Login:"
echo "  Username: ${GREEN}admin${NC}"
echo "  Password: ${GREEN}admin123${NC}"
echo ""
echo "Service Management:"
echo "  Backend:  sudo systemctl status nova-backend"
echo "  Nginx:    sudo systemctl status nginx"
echo ""
echo "Logs:"
echo "  Backend:  sudo journalctl -u nova-backend -f"
echo "  Nginx:    sudo tail -f /var/log/nginx/error.log"
echo ""
echo "${YELLOW}Important: Update frontend/.env with your EC2 IP:${NC}"
echo "  VITE_API_URL=http://$PUBLIC_IP"
echo ""
