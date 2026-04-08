# 🚀 AWS EC2 Deployment - Complete Summary

## ✅ What You Have Now

I've created a complete AWS EC2 deployment solution for your Nova Pass Generator application. Here's everything you need:

---

## 📦 Deployment Files Created

### 🎯 Main Deployment Scripts

1. **quick_deploy.sh** ⭐⭐⭐ **USE THIS!**
   - One-command deployment from your local machine
   - Automatically packages, uploads, and deploys everything
   - Usage: `./quick_deploy.sh ~/path/to/key.pem YOUR_EC2_IP`

2. **deploy_ec2.sh**
   - Runs on EC2 to set up everything
   - Installs Python 3.11, Node.js, Nginx
   - Configures services and starts application

3. **manage.sh**
   - Interactive menu for managing your EC2 application
   - Start/stop services, view logs, backup database, etc.

4. **monitor.sh**
   - System monitoring and health checks
   - Shows service status, resource usage, logs

### 🏠 Local Development Scripts

5. **start.sh** - Start both backend and frontend locally
6. **stop.sh** - Stop local servers
7. **status.sh** - Check local server status

---

## 📚 Documentation Created

1. **EC2_QUICK_START.md** ⭐⭐⭐ **START HERE!**
   - Simple 3-step deployment guide
   - Perfect for beginners

2. **DEPLOYMENT.md**
   - Complete detailed deployment guide
   - SSL setup, security, troubleshooting

3. **DEPLOYMENT_FILES.md**
   - Overview of all deployment files
   - Quick reference guide

4. **START_HERE.md**
   - Local development quick start

5. **AWS_DEPLOYMENT_SUMMARY.md** (This file)
   - Complete overview of everything

---

## 🚀 How to Deploy (3 Simple Steps)

### Step 1: Launch EC2 Instance

Go to AWS Console → EC2 → Launch Instance

**Configuration:**
```
Name: nova-pass-generator
AMI: Ubuntu Server 22.04 LTS
Instance Type: t2.medium (or t2.small for testing)
Storage: 20 GB
Key Pair: Create or select existing
Security Group: 
  - SSH (22) - Your IP
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0
```

Click **Launch** and wait for instance to start.

---

### Step 2: Run Quick Deploy

On your **local machine** (Mac):

```bash
# Make script executable (first time only)
chmod +x quick_deploy.sh

# Deploy (replace with your values)
./quick_deploy.sh ~/Downloads/your-key.pem YOUR_EC2_PUBLIC_IP
```

**Example:**
```bash
./quick_deploy.sh ~/Downloads/nova-key.pem 54.123.45.67
```

**Wait 10-15 minutes** for deployment to complete.

---

### Step 3: Access Your Application

Open browser:
```
http://YOUR_EC2_PUBLIC_IP
```

**Login:**
- Username: `admin`
- Password: `admin123`

**Done! 🎉**

---

## 🎯 What Gets Deployed

### Backend (FastAPI)
- Python 3.11 with virtual environment
- All dependencies installed
- Running as systemd service
- Auto-restart on failure
- Accessible at `http://YOUR_IP/api`

### Frontend (React + Vite)
- Built for production
- Served by Nginx
- Accessible at `http://YOUR_IP`

### Nginx
- Reverse proxy for backend
- Serves frontend static files
- Serves static files (QR codes, passes)
- API documentation at `/docs`

### Database
- SQLite database
- Located at `/home/ubuntu/nova-pass-generator/backend/hackgear.db`

### Services
- `nova-backend.service` - Backend API
- `nginx.service` - Web server

---

## 🔧 Managing Your Application

### SSH to EC2
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Use Management Menu
```bash
cd ~/nova-pass-generator
./manage.sh
```

**Menu Options:**
- Start/stop/restart services
- View logs (live)
- Monitor system resources
- Backup database
- Update application
- Clean logs

### Quick Commands

**Check Status:**
```bash
./monitor.sh
```

**View Logs:**
```bash
# Backend
sudo journalctl -u nova-backend -f

# Nginx
sudo tail -f /var/log/nginx/access.log
```

**Restart Services:**
```bash
sudo systemctl restart nova-backend
sudo systemctl restart nginx
```

**Backup Database:**
```bash
cp ~/nova-pass-generator/backend/hackgear.db ~/backup-$(date +%Y%m%d).db
```

---

## 🔒 Security Setup (Important!)

### 1. Change Admin Password
- Login to application
- Change default password immediately

### 2. Set Up SSL (If you have a domain)
```bash
# On EC2
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# Update frontend
cd ~/nova-pass-generator/frontend
echo "VITE_API_URL=https://yourdomain.com" > .env
npm run build
sudo systemctl reload nginx
```

### 3. Restrict SSH Access
- Go to AWS Console → Security Groups
- Edit inbound rules
- Change SSH source to "My IP" only

---

## 📊 Monitoring

### System Monitor
```bash
./monitor.sh
```

Shows:
- Service status (running/stopped)
- Port status (listening/not listening)
- CPU, Memory, Disk usage
- Recent logs
- Database size

