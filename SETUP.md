# 🚀 Complete Setup Guide

## Backend Setup (FastAPI)

### 1. Install Dependencies

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# Minimum required:
# - SECRET_KEY (generate with: openssl rand -hex 32)
# - QR_ENCRYPTION_PASSWORD
```

### 3. Initialize Database

```bash
# The database will be created automatically on first run
# Tables are created via SQLAlchemy models

python -c "from app.core.database import engine, Base; from app.models.models import *; Base.metadata.create_all(bind=engine)"
```

### 4. Create First Admin User

```python
# Run Python shell
python

# Then execute:
from app.core.database import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    email="admin@hackgear.com",
    username="admin",
    full_name="Admin User",
    role="admin",
    hashed_password=get_password_hash("admin123")
)
db.add(admin)
db.commit()
print("Admin user created!")
```

### 5. Start Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

Backend will run on: **http://localhost:8000**
API Docs: **http://localhost:8000/docs**

---

## Frontend Setup (React + Vite)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 📝 Quick Start Guide

### 1. Login
- Navigate to http://localhost:5173/login
- Use credentials: `admin` / `admin123`

### 2. Create Event
- Go to Events page
- Click "Create Event"
- Fill in event details

### 3. Upload CSV
- Open your event
- Go to "CSV Manager"
- Upload your CSV file with columns:
  - Team Id
  - Team Name
  - Name
  - Status
  - Email

### 4. Generate Passes
- Go to "Pass Generator"
- Upload template PDF (or use default)
- Click "Generate Passes"
- Download individual or bulk passes

### 5. Scan QR Codes
- Go to "Scanner"
- Use device camera to scan QR codes
- View real-time attendance

---

## 🔧 Troubleshooting

### Backend Issues

**Database errors:**
```bash
# Delete database and recreate
rm hackgear.db
python -c "from app.core.database import engine, Base; from app.models.models import *; Base.metadata.create_all(bind=engine)"
```

**Import errors:**
```bash
# Make sure you're in the backend directory
cd backend
# Activate venv
source venv/bin/activate
# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

**Module not found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API connection errors:**
- Check backend is running on port 8000
- Verify VITE_API_URL in .env
- Check CORS settings in backend/app/main.py

---

## 📦 Production Deployment

### Backend (Railway/Render)

1. Set environment variables:
```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
QR_ENCRYPTION_PASSWORD=your-password
ALLOWED_ORIGINS=https://your-frontend.com
```

2. Deploy:
```bash
# Railway
railway up

# Render
# Connect GitHub repo and deploy
```

### Frontend (Vercel/Netlify)

1. Build:
```bash
npm run build
```

2. Deploy:
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod
```

3. Set environment variable:
```
VITE_API_URL=https://your-backend.com
```

---

## 🎯 Next Steps

1. **Customize Templates**
   - Upload your own PDF templates
   - Adjust QR code and text positions

2. **Integrate with NovaMailer**
   - Use CSV export with pass paths
   - Import to NovaMailer for bulk emails

3. **Add More Features**
   - WhatsApp integration
   - SMS notifications
   - Certificate generation
   - Advanced analytics

---

## 📞 Support

For issues or questions:
- Email: novacoders007@gmail.com
- GitHub Issues: [Create Issue]

---

## ✅ Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Admin user created
- [ ] First event created
- [ ] CSV uploaded successfully
- [ ] Passes generated
- [ ] QR scanner working

---

Happy Hacking! 🚀
