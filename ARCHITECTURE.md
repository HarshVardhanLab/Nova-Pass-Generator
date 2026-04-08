# 🏗️ Nova Pass Generator - Architecture

## System Architecture on AWS EC2

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS EC2 Instance                         │
│                      (Ubuntu 22.04 LTS)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                         Nginx                               │ │
│  │                   (Reverse Proxy)                           │ │
│  │                    Port 80/443                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│           │                                    │                  │
│           │                                    │                  │
│           ▼                                    ▼                  │
│  ┌──────────────────┐              ┌──────────────────────┐     │
│  │   Frontend       │              │   Backend API        │     │
│  │   (React)        │              │   (FastAPI)          │     │
│  │   Static Files   │              │   Port 8000          │     │
│  │   /dist          │              │   Python 3.11        │     │
│  └──────────────────┘              └──────────────────────┘     │
│                                              │                    │
│                                              │                    │
│                                              ▼                    │
│                                     ┌──────────────────┐         │
│                                     │   SQLite DB      │         │
│                                     │   hackgear.db    │         │
│                                     └──────────────────┘         │
│                                              │                    │
│                                              │                    │
│                                              ▼                    │
│                                     ┌──────────────────┐         │
│                                     │  Static Files    │         │
│                                     │  /static         │         │
│                                     │  - QR Codes      │         │
│                                     │  - PDF Passes    │         │
│                                     │  - Templates     │         │
│                                     └──────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Internet
                              │
                              ▼
                    ┌──────────────────┐
                    │   Users          │
                    │   (Browser)      │
                    └──────────────────┘
```

---

## Request Flow

### Frontend Request
```
User Browser
    │
    │ HTTP GET /
    ▼
Nginx (Port 80)
    │
    │ Serve static files
    ▼
Frontend (React App)
    │
    │ Loaded in browser
    ▼
User Interface
```

### API Request
```
User Browser
    │
    │ HTTP POST /api/v1/events
    ▼
Nginx (Port 80)
    │
    │ Proxy to backend
    ▼
Backend (FastAPI - Port 8000)
    │
    │ Process request
    ▼
Database (SQLite)
    │
    │ Query/Update
    ▼
Response to User
```

### Pass Generation Flow
```
User clicks "Generate Passes"
    │
    ▼
Frontend sends POST /api/v1/passes/generate
    │
    ▼
Backend receives request
    │
    ├─► Get template from DB
    │
    ├─► Get members from DB
    │
    ├─► For each member:
    │   │
    │   ├─► Generate encrypted QR code
    │   │   └─► Save to /static/qr_codes/
    │   │
    │   └─► Generate PDF pass
    │       ├─► Load template PDF
    │       ├─► Overlay QR code
    │       ├─► Add text elements
    │       └─► Save to /static/passes/
    │
    └─► Return success response
```

---

## Component Details

### 1. Nginx (Web Server)
**Purpose**: Reverse proxy and static file server

**Configuration**:
- Listens on port 80 (HTTP)
- Serves frontend from `/home/ubuntu/nova-pass-generator/frontend/dist`
- Proxies API requests to backend on port 8000
- Serves static files (QR codes, passes) from `/static`

**Config File**: `/etc/nginx/sites-available/nova`

---

### 2. Frontend (React + Vite)
**Purpose**: User interface

**Technology Stack**:
- React 18
- TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Router (routing)
- TanStack Query (data fetching)

**Pages**:
- Login
- Dashboard
- Events
- Event Detail
- CSV Manager
- Template Editor (Canva-like)
- Pass Generator
- Scanner
- Analytics

**Build Output**: `/home/ubuntu/nova-pass-generator/frontend/dist`

---

### 3. Backend (FastAPI)
**Purpose**: REST API server

**Technology Stack**:
- FastAPI (web framework)
- Python 3.11
- SQLAlchemy (ORM)
- Pydantic (validation)
- Uvicorn (ASGI server)

**API Routes**:
- `/api/v1/auth` - Authentication
- `/api/v1/events` - Event management
- `/api/v1/teams` - Team management
- `/api/v1/members` - Member management
- `/api/v1/csv` - CSV upload/export
- `/api/v1/templates` - Template management
- `/api/v1/passes` - Pass generation
- `/api/v1/scanner` - QR scanning
- `/api/v1/dashboard` - Analytics

**Service**: `nova-backend.service` (systemd)

**Port**: 8000 (internal)

---

### 4. Database (SQLite)
**Purpose**: Data storage

**Location**: `/home/ubuntu/nova-pass-generator/backend/hackgear.db`

**Tables**:
- `users` - Admin users
- `events` - Events
- `teams` - Teams
- `members` - Team members
- `templates` - PDF templates
- `attendance_logs` - Check-in logs

**Schema**:
```sql
users
  - id, username, email, hashed_password, is_active

events
  - id, name, description, start_date, end_date, location

teams
  - id, team_id, team_name, event_id

members
  - id, name, email, status, team_id
  - qr_code_path, pass_path
  - is_checked_in, checked_in_at

