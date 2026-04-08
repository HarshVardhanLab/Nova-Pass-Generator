# 🎫 Nova Pass Generator

A complete event pass management system with QR code generation, PDF pass creation, and attendance tracking.

## ✨ Features

- 🎟️ Event Management
- 👥 Team & Member Management
- 📊 CSV Upload/Export
- 🎨 Drag-and-Drop Template Editor (Canva-like)
- 🔐 Encrypted QR Code Generation
- 📄 PDF Pass Generation
- 📱 QR Scanner with Attendance Tracking
- 📈 Analytics Dashboard
- 🎯 Custom Text Fields with Placeholders

## 🚀 Quick Start

### Local Development

```bash
# Clone repository
git clone YOUR_REPO_URL Nova-Pass-Generator
cd Nova-Pass-Generator

# Start backend
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

**Access:** http://localhost:5173

**Login:**
- Username: `harshvardhan`
- Password: `harsh9837`

---

## 🌐 Production Deployment

### Current Setup
- **Frontend**: Vercel → https://nova-pass-generator.vercel.app
- **Backend**: AWS EC2 → http://100.55.91.90:8000
- **Process Manager**: PM2

### 🚨 Backend Not Working? Quick Fix

If backend on EC2 shows pydantic validation errors:

```bash
# On EC2 instance
cd ~/Nova-Pass-Generator
git pull
chmod +x fix_backend_ec2.sh
./fix_backend_ec2.sh
```

**See:** `QUICK_FIX.md` for detailed troubleshooting

### Deploy Backend to EC2

```bash
# On EC2 instance
git clone YOUR_REPO_URL Nova-Pass-Generator
cd Nova-Pass-Generator
chmod +x deploy_backend_pm2.sh
./deploy_backend_pm2.sh
```

**See:** `PM2_GUIDE.md` for PM2 management commands

### Setup Vercel Frontend

1. Deploy to Vercel (import from GitHub)
2. Set Root Directory: `frontend`
3. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `http://100.55.91.90:8000`
4. Deploy

**See:** `VERCEL_SETUP.md` for detailed configuration

---

## 📚 Documentation

### Essential Guides (Start Here)
- **`QUICK_FIX.md`** - Fix backend errors on EC2 ⚡
- **`VERCEL_SETUP.md`** - Configure Vercel frontend 🌐
- **`PM2_GUIDE.md`** - Manage backend with PM2 🔄
- **`VERCEL_EC2_DEPLOYMENT.md`** - Complete deployment guide 📖

### Additional Resources
- `CLOUDFLARE_TUNNEL.md` - Setup HTTPS tunnel (free SSL)
- `NGROK_SETUP.md` - Alternative tunnel setup
- `docs/archive/` - Archived documentation

---

## 🔧 Common Commands

### PM2 (on EC2)
```bash
pm2 status              # Check backend status
pm2 logs nova-backend   # View logs
pm2 restart nova-backend # Restart backend
pm2 stop nova-backend   # Stop backend
pm2 start nova-backend  # Start backend
```

### Local Development
```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

### Test API
```bash
# Health check
curl http://100.55.91.90:8000/api/v1/health

