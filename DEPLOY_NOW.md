# 🚀 Deploy to AWS EC2 - RIGHT NOW!

## ⚡ Super Quick Guide (10 Minutes)

---

## Step 1: Launch EC2 (5 minutes)

### Go to AWS Console
1. Open https://console.aws.amazon.com/ec2/
2. Click **"Launch Instance"**

### Configure Instance
```
┌─────────────────────────────────────────┐
│ Name: nova-pass-generator               │
│                                         │
│ AMI: Ubuntu Server 22.04 LTS            │
│                                         │
│ Instance Type: t2.medium                │
│                                         │
│ Key Pair: [Create new or select]       │
│                                         │
│ Storage: 20 GB                          │
│                                         │
│ Security Group:                         │
│   ✓ SSH (22) - My IP                   │
│   ✓ HTTP (80) - 0.0.0.0/0              │
│   ✓ HTTPS (443) - 0.0.0.0/0            │
└─────────────────────────────────────────┘
```

3. Click **"Launch Instance"**
4. Download your key pair (e.g., `nova-key.pem`)
5. Wait for instance to show "Running" status
6. Copy the **Public IPv4 address**

---

## Step 2: Deploy (5 minutes)

### On Your Mac Terminal

```bash
# Navigate to your project
cd /path/to/your/nova-pass-generator

# Make script executable
chmod +x quick_deploy.sh

# Deploy!
./quick_deploy.sh ~/Downloads/nova-key.pem YOUR_EC2_IP
```

### Example:
```bash
./quick_deploy.sh ~/Downloads/nova-key.pem 54.123.45.67
```

### What You'll See:
```
📦 Nova Pass Generator - Quick Deploy to EC2
=============================================

Step 1: Creating deployment package...
✓ Package created

Step 2: Uploading to EC2...
✓ Upload complete

Step 3: Extracting and deploying on EC2...
🚀 Starting Nova Pass Generator...
📦 Installing Python 3.11...
📦 Installing Node.js 18...
📦 Installing Nginx...
...
✓ Deployment completed successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Nova Pass Generator is now running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Access your application:
  http://54.123.45.67

Admin Login:
  Username: admin
  Password: admin123
```

---

## Step 3: Access & Use

### Open Browser
```
http://YOUR_EC2_IP
```

### Login
```
Username: admin
Password: admin123
```

### Start Using!
1. ✅ Create an event
2. ✅ Upload CSV with members
3. ✅ Create template (drag-and-drop editor)
4. ✅ Generate passes
5. ✅ Download passes
6. ✅ Scan QR codes

---

## 🎉 DONE!

Your application is now live on AWS!

---

## 📱 Share With Your Team

```
Application URL: http://YOUR_EC2_IP
Username: admin
Password: admin123

Features:
✓ Event Management
✓ CSV Upload/Export
✓ Drag-and-Drop Template Editor
✓ QR Code Generation
✓ PDF Pass Generation
✓ QR Scanner
✓ Analytics Dashboard
```

---

## 🔧 Quick Management

### SSH to Your Server
```bash
ssh -i ~/Downloads/nova-key.pem ubuntu@YOUR_EC2_IP
```

### Check Status
```bash
cd ~/nova-pass-generator
./monitor.sh
```

### Manage Services
```bash
./manage.sh
```

### View Logs
```bash
sudo journalctl -u nova-backend -f
```

---

## 🔒 Important: Change Password!

After first login:
1. Go to Settings
2. Change admin password
3. Save

---

## 💰 Cost

**t2.medium**: ~$34/month
**t2.small**: ~$15/month (for low traffic)

**Save money:**
- Stop instance when not needed
- Use Reserved Instances (save 30%)

---

## 🆘 Problems?

### Application not loading?
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd ~/nova-pass-generator
./manage.sh
# Select option 3 (Restart Backend)
# Select option 6 (Restart Nginx)
```

### Need help?
```bash
# Check logs
./manage.sh
# Select option 5 (Backend Logs)
```

---

## 📚 More Info

- **Quick Start**: `EC2_QUICK_START.md`
- **Detailed Guide**: `DEPLOYMENT.md`
- **All Files**: `DEPLOYMENT_FILES.md`
- **Summary**: `AWS_DEPLOYMENT_SUMMARY.md`

---

## ✅ Checklist

- [ ] EC2 instance launched
- [ ] Security group configured
- [ ] Deployed using quick_deploy.sh
- [ ] Application accessible
- [ ] Logged in successfully
- [ ] Changed admin password
- [ ] Tested creating event
- [ ] Tested uploading CSV
- [ ] Tested generating passes

---

**That's it! You're live on AWS! 🚀**

---

## 🎯 Next Steps

1. **Secure**: Change admin password
2. **SSL**: Set up HTTPS if you have a domain
3. **Backup**: Set up automated backups
4. **Monitor**: Check logs regularly
5. **Scale**: Upgrade instance if needed

---

**Need SSL/HTTPS?**

If you have a domain (e.g., nova.yourdomain.com):

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nova.yourdomain.com
```

Then update DNS:
```
A Record: nova.yourdomain.com → YOUR_EC2_IP
```

---

**Enjoy your Nova Pass Generator on AWS! 🎉**
