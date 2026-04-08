#!/bin/bash

# Quick Deploy Script - Package for EC2 Instance Connect
# This creates a deployment package you can upload via AWS Console

set -e

echo "📦 Nova Pass Generator - Deployment Package Creator"
echo "===================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if EC2 IP is provided
if [ "$#" -ne 1 ]; then
    echo "${RED}Usage: ./quick_deploy.sh <ec2-public-ip>${NC}"
    echo ""
    echo "Example:"
    echo "  ./quick_deploy.sh 54.123.45.67"
    echo ""
    echo "This will create a deployment package that you can upload"
    echo "to your EC2 instance using AWS Instance Connect."
    exit 1
fi

EC2_IP=$1

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

# Move to current directory
mv "$TEMP_DIR/nova-app.tar.gz" ./nova-app.tar.gz

echo "${GREEN}✓ Package created: nova-app.tar.gz${NC}"
echo ""

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}Deployment package ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Go to AWS EC2 Console"
echo "   ${BLUE}https://console.aws.amazon.com/ec2/${NC}"
echo ""
echo "2. Select your instance and click 'Connect'"
echo ""
echo "3. Choose 'EC2 Instance Connect' and click 'Connect'"
echo ""
echo "4. In the browser terminal, run these commands:"
echo ""
echo "${BLUE}   # Upload the package (use the Upload button in Instance Connect)${NC}"
echo "${BLUE}   # Or use this command in your local terminal:${NC}"
echo "   ${GREEN}aws ec2-instance-connect send-ssh-public-key \\${NC}"
echo "   ${GREEN}  --instance-id YOUR_INSTANCE_ID \\${NC}"
echo "   ${GREEN}  --instance-os-user ubuntu \\${NC}"
echo "   ${GREEN}  --ssh-public-key file://~/.ssh/id_rsa.pub${NC}"
echo ""
echo "   ${BLUE}# Then in Instance Connect terminal:${NC}"
echo "   ${GREEN}# Extract the package${NC}"
echo "   tar -xzf nova-app.tar.gz"
echo "   cd nova-pass-generator"
echo ""
echo "   ${GREEN}# Make deploy script executable${NC}"
echo "   chmod +x deploy_ec2.sh"
echo ""
echo "   ${GREEN}# Run deployment${NC}"
echo "   ./deploy_ec2.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${YELLOW}Alternative: Use the upload_to_ec2.sh script${NC}"
echo "If you have AWS CLI configured:"
echo "  ${GREEN}./upload_to_ec2.sh YOUR_INSTANCE_ID${NC}"
echo ""
echo "Package location: ${GREEN}./nova-app.tar.gz${NC}"
echo "Package size: $(du -h nova-app.tar.gz | cut -f1)"
echo ""
echo "After deployment, access your application at:"
echo "  ${BLUE}http://$EC2_IP${NC}"
echo ""
