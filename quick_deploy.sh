#!/bin/bash

# Quick Deploy Script - Run this on your LOCAL machine
# This will package and upload your app to EC2

set -e

echo "📦 Nova Pass Generator - Quick Deploy to EC2"
echo "============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if required arguments are provided
if [ "$#" -ne 2 ]; then
    echo "${RED}Usage: ./quick_deploy.sh <path-to-key.pem> <ec2-public-ip>${NC}"
    echo ""
    echo "Example:"
    echo "  ./quick_deploy.sh ~/Downloads/my-key.pem 54.123.45.67"
    exit 1
fi

KEY_FILE=$1
EC2_IP=$2

# Validate key file
if [ ! -f "$KEY_FILE" ]; then
    echo "${RED}Error: Key file not found: $KEY_FILE${NC}"
    exit 1
fi

# Ensure key has correct permissions
chmod 400 "$KEY_FILE"

echo "${BLUE}Step 1: Creating deployment package...${NC}"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Using temp directory: $TEMP_DIR"

# Copy files
cp -r backend frontend deploy_ec2.sh "$TEMP_DIR/"

# Clean up unnecessary files
echo "Cleaning up unnecessary files..."
rm -rf "$TEMP_DIR/backend/venv"
rm -rf "$TEMP_DIR/backend/__pycache__"
rm -rf "$TEMP_DIR/backend/app/__pycache__"
rm -rf "$TEMP_DIR/backend/*.db"
rm -rf "$TEMP_DIR/backend/static/passes"/*
rm -rf "$TEMP_DIR/backend/static/qr_codes"/*
rm -rf "$TEMP_DIR/frontend/node_modules"
rm -rf "$TEMP_DIR/frontend/dist"

# Update frontend .env
echo "VITE_API_URL=http://$EC2_IP" > "$TEMP_DIR/frontend/.env"

# Create tarball
cd "$TEMP_DIR"
tar -czf nova-app.tar.gz backend/ frontend/ deploy_ec2.sh
cd -

echo "${GREEN}✓ Package created${NC}"
echo ""

echo "${BLUE}Step 2: Uploading to EC2...${NC}"
scp -i "$KEY_FILE" "$TEMP_DIR/nova-app.tar.gz" ubuntu@$EC2_IP:~
echo "${GREEN}✓ Upload complete${NC}"
echo ""

echo "${BLUE}Step 3: Extracting and deploying on EC2...${NC}"
ssh -i "$KEY_FILE" ubuntu@$EC2_IP << 'ENDSSH'
    echo "Extracting files..."
    mkdir -p nova-pass-generator
    tar -xzf nova-app.tar.gz -C nova-pass-generator
    cd nova-pass-generator
    
    echo "Making deploy script executable..."
    chmod +x deploy_ec2.sh
    
    echo "Starting deployment..."
    ./deploy_ec2.sh
ENDSSH

echo ""
echo "${GREEN}✓ Deployment complete!${NC}"
echo ""

# Clean up
rm -rf "$TEMP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}Nova Pass Generator is now live!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access your application:"
echo "  ${BLUE}http://$EC2_IP${NC}"
echo ""
echo "API Documentation:"
echo "  ${BLUE}http://$EC2_IP/docs${NC}"
echo ""
echo "Admin Login:"
echo "  Username: ${GREEN}admin${NC}"
echo "  Password: ${GREEN}admin123${NC}"
echo ""
echo "SSH to your instance:"
echo "  ${YELLOW}ssh -i $KEY_FILE ubuntu@$EC2_IP${NC}"
echo ""
echo "View logs:"
echo "  ${YELLOW}ssh -i $KEY_FILE ubuntu@$EC2_IP 'sudo journalctl -u nova-backend -f'${NC}"
echo ""
