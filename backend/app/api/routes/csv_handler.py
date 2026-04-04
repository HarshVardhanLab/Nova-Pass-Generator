from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import io
from typing import List

from ...core.database import get_db
from ...models.models import Team, Member, Event
from ...schemas.schemas import CSVUploadResponse

router = APIRouter()

@router.post("/upload/{event_id}", response_model=CSVUploadResponse)
async def upload_csv(
    event_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload CSV file and create teams/members"""
    
    # Check if event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Read CSV
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    
    # Validate required columns
    required_columns = ['Team Id', 'Team Name', 'Name', 'Status', 'Email']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing_columns)}"
        )
    
    teams_created = 0
    members_created = 0
    errors = []
    
    # Process each row
    for index, row in df.iterrows():
        try:
            # Skip rows with missing email
            if pd.isna(row['Email']) or not str(row['Email']).strip():
                errors.append(f"Row {index + 2}: Missing email for {row['Name']}")
                continue
            
            # Skip rows with missing required fields
            if pd.isna(row['Team Id']) or pd.isna(row['Team Name']) or pd.isna(row['Name']):
                errors.append(f"Row {index + 2}: Missing required fields")
                continue
            
            # Get or create team
            team = db.query(Team).filter(
                Team.team_id == str(row['Team Id']),
                Team.event_id == event_id
            ).first()
            
            if not team:
                team = Team(
                    team_id=str(row['Team Id']),
                    team_name=str(row['Team Name']),
                    event_id=event_id
                )
                db.add(team)
                db.flush()
                teams_created += 1
            
            # Check if member already exists
            existing_member = db.query(Member).filter(
                Member.email == str(row['Email']).strip(),
                Member.team_id == team.id
            ).first()
            
            if not existing_member:
                # Create member
                # Normalize status to uppercase to match enum
                status_value = str(row['Status']).strip().upper()
                if status_value not in ['LEADER', 'MEMBER']:
                    status_value = 'MEMBER'  # Default to MEMBER if invalid
                
                member = Member(
                    name=str(row['Name']),
                    email=str(row['Email']).strip(),
                    status=status_value,
                    team_id=team.id
                )
                db.add(member)
                members_created += 1
            
        except Exception as e:
            errors.append(f"Row {index + 2}: {str(e)}")
            db.rollback()  # Rollback on error to continue processing
    
    db.commit()
    
    return CSVUploadResponse(
        message="CSV processed successfully",
        teams_created=teams_created,
        members_created=members_created,
        errors=errors
    )

@router.get("/export/{event_id}")
async def export_csv(event_id: int, db: Session = Depends(get_db)):
    """Export event data to CSV"""
    
    # Get all members for the event
    members = db.query(Member).join(Team).filter(Team.event_id == event_id).all()
    
    if not members:
        raise HTTPException(status_code=404, detail="No members found for this event")
    
    # Create DataFrame
    data = []
    for member in members:
        data.append({
            'Team Id': member.team.team_id,
            'Team Name': member.team.team_name,
            'Name': member.name,
            'Status': member.status.value,
            'Email': member.email,
            'Pass Path': member.pass_path or '',
            'Checked In': 'Yes' if member.is_checked_in else 'No'
        })
    
    df = pd.DataFrame(data)
    
    # Convert to CSV
    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)
    
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=event_{event_id}_data.csv"}
    )
