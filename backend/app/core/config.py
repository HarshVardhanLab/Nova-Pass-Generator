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
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_EMAIL: str = "admin@nova.local"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra fields from .env

settings = Settings()
