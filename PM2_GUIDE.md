# 🔄 PM2 Deployment Guide

## Deploy Backend with PM2 on EC2

PM2 is a production process manager for Node.js and Python applications with built-in load balancer, monitoring, and auto-restart.

---

## 🚀 Quick Deploy

### On EC2 Instance:

```bash
# Clone repository
git clone YOUR_REPO_URL Nova-Pass-Generator
cd Nova-Pass-Generator

# Make script executable
chmod +x deploy_backend_pm2.sh

# Run deployment
./deploy_backend_pm2.sh
```

**Wait 3-5 minutes. Done!** ✅

---

## 📋 What Gets Installed

- ✅ Node.js 18
- ✅ PM2 (process manager)
- ✅ Python 3.11
- ✅ Backend dependencies
- ✅ Auto-restart on crash
- ✅ Auto-start on boot

---

## 🎯 PM2 Commands

### Check Status

```bash
pm2 status
```

Output:
```
┌─────┬──────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name         │ mode    │ ↺      │ status  │ cpu      │
├─────┼──────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ nova-backend │ fork    │ 0       │ online  │ 0%       │
└─────┴──────────────┴─────────┴─────────┴─────────┴──────────┘
```

### View Logs

```bash
# Live logs
pm2 logs nova-backend

# Last 100 lines
pm2 logs nova-backend --lines 100

# Error logs only
pm2 logs nova-backend --err

# Output logs only
pm2 logs nova-backend --out
```

### Restart Backend

```bash
pm2 restart nova-backend
```

### Stop Backend

```bash
pm2 stop nova-backend
```

### Start Backend

```bash
pm2 start nova-backend
```

### Delete from PM2

```bash
pm2 delete nova-backend
```

### Monitor Resources

```bash
pm2 monit
```

Shows real-time CPU, memory, logs.

---

## 🔧 Configuration

### PM2 Ecosystem File

Located at: `ecosystem.config.js`

```javascript
module.exports = {
  apps: [{
    name: 'nova-backend',
    script: '/home/ubuntu/Nova-Pass-Generator/backend/venv/bin/python',
    args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8000',
    cwd: '/home/ubuntu/Nova-Pass-Generator/backend',
    interpreter: 'none',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Edit Configuration

```bash
nano ecosystem.config.js
```

**Common changes:**
- `max_memory_restart` - Restart if memory exceeds limit
- `instances` - Number of instances (keep at 1 for SQLite)
- `watch` - Auto-restart on file changes (set to true for dev)

**After editing:**
```bash
pm2 restart ecosystem.config.js
```

---

## 📊 Monitoring

### Real-time Monitoring

```bash
pm2 monit
```

### Process Information

```bash
pm2 show nova-backend
```

### CPU and Memory Usage

```bash
pm2 list
```

---

## 🔄 Auto-Start on Boot

### Setup (Already done by script)

```bash
pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

This generates a command like:
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

Run that command, then:

```bash
pm2 save
```

### Test Auto-Start

```bash
# Reboot EC2
sudo reboot

# After reboot, check if backend is running
pm2 status
```

---

## 📝 Environment Variables

### Create .env File

```bash
cd ~/Nova-Pass-Generator/backend

cat > .env << 'EOF'
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
QR_ENCRYPTION_PASSWORD=nova2024
DATABASE_URL=sqlite:///./hackgear.db
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
STATIC_DIR=./static
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@nova.local
CORS_ORIGINS=["https://your-app.vercel.app","https://*.vercel.app"]
EOF
```

### Generate Secure SECRET_KEY

```bash
openssl rand -hex 32
```

Copy output and update .env:
```bash
nano .env
# Update SECRET_KEY with generated value
```

### Restart After Changing .env

```bash
pm2 restart nova-backend
```

---

## 🔄 Update Backend

### Pull Latest Code

```bash
cd ~/Nova-Pass-Generator
git pull
```

### Update Dependencies (if needed)

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
deactivate
```

### Restart

```bash
pm2 restart nova-backend
```

---

## 🐛 Troubleshooting

### Backend Not Starting

**Check logs:**
```bash
pm2 logs nova-backend --lines 50
```

**Common issues:**
- Python path incorrect
- Dependencies missing
- Port 8000 already in use

**Fix:**
```bash
# Reinstall dependencies
cd ~/Nova-Pass-Generator/backend
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Restart
pm2 restart nova-backend
```

### High Memory Usage

**Check memory:**
```bash
pm2 list
```

**Restart if needed:**
```bash
pm2 restart nova-backend
```

**Or set auto-restart limit:**
```javascript
// In ecosystem.config.js
max_memory_restart: '500M'  // Restart if exceeds 500MB
```

### Port Already in Use

**Find process using port 8000:**
```bash
sudo lsof -i :8000
```

**Kill it:**
```bash
sudo kill -9 PID
```

**Restart PM2:**
```bash
pm2 restart nova-backend
```

---

## 📈 Advanced Features

### Multiple Instances (Load Balancing)

**Note:** Don't use with SQLite! Only for databases that support concurrent connections.

```javascript
// ecosystem.config.js
instances: 2,  // Run 2 instances
exec_mode: 'cluster'
```

### Watch Mode (Development)

```javascript
// ecosystem.config.js
watch: true,
ignore_watch: ['node_modules', 'logs', '*.db']
```

### Custom Environment Variables

```javascript
// ecosystem.config.js
env: {
  NODE_ENV: 'production',
  PORT: 8000,
  DATABASE_URL: 'sqlite:///./hackgear.db'
}
```

---

## 🔒 Security

### Run as Non-Root User

PM2 runs as `ubuntu` user (already configured).

### Limit Memory

```javascript
max_memory_restart: '1G'
```

### Log Rotation

```bash
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 📊 PM2 Plus (Optional Monitoring)

### Free Monitoring Dashboard

```bash
# Sign up at https://pm2.io
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

Features:
- Real-time monitoring
- Error tracking
- Performance metrics
- Email alerts

---

## ✅ Quick Reference

### Essential Commands

```bash
# Status
pm2 status

# Logs
pm2 logs nova-backend

# Restart
pm2 restart nova-backend

# Stop
pm2 stop nova-backend

# Start
pm2 start nova-backend

# Monitor
pm2 monit

# Info
pm2 show nova-backend

# Save config
pm2 save

# Resurrect after reboot
pm2 resurrect
```

### Log Files

```
logs/error.log     - Error logs
logs/out.log       - Output logs
logs/combined.log  - All logs
```

### View Logs

```bash
# Live tail
tail -f logs/error.log

# Last 100 lines
tail -100 logs/combined.log

# Search logs
grep "error" logs/error.log
```

---

## 🎯 Comparison: PM2 vs Systemd

| Feature | PM2 | Systemd |
|---------|-----|---------|
| **Setup** | Easy | Medium |
| **Logs** | Built-in viewer | journalctl |
| **Monitoring** | Real-time dashboard | Basic |
| **Auto-restart** | ✅ | ✅ |
| **Load balancing** | ✅ | ❌ |
| **Cross-platform** | ✅ | Linux only |
| **Best for** | Development + Production | Production |

---

## 🎉 Summary

### Advantages of PM2

- ✅ Easy to use
- ✅ Built-in monitoring
- ✅ Auto-restart on crash
- ✅ Auto-start on boot
- ✅ Log management
- ✅ Zero-downtime reload
- ✅ Process clustering

### Perfect For

- Development environments
- Small to medium production
- Quick deployments
- Easy management

---

**Your backend is now running with PM2! 🚀**

Check status: `pm2 status`
View logs: `pm2 logs nova-backend`
