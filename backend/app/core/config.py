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
    QR_ENCRYPTION_PASSWORD: str = "hackgear2.0"
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    STATIC_DIR: str = "./static"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
