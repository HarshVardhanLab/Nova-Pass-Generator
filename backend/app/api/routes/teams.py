from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...core.database import get_db
from ...models.models import Team
from ...schemas.schemas import TeamCreate, TeamResponse

router = APIRouter()

@router.get("/", response_model=List[TeamResponse])
def get_teams(
    event_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all teams with optional event filter"""
    query = db.query(Team)
    if event_id:
        query = query.filter(Team.event_id == event_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{team_id}", response_model=TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db)):
    """Get team by ID"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("/", response_model=TeamResponse)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    """Create new team"""
    # Check if team_id already exists for this event
    existing = db.query(Team).filter(
        Team.team_id == team.team_id,
        Team.event_id == team.event_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team ID already exists for this event")
    
    db_team = Team(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.delete("/{team_id}")
def delete_team(team_id: int, db: Session = Depends(get_db)):
    """Delete team"""
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    db.delete(db_team)
    db.commit()
    return {"message": "Team deleted successfully"}
