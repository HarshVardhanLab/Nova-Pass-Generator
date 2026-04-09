# Run Nova Pass Generator Locally

Quick guide to run the application on your local machine.

## Prerequisites

Make sure you have installed:
- Python 3.11 or higher
- Node.js 16 or higher
- npm or yarn

## Quick Start (Easiest Method)

### 1. Run the start script

```bash
chmod +x start-local.sh
./start-local.sh
```

This will:
- Create Python virtual environment (if needed)
- Install backend dependencies
- Install frontend dependencies
- Start backend on port 8000
- Start frontend on port 5173

### 2. Open in browser

Frontend: http://localhost:5173
Backend API: http://localhost:8000/docs

### 3. Login

- Username: `harshvardhan`
- Password: `harsh9837`

### 4. Stop servers

Press `Ctrl+C` in the terminal, or run:

```bash
./stop-local.sh
```

## Manual Setup (Step by Step)

If you prefer to run things manually:

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will run on: http://localhost:8000

### Frontend Setup

Open a NEW terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend will run on: http://localhost:5173

## Environment Variables

### Backend (.env)

The backend uses `backend/.env` file:

```env
DATABASE_URL=sqlite:///./hackgear.db
SECRET_KEY=b-FvuC77UAdA7YN1o90xWYEGM6lEmTCRD0pn4QoiN7UBIKio3hViZX4PBjWcGCeQiADlrGhfoErSCAbhlTUSvQ
QR_ENCRYPTION_PASSWORD=hackgear2.0
ADMIN_USERNAME=harshvardhan
ADMIN_PASSWORD=harsh9837
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### Frontend (.env)

The frontend uses `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8000
```

## Troubleshooting

### Port Already in Use

If port 8000 or 5173 is already in use:

```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Backend Won't Start

```bash
# Check Python version
python3 --version  # Should be 3.11+

# Reinstall dependencies
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Won't Start

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Issues

```bash
# Delete and recreate database
cd backend
rm hackgear.db
# Restart backend - it will create a new database
```

### CORS Errors

Make sure `frontend/.env` has:
```
VITE_API_URL=http://localhost:8000
```

And `backend/.env` has:
```
CORS_ORIGINS=["http://localhost:5173"]
```

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:
- Backend: Changes to Python files auto-reload
- Frontend: Changes to React files auto-reload

### View Logs

Backend logs appear in the terminal where you ran `uvicorn`
Frontend logs appear in browser console (F12)

### API Documentation

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI)

### Database Browser

To view the SQLite database:

```bash
cd backend
sqlite3 hackgear.db
.tables
SELECT * FROM users;
.quit
```

## Production vs Development

### Development (Local)
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Database: SQLite (local file)
- Hot reload: Enabled

### Production (Deployed)
- Backend: http://100.55.91.90:8000 (EC2)
- Frontend: https://nova-pass-generator.vercel.app
- Database: SQLite (on EC2)
- Hot reload: Disabled

## Common Commands

```bash
# Start everything
./start-local.sh

# Stop everything
./stop-local.sh

# Backend only
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend only
cd frontend && npm run dev

# Install new backend package
cd backend && source venv/bin/activate && pip install package-name

# Install new frontend package
cd frontend && npm install package-name

# Run backend tests (if you add them)
cd backend && source venv/bin/activate && pytest

# Build frontend for production
cd frontend && npm run build
```

## Project Structure

```
Nova-Pass-Generator/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── core/            # Config, database, security
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── main.py          # FastAPI app
│   ├── static/              # Generated files
│   ├── uploads/             # Uploaded templates
│   ├── venv/                # Virtual environment
│   ├── .env                 # Environment variables
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API calls
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx          # Main app
│   ├── .env                 # Environment variables
│   └── package.json         # Node dependencies
│
└── start-local.sh           # Start script
```

## Next Steps

1. Start the app: `./start-local.sh`
2. Open http://localhost:5173
3. Login with harshvardhan/harsh9837
4. Create an event
5. Upload CSV with team data
6. Generate passes
7. Test QR scanner

Enjoy developing! 🚀
