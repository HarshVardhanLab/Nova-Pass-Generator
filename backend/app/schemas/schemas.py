from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    ORGANIZER = "organizer"
    VOLUNTEER = "volunteer"

class MemberStatus(str, Enum):
    LEADER = "Leader"
    MEMBER = "Member"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.ORGANIZER

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Event Schemas
class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    venue: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    owner_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Team Schemas
class TeamBase(BaseModel):
    team_id: str
    team_name: str

class TeamCreate(TeamBase):
    event_id: int

class TeamResponse(TeamBase):
    id: int
    event_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Member Schemas
class MemberBase(BaseModel):
    name: str
    email: EmailStr
    status: MemberStatus = MemberStatus.MEMBER

class MemberCreate(MemberBase):
    team_id: int

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[MemberStatus] = None

class MemberResponse(MemberBase):
    id: int
    team_id: int
    team: TeamResponse  # Add team relationship
    qr_code_path: Optional[str] = None
    pass_path: Optional[str] = None
    is_checked_in: bool
    checked_in_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        from_attributes = True

# CSV Upload Schema
class CSVUploadResponse(BaseModel):
    message: str
    teams_created: int
    members_created: int
    errors: List[str] = []

# Pass Generation Schema
class PassGenerationRequest(BaseModel):
    event_id: int
    template_id: Optional[int] = None
    member_ids: Optional[List[int]] = None  # If None, generate for all
    encryption_password: Optional[str] = None

class PassGenerationResponse(BaseModel):
    message: str
    total_generated: int
    failed: List[str] = []

# Template Schema
class TemplateBase(BaseModel):
    name: str
    qr_x: int = 30
    qr_y: int = 30
    qr_size: int = 100
    text_x: int = 200
    text_y: int = 100

class TemplateCreate(TemplateBase):
    event_id: int

class TemplateResponse(TemplateBase):
    id: int
    event_id: int
    file_path: str
    is_default: bool
    text_elements: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard Stats
class DashboardStats(BaseModel):
    total_events: int
    total_teams: int
    total_members: int
    total_checked_in: int
    recent_check_ins: List[dict]
