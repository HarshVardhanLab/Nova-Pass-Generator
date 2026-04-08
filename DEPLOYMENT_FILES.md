# 📦 Deployment Files Overview

Complete guide to all deployment-related files for AWS EC2.

---

## 📁 Files Created

### 1. **deploy_ec2.sh** ⭐
Main deployment script that runs on EC2 instance.

**What it does:**
- Installs Python 3.11, Node.js, Nginx
- Sets up virtual environment
- Installs all dependencies
- Builds frontend
- Configures systemd services
- Sets up Nginx reverse proxy
- Starts all services

**Usage:**
```bash
# On EC2 instance
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

---

### 2. **quick_deploy.sh** ⭐⭐⭐ (RECOMMENDED)
One-command deployment from your local machine.

**What it does:**
- Packages your application
- Uploads to EC2
- Runs deploy_ec2.sh automatically
- Shows you the final URLs

**Usage:**
```bash
# On your LOCAL machine
chmod +x quick_deploy.sh
./quick_deploy.sh ~/path/to/key.pem YOUR_EC2_IP
```

**Example:**
```bash
./quick_deploy.sh ~/Downloads/nova-key.pem 54.123.45.67
```

---

### 3. **manage.sh**
Interactive management menu for EC2.

**Features:**
- Start/stop/restart services
- View logs
- Monitor resources
- Backup database
- Update application
- Clean logs

**Usage:**
```bash
# On EC2 instance
chmod +x manage.sh
./manage.sh
```

---

### 4. **monitor.sh**
System monitoring script.

**Shows:**
- Service status
- Port status
- CPU/Memory/Disk usage
- Recent logs
- Database size

**Usage:**
```bash
# On EC2 instance
chmod +x monitor.sh
./monitor.sh
```

---

### 5. **start.sh**
Local development startup script.

**Usage:**
```bash
# On your LOCAL machine
chmod +x start.sh
./start.sh
```

---

### 6. **stop.sh**
Stop local development servers.

**Usage:**
```bash
./stop.sh
```

---

### 7. **status.sh**
Check local development server status.

**Usage:**
```bash
./status.sh
```

---

## 📄 Documentation Files

### 1. **DEPLOYMENT.md** ⭐⭐⭐
Complete deployment guide with:
- Step-by-step instructions
- EC2 configuration
- SSL setup
- Troubleshooting
- Security recommendations
- Backup/restore procedures
- Cost estimation

---

### 2. **EC2_QUICK_START.md** ⭐⭐⭐ (START HERE)
Quick start guide for beginners:
- Simple 3-step deployment
- Common tasks
- Troubleshooting
- Cost optimization

---

### 3. **START_HERE.md**
Local development quick start.

---

### 4. **DEPLOYMENT_FILES.md** (This file)
Overview of all deployment files.

---

## 🚀 Deployment Workflows

### Workflow 1: Quick Deploy (Easiest) ⭐⭐⭐

```bash
# 1. Launch EC2 instance in AWS Console
# 2. Run from your local machine:
./quick_deploy.sh ~/Downloads/key.pem 54.123.45.67

# 3. Open browser:
http://54.123.45.67
```

**Time:** 10-15 minutes

---

### Workflow 2: Manual Deploy

```bash
# 1. Launch EC2 instance

# 2. Upload files
tar -czf nova-app.tar.gz backend/ frontend/ deploy_ec2.sh
scp -i key.pem nova-app.tar.gz ubuntu@EC2_IP:~

# 3. SSH and deploy
ssh -i key.pem ubuntu@EC2_IP
tar -xzf nova-app.tar.gz
cd nova-pass-generator
./deploy_ec2.sh
```

**Time:** 15-20 minutes

---

### Workflow 3: Git-based Deploy

```bash
# 1. Push code to Git repository

# 2. SSH to EC2
ssh -i key.pem ubuntu@EC2_IP

