#!/bin/bash

# Setup Auto-Deploy from GitHub to EC2
# This script helps you configure automatic deployment

echo "🚀 GitHub to EC2 Auto-Deploy Setup"
echo "===================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

echo "📋 You need to add these secrets to GitHub:"
echo ""
echo "1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""
echo "2. Add these three secrets:"
echo ""
echo "   Secret Name: EC2_HOST"
echo "   Value: 100.55.91.90"
echo ""
echo "   Secret Name: EC2_USERNAME"
echo "   Value: ubuntu"
echo ""
echo "   Secret Name: EC2_SSH_KEY"
echo "   Value: [Your EC2 private key content]"
echo ""
echo "3. To get your private key, run:"
echo "   cat ~/path/to/your-ec2-key.pem"
echo ""
echo "4. Copy the ENTIRE key including BEGIN/END lines"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Have you added all three secrets to GitHub? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please add the secrets first, then run this script again."
    exit 1
fi

echo ""
echo "✅ Great! Now let's push the workflow to GitHub..."
echo ""

# Add workflow file
git add .github/workflows/deploy-ec2.yml
git add GITHUB_AUTO_DEPLOY.md

# Check if there are changes
if git diff --staged --quiet; then
    echo "✅ Workflow already committed"
else
    git commit -m "Add GitHub Actions auto-deploy workflow"
    echo "✅ Workflow committed"
fi

echo ""
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo ""
echo "🎉 Auto-deploy is now configured!"
echo ""
echo "📝 Next steps:"
echo "   1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
echo "   2. You should see the workflow running"
echo "   3. Click on it to see deployment logs"
echo ""
echo "🧪 To test auto-deploy:"
echo "   1. Make any change to backend code"
echo "   2. git add . && git commit -m 'Test deploy' && git push"
echo "   3. Watch it deploy automatically!"
echo ""
echo "📖 Read GITHUB_AUTO_DEPLOY.md for more details"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
