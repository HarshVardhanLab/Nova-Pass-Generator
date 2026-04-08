# 🚀 Nova Pass Generator - Quick Start

## Prerequisites

- Python 3.11 (not 3.13!)
- Node.js (v16 or higher)
- npm

## Easy Start (Recommended)

### 1. Make scripts executable (first time only)
```bash
chmod +x start.sh stop.sh status.sh
```

### 2. Start both servers
```bash
./start.sh
```

This will:
- Start the backend on http://localhost:8000
- Start the frontend on http://localhost:5173
- Create log files: `backend.log` and `frontend.log`

### 3. Access the application
Open your browser and go to: **http://localhost:5173**

**Login credentials:**
- Username: `admin`
- Password: `admin123`

### 4. Stop servers
Press `Ctrl+C` in the terminal where start.sh is running

OR run:
```bash
./stop.sh
```

### 5. Check status
```bash
./status.sh
```

---

## Manual Start (Alternative)

### Backend
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3.11 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

---

## Important URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Alternative API Docs:** http://localhost:8000/redoc

---

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### View logs
```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

### Python version issues
Make sure you're using Python 3.11 (not 3.13):
```bash
python3.11 --version
```

### Database issues
If you encounter database errors, delete and recreate:
```bash
rm backend/hackgear.db
# Restart the backend - it will create a new database
```

---

## Features

✅ Event Management
✅ Team & Member Management
✅ CSV Upload/Export
✅ Drag-and-Drop Template Editor (Canva-like)
✅ QR Code Generation with Encryption
✅ PDF Pass Generation
✅ QR Scanner with Attendance Tracking
✅ Analytics Dashboard
✅ Custom Text Fields with Placeholders: `{Name}`, `{Team Name}`, `{Team ID}`, `{Status}`, `{Email}`

---

## Quick Workflow

1. **Login** with admin credentials
2. **Create an Event**
3. **Upload CSV** with team members (Team Id, Team Name, Name, Status, Email)
4. **Create Template** using the drag-and-drop editor
5. **Generate Passes** for all members
6. **Download Passes** individually or as a ZIP file
7. **Scan QR Codes** for attendance tracking

---

## Need Help?

Check the detailed documentation:
- `README.md` - Full documentation
- `SETUP.md` - Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Technical details

---

**Enjoy using Nova Pass Generator! 🎉**
