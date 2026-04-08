# 🚀 Deploy Frontend on Vercel + Backend on EC2

## Perfect Setup: Frontend (Vercel) + Backend (EC2)

This is the recommended production setup:
- ✅ Frontend on Vercel (free, fast, CDN)
- ✅ Backend on EC2 (full control, database)
- ✅ Easy to manage and scale

---

## 📋 Overview

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend)               │
│    https://your-app.vercel.app          │
│         React + Vite                    │
└─────────────────┬───────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────┐
│         EC2 (Backend)                   │
│    http://YOUR_EC2_IP:8000              │
│    or https://api.yourdomain.com        │
│         FastAPI + SQLite                │
└─────────────────────────────────────────┘
```

---

## Part 1: Deploy Backend on EC2

### Step 1: Setup EC2 Instance

**Launch EC2:**
```
AMI: Ubuntu Server 22.04 LTS
Instance Type: t2.small (minimum)
Storage: 20 GB

Security Group:
  SSH (22) - Your IP
  HTTP (80) - 0.0.0.0/0
  Custom TCP (8000) - 0.0.0.0/0  ← Important!
```

### Step 2: Connect and Clone

```bash
# Connect via EC2 Instance Connect

# Clone repository
git clone YOUR_REPO_URL Nova-Pass-Generator
cd Nova-Pass-Generator
```

### Step 3: Deploy Backend Only

```bash
# Install Python 3.11
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev

# Setup backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Create systemd service
sudo tee /etc/systemd/system/nova-backend.service > /dev/null <<EOF
[Unit]
Description=Nova Pass Generator Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Nova-Pass-Generator/backend
Environment="PATH=/home/ubuntu/Nova-Pass-Generator/backend/venv/bin"
ExecStart=/home/ubuntu/Nova-Pass-Generator/backend/venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Start backend
sudo systemctl daemon-reload
sudo systemctl enable nova-backend
sudo systemctl start nova-backend

# Check status
sudo systemctl status nova-backend
```

### Step 4: Get Backend URL

```bash
# Get your EC2 public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

**Your backend URL:** `http://YOUR_EC2_IP:8000`

**Test it:**
```bash
curl http://YOUR_EC2_IP:8000/docs
```

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Prepare Frontend

**Update CORS in backend:**

```bash
# On EC2
cd ~/Nova-Pass-Generator/backend/app/core

# Edit config.py to allow Vercel domain
nano config.py
```

Update ALLOWED_ORIGINS:
```python
ALLOWED_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-app.vercel.app",  # Add this
    "https://*.vercel.app"  # Allow all Vercel preview deployments
]
```

Restart backend:
```bash
sudo systemctl restart nova-backend
```

### Step 2: Push to GitHub

```bash
# On your local machine
cd /path/to/Nova-Pass-Generator

# Make sure .gitignore is correct
cat > .gitignore << 'EOF'
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
.venv/
*.db
*.log

# Node
node_modules/
dist/
.env.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Generated files
backend/static/passes/
backend/static/qr_codes/
backend/uploads/
EOF

# Commit and push
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 3: Deploy on Vercel

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to https://vercel.com
2. Sign up/Login (free)
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
6. Add Environment Variable:
   ```
   Name: VITE_API_URL
   Value: http://YOUR_EC2_IP:8000
   ```
7. Click **"Deploy"**

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: nova-pass-generator
# - Directory: ./
# - Override settings? Yes
# - Build command: npm run build
# - Output directory: dist

# Add environment variable
vercel env add VITE_API_URL
# Enter: http://YOUR_EC2_IP:8000

# Deploy to production
vercel --prod
```

### Step 4: Get Your URLs

**Frontend:** `https://your-app.vercel.app`
**Backend:** `http://YOUR_EC2_IP:8000`

---

## 🔒 Optional: Use Cloudflare Tunnel for Backend

Instead of exposing port 8000, use Cloudflare Tunnel:

```bash
# On EC2
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

cloudflared tunnel login
cloudflared tunnel create nova-backend

# Configure
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: nova-backend
credentials-file: ~/.cloudflared/TUNNEL_ID.json

ingress:
  - service: http://localhost:8000
EOF

cloudflared tunnel route dns nova-backend api.yourdomain.com

# Install as service
sudo cloudflared service install
sudo systemctl start cloudflared
```

**Then update Vercel env:**
```
VITE_API_URL=https://api.yourdomain.com
```

---

## 🔄 Update Process

### Update Backend

```bash
# On EC2
cd ~/Nova-Pass-Generator
git pull
sudo systemctl restart nova-backend
```

### Update Frontend

```bash
# On local machine
cd frontend
git add .
git commit -m "Update frontend"
git push

# Vercel auto-deploys on push!
```

Or manually:
```bash
cd frontend
vercel --prod
```

---

## 📝 Configuration Files

### Create `vercel.json` in frontend/

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Update `frontend/.env.production`

```bash
VITE_API_URL=http://YOUR_EC2_IP:8000
```

---

## 🔧 CORS Configuration

Make sure backend allows Vercel domain:

**backend/app/main.py:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-app.vercel.app",
        "https://*.vercel.app"  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 💰 Cost Breakdown

### Vercel (Frontend)
- **Free Tier:**
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Custom domain
  - HTTPS included
  - **Cost: $0**

### EC2 (Backend)
- **t2.micro:** Free tier (1 year)
- **t2.small:** ~$15/month
- **t2.medium:** ~$34/month

**Total: $0-34/month**

---

## ✅ Advantages

### Vercel Frontend
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-deploy on git push
- ✅ Preview deployments
- ✅ Zero configuration

### EC2 Backend
- ✅ Full control
- ✅ Database on same server
- ✅ File storage (QR codes, PDFs)
- ✅ No cold starts
- ✅ Predictable performance

---

## 🐛 Troubleshooting

### CORS Errors

**Update backend CORS:**
```python
allow_origins=["https://your-app.vercel.app"]
```

**Restart backend:**
```bash
sudo systemctl restart nova-backend
```

### Frontend Can't Connect

**Check backend is accessible:**
```bash
curl http://YOUR_EC2_IP:8000/docs
```

**Check Vercel env variable:**
```bash
vercel env ls
```

**Update if needed:**
```bash
vercel env rm VITE_API_URL
vercel env add VITE_API_URL
# Enter: http://YOUR_EC2_IP:8000
vercel --prod
```

### Static Files Not Loading

**Check EC2 security group allows port 8000**

**Or use Cloudflare Tunnel** (recommended)

---

## 🎯 Quick Commands

### Deploy Backend (EC2)
```bash
cd ~/Nova-Pass-Generator
git pull
sudo systemctl restart nova-backend
```

### Deploy Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Check Status
```bash
# Backend
sudo systemctl status nova-backend

# Frontend
vercel ls
```

### View Logs
```bash
# Backend
sudo journalctl -u nova-backend -f

# Frontend
vercel logs
```

---

## 🎉 Final Setup

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `http://YOUR_EC2_IP:8000`
- API Docs: `http://YOUR_EC2_IP:8000/docs`

**Login:**
- Username: `admin`
- Password: `admin123`

---

## 📚 Next Steps

1. ✅ Deploy backend on EC2
2. ✅ Deploy frontend on Vercel
3. ⭐ Set up custom domain
4. ⭐ Add Cloudflare Tunnel for backend
5. ⭐ Set up monitoring
6. ⭐ Configure backups

---

**This is the best setup for production! Frontend on Vercel (free, fast) + Backend on EC2 (full control)** 🚀
