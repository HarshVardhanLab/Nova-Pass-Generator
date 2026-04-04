from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ORGANIZER = "organizer"
    VOLUNTEER = "volunteer"

class MemberStatus(str, enum.Enum):
    LEADER = "Leader"
    MEMBER = "Member"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.ORGANIZER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    events = relationship("Event", back_populates="owner")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    date = Column(DateTime(timezone=True))
    venue = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", back_populates="events")
    teams = relationship("Team", back_populates="event", cascade="all, delete-orphan")
    templates = relationship("Template", back_populates="event", cascade="all, delete-orphan")

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(String, unique=True, index=True, nullable=False)
    team_name = Column(String, nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    event = relationship("Event", back_populates="teams")
    members = relationship("Member", back_populates="team", cascade="all, delete-orphan")

class Member(Base):
    __tablename__ = "members"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    status = Column(Enum(MemberStatus), default=MemberStatus.MEMBER)
    team_id = Column(Integer, ForeignKey("teams.id"))
    qr_code_path = Column(String)
    pass_path = Column(String)
    is_checked_in = Column(Boolean, default=False)
    checked_in_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    team = relationship("Team", back_populates="members")
    attendance_logs = relationship("AttendanceLog", back_populates="member")

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"))
    is_default = Column(Boolean, default=False)
    qr_x = Column(Integer, default=30)
    qr_y = Column(Integer, default=30)
    qr_size = Column(Integer, default=100)
    text_x = Column(Integer, default=200)
    text_y = Column(Integer, default=100)
    text_elements = Column(Text)  # JSON string of text elements
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    event = relationship("Event", back_populates="templates")

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"))
    action = Column(String)  # check_in, check_out
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    scanned_by = Column(String)
    
    member = relationship("Member", back_populates="attendance_logs")
