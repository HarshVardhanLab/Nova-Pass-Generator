# ⚡ EC2 Quick Start Guide

Deploy Nova Pass Generator to AWS EC2 in 3 simple steps!

---

## 🎯 Prerequisites

1. AWS Account
2. EC2 Key Pair (.pem file)
3. Your local machine with bash

---

## 🚀 Quick Deploy (Easiest Method)

### Step 1: Launch EC2 Instance

**Go to AWS Console → EC2 → Launch Instance**

Configure:
- **Name**: nova-pass-generator
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t2.medium (or t2.small for testing)
- **Key Pair**: Select or create new
- **Security Group**: Create new with these rules:
  ```
  SSH (22)    - Your IP
  HTTP (80)   - 0.0.0.0/0
  HTTPS (443) - 0.0.0.0/0
  ```
- **Storage**: 20 GB

Click **Launch Instance** and wait for it to start.

### Step 2: Run Quick Deploy Script

On your **local machine**:

```bash
# Make script executable
chmod +x quick_deploy.sh

# Deploy (replace with your values)
./quick_deploy.sh ~/Downloads/your-key.pem YOUR_EC2_PUBLIC_IP
```

Example:
```bash
./quick_deploy.sh ~/Downloads/nova-key.pem 54.123.45.67
```

This script will:
- ✅ Package your application
- ✅ Upload to EC2
- ✅ Install all dependencies
- ✅ Configure services
- ✅ Start the application

**Wait 5-10 minutes for deployment to complete.**

### Step 3: Access Your Application

Open browser:
```
http://YOUR_EC2_PUBLIC_IP
```

Login:
- Username: `admin`
- Password: `admin123`

**Done! 🎉**

---

## 📋 Manual Deploy (Alternative)

If you prefer manual control:

### 1. Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 2. Upload Files
```bash
# On local machine
tar -czf nova-app.tar.gz \
  --exclude='node_modules' \
  --exclude='venv' \
  --exclude='*.db' \
  backend/ frontend/ deploy_ec2.sh

scp -i your-key.pem nova-app.tar.gz ubuntu@YOUR_EC2_IP:~
```

### 3. Deploy on EC2
```bash
# On EC2 instance
mkdir -p nova-pass-generator
tar -xzf nova-app.tar.gz -C nova-pass-generator
cd nova-pass-generator

# Update frontend config
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > frontend/.env

# Run deployment
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

---

## 🔧 Post-Deployment

### Check Status
```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Run monitor script
cd nova-pass-generator
chmod +x monitor.sh
./monitor.sh
```

### View Logs
```bash
# Backend logs (live)
sudo journalctl -u nova-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

### Restart Services
```bash
# Restart backend
sudo systemctl restart nova-backend

# Restart nginx
sudo systemctl restart nginx
```

---

## 🔒 Security Setup (Important!)

### 1. Change Admin Password
- Login to application
- Go to settings
- Change default password

### 2. Set Up SSL (Recommended)

If you have a domain:

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Update frontend
cd ~/nova-pass-generator/frontend
echo "VITE_API_URL=https://yourdomain.com" > .env
npm run build
sudo systemctl reload nginx
```

### 3. Restrict SSH Access

In AWS Console:
- Go to Security Groups
- Edit inbound rules
- Change SSH source from 0.0.0.0/0 to "My IP"

---

## 📊 Monitoring

### System Monitor
```bash
cd ~/nova-pass-generator
./monitor.sh
```

### Check Service Status
```bash
sudo systemctl status nova-backend
sudo systemctl status nginx
```

### Resource Usage
```bash
# CPU and Memory
htop

# Disk space
df -h

# Network connections
sudo netstat -tulpn
```

---

## 🔄 Updates

### Update Application
```bash
# On local machine - redeploy
./quick_deploy.sh your-key.pem YOUR_EC2_IP

# Or manually on EC2
cd ~/nova-pass-generator
git pull  # if using git
sudo systemctl restart nova-backend
```

### Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo reboot  # if kernel updated
```

---

## 💾 Backup

### Manual Backup
```bash
# Create backup
mkdir -p ~/backups
cp ~/nova-pass-generator/backend/hackgear.db ~/backups/backup-$(date +%Y%m%d).db

# Download to local machine
scp -i your-key.pem ubuntu@YOUR_EC2_IP:~/backups/backup-*.db ./
```

### Automated Backup (Cron)
```bash
# Add to crontab
crontab -e

# Add this line (daily backup at 2 AM)
0 2 * * * cp ~/nova-pass-generator/backend/hackgear.db ~/backups/backup-$(date +\%Y\%m\%d).db
```

---

## 🐛 Troubleshooting

### Application Not Loading

1. **Check services:**
   ```bash
   sudo systemctl status nova-backend
   sudo systemctl status nginx
   ```

2. **Check logs:**
   ```bash
   sudo journalctl -u nova-backend -n 50
   sudo tail -50 /var/log/nginx/error.log
   ```

3. **Restart services:**
   ```bash
   sudo systemctl restart nova-backend
   sudo systemctl restart nginx
   ```

### Port Issues

```bash
# Check what's using ports
sudo lsof -i :8000
sudo lsof -i :80

# Kill process if needed
sudo kill -9 PID
```

### Database Issues

```bash
# Reset database
cd ~/nova-pass-generator/backend
rm hackgear.db
sudo systemctl restart nova-backend
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R ubuntu:ubuntu ~/nova-pass-generator

# Fix permissions
chmod -R 755 ~/nova-pass-generator/backend/static
```

---

## 💰 Cost Optimization

### Instance Types:
- **t2.micro** (Free Tier): Good for testing, may be slow
- **t2.small**: ~$15/month - Minimum recommended
- **t2.medium**: ~$34/month - Recommended for production
- **t2.large**: ~$68/month - For high traffic

### Save Money:
1. **Stop instance when not in use** (development)
2. **Use Reserved Instances** (save 30-40% for 1-year commitment)
3. **Use Spot Instances** (save 70-90% for non-critical workloads)
4. **Set up auto-shutdown** for development instances

### Auto-Shutdown Script (Dev Only):
```bash
# Stop instance at 6 PM daily
crontab -e

# Add:
0 18 * * * sudo shutdown -h now
```

---

## 📞 Support

### Useful Commands:
```bash
# Service management
sudo systemctl start|stop|restart|status nova-backend

# View logs
sudo journalctl -u nova-backend -f

# Monitor system
./monitor.sh

# Check disk space
df -h

# Check memory
free -h
```

### Common URLs:
- Application: `http://YOUR_EC2_IP`
- API Docs: `http://YOUR_EC2_IP/docs`
- Health Check: `http://YOUR_EC2_IP/api/v1/health`

---

## ✅ Checklist

After deployment, verify:

- [ ] Application loads at `http://YOUR_EC2_IP`
- [ ] Can login with admin credentials
- [ ] Can create an event
- [ ] Can upload CSV
- [ ] Can create template
- [ ] Can generate passes
- [ ] Can download passes
- [ ] Changed default admin password
- [ ] Set up SSL (if using domain)
- [ ] Configured backups
- [ ] Restricted SSH access

---

**Your Nova Pass Generator is now live on AWS! 🚀**

For detailed documentation, see `DEPLOYMENT.md`