### CloudWatch (Optional)
- Enable in EC2 console for detailed metrics
- Set up alarms for CPU, memory, disk

---

## 🔄 Updating Your Application

### Full Redeploy
```bash
# From your local machine
./quick_deploy.sh your-key.pem YOUR_EC2_IP
```

### Manual Update
```bash
# On EC2
cd ~/nova-pass-generator

# Upload new files or git pull
git pull

# Restart services
sudo systemctl restart nova-backend
```

---

## 💾 Backup Strategy

### Manual Backup
```bash
# On EC2
./manage.sh
# Select option 13 (Backup Database)
```

### Automated Daily Backup
```bash
# On EC2
crontab -e

# Add this line (backup at 2 AM daily)
0 2 * * * cp ~/nova-pass-generator/backend/hackgear.db ~/backups/backup-$(date +\%Y\%m\%d).db
```

### Download Backup to Local
```bash
# From local machine
scp -i your-key.pem ubuntu@YOUR_EC2_IP:~/backups/backup-*.db ./
```

---

## 💰 Cost Estimation

### EC2 Instance Costs (Monthly)

| Instance Type | vCPU | RAM | Cost/Month | Use Case |
|--------------|------|-----|------------|----------|
| t2.micro | 1 | 1 GB | Free Tier | Testing only |
| t2.small | 1 | 2 GB | ~$15 | Minimum recommended |
| t2.medium | 2 | 4 GB | ~$34 | Production (recommended) |
| t2.large | 2 | 8 GB | ~$68 | High traffic |

### Additional Costs
- Storage (20 GB): ~$2/month
- Data Transfer: First 1 GB free, then $0.09/GB
- Elastic IP: Free while instance running

**Total: $25-40/month for production**

### Save Money
- Use Reserved Instances (save 30-40%)
- Use Spot Instances for dev (save 70-90%)
- Stop instances when not needed
- Use t2.small for low traffic

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

# Kill if needed
sudo kill -9 PID
```

### Database Issues
```bash
# Backup first!
cp ~/nova-pass-generator/backend/hackgear.db ~/backup.db

# Reset
rm ~/nova-pass-generator/backend/hackgear.db
sudo systemctl restart nova-backend
```

### Permission Issues
```bash
sudo chown -R ubuntu:ubuntu ~/nova-pass-generator
chmod -R 755 ~/nova-pass-generator/backend/static
```

---

## 📞 Quick Reference

### Important URLs
```
Application:  http://YOUR_EC2_IP
API Docs:     http://YOUR_EC2_IP/docs
Redoc:        http://YOUR_EC2_IP/redoc
```

### Login Credentials
```
Username: admin
Password: admin123
```

### Important Paths
```
App:       /home/ubuntu/nova-pass-generator
Backend:   /home/ubuntu/nova-pass-generator/backend
Frontend:  /home/ubuntu/nova-pass-generator/frontend
Database:  /home/ubuntu/nova-pass-generator/backend/hackgear.db
Static:    /home/ubuntu/nova-pass-generator/backend/static
```

### Service Commands
```bash
# Backend
sudo systemctl start|stop|restart|status nova-backend

# Nginx
sudo systemctl start|stop|restart|status nginx

# Logs
sudo journalctl -u nova-backend -f
sudo tail -f /var/log/nginx/access.log
```

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Application loads at `http://YOUR_EC2_IP`
- [ ] Can login with admin credentials
- [ ] Can create an event
- [ ] Can upload CSV
- [ ] Can create template with drag-and-drop editor
- [ ] Can generate passes
- [ ] Can download passes (individual and ZIP)
- [ ] QR scanner works
- [ ] Changed default admin password
- [ ] Set up SSL (if using domain)
- [ ] Configured automated backups
- [ ] Restricted SSH access to your IP
- [ ] Tested monitoring scripts

---

## 🎓 Learning Resources

### AWS Documentation
- [EC2 User Guide](https://docs.aws.amazon.com/ec2/)
- [Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html)
- [CloudWatch](https://docs.aws.amazon.com/cloudwatch/)

### Application Documentation
- `EC2_QUICK_START.md` - Quick start guide
- `DEPLOYMENT.md` - Detailed deployment guide
- `DEPLOYMENT_FILES.md` - File reference

---

## 🆘 Getting Help

### Check Logs
```bash
# Backend logs
sudo journalctl -u nova-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo tail -f /var/log/syslog
```

### Run Diagnostics
```bash
./monitor.sh
./manage.sh  # Use menu options
```

### Common Issues
1. **502 Bad Gateway** - Backend not running
2. **404 Not Found** - Nginx misconfigured
3. **Connection Refused** - Firewall blocking
4. **Database Locked** - Multiple processes accessing DB

---

## 🎉 Success!

Your Nova Pass Generator is now ready to deploy to AWS EC2!

**Next Steps:**
1. Launch EC2 instance
2. Run `./quick_deploy.sh`
3. Access your application
4. Change admin password
5. Start using!

**Questions?** Check the documentation files or run `./manage.sh` for help.

---

**Happy Deploying! 🚀**
