# 🚀 Deploy with Git Clone - Simplest Method!

## ⚡ Super Quick Deployment (5 Minutes)

If your code is in a Git repository (GitHub, GitLab, Bitbucket), this is the easiest way to deploy!

---

## 📋 Prerequisites

1. EC2 instance running Ubuntu 22.04
2. Your code pushed to a Git repository
3. Repository is public OR you have access credentials

---

## 🎯 Deployment Steps

### Step 1: Launch EC2 Instance

**AWS Console → EC2 → Launch Instance**

```
Name: nova-pass-generator
AMI: Ubuntu Server 22.04 LTS
Instance Type: t2.medium
Storage: 20 GB

Security Group:
  ✓ SSH (22) - My IP
  ✓ HTTP (80) - 0.0.0.0/0
  ✓ HTTPS (443) - 0.0.0.0/0
```

Click **Launch** and wait for "Running" status.

---

### Step 2: Connect to EC2

**Using EC2 Instance Connect (Browser):**

1. AWS Console → EC2 → Instances
2. Select your instance
3. Click **"Connect"**
4. Choose **"EC2 Instance Connect"**
5. Click **"Connect"**

Browser terminal opens! ✅

---

### Step 3: Clone and Deploy

In the **EC2 Instance Connect terminal**:

```bash
# Clone your repository
git clone YOUR_REPOSITORY_URL nova-pass-generator
cd nova-pass-generator

# Update frontend config with your EC2 IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > frontend/.env

# Make deploy script executable
chmod +x deploy_ec2.sh

# Run deployment (takes 5-10 minutes)
./deploy_ec2.sh
```

**That's it!** ✨

---

## 📝 Example Commands

### For Public Repository

```bash
# Clone
git clone https://github.com/yourusername/nova-pass-generator.git nova-pass-generator
cd nova-pass-generator

# Configure
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > frontend/.env

# Deploy
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

### For Private Repository (GitHub)

```bash
# Clone with credentials
git clone https://YOUR_TOKEN@github.com/yourusername/nova-pass-generator.git nova-pass-generator

# Or use SSH (if you set up SSH keys)
git clone git@github.com:yourusername/nova-pass-generator.git nova-pass-generator

cd nova-pass-generator

# Configure and deploy
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > frontend/.env
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

---

## 🎉 Access Your Application

After deployment completes (5-10 minutes):

```
Application: http://YOUR_EC2_IP
API Docs:    http://YOUR_EC2_IP/docs

Login:
  Username: admin
  Password: admin123
```

---

## 🔄 Updating Your Application

When you push changes to your repository:

### Connect to EC2
```bash
# AWS Console → EC2 → Connect → EC2 Instance Connect
```

### Pull and Restart
```bash
cd ~/nova-pass-generator

# Pull latest changes
git pull

# If backend changed
sudo systemctl restart nova-backend

# If frontend changed
cd frontend
npm run build
sudo systemctl reload nginx
```

---

## 🛠️ Complete Update Script

Create this script for easy updates:

```bash
# In EC2 Instance Connect terminal
cd ~/nova-pass-generator

cat > update.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating Nova Pass Generator..."

# Pull latest code
git pull

# Update backend dependencies if needed
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# Rebuild frontend
cd frontend
npm install
npm run build
cd ..

# Restart services
sudo systemctl restart nova-backend
sudo systemctl reload nginx

echo "✅ Update complete!"
EOF

chmod +x update.sh
```

Then update anytime with:
```bash
./update.sh
```

---

## 🔒 Setting Up Git Credentials

### Option 1: Personal Access Token (Recommended)

**For GitHub:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`
4. Copy token

**Clone with token:**
```bash
git clone https://YOUR_TOKEN@github.com/username/repo.git
```

### Option 2: SSH Keys

**Generate SSH key on EC2:**
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
```

**Add to GitHub:**
1. Copy the public key
2. GitHub → Settings → SSH and GPG keys
3. New SSH key → Paste key

**Clone with SSH:**
```bash
git clone git@github.com:username/repo.git
```

