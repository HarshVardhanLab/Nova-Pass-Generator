# 🎫 HackGear Pass Generator - Full Stack Application

A comprehensive event management platform for generating encrypted QR codes, PDF passes, and managing attendees.

## 🚀 Features

### Phase 1 (Current Implementation)
- ✅ **Dashboard** - Overview stats and recent activity
- ✅ **CSV Management** - Upload CSV or edit data inline (Excel-like)
- ✅ **Pass Generation** - Generate encrypted QR codes and PDF passes
- ✅ **Team Management** - Manage teams and members
- ✅ **Template System** - Custom pass templates
- ✅ **QR Scanner** - Real-time attendance tracking
- ✅ **Analytics** - Event statistics and reports

### Excluded (Already in NovaMailer)
- ❌ Email System (use NovaMailer integration)

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL/SQLite** - Database
- **Pydantic** - Data validation
- **QRCode** - QR code generation
- **ReportLab** - PDF generation
- **Cryptography** - QR encryption

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **AG-Grid** - Excel-like data grid
- **React Query** - Data fetching
- **Zustand** - State management
- **Recharts** - Analytics charts

## 📦 Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (optional, SQLite works too)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run migrations (creates tables)
python -m app.main

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend will run on: http://localhost:8000
API docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

## 📁 Project Structure

```
hackgear-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       ├── csv_handler.py
│   │   │       ├── dashboard.py
│   │   │       ├── events.py
│   │   │       ├── members.py
│   │   │       ├── passes.py
│   │   │       ├── scanner.py
│   │   │       ├── teams.py
│   │   │       └── templates.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   └── models.py
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── qr_service.py
│   │   │   └── pdf_service.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── CSVEditor.tsx
│   │   │   ├── PassPreview.tsx
│   │   │   └── Scanner.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── EventDetail.tsx
│   │   │   ├── CSVManager.tsx
│   │   │   ├── PassGenerator.tsx
│   │   │   ├── Scanner.tsx
│   │   │   ├── Templates.tsx
│   │   │   └── Analytics.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── store/
│   │   │   └── useStore.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## 🔑 Key API Endpoints

### Events
- `GET /api/v1/events` - List all events
- `POST /api/v1/events` - Create event
- `GET /api/v1/events/{id}` - Get event details

### CSV Management
- `POST /api/v1/csv/upload/{event_id}` - Upload CSV
- `GET /api/v1/csv/export/{event_id}` - Export CSV

### Members
- `GET /api/v1/members` - List members
- `POST /api/v1/members` - Create member
- `PUT /api/v1/members/{id}` - Update member
- `DELETE /api/v1/members/{id}` - Delete member

### Pass Generation
- `POST /api/v1/passes/generate` - Generate passes
- `GET /api/v1/passes/download/{member_id}` - Download pass

### Scanner
- `POST /api/v1/scanner/scan` - Scan QR code
- `GET /api/v1/scanner/attendance/{event_id}` - Get attendance

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## 🎨 Frontend Features

### CSV Manager
- Upload CSV files
- Inline editing (Excel-like with AG-Grid)
- Add/Edit/Delete rows
- Bulk operations
- Data validation
- Export to CSV

### Pass Generator
- Batch generation
- Real-time progress
- Preview before generating
- Custom templates
- Download individual or bulk passes

### Scanner
- Web-based QR scanner
- Real-time check-in
- Duplicate prevention
- Attendance logs

### Analytics
- Event statistics
- Team-wise reports
- Attendance trends
- Visual charts

## 🔐 Security

- JWT authentication
- Password hashing (bcrypt)
- QR code encryption (Fernet)
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
```bash
# Set environment variables
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key

# Deploy
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy
vercel deploy
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/hackgear_db
SECRET_KEY=your-secret-key-here
QR_ENCRYPTION_PASSWORD=hackgear2.0
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License

## 👥 Team

Built for HackGear 2.0 by Nova Coders

## 🔮 Future Features (Phase 2)

- WhatsApp integration
- SMS notifications
- Certificate generation
- Payment integration
- Mobile app (React Native)
- Advanced analytics
- Multi-language support
- API webhooks

---

For questions or support, contact: novacoders007@gmail.com
