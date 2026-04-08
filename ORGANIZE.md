# 📁 File Organization Guide

## Current Cleanup Plan

### ✅ Files to KEEP (Root Directory)

**Documentation:**
- `README.md` - Main project documentation
- `VERCEL_EC2_DEPLOYMENT.md` - Production deployment guide

**Scripts:**
- `start.sh` - Start local development
- `stop.sh` - Stop local development
- `deploy_backend_only.sh` - Deploy backend on EC2

**Configuration:**
- `.gitignore`
- `frontend/` - Frontend code
- `backend/` - Backend code

### 📦 Files to ARCHIVE (Move to docs/archive/)

**Old Deployment Guides:**
- `DEPLOY_NOW.md`
- `DEPLOY_WITH_GIT.md`
- `EC2_QUICK_START.md`
- `EC2_INSTANCE_CONNECT_GUIDE.md`
- `AWS_DEPLOYMENT_SUMMARY.md`
- `DEPLOYMENT.md`
- `DEPLOYMENT_FILES.md`
- `DEPLOYMENT_UPDATED.md`

**Tunnel Guides:**
- `CLOUDFLARE_TUNNEL.md`
- `NGROK_SETUP.md`
- `TUNNEL_COMPARISON.md`
- `TUNNEL_NO_DOMAIN.md`
- `INSTANT_URL.md`

**Other Docs:**
- `ARCHITECTURE.md`
- `ENV_SETUP.md`
- `INDEX.md`
- `QUICK_DEPLOY.md`
- `START_HERE.md`
- `SETUP.md`
- `QUICK_START.md`
- `CHECKLIST.md`
- `IMPLEMENTATION_SUMMARY.md`

**Old Scripts:**
- `deploy_ec2.sh` (replaced by deploy_backend_only.sh)
- `quick_deploy.sh`
- `upload_to_ec2.sh`
- `manage.sh`
- `monitor.sh`
- `status.sh`

---

## 🚀 How to Clean Up

### Option 1: Automatic Cleanup

```bash
chmod +x cleanup.sh
./cleanup.sh
```

This will:
- Create `docs/archive/` directory
- Move all old files there
- Keep only essential files

### Option 2: Manual Cleanup

```bash
# Create archive directory
mkdir -p docs/archive

# Move old docs
mv DEPLOY_NOW.md DEPLOY_WITH_GIT.md EC2_*.md AWS_*.md DEPLOYMENT*.md docs/archive/
mv CLOUDFLARE_TUNNEL.md NGROK_SETUP.md TUNNEL_*.md INSTANT_URL.md docs/archive/
mv ARCHITECTURE.md ENV_SETUP.md INDEX.md QUICK_*.md START_HERE.md SETUP.md docs/archive/
mv CHECKLIST.md IMPLEMENTATION_SUMMARY.md docs/archive/

# Move old scripts
mv deploy_ec2.sh quick_deploy.sh upload_to_ec2.sh docs/archive/
mv manage.sh monitor.sh status.sh docs/archive/

# Update README
mv README_NEW.md README.md
```

---

## 📂 Final Structure

```
Nova-Pass-Generator/
├── README.md                      ← Main documentation
├── VERCEL_EC2_DEPLOYMENT.md      ← Deployment guide
├── start.sh                       ← Start local dev
├── stop.sh                        ← Stop local dev
├── deploy_backend_only.sh         ← Deploy backend
├── .gitignore
├── backend/                       ← Backend code
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── frontend/                      ← Frontend code
│   ├── src/
│   ├── package.json
│   └── ...
└── docs/
    └── archive/                   ← Old documentation
        ├── DEPLOY_NOW.md
        ├── CLOUDFLARE_TUNNEL.md
        └── ...
```

---

## ✨ Benefits

- ✅ Clean root directory
- ✅ Easy to navigate
- ✅ Clear documentation
- ✅ Old docs preserved in archive
- ✅ Professional structure

---

## 🎯 What Each File Does

### Essential Files

**README.md**
- Project overview
- Quick start guide
- Features list
- Tech stack

**VERCEL_EC2_DEPLOYMENT.md**
- Complete production deployment
- Vercel + EC2 setup
- CORS configuration
- Troubleshooting

**start.sh**
- Starts backend + frontend locally
- One command to run everything

**stop.sh**
- Stops local servers

**deploy_backend_only.sh**
- Deploys backend on EC2
- Creates systemd service
- Automated setup

---

## 🗑️ Safe to Delete

After archiving, these files are safe to delete if you want:
- All files in `docs/archive/`
- `cleanup.sh`
- `ORGANIZE.md` (this file)

But keeping them in archive is recommended for reference.

---

## 📝 Update .gitignore

Add to `.gitignore`:

```
# Documentation archive
docs/archive/

# Cleanup scripts
cleanup.sh
ORGANIZE.md
README_NEW.md
```

---

**Run `./cleanup.sh` to organize everything!** 🧹
