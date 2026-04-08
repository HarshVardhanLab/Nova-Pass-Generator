# 🚀 AWS EC2 Deployment Guide

## Prerequisites

1. **AWS Account** with EC2 access
2. **SSH Key Pair** for EC2 instance
3. **Local machine** with AWS CLI (optional)

---

## Step 1: Launch EC2 Instance

### Instance Configuration:
- **AMI**: Ubuntu Server 22.04 LTS
- **Instance Type**: t2.medium or larger (minimum t2.small)
- **Storage**: 20 GB or more
- **Security Group**: Configure the following inbound rules:
  - SSH (22) - Your IP
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0 (for future SSL)

### Launch Steps:
1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. Choose Ubuntu Server 22.04 LTS
4. Select instance type (t2.medium recommended)
5. Configure security group with above rules
6. Download your key pair (.pem file)
7. Launch instance

---

## Step 2: Connect to EC2 Instance

```bash
# Make key file secure
chmod 400 your-key.pem

# Connect to instance
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Step 3: Upload Application Files

### Option A: Using SCP (from your local machine)

```bash
# Create a tarball of your application
tar -czf nova-app.tar.gz \
  --exclude='node_modules' \
  --exclude='venv' \
  --exclude='.venv' \
  --exclude='backend/__pycache__' \
  --exclude='backend/app/__pycache__' \
  --exclude='backend/*.db' \
  --exclude='backend/static/passes/*' \
  --exclude='backend/static/qr_codes/*' \
  --exclude='frontend/dist' \
  --exclude='frontend/node_modules' \
  --exclude='.git' \
  backend/ frontend/ deploy_ec2.sh

# Upload to EC2
scp -i your-key.pem nova-app.tar.gz ubuntu@YOUR_EC2_PUBLIC_IP:~

# SSH into EC2 and extract
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
mkdir -p nova-pass-generator
tar -xzf nova-app.tar.gz -C nova-pass-generator
cd nova-pass-generator
```

### Option B: Using Git (if you have a repository)

```bash
# On EC2 instance
git clone YOUR_REPOSITORY_URL nova-pass-generator
cd nova-pass-generator
```

---

## Step 4: Update Frontend Configuration

Before deploying, update the frontend environment file:

```bash
# On EC2 instance
cd ~/nova-pass-generator/frontend

# Get your EC2 public IP
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Update .env file
cat > .env << EOF
VITE_API_URL=http://$PUBLIC_IP
EOF
```

---

## Step 5: Run Deployment Script

```bash
cd ~/nova-pass-generator
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

This script will:
- ✅ Install Python 3.11
- ✅ Install Node.js 18
- ✅ Install Nginx
- ✅ Install all dependencies
- ✅ Build frontend for production
- ✅ Configure systemd services
- ✅ Configure Nginx as reverse proxy
- ✅ Set up firewall
- ✅ Start all services

**Note**: The script takes 5-10 minutes to complete.

---

## Step 6: Verify Deployment

### Check Services Status:
```bash
# Backend service
sudo systemctl status nova-backend

# Nginx
sudo systemctl status nginx
```

### View Logs:
```bash
# Backend logs (live)
sudo journalctl -u nova-backend -f

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### Test Application:
```bash
# Get your public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Test backend API
curl http://localhost:8000/docs

# Test from browser
# Open: http://YOUR_EC2_PUBLIC_IP
```

---

## Step 7: Access Your Application

Open your browser and navigate to:
```
http://YOUR_EC2_PUBLIC_IP
```

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

---

## Service Management

### Backend Service:
```bash
# Start
sudo systemctl start nova-backend

# Stop
sudo systemctl stop nova-backend

# Restart
sudo systemctl restart nova-backend

# Status
sudo systemctl status nova-backend

# Enable on boot
sudo systemctl enable nova-backend

# Disable on boot
sudo systemctl disable nova-backend
```

### Nginx:
```bash
# Start
sudo systemctl start nginx