# Should return: {"status":"ok"}
```

---

## 📋 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack Query

### Backend
- FastAPI
- Python 3.11
- SQLAlchemy + SQLite
- Pydantic
- JWT Authentication
- Fernet Encryption

---

## 📁 Project Structure

```
Nova-Pass-Generator/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes (9 modules)
│   │   ├── core/        # Config, database, security
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # PDF & QR services
│   ├── static/          # Generated passes & QR codes
│   └── uploads/         # Template uploads
├── frontend/            # React frontend
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components (9 pages)
│       └── services/    # API client
├── docs/               # Documentation
├── fix_backend_ec2.sh  # Fix script for EC2
├── deploy_backend_pm2.sh # PM2 deployment
└── ecosystem.config.js # PM2 configuration
```

---

## 🎯 URLs

- **Frontend**: https://nova-pass-generator.vercel.app
- **Backend**: http://100.55.91.90:8000
- **API Docs**: http://100.55.91.90:8000/docs
- **Health Check**: http://100.55.91.90:8000/api/v1/health

---

## 📱 Features in Detail

### Template Editor (Canva-like)
- Drag-and-drop QR code positioning
- Multiple text elements with full control
- Typography: font family, size (8-48px), weight, color, alignment
- Adjustable width/height for text boxes
- Data field binding: name, team_name, team_id, status, email
- Custom text with placeholders: `{Name}`, `{Team Name}`, `{Team ID}`, `{Status}`, `{Email}`
- Real-time preview on PDF template

### Pass Generation
- Bulk generation from CSV
- Individual pass download
- ZIP download for all passes
- Encrypted QR codes with Fernet
- Custom positioning and styling

### QR Scanner
- Real-time scanning with camera
- Attendance tracking
- Check-in/check-out logging
- Member information display
- Analytics integration

### CSV Management
- Upload CSV with team data
- Format: Team Id, Team Name, Name, Status, Email
- Bulk import teams and members
- Export functionality

---

## 🔒 Security

- JWT authentication with token expiry
- Encrypted QR codes (Fernet encryption)
- Password hashing (bcrypt)
- CORS protection
- Input validation with Pydantic
- SQL injection protection (SQLAlchemy ORM)

---

## 🔧 Configuration

### Frontend Environment (`frontend/.env`)
```bash
VITE_API_URL=http://localhost:8000  # Local
# or
VITE_API_URL=http://100.55.91.90:8000  # Production EC2
```

### Backend Environment (`backend/.env`)
```bash
# Database
DATABASE_URL=sqlite:///./hackgear.db

# Security
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# QR Encryption
QR_ENCRYPTION_PASSWORD=nova2024

# CORS
CORS_ORIGINS=["https://nova-pass-generator.vercel.app","http://localhost:5173"]

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
STATIC_DIR=./static

# Admin User
ADMIN_USERNAME=harshvardhan
ADMIN_PASSWORD=harsh9837
ADMIN_EMAIL=admin@nova.local
```

---

## 🐛 Troubleshooting

### Backend Won't Start on EC2

**Error:** Pydantic validation errors

**Fix:**
```bash
cd ~/Nova-Pass-Generator
git pull
chmod +x fix_backend_ec2.sh
./fix_backend_ec2.sh
```

### CORS Errors in Browser

**Error:** "Access blocked by CORS policy"

**Fix:**
```bash
# On EC2
cd ~/Nova-Pass-Generator/backend
nano .env
# Update: CORS_ORIGINS=["https://nova-pass-generator.vercel.app"]
pm2 restart nova-backend
```

### Frontend Shows "Network Error"

**Check:**
1. Backend is running: `pm2 status` on EC2
2. Port 8000 is open in EC2 Security Group
3. `VITE_API_URL` is set in Vercel

**Fix Security Group:**
- EC2 Console → Security Groups
- Add Inbound Rule: Custom TCP, Port 8000, Source: 0.0.0.0/0

### Port 8000 Already in Use

```bash
# Find process
sudo lsof -i :8000

# Kill it
sudo kill -9 PID

# Restart PM2
pm2 restart nova-backend
```

---

## 📊 Database Schema

- **users** - Admin authentication
- **events** - Event management
- **teams** - Team information
- **members** - Team members with QR data
- **templates** - PDF templates with element positioning
- **attendance_logs** - Check-in/check-out records

---

## ✅ Success Checklist

- [ ] Backend running on EC2 (`pm2 status` shows "online")
- [ ] API health check returns `{"status":"ok"}`
- [ ] Port 8000 open in EC2 Security Group
- [ ] `VITE_API_URL` set in Vercel environment variables
- [ ] Frontend deployed and accessible on Vercel
- [ ] Can login to frontend
- [ ] No CORS errors in browser console
- [ ] Can generate passes and scan QR codes

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - feel free to use for your projects!

---

## 🆘 Need Help?

1. Check `QUICK_FIX.md` for common issues
2. Review `PM2_GUIDE.md` for backend management
3. See `VERCEL_SETUP.md` for frontend configuration
4. Read `VERCEL_EC2_DEPLOYMENT.md` for complete deployment guide

---

**Built with ❤️ for seamless event management**

**Happy Event Managing! 🎉**
