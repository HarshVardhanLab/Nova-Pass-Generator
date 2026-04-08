# 🔧 Environment Configuration for EC2

## Quick Answer

**You DON'T need to manually configure .env files!** 

The deployment script handles everything automatically. But here's what happens:

---

## 📋 What Gets Configured

### 1. Frontend Environment

**File:** `frontend/.env`

**Automatically set during deployment:**
```bash
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP
```

This is done automatically by:
- The `deploy_ec2.sh` script, OR
- The git clone deployment command

**You don't need to do anything!** ✅

---

### 2. Backend Environment

**File:** `backend/.env` (optional)

**Default values work fine:**
- Database: SQLite (local file)
- QR Password: `nova2024`
- Admin: `admin` / `admin123`
- CORS: Automatically allows all origins

**You don't need to create this file!** ✅

The backend uses defaults from `backend/app/core/config.py`

---

## 🚀 Deployment Methods

### Method 1: Git Clone (Recommended)

**The deployment command automatically sets the frontend URL:**

```bash
git clone YOUR_REPO_URL nova-pass-generator
cd nova-pass-generator

# This line automatically configures frontend
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > frontend/.env

chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

**That's it!** Everything is configured automatically.

---

### Method 2: Package Upload

**The quick_deploy.sh script automatically sets the frontend URL:**

```bash
# On your local machine
./quick_deploy.sh YOUR_EC2_IP
```

This creates `nova-app.tar.gz` with `frontend/.env` already configured.

---

## 🔒 Optional: Custom Configuration

### If You Want to Change Settings

**Only do this if you need custom settings!**

#### Backend Configuration

Create `backend/.env` on EC2:

```bash
# On EC2, after deployment
cd ~/nova-pass-generator/backend

cat > .env << EOF
# Security (CHANGE THIS!)
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# QR Code Encryption (CHANGE THIS!)
QR_ENCRYPTION_PASSWORD=your-secure-password-here

# Database
DATABASE_URL=sqlite:///./hackgear.db

# Admin User
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@yourdomain.com

# File Storage
UPLOAD_DIR=./uploads
STATIC_DIR=./static
EOF

# Restart backend
sudo systemctl restart nova-backend
```

#### Frontend Configuration

Already set automatically, but if you need to change:

```bash
# On EC2
cd ~/nova-pass-generator/frontend

# Update .env
echo "VITE_API_URL=http://YOUR_EC2_IP" > .env

# Rebuild
npm run build

# Reload nginx
sudo systemctl reload nginx
```

---

## 📝 Environment Files Summary

### Files in Repository

```
backend/
├── .env.production          # Example file (not used)
└── app/core/config.py       # Default settings (used)

frontend/
└── .env                     # Set during deployment
```

### What You Need to Do

**Nothing!** 🎉

The deployment scripts handle everything:
1. Frontend `.env` is created automatically
2. Backend uses default settings (works fine)
3. Everything is configured correctly

---

## 🔐 Security Recommendations

### After Deployment

1. **Change Admin Password**
   - Login to application
   - Change password in settings

2. **Optional: Set Custom SECRET_KEY**
   ```bash
   # On EC2
   cd ~/nova-pass-generator/backend
   echo "SECRET_KEY=$(openssl rand -hex 32)" > .env
   sudo systemctl restart nova-backend
   ```

3. **Optional: Change QR Encryption Password**
   ```bash
   # On EC2
   cd ~/nova-pass-generator/backend
   echo "QR_ENCRYPTION_PASSWORD=your-secure-password" >> .env
   sudo systemctl restart nova-backend
   ```

---

## 🎯 Common Scenarios

### Scenario 1: First Deployment

**What to do:** Nothing!

Just follow the deployment guide:
- [DEPLOY_WITH_GIT.md](DEPLOY_WITH_GIT.md) for git method
- [DEPLOY_NOW.md](DEPLOY_NOW.md) for package method

Everything is configured automatically.

---

### Scenario 2: Using a Domain Name

**After getting a domain:**

```bash
# On EC2
cd ~/nova-pass-generator/frontend

