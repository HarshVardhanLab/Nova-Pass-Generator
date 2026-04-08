# ✅ Complete Setup Checklist

## Pre-Installation Check

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed (optional)

---

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```
- [ ] Virtual environment created
- [ ] Dependencies installed

### 2. Initialize Database
```bash
python -c "from app.core.database import engine, Base; from app.models.models import *; Base.metadata.create_all(bind=engine)"
```
- [ ] Database created (hackgear.db)

### 3. Create Admin User
```bash
python
```
Then paste:
```python
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
print("✅ Admin created!")
exit()
```
- [ ] Admin user created

### 4. Start Backend
```bash
uvicorn app.main:app --reload
```
- [ ] Backend running on http://localhost:8000
- [ ] API docs accessible at http://localhost:8000/docs

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```
- [ ] Node modules installed

### 2. Verify Configuration
- [ ] `.env` file exists with `VITE_API_URL=http://localhost:8000`
- [ ] All config files present (tsconfig.json, vite.config.ts, etc.)

### 3. Start Frontend
```bash
npm run dev
```
- [ ] Frontend running on http://localhost:5173

---

## First Time Usage

### 1. Login
- [ ] Open http://localhost:5173
- [ ] Login with username: `admin`, password: `admin123`
- [ ] Redirected to dashboard

### 2. Create Event
- [ ] Click "Events" in sidebar
- [ ] Click "Create Event"
- [ ] Fill in event details
- [ ] Event created successfully

### 3. Upload CSV
- [ ] Open your event
- [ ] Click "CSV Manager"
- [ ] Upload `Hackgear2.0-final.csv`
- [ ] Data imported successfully

### 4. Upload Template (Optional)
- [ ] Go to "Templates"
- [ ] Upload `HackGear2.0Pass.pdf`
- [ ] Template uploaded successfully

### 5. Generate Passes
- [ ] Go to event → "Generate Passes"
- [ ] Select template
- [ ] Select members
- [ ] Click "Generate Passes"
- [ ] Passes generated successfully
- [ ] Download test pass

### 6. Test Scanner
- [ ] Go to "Scanner"
- [ ] Copy QR data from a pass
- [ ] Paste and scan
- [ ] Attendance marked successfully

---

## Feature Testing

### Authentication
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect to login

### Events
- [ ] Create event
- [ ] View event list
- [ ] View event details
- [ ] Delete event

### CSV Management
- [ ] Upload CSV
- [ ] View data in grid
- [ ] Edit cell inline
- [ ] Export CSV

### Pass Generation
- [ ] Select members
- [ ] Select template
- [ ] Generate passes
- [ ] Download individual pass
- [ ] View pass path in CSV

### Scanner
- [ ] Scan QR code
- [ ] Mark attendance
- [ ] Prevent duplicate check-in
- [ ] View attendance logs

### Analytics
- [ ] View dashboard stats
- [ ] View event stats
- [ ] View team-wise attendance
- [ ] See attendance rate

### Templates
- [ ] Upload template
- [ ] View template list
- [ ] Delete template

---

## Troubleshooting

### Backend Issues
- [ ] Check Python version: `python --version`
- [ ] Check if port 8000 is free
- [ ] Check database file exists
- [ ] Check virtual environment is activated

### Frontend Issues
- [ ] Check Node version: `node --version`
- [ ] Check if port 5173 is free
- [ ] Check .env file exists
- [ ] Clear node_modules and reinstall if needed

### API Connection Issues
- [ ] Backend is running
- [ ] Frontend .env has correct API URL
- [ ] No CORS errors in browser console
- [ ] Check network tab in browser dev tools

---

## Production Deployment

### Backend
- [ ] Set production SECRET_KEY
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set ALLOWED_ORIGINS
- [ ] Deploy to Railway/Render/Heroku

### Frontend
- [ ] Update VITE_API_URL to production backend
- [ ] Build: `npm run build`
- [ ] Deploy to Vercel/Netlify

---

## Final Verification

- [ ] All backend endpoints working (check /docs)
- [ ] All frontend pages loading
- [ ] Can create event
- [ ] Can upload CSV
- [ ] Can generate passes
- [ ] Can scan QR codes
- [ ] Can view analytics

---

## 🎉 Success Criteria

✅ Backend running without errors
✅ Frontend running without errors
✅ Can login successfully
✅ Can create and manage events
✅ Can upload and edit CSV data
✅ Can generate QR codes and PDF passes
✅ Can scan QR codes and track attendance
✅ Can view analytics and reports

---

**If all checkboxes are checked, you're ready to go! 🚀**

For issues, check:
- QUICK_START.md for setup instructions
- README.md for feature documentation
- API docs at http://localhost:8000/docs
