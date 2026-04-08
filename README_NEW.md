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
git clone YOUR_REPO_URL
cd Nova-Pass-Generator

# Start both backend and frontend
./start.sh
```

**Access:** http://localhost:5173

**Login:**
- Username: `admin`
- Password: `admin123`

### Stop Servers

```bash
./stop.sh
```

---

## 🌐 Production Deployment

### Recommended: Vercel (Frontend) + EC2 (Backend)

**Best setup for production:**
- Frontend on Vercel (free, fast, CDN)
- Backend on EC2 (full control, database)

**See:** [VERCEL_EC2_DEPLOYMENT.md](VERCEL_EC2_DEPLOYMENT.md)

#### Quick Deploy Backend on EC2

```bash
# On EC2 instance
git clone YOUR_REPO_URL Nova-Pass-Generator
cd Nova-Pass-Generator
chmod +x deploy_backend_only.sh
./deploy_backend_only.sh
```

#### Quick Deploy Frontend on Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
   - Environment Variable: `VITE_API_URL=http://YOUR_EC2_IP:8000`
4. Deploy!

---

## 📋 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack Query

### Backend
- FastAPI
- Python 3.11+
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn

---

## 🔧 Configuration

### Frontend Environment

Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:8000  # Local
# or
VITE_API_URL=http://YOUR_EC2_IP:8000  # Production
```

### Backend Environment

Backend uses defaults from `backend/app/core/config.py`. Optional `.env`:
```bash
SECRET_KEY=your-secret-key
QR_ENCRYPTION_PASSWORD=nova2024
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

---

## 📖 Documentation

- **[VERCEL_EC2_DEPLOYMENT.md](VERCEL_EC2_DEPLOYMENT.md)** - Production deployment guide
- **[docs/archive/](docs/archive/)** - Additional documentation

---

## 🛠️ Development

### Prerequisites

- Python 3.11+
- Node.js 16+
- npm

### Backend Setup

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📱 Features in Detail

### Template Editor
- Drag-and-drop QR code positioning
- Multiple text elements
- Full typography control (font, size, color, weight)
- Custom text with placeholders: `{Name}`, `{Team Name}`, `{Team ID}`, `{Status}`, `{Email}`
- Real-time preview

### Pass Generation
- Bulk generation from CSV
- Individual pass download
- ZIP download for all passes
- Encrypted QR codes

### QR Scanner
- Real-time scanning
- Attendance tracking
- Check-in/check-out
- Analytics

---

## 🔒 Security

- JWT authentication
- Encrypted QR codes (Fernet)
- Password hashing (bcrypt)
- CORS protection
- Input validation

---

## 📊 Database Schema

- **Users** - Admin users
- **Events** - Event management
- **Teams** - Team information
- **Members** - Team members
- **Templates** - PDF templates with positioning
- **AttendanceLogs** - Check-in records

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use for your projects!

---

## 🆘 Support

### Common Issues

**Backend won't start:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend won't start:**
```bash
cd frontend
npm install
npm run dev
```

**CORS errors:**
Update `backend/app/core/config.py` ALLOWED_ORIGINS

---

## 🎯 Roadmap

- [ ] Email notifications
- [ ] SMS integration
- [ ] Multiple QR code formats
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Multi-language support

---

## 👨‍💻 Author

Built with ❤️ for event management

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Happy Event Managing! 🎉**
