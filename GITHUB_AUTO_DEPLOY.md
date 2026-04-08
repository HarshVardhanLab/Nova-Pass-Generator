# GitHub Auto-Deploy to EC2 Setup Guide

This guide will help you set up automatic deployment to EC2 whenever you push code to GitHub.

## Overview

When you push code to GitHub (main branch), GitHub Actions will:
1. Connect to your EC2 instance via SSH
2. Pull the latest code
3. Install dependencies
4. Restart the backend with PM2

## Step-by-Step Setup

### Step 1: Prepare Your EC2 Instance

SSH into your EC2 instance and set up Git:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@100.55.91.90

# Navigate to project directory
cd /home/ubuntu/Nova-Pass-Generator

# Initialize git if not already done
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Or if already initialized, just set the remote
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Pull the code
git pull origin main
```

### Step 2: Get Your EC2 SSH Private Key

You need the private key (.pem file) that you use to SSH into EC2.

```bash
# On your local machine, view your private key
cat ~/path/to/your-ec2-key.pem
```

Copy the entire content including:
```
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

**IMPORTANT:** 
- Copy the ENTIRE key including the BEGIN and END lines
- Make sure there are NO extra spaces or newlines at the beginning or end
- The key should start with `-----BEGIN` and end with `-----END`
- If your key starts with `-----BEGIN OPENSSH PRIVATE KEY-----`, that's fine too

### Step 3: Add GitHub Secrets

Go to your GitHub repository:

1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these three secrets:

#### Secret 1: EC2_HOST
- Name: `EC2_HOST`
- Value: `100.55.91.90`

#### Secret 2: EC2_USERNAME
- Name: `EC2_USERNAME`
- Value: `ubuntu`

#### Secret 3: EC2_SSH_KEY
- Name: `EC2_SSH_KEY`
- Value: Paste your entire private key content (from Step 2)

### Step 4: Push the Workflow File

The workflow file has been created at `.github/workflows/deploy-ec2.yml`

```bash
# On your local machine
git add .github/workflows/deploy-ec2.yml
git add backend/app/schemas/schemas.py
git add backend/.env
git commit -m "Add auto-deploy workflow and fix email validation"
git push origin main
```

### Step 5: Verify Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see your workflow running
4. Click on the workflow to see the deployment logs

### Step 6: Test Auto-Deploy

Make a small change to test:

```bash
# Edit any backend file
echo "# Test change" >> backend/README.md

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Watch the Actions tab to see the deployment happen automatically!

## How It Works

```
┌─────────────┐
│  You Push   │
│  to GitHub  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ GitHub Actions  │
│   Triggered     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  SSH to EC2     │
│  100.55.91.90   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  git pull       │
│  Install deps   │
│  Restart PM2    │
└─────────────────┘
```

## Workflow Triggers

The workflow runs when:
- You push to the `main` branch
- Changes are in the `backend/` folder
- Changes are in the workflow file itself

## Customization

### Change Branch Name

Edit `.github/workflows/deploy-ec2.yml`:

```yaml
on:
  push:
    branches:
      - your-branch-name  # Change this
```

### Deploy Frontend Too

Add frontend deployment steps:

```yaml
script: |
  cd /home/ubuntu/Nova-Pass-Generator
  git pull origin main
  
  # Backend
  cd backend
  source venv/bin/activate
  pip install -r requirements.txt
  cd ..
  pm2 restart nova-backend
  
  # Frontend (if hosted on EC2)
  cd frontend
  npm install
  npm run build
  pm2 restart nova-frontend
```

### Add Notifications

Add Slack/Discord notifications on deployment success/failure:

```yaml
- name: Notify on success
  if: success()
  run: echo "Deployment successful!"
  
- name: Notify on failure
  if: failure()
  run: echo "Deployment failed!"
```

## Troubleshooting

### Workflow fails with "Permission denied"

- Check that EC2_SSH_KEY secret contains the correct private key
- Ensure the key has proper format with BEGIN/END lines
- Verify EC2 security group allows SSH from GitHub Actions IPs

### Git pull fails

```bash
# On EC2, configure git to store credentials
cd /home/ubuntu/Nova-Pass-Generator
git config --global credential.helper store

# For private repos, use personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/USERNAME/REPO.git
```

### PM2 restart fails

```bash
# SSH into EC2 and check PM2 status
pm2 status
pm2 logs nova-backend

# Ensure PM2 is saved
pm2 save
```

## Manual Deployment (Backup Method)

If GitHub Actions fails, you can still deploy manually:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@100.55.91.90

# Pull and restart
cd /home/ubuntu/Nova-Pass-Generator
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ..
pm2 restart nova-backend
```

## Security Best Practices

1. **Never commit** `.env` files to GitHub
2. **Use GitHub Secrets** for sensitive data
3. **Rotate SSH keys** periodically
4. **Limit EC2 security group** to specific IPs if possible
5. **Use deploy keys** instead of personal SSH keys for production

## Next Steps

- Set up staging environment
- Add automated tests before deployment
- Configure rollback on failure
- Add deployment notifications
- Set up monitoring and alerts
