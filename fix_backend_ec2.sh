#!/bin/bash

# Fix Backend Config on EC2
# Run this on your EC2 instance to fix the pydantic validation errors

set -e

echo "🔧 Fixing Backend Configuration..."

# Navigate to backend directory
cd ~/Nova-Pass-Generator/backend

# Backup current config
echo "📦 Backing up current config..."
cp app/core/config.py app/core/config.py.backup

# Update config.py with correct Settings class
echo "✏️  Updating config.py..."
cat > app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Nova Pass Generator"
    
    # Database
    DATABASE_URL: str = "sqlite:///./hackgear.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # QR Encryption
    QR_ENCRYPTION_PASSWORD: str = "nova2024"
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    STATIC_DIR: str = "./static"
    MAX_UPLOAD_SIZE: int = 10485760
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    CORS_ORIGINS: str = ""  # For .env file compatibility
    
    # Admin User
    ADMIN_USERNAME: str = "harshvardhan"
    ADMIN_PASSWORD: str = "harsh9837"
    ADMIN_EMAIL: str = "admin@nova.local"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra fields from .env

settings = Settings()
EOF

# Update .env file with correct values
echo "📝 Updating .env file..."
cat > .env << 'EOF'
# Database
DATABASE_URL=sqlite:///./hackgear.db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# QR Code Encryption
QR_ENCRYPTION_PASSWORD=nova2024

# CORS - Vercel frontend
CORS_ORIGINS=["https://nova-pass-generator.vercel.app","http://localhost:5173"]

# File Upload
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIR=./uploads
STATIC_DIR=./static

# Admin User
ADMIN_USERNAME=harshvardhan
ADMIN_PASSWORD=harsh9837
ADMIN_EMAIL=admin@nova.local
EOF

echo "✅ Configuration updated!"

# Restart PM2
echo "🔄 Restarting backend with PM2..."
pm2 restart nova-backend

# Wait a moment
sleep 3

# Check status
echo ""
echo "📊 Backend Status:"
pm2 status

echo ""
echo "📋 Recent Logs:"
pm2 logs nova-backend --lines 20 --nostream

echo ""
echo "✅ Done! Backend should be running now."
echo ""
echo "🔍 To check logs: pm2 logs nova-backend"
echo "📊 To check status: pm2 status"
echo "🌐 Backend URL: http://100.55.91.90:8000"
echo "📖 API Docs: http://100.55.91.90:8000/docs"
