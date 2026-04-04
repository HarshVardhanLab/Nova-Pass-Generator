from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from ...core.database import get_db
from ...models.models import Member, Team
from ...schemas.schemas import MemberCreate, MemberUpdate, MemberResponse

router = APIRouter()

@router.get("/", response_model=List[MemberResponse])
def get_members(
    skip: int = 0,
    limit: int = 100,
    team_id: int = None,
    event_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all members with optional team or event filter"""
    query = db.query(Member).options(joinedload(Member.team))
    
    if event_id:
        # Filter by event through team relationship
        query = query.join(Team).filter(Team.event_id == event_id)
    elif team_id:
        query = query.filter(Member.team_id == team_id)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{member_id}", response_model=MemberResponse)
def get_member(member_id: int, db: Session = Depends(get_db)):
    """Get member by ID"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.post("/", response_model=MemberResponse)
def create_member(member: MemberCreate, db: Session = Depends(get_db)):
    """Create new member"""
    db_member = Member(**member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: int,
    member_update: MemberUpdate,
    db: Session = Depends(get_db)
):
    """Update member"""
    db_member = db.query(Member).filter(Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    update_data = member_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_member, field, value)
    
    db.commit()
    db.refresh(db_member)
    return db_member

@router.delete("/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    """Delete member"""
    db_member = db.query(Member).filter(Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db.delete(db_member)
    db.commit()
    return {"message": "Member deleted successfully"}
