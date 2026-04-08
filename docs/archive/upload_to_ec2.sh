#!/bin/bash

# Upload deployment package to EC2 using AWS CLI
# Requires AWS CLI to be installed and configured

set -e

echo "📤 Upload to EC2 using AWS CLI"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "${RED}Error: AWS CLI is not installed${NC}"
    echo ""
    echo "Install AWS CLI:"
    echo "  macOS: brew install awscli"
    echo "  Or visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check arguments
if [ "$#" -ne 1 ]; then
    echo "${RED}Usage: ./upload_to_ec2.sh <instance-id>${NC}"
    echo ""
    echo "Example:"
    echo "  ./upload_to_ec2.sh i-1234567890abcdef0"
    echo ""
    echo "Find your instance ID in AWS Console → EC2 → Instances"
    exit 1
fi

INSTANCE_ID=$1

# Check if package exists
if [ ! -f "nova-app.tar.gz" ]; then
    echo "${RED}Error: nova-app.tar.gz not found${NC}"
    echo ""
    echo "Run quick_deploy.sh first to create the package:"
    echo "  ./quick_deploy.sh YOUR_EC2_IP"
    exit 1
fi

echo "${BLUE}Getting instance information...${NC}"

# Get instance details
INSTANCE_INFO=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0]' 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "${RED}Error: Could not find instance $INSTANCE_ID${NC}"
    echo ""
    echo "Make sure:"
    echo "  1. AWS CLI is configured (run: aws configure)"
    echo "  2. Instance ID is correct"
    echo "  3. You have permissions to access the instance"
    exit 1
fi

PUBLIC_IP=$(echo $INSTANCE_INFO | jq -r '.PublicIpAddress')
STATE=$(echo $INSTANCE_INFO | jq -r '.State.Name')

echo "Instance ID: $INSTANCE_ID"
echo "Public IP: $PUBLIC_IP"
echo "State: $STATE"
echo ""

if [ "$STATE" != "running" ]; then
    echo "${RED}Error: Instance is not running (state: $STATE)${NC}"
    exit 1
fi

echo "${BLUE}Uploading package using AWS Systems Manager...${NC}"
echo ""

# Create a temporary S3 bucket or use existing one
BUCKET_NAME="nova-deploy-temp-$(date +%s)"

echo "Creating temporary S3 bucket..."
aws s3 mb s3://$BUCKET_NAME 2>/dev/null || echo "Using existing bucket"

echo "Uploading to S3..."
aws s3 cp nova-app.tar.gz s3://$BUCKET_NAME/nova-app.tar.gz

echo ""
echo "${GREEN}✓ Package uploaded to S3${NC}"
echo ""
echo "${YELLOW}Now, connect to your instance using EC2 Instance Connect and run:${NC}"
echo ""
echo "${GREEN}# Download from S3${NC}"
echo "aws s3 cp s3://$BUCKET_NAME/nova-app.tar.gz ~/nova-app.tar.gz"
echo ""
echo "${GREEN}# Extract${NC}"
echo "mkdir -p nova-pass-generator"
echo "tar -xzf nova-app.tar.gz -C nova-pass-generator"
echo "cd nova-pass-generator"
echo ""
echo "${GREEN}# Deploy${NC}"
echo "chmod +x deploy_ec2.sh"
echo "./deploy_ec2.sh"
echo ""
echo "${YELLOW}Or use this one-liner:${NC}"
echo ""
echo "aws s3 cp s3://$BUCKET_NAME/nova-app.tar.gz ~/nova-app.tar.gz && mkdir -p nova-pass-generator && tar -xzf nova-app.tar.gz -C nova-pass-generator && cd nova-pass-generator && chmod +x deploy_ec2.sh && ./deploy_ec2.sh"
echo ""
echo "${YELLOW}After deployment, clean up S3:${NC}"
echo "aws s3 rm s3://$BUCKET_NAME/nova-app.tar.gz"
echo "aws s3 rb s3://$BUCKET_NAME"
echo ""
