# Quick Fix Guide - Backend Deployment on EC2

## Current Status
- Frontend: Deployed on Vercel at `https://nova-pass-generator.vercel.app`
- Backend: EC2 at `100.55.91.90:8000` (needs configuration)

## Step 1: Upload .env File to EC2

SSH into your EC2 instance and create the `.env` file:

```bash
cd /home/ubuntu/Nova-Pass-Generator/backend
nano .env
```

Paste this content:

```env
# Production Environment Variables for AWS EC2

# Database
DATABASE_URL=sqlite:///./hackgear.db

# Security
SECRET_KEY=jdbgjba;dkdb;gkjbas;kjbg439875985sdklfndkjgashiutgiugraiutgiukjnjg
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# QR Code Encryption
QR_ENCRYPTION_PASSWORD=hackgear2.0

# CORS - Vercel frontend + local testing
CORS_ORIGINS=["https://nova-pass-generator.vercel.app","http://localhost:5173","http://100.55.91.90:8000"]

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
STATIC_DIR=./static

# Admin User
ADMIN_USERNAME=harshvardhan
ADMIN_PASSWORD=harsh9837
ADMIN_EMAIL=admin@nova.local
```

Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`.

## Step 2: Upload ecosystem.config.js to EC2

```bash
cd /home/ubuntu/Nova-Pass-Generator
nano ecosystem.config.js
```

Paste this content:

```javascript
module.exports = {
  apps: [{
    name: 'nova-backend',
    script: 'venv/bin/uvicorn',
    args: 'app.main:app --host 0.0.0.0 --port 8000',
    cwd: '/home/ubuntu/Nova-Pass-Generator/backend',
    interpreter: 'none',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/home/ubuntu/Nova-Pass-Generator/backend/logs/error.log',
    out_file: '/home/ubuntu/Nova-Pass-Generator/backend/logs/out.log',
    log_file: '/home/ubuntu/Nova-Pass-Generator/backend/logs/combined.log',
    time: true
  }]
};
```

Save and exit.

## Step 3: Create Logs Directory

```bash
cd /home/ubuntu/Nova-Pass-Generator/backend
mkdir -p logs
```

## Step 4: Stop Any Running Backend Process

```bash
# Stop PM2 if running
pm2 stop nova-backend
pm2 delete nova-backend

# Kill any uvicorn processes
pkill -f uvicorn
```

## Step 5: Start Backend with PM2

```bash
cd /home/ubuntu/Nova-Pass-Generator
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 6: Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs nova-backend --lines 50

# Test API endpoint
curl http://localhost:8000/docs
```

## Step 7: Verify EC2 Security Group

Make sure your EC2 Security Group allows:
- Port 8000 (TCP) from 0.0.0.0/0 (or your IP)
- Port 22 (SSH) from your IP

## Step 8: Test from Browser

1. Visit: `http://100.55.91.90:8000/docs`
2. You should see the FastAPI Swagger documentation

## Step 9: Update Vercel Environment Variable

Go to Vercel Dashboard:
1. Select your project: `nova-pass-generator`
2. Go to Settings → Environment Variables
3. Add or update:
   - Key: `VITE_API_URL`
   - Value: `http://100.55.91.90:8000`
4. Redeploy the frontend

## Step 10: Test Login

1. Visit: `https://nova-pass-generator.vercel.app`
2. Login with:
   - Username: `harshvardhan`
   - Password: `harsh9837`

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs nova-backend

# Check if port 8000 is in use
sudo lsof -i :8000

# Restart PM2
pm2 restart nova-backend
```

### Can't access from browser
```bash
# Check if backend is listening
netstat -tlnp | grep 8000

# Check EC2 Security Group in AWS Console
# Make sure port 8000 is open
```

### CORS errors
- Make sure Vercel URL is in CORS_ORIGINS in `.env`
- Restart backend after changing `.env`

## PM2 Commands Reference

```bash
# Status
pm2 status

# Logs
pm2 logs nova-backend
pm2 logs nova-backend --lines 100

# Restart
pm2 restart nova-backend

# Stop
pm2 stop nova-backend

# Delete
pm2 delete nova-backend

# Monitor
pm2 monit
```

## Login Credentials

- Username: `harshvardhan`
- Password: `harsh9837`
- QR Encryption: `hackgear2.0`
