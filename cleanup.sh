#!/bin/bash

# Cleanup Script - Remove redundant documentation and scripts

echo "🧹 Cleaning up redundant files..."
echo ""

# Create docs directory for archived files
mkdir -p docs/archive

# Files to KEEP (essential)
KEEP_FILES=(
    "README.md"
    "VERCEL_EC2_DEPLOYMENT.md"
    "start.sh"
    "stop.sh"
    "deploy_backend_only.sh"
)

# Files to ARCHIVE (move to docs/archive)
ARCHIVE_FILES=(
    "ARCHITECTURE.md"
    "AWS_DEPLOYMENT_SUMMARY.md"
    "CHECKLIST.md"
    "CLOUDFLARE_TUNNEL.md"
    "DEPLOYMENT.md"
    "DEPLOYMENT_FILES.md"
    "DEPLOYMENT_UPDATED.md"
    "DEPLOY_NOW.md"
    "DEPLOY_WITH_GIT.md"
    "EC2_INSTANCE_CONNECT_GUIDE.md"
    "EC2_QUICK_START.md"
    "ENV_SETUP.md"
    "IMPLEMENTATION_SUMMARY.md"
    "INDEX.md"
    "INSTANT_URL.md"
    "NGROK_SETUP.md"
    "QUICK_DEPLOY.md"
    "QUICK_START.md"
    "SETUP.md"
    "START_HERE.md"
    "TUNNEL_COMPARISON.md"
    "TUNNEL_NO_DOMAIN.md"
    "deploy_ec2.sh"
    "manage.sh"
    "monitor.sh"
    "quick_deploy.sh"
    "status.sh"
    "upload_to_ec2.sh"
)

# Move files to archive
for file in "${ARCHIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" docs/archive/
        echo "✓ Archived: $file"
    fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📁 Essential files kept:"
for file in "${KEEP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file"
    fi
done

echo ""
echo "📦 Archived files moved to: docs/archive/"
echo ""