# Update frontend
echo "VITE_API_URL=https://yourdomain.com" > .env
npm run build
sudo systemctl reload nginx
```

---

### Scenario 3: Changing QR Password

**If you want a different QR encryption password:**

```bash
# On EC2
cd ~/nova-pass-generator/backend

# Create/update .env
echo "QR_ENCRYPTION_PASSWORD=my-new-password" > .env

# Restart backend
sudo systemctl restart nova-backend
```

**⚠️ Warning:** Existing QR codes won't work with new password!

---

### Scenario 4: Multiple Environments

**If you want dev and prod:**

```bash
# Development
VITE_API_URL=http://dev.yourdomain.com

# Production
VITE_API_URL=https://yourdomain.com
```

---

## 📊 Configuration Checklist

### Required (Automatic) ✅
- [x] Frontend API URL - Set by deployment script
- [x] Backend defaults - Built into code
- [x] Database - SQLite created automatically
- [x] Static directories - Created automatically

### Optional (Manual) 
- [ ] Custom SECRET_KEY - For extra security
- [ ] Custom QR password - If you want different password
- [ ] Custom admin credentials - Change after first login
- [ ] Domain name - If you have one
- [ ] SSL certificate - For HTTPS

---

## 🔍 Verify Configuration

### Check Frontend Config

```bash
# On EC2
cd ~/nova-pass-generator/frontend
cat .env
```

Should show:
```
VITE_API_URL=http://YOUR_EC2_IP
```

### Check Backend Config

```bash
# On EC2
cd ~/nova-pass-generator/backend

# Check if .env exists
ls -la .env

# If it exists, view it
cat .env
```

If `.env` doesn't exist, that's fine! Backend uses defaults.

### Test Configuration

```bash
# Check if backend is running
sudo systemctl status nova-backend

# Check if frontend is built
ls ~/nova-pass-generator/frontend/dist

# Test API
curl http://localhost:8000/docs
```

---

## 🆘 Troubleshooting

### Frontend Can't Connect to Backend

**Check frontend .env:**
```bash
cd ~/nova-pass-generator/frontend
cat .env
```

Should match your EC2 public IP.

**Fix:**
```bash
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "VITE_API_URL=http://$PUBLIC_IP" > .env
npm run build
sudo systemctl reload nginx
```

### Backend Not Starting

**Check logs:**
```bash
sudo journalctl -u nova-backend -n 50
```

**Common issues:**
- Port 8000 already in use
- Python dependencies missing
- Database permissions

**Fix:**
```bash
cd ~/nova-pass-generator/backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
sudo systemctl restart nova-backend
```

### QR Codes Not Scanning

**Check QR password matches:**
```bash
cd ~/nova-pass-generator/backend
cat .env | grep QR_ENCRYPTION_PASSWORD
```

Should be `nova2024` (default) or your custom password.

---

## 💡 Best Practices

### Development
- Use `http://localhost:8000` for API
- Use default settings
- Don't commit `.env` files

### Production
- Use your EC2 IP or domain
- Set custom SECRET_KEY
- Change admin password
- Set up SSL/HTTPS
- Use environment variables for secrets

### Security
- Never commit `.env` files to git
- Use strong SECRET_KEY
- Change default passwords
- Restrict security group rules
- Enable HTTPS

---

## 📚 Related Documentation

- **Deployment:** [DEPLOY_WITH_GIT.md](DEPLOY_WITH_GIT.md)
- **Quick Start:** [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
- **Security:** [DEPLOYMENT.md](DEPLOYMENT.md) → Security section

---

## ✅ Summary

### What You Need to Do

**For deployment:** Nothing! ✅

The deployment scripts automatically configure:
- Frontend API URL
- Backend defaults
- Database
- All directories

### What's Optional

**For extra security:**
- Set custom SECRET_KEY
- Change QR encryption password
- Change admin password (via UI)

### What's Automatic

**Everything else:**
- Frontend `.env` created during deployment
- Backend uses sensible defaults
- Database created on first run
- Directories created automatically

---

**Just deploy and it works! 🚀**

No manual environment configuration needed!