---

## 📊 Deployment Timeline

```
┌─────────────────────────────────────────┐
│ Launch EC2 Instance          │ 2 min    │
├─────────────────────────────────────────┤
│ Connect via Instance Connect │ 30 sec   │
├─────────────────────────────────────────┤
│ Git clone repository         │ 30 sec   │
├─────────────────────────────────────────┤
│ Run deploy_ec2.sh            │ 5-10 min │
├─────────────────────────────────────────┤
│ Access application           │ Done! ✅  │
└─────────────────────────────────────────┘

Total: ~10-15 minutes
```

---

## 🎯 One-Liner Deployment

After connecting to EC2:

```bash
git clone YOUR_REPO_URL nova-pass-generator && cd nova-pass-generator && echo "VITE_API_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)" > frontend/.env && chmod +x deploy_ec2.sh && ./deploy_ec2.sh
```

Replace `YOUR_REPO_URL` with your actual repository URL.

---

## 🔧 Management

### Check Status
```bash
cd ~/nova-pass-generator
./monitor.sh
```

### Manage Services
```bash
cd ~/nova-pass-generator
./manage.sh
```

### View Logs
```bash
# Backend
sudo journalctl -u nova-backend -f

# Nginx
sudo tail -f /var/log/nginx/access.log
```

---

## 🐛 Troubleshooting

### Git Clone Fails

**Error: "Permission denied"**
- For private repos, use personal access token or SSH keys
- Check repository URL is correct

**Error: "Repository not found"**
- Check repository URL
- Verify repository is public or you have access

### Deployment Fails

**Check logs:**
```bash
cd ~/nova-pass-generator
cat deploy.log
```

**Common issues:**
- Python 3.11 installation failed → Check internet connection
- Node.js installation failed → Check internet connection
- Port already in use → Reboot instance

---

## 📚 Repository Structure

Make sure your repository has these files:

```
your-repo/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── deploy_ec2.sh          ← Required!
├── manage.sh
├── monitor.sh
└── README.md
```

---

## ✅ Advantages of Git Deployment

### Easy Updates
```bash
git pull
sudo systemctl restart nova-backend
```

### Version Control
- Track all changes
- Rollback if needed
- Collaborate with team

### CI/CD Ready
- Can add GitHub Actions
- Automated testing
- Automated deployment

### No File Uploads
- No need to create packages
- No need to upload files
- Direct from repository

---

## 🚀 Advanced: Automated Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/nova-pass-generator
            git pull
            sudo systemctl restart nova-backend
            cd frontend && npm run build
            sudo systemctl reload nginx
```

---

## 💡 Best Practices

### 1. Use .gitignore

Make sure these are in `.gitignore`:

```
# Python
__pycache__/
*.py[cod]
venv/
.venv/
*.db

# Node
node_modules/
dist/
.env.local

# Generated files
backend/static/passes/
backend/static/qr_codes/
```

### 2. Environment Variables

Don't commit sensitive data:
- Use `.env.example` for templates
- Set actual values on EC2
- Use AWS Secrets Manager for production

### 3. Branches

- `main` - Production
- `dev` - Development
- `feature/*` - Features

Deploy from `main` only.

---

## 📞 Quick Reference

### Clone and Deploy
```bash
git clone YOUR_REPO nova-pass-generator
cd nova-pass-generator
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > frontend/.env
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

### Update
```bash
cd ~/nova-pass-generator
git pull
sudo systemctl restart nova-backend
```

### Check Status
```bash
cd ~/nova-pass-generator
./monitor.sh
```

---

## 🎉 Summary

Git-based deployment is:
- ✅ Fastest method
- ✅ Easiest to update
- ✅ Best for teams
- ✅ Version controlled
- ✅ No file uploads needed

**Just clone and deploy!** 🚀

---

**Ready to deploy? Connect to EC2 and run:**

```bash
git clone YOUR_REPOSITORY_URL nova-pass-generator
cd nova-pass-generator
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > frontend/.env
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

**That's it! Your application will be live in 10 minutes! 🎉**