# 3. Clone and deploy
git clone YOUR_REPO nova-pass-generator
cd nova-pass-generator
./deploy_ec2.sh
```

**Time:** 10-15 minutes

---

## 🔧 Common Tasks

### Update Application

**Option 1: Full redeploy**
```bash
# From local machine
./quick_deploy.sh key.pem EC2_IP
```

**Option 2: Manual update**
```bash
# On EC2
cd ~/nova-pass-generator
git pull  # or upload new files
sudo systemctl restart nova-backend
```

---

### View Logs

```bash
# Backend logs
sudo journalctl -u nova-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
```

---

### Backup Database

```bash
# On EC2
cd ~/nova-pass-generator
./manage.sh
# Select option 13
```

Or manually:
```bash
cp ~/nova-pass-generator/backend/hackgear.db ~/backup-$(date +%Y%m%d).db
```

---

### Restart Services

```bash
# Using manage.sh
./manage.sh
# Select option 3

# Or manually
sudo systemctl restart nova-backend
sudo systemctl restart nginx
```

---

## 📊 Monitoring

### Check Status
```bash
./monitor.sh
```

### Check Services
```bash
sudo systemctl status nova-backend
sudo systemctl status nginx
```

### Check Resources
```bash
htop
df -h
free -h
```

---

## 🐛 Troubleshooting

### Application not loading

1. Check services:
   ```bash
   ./manage.sh  # Option 4 and 7
   ```

2. Check logs:
   ```bash
   ./manage.sh  # Option 5 and 8
   ```

3. Restart:
   ```bash
   ./manage.sh  # Option 3 and 6
   ```

---

### Port conflicts

```bash
# Check ports
./manage.sh  # Option 12

# Kill process
sudo lsof -i :8000
sudo kill -9 PID
```

---

### Database issues

```bash
# Backup first
./manage.sh  # Option 13

# Reset database
./manage.sh  # Option 15
```

---

## 🔒 Security Checklist

After deployment:

- [ ] Change admin password
- [ ] Set up SSL/HTTPS
- [ ] Restrict SSH to your IP
- [ ] Enable firewall
- [ ] Set up automated backups
- [ ] Update system packages
- [ ] Configure CloudWatch (optional)

---

## 💰 Cost Optimization

### Instance Types:
- **t2.micro**: Free tier, testing only
- **t2.small**: ~$15/month, minimum recommended
- **t2.medium**: ~$34/month, production recommended
- **t2.large**: ~$68/month, high traffic

### Save Money:
1. Use Reserved Instances (save 30-40%)
2. Use Spot Instances for dev (save 70-90%)
3. Stop instances when not needed
4. Use auto-scaling for variable traffic

---

## 📞 Quick Reference

### URLs:
```
Application: http://YOUR_EC2_IP
API Docs:    http://YOUR_EC2_IP/docs
Redoc:       http://YOUR_EC2_IP/redoc
```

### Credentials:
```
Username: admin
Password: admin123
```

### Important Paths:
```
App Directory:  /home/ubuntu/nova-pass-generator
Backend:        /home/ubuntu/nova-pass-generator/backend
Frontend:       /home/ubuntu/nova-pass-generator/frontend
Database:       /home/ubuntu/nova-pass-generator/backend/hackgear.db
Static Files:   /home/ubuntu/nova-pass-generator/backend/static
Logs:           sudo journalctl -u nova-backend
Nginx Config:   /etc/nginx/sites-available/nova
```

### Service Commands:
```bash
# Backend
sudo systemctl start|stop|restart|status nova-backend

# Nginx
sudo systemctl start|stop|restart|status nginx

# View logs
sudo journalctl -u nova-backend -f
sudo tail -f /var/log/nginx/access.log
```

---

## 🎯 Next Steps

1. **Deploy**: Use `quick_deploy.sh`
2. **Verify**: Run `monitor.sh`
3. **Secure**: Change password, set up SSL
4. **Backup**: Set up automated backups
5. **Monitor**: Check logs regularly

---

**Need Help?**

- Read: `EC2_QUICK_START.md` for quick start
- Read: `DEPLOYMENT.md` for detailed guide
- Run: `./manage.sh` for interactive menu
- Run: `./monitor.sh` for system status

---

**Happy Deploying! 🚀**