# Stop
sudo systemctl stop nginx

# Restart
sudo systemctl restart nginx

# Reload config (no downtime)
sudo systemctl reload nginx

# Test config
sudo nginx -t
```

---

## Updating the Application

### Update Backend:
```bash
cd ~/nova-pass-generator/backend
source venv/bin/activate
git pull  # or upload new files
pip install -r requirements.txt
sudo systemctl restart nova-backend
```

### Update Frontend:
```bash
cd ~/nova-pass-generator/frontend
git pull  # or upload new files
npm install
npm run build
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup (Optional but Recommended)

### Using Let's Encrypt (Free SSL):

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

### Update Frontend .env for HTTPS:
```bash
cd ~/nova-pass-generator/frontend
echo "VITE_API_URL=https://yourdomain.com" > .env
npm run build
sudo systemctl reload nginx
```

---

## Troubleshooting

### Backend not starting:
```bash
# Check logs
sudo journalctl -u nova-backend -n 50

# Check if port is in use
sudo lsof -i :8000

# Manually test backend
cd ~/nova-pass-generator/backend
source venv/bin/activate
python3.11 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Nginx errors:
```bash
# Check config
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check if port 80 is available
sudo lsof -i :80
```

### Database issues:
```bash
# Reset database
cd ~/nova-pass-generator/backend
rm hackgear.db
sudo systemctl restart nova-backend
```

### Permission issues:
```bash
# Fix ownership
sudo chown -R ubuntu:ubuntu ~/nova-pass-generator

# Fix static files permissions
sudo chmod -R 755 ~/nova-pass-generator/backend/static
```

---

## Security Recommendations

1. **Change default admin password** immediately after first login
2. **Set up SSL/HTTPS** using Let's Encrypt
3. **Configure firewall** to restrict SSH access to your IP only
4. **Regular updates**:
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```
5. **Set up automated backups** for the database
6. **Use environment variables** for sensitive data
7. **Enable CloudWatch** for monitoring (optional)

---

## Backup and Restore

### Backup:
```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
cp ~/nova-pass-generator/backend/hackgear.db ~/backups/hackgear-$(date +%Y%m%d).db

# Backup static files
tar -czf ~/backups/static-$(date +%Y%m%d).tar.gz \
  ~/nova-pass-generator/backend/static/passes \
  ~/nova-pass-generator/backend/static/qr_codes
```

### Restore:
```bash
# Stop backend
sudo systemctl stop nova-backend

# Restore database
cp ~/backups/hackgear-YYYYMMDD.db ~/nova-pass-generator/backend/hackgear.db

# Restore static files
tar -xzf ~/backups/static-YYYYMMDD.tar.gz -C ~/nova-pass-generator/backend/

# Start backend
sudo systemctl start nova-backend
```

---

## Cost Estimation

### EC2 Instance (t2.medium):
- **On-Demand**: ~$0.0464/hour (~$34/month)
- **Reserved (1 year)**: ~$20/month
- **Spot Instance**: ~$10-15/month

### Additional Costs:
- **Storage (20 GB)**: ~$2/month
- **Data Transfer**: First 1 GB free, then $0.09/GB
- **Elastic IP** (if used): Free while instance is running

**Total Estimated Cost**: $25-40/month for t2.medium

### Cost Optimization:
- Use t2.small for low traffic (~$15/month)
- Use Reserved Instances for long-term (save 30-40%)
- Use Spot Instances for development (save 70-90%)

---

## Monitoring

### Basic Monitoring:
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Service status
sudo systemctl status nova-backend nginx
```

### CloudWatch (Optional):
- Enable detailed monitoring in EC2 console
- Set up alarms for CPU, memory, disk usage
- Monitor application logs

---

## Support

For issues or questions:
1. Check logs: `sudo journalctl -u nova-backend -f`
2. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check service status: `sudo systemctl status nova-backend`

---

**Deployment Complete! 🎉**

Your Nova Pass Generator is now running on AWS EC2!
