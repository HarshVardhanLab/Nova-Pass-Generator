# ⚡ Quick Deploy Reference

## 🎯 Choose Your Method

### Method 1: Git Clone (Fastest!) ⭐⭐⭐

**Best for:** Everyone using Git

**Time:** 10 minutes

**Steps:**
1. Launch EC2 instance
2. Connect via EC2 Instance Connect
3. Run these commands:

```bash
git clone YOUR_REPO_URL nova-pass-generator
cd nova-pass-generator
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > frontend/.env
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

**Full Guide:** [DEPLOY_WITH_GIT.md](DEPLOY_WITH_GIT.md)

---

### Method 2: Upload Package

**Best for:** Not using Git

**Time:** 15 minutes

**Steps:**
1. Launch EC2 instance
2. Create package: `./quick_deploy.sh YOUR_EC2_IP`
3. Connect via EC2 Instance Connect
4. Upload `nova-app.tar.gz` via browser
5. Deploy:

```bash
tar -xzf nova-app.tar.gz -C nova-pass-generator
cd nova-pass-generator
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

**Full Guide:** [DEPLOY_NOW.md](DEPLOY_NOW.md)

---

## 🚀 EC2 Instance Setup

**Required Configuration:**
```
AMI: Ubuntu Server 22.04 LTS
Instance Type: t2.medium (or t2.small)
Storage: 20 GB

Security Group:
  SSH (22) - My IP
  HTTP (80) - 0.0.0.0/0
  HTTPS (443) - 0.0.0.0/0
```

---

## 🔧 After Deployment

### Access Application
```
http://YOUR_EC2_IP
```

### Login
```
Username: admin
Password: admin123
```

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

---

## 🔄 Updates

### Git Method
```bash
cd ~/nova-pass-generator
git pull
sudo systemctl restart nova-backend
```

### Package Method
```bash
# Create new package locally
./quick_deploy.sh YOUR_EC2_IP

# Upload and extract on EC2
# Then restart services
sudo systemctl restart nova-backend
```

---

## 📚 Documentation

- **Git Deployment:** [DEPLOY_WITH_GIT.md](DEPLOY_WITH_GIT.md)
- **Package Deployment:** [DEPLOY_NOW.md](DEPLOY_NOW.md)
- **EC2 Instance Connect:** [EC2_INSTANCE_CONNECT_GUIDE.md](EC2_INSTANCE_CONNECT_GUIDE.md)
- **All Docs:** [INDEX.md](INDEX.md)

---

## 💰 Cost

- **t2.small:** ~$15/month
- **t2.medium:** ~$34/month (recommended)

---

## 🆘 Help

### Application not loading?
```bash
cd ~/nova-pass-generator
./manage.sh
# Select option 3 (Restart Backend)
```

### View logs?
```bash
sudo journalctl -u nova-backend -f
```

---

**Choose your method and deploy now! 🚀**