templates
  - id, name, file_path, event_id
  - qr_x, qr_y, qr_size
  - text_elements (JSON)
  - is_default

attendance_logs
  - id, member_id, action, timestamp, scanned_by
```

---

### 5. Static Files
**Purpose**: Store generated files

**Location**: `/home/ubuntu/nova-pass-generator/backend/static`

**Structure**:
```
static/
├── qr_codes/          # Generated QR code images
│   └── {TeamID}_{Name}.png
├── passes/            # Generated PDF passes
│   └── {TeamID}_{Name}.pdf
└── templates/         # Uploaded PDF templates
    └── {EventID}_{filename}.pdf
```

**Access**: `http://YOUR_IP/static/...`

---

## Security Architecture

### Authentication
```
User Login
    │
    │ POST /api/v1/auth/login
    ▼
Backend validates credentials
    │
    │ Hash password with bcrypt
    │ Compare with stored hash
    ▼
Generate JWT token
    │
    │ Token expires in 30 minutes
    ▼
Return token to frontend
    │
    │ Store in localStorage
    ▼
Include in all API requests
    │
    │ Authorization: Bearer {token}
    ▼
Backend validates token
```

### QR Code Encryption
```
Member Data
    │
    │ {name, team_id, team_name, status, email, member_id}
    ▼
JSON stringify
    │
    ▼
Encrypt with Fernet
    │
    │ Key derived from password: "nova2024"
    │ Algorithm: AES-128-CBC
    ▼
Base64 encode
    │
    ▼
Generate QR code image
    │
    ▼
Save as PNG
```

### Decryption (Scanning)
```
Scan QR code
    │
    │ Get encrypted string
    ▼
Base64 decode
    │
    ▼
Decrypt with Fernet
    │
    │ Same key: "nova2024"
    ▼
Parse JSON
    │
    ▼
Get member_id
    │
    ▼
Mark as checked in
```

---

## Systemd Services

### Backend Service
**File**: `/etc/systemd/system/nova-backend.service`

```ini
[Unit]
Description=Nova Pass Generator Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/nova-pass-generator/backend
Environment="PATH=/home/ubuntu/nova-pass-generator/backend/venv/bin"
ExecStart=/home/ubuntu/nova-pass-generator/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Features**:
- Auto-start on boot
- Auto-restart on failure
- Runs as ubuntu user
- Logs to journald

---

## Network Architecture

### Security Group Rules
```
Inbound:
  SSH (22)    ← Your IP only
  HTTP (80)   ← 0.0.0.0/0 (public)
  HTTPS (443) ← 0.0.0.0/0 (public)

Outbound:
  All traffic → 0.0.0.0/0
```

### Port Mapping
```
External Port 80 (HTTP)
    │
    ▼
Nginx (Port 80)
    │
    ├─► Frontend (static files)
    │
    └─► Backend (proxy to port 8000)
            │
            ▼
        FastAPI (Port 8000)
```

---

## File System Layout

```
/home/ubuntu/nova-pass-generator/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── venv/
│   ├── static/
│   │   ├── qr_codes/
│   │   ├── passes/
│   │   └── templates/
│   ├── uploads/
│   ├── hackgear.db
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── dist/              # Built files
│   ├── node_modules/
│   └── package.json
│
├── deploy_ec2.sh
├── manage.sh
└── monitor.sh
```

---

## Deployment Architecture

### Local Machine
```
Developer
    │
    │ Runs quick_deploy.sh
    ▼
Package application
    │
    │ Create tarball
    │ Exclude node_modules, venv, etc.
    ▼
Upload to EC2
    │
    │ SCP over SSH
    ▼
Execute deploy_ec2.sh on EC2
```

### EC2 Instance
```
Receive deployment package
    │
    ▼
Extract files
    │
    ▼
Install dependencies
    │
    ├─► Python 3.11
    ├─► Node.js 18
    └─► Nginx
    │
    ▼
Set up services
    │
    ├─► Create systemd services
    ├─► Configure Nginx
    └─► Set up firewall
    │
    ▼
Start services
    │
    ├─► Start nova-backend
    └─► Start nginx
    │
    ▼
Application running!
```

---

## Scaling Considerations

### Vertical Scaling (Upgrade Instance)
```
t2.small (2GB RAM)
    ↓ Upgrade
t2.medium (4GB RAM)
    ↓ Upgrade
t2.large (8GB RAM)
    ↓ Upgrade
t2.xlarge (16GB RAM)
```

### Horizontal Scaling (Future)
```
Load Balancer
    │
    ├─► EC2 Instance 1
    ├─► EC2 Instance 2
    └─► EC2 Instance 3
         │
         ▼
    Shared Database (RDS)
         │
         ▼
    Shared Storage (S3)
```

---

## Monitoring Points

### Application Level
- Backend API response times
- Database query performance
- QR generation time
- PDF generation time
- Error rates

### System Level
- CPU usage
- Memory usage
- Disk usage
- Network I/O
- Process status

### Service Level
- Backend uptime
- Nginx uptime
- Request count
- Response codes
- Active connections

---

**Architecture designed for simplicity, reliability, and easy deployment! 🏗️**
