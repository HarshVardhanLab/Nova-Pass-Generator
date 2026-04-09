#!/usr/bin/env python3
"""
Create admin user in the database
"""
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, User
from app.core.security import get_password_hash
from app.core.config import settings

def create_admin_user():
    # Create database engine
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        existing_user = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        
        if existing_user:
            print(f"✅ User '{settings.ADMIN_USERNAME}' already exists!")
            print(f"   Email: {existing_user.email}")
            print(f"   Role: {existing_user.role}")
            print(f"   Active: {existing_user.is_active}")
            return
        
        # Create new admin user
        admin_user = User(
            email=settings.ADMIN_EMAIL,
            username=settings.ADMIN_USERNAME,
            hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            full_name="Admin User",
            role="admin",
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully!")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Password: {settings.ADMIN_PASSWORD}")
        print(f"   Role: {admin_user.role}")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Creating admin user...")
    print(f"   Database: {settings.DATABASE_URL}")
    print(f"   Username: {settings.ADMIN_USERNAME}")
    print("")
    create_admin_user()
