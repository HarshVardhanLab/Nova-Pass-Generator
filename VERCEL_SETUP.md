# 🚀 Vercel Frontend Setup

## Quick Setup Guide

### 1️⃣ Deploy Frontend to Vercel

```bash
# In your local machine
cd frontend

# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Or use Vercel Dashboard:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Set Root Directory: `frontend`
5. Click "Deploy"

---

### 2️⃣ Set Environment Variable in Vercel

Your backend is running at: `http://100.55.91.90:8000`

#### Option A: Vercel Dashboard

1. Go to your project on Vercel
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `http://100.55.91.90:8000`
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy: Go to "Deployments" → Click "..." on latest → "Redeploy"

#### Option B: Vercel CLI

```bash
# Set environment variable
vercel env add VITE_API_URL

# When prompted, enter: http://100.55.91.90:8000
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

---

### 3️⃣ Update Backend CORS on EC2

Your backend needs to allow requests from Vercel.

**On EC2 instance:**

```bash
cd ~/Nova-Pass-Generator/backend

# Edit .env file
nano .env
```

Update the CORS_ORIGINS line:
```bash
CORS_ORIGINS=["https://nova-pass-generator.vercel.app","http://localhost:5173"]
```

Save (Ctrl+O, Enter, Ctrl+X) and restart:
```bash
pm2 restart nova-backend
```

---

## ✅ Verify Setup

### Test Frontend
1. Open: https://nova-pass-generator.vercel.app
2. Try to login with: `harshvardhan` / `harsh9837`
3. Should connect to EC2 backend

### Test Backend
```bash
# From your local machine
curl http://100.55.91.90:8000/api/v1/health

# Should return: {"status":"ok"}
```

### Check Backend Logs
```bash
# On EC2
pm2 logs nova-backend
```

---

## 🔧 Troubleshooting

### CORS Error in Browser Console

**Error:** "Access to fetch at 'http://100.55.91.90:8000' from origin 'https://nova-pass-generator.vercel.app' has been blocked by CORS policy"

**Fix:**
```bash
# On EC2
cd ~/Nova-Pass-Generator/backend
nano .env

# Make sure CORS_ORIGINS includes your Vercel URL:
CORS_ORIGINS=["https://nova-pass-generator.vercel.app","http://localhost:5173"]

# Restart
pm2 restart nova-backend
```

### Frontend Shows "Network Error"

**Check:**
1. Backend is running: `pm2 status` on EC2
2. Port 8000 is open in EC2 Security Group
3. Environment variable is set in Vercel

**Fix Security Group:**
1. Go to EC2 Console → Security Groups
2. Find your instance's security group
3. Add Inbound Rule:
   - Type: Custom TCP
   - Port: 8000
   - Source: 0.0.0.0/0 (or Anywhere-IPv4)
4. Save

### Environment Variable Not Working

**Redeploy after setting:**
```bash
vercel --prod
```

Or in Vercel Dashboard:
- Deployments → Latest → "..." → Redeploy

---

## 📋 Complete Configuration

### Vercel Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `http://100.55.91.90:8000` |

### EC2 Backend .env

```bash
DATABASE_URL=sqlite:///./hackgear.db
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
QR_ENCRYPTION_PASSWORD=nova2024
CORS_ORIGINS=["https://nova-pass-generator.vercel.app","http://localhost:5173"]
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
STATIC_DIR=./static
ADMIN_USERNAME=harshvardhan
ADMIN_PASSWORD=harsh9837
ADMIN_EMAIL=admin@nova.local
```

---

## 🎯 URLs

- **Frontend**: https://nova-pass-generator.vercel.app
- **Backend**: http://100.55.91.90:8000
- **API Docs**: http://100.55.91.90:8000/docs
- **Health Check**: http://100.55.91.90:8000/api/v1/health

---

## 🔒 Security Note

Your backend is using HTTP (not HTTPS). For production:

1. **Get a domain** (free from Freenom, or cheap from Namecheap)
2. **Setup SSL** with Let's Encrypt (free)
3. **Use Nginx** as reverse proxy

Or use **Cloudflare Tunnel** for free HTTPS:
- See `CLOUDFLARE_TUNNEL.md` for setup

---

**Your app is now live! 🎉**

Frontend: https://nova-pass-generator.vercel.app
Backend: http://100.55.91.90:8000
