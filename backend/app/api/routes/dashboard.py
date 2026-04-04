from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, Integer

from ...core.database import get_db
from ...core.security import get_current_active_user
from ...models.models import Event, Team, Member, AttendanceLog, User
from ...schemas.schemas import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard statistics"""
    
    # Total events
    total_events = db.query(Event).filter(Event.owner_id == current_user.id).count()
    
    # Total teams
    total_teams = db.query(Team).join(Event).filter(
        Event.owner_id == current_user.id
    ).count()
    
    # Total members
    total_members = db.query(Member).join(Team).join(Event).filter(
        Event.owner_id == current_user.id
    ).count()
    
    # Total checked in
    total_checked_in = db.query(Member).join(Team).join(Event).filter(
        Event.owner_id == current_user.id,
        Member.is_checked_in == True
    ).count()
    
    # Recent check-ins
    recent_logs = db.query(AttendanceLog).join(Member).join(Team).join(Event).filter(
        Event.owner_id == current_user.id
    ).order_by(AttendanceLog.timestamp.desc()).limit(5).all()
    
    recent_check_ins = []
    for log in recent_logs:
        recent_check_ins.append({
            "member_name": log.member.name,
            "team_name": log.member.team.team_name,
            "event_name": log.member.team.event.name,
            "timestamp": log.timestamp.isoformat()
        })
    
    return DashboardStats(
        total_events=total_events,
        total_teams=total_teams,
        total_members=total_members,
        total_checked_in=total_checked_in,
        recent_check_ins=recent_check_ins
    )

@router.get("/event-stats/{event_id}")
async def get_event_stats(event_id: int, db: Session = Depends(get_db)):
    """Get statistics for specific event"""
    
    # Team count
    team_count = db.query(Team).filter(Team.event_id == event_id).count()
    
    # Member count
    member_count = db.query(Member).join(Team).filter(Team.event_id == event_id).count()
    
    # Checked in count
    checked_in_count = db.query(Member).join(Team).filter(
        Team.event_id == event_id,
        Member.is_checked_in == True
    ).count()
    
    # Team-wise stats
    team_stats = db.query(
        Team.team_name,
        func.count(Member.id).label('total_members'),
        func.sum(func.cast(Member.is_checked_in, Integer)).label('checked_in')
    ).join(Member).filter(Team.event_id == event_id).group_by(Team.id, Team.team_name).all()
    
    teams = []
    for stat in team_stats:
        teams.append({
            "team_name": stat.team_name,
            "total_members": stat.total_members,
            "checked_in": stat.checked_in or 0,
            "pending": stat.total_members - (stat.checked_in or 0)
        })
    
    return {
        "team_count": team_count,
        "member_count": member_count,
        "checked_in_count": checked_in_count,
        "pending_count": member_count - checked_in_count,
        "attendance_rate": round((checked_in_count / member_count * 100) if member_count > 0 else 0, 2),
        "teams": teams
    }
