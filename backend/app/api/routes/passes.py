from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import zipfile
import tempfile

from ...core.database import get_db
from ...core.config import settings
from ...models.models import Member, Team, Template, Event
from ...schemas.schemas import PassGenerationRequest, PassGenerationResponse
from ...services.qr_service import generate_qr_code
from ...services.pdf_service import generate_pass_pdf

router = APIRouter()

@router.post("/generate", response_model=PassGenerationResponse)
async def generate_passes(
    request: PassGenerationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Generate QR codes and PDF passes for members"""
    
    # Get event
    event = db.query(Event).filter(Event.id == request.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Get template
    template = None
    if request.template_id:
        template = db.query(Template).filter(Template.id == request.template_id).first()
    else:
        template = db.query(Template).filter(
            Template.event_id == request.event_id,
            Template.is_default == True
        ).first()
    
    # If no template, check if any template exists for this event
    if not template:
        template = db.query(Template).filter(Template.event_id == request.event_id).first()
    
    if not template:
        raise HTTPException(
            status_code=404, 
            detail=f"No template found for event {request.event_id}. Please upload a template first."
        )
    
    # Get members
    if request.member_ids:
        members = db.query(Member).join(Team).filter(Member.id.in_(request.member_ids)).all()
    else:
        # Get all members for the event
        members = db.query(Member).join(Team).filter(Team.event_id == request.event_id).all()
    
    if not members:
        raise HTTPException(status_code=404, detail="No members found for this event")
    
    total_generated = 0
    failed = []
    
    # Create directories
    qr_dir = os.path.join(settings.STATIC_DIR, "qr_codes")
    pass_dir = os.path.join(settings.STATIC_DIR, "passes")
    os.makedirs(qr_dir, exist_ok=True)
    os.makedirs(pass_dir, exist_ok=True)
    
    for member in members:
        try:
            # Prepare data
            data = {
                "team_id": member.team.team_id,
                "team_name": member.team.team_name,
                "name": member.name,
                "status": member.status.value,
                "email": member.email,
                "member_id": member.id
            }
            
            # Generate QR code
            qr_filename = f"{member.team.team_id}_{member.name.replace(' ', '_')}.png"
            qr_path = os.path.join(qr_dir, qr_filename)
            generate_qr_code(data, qr_path, encryption_password=request.encryption_password)
            
            # Generate PDF pass
            pass_filename = f"{member.team.team_id}_{member.name.replace(' ', '_')}.pdf"
            pass_path = os.path.join(pass_dir, pass_filename)
            
            coordinates = {
                'qr_x': template.qr_x,
                'qr_y': template.qr_y,
                'qr_size': template.qr_size,
                'text_x': template.text_x,
                'text_y': template.text_y
            }
            
            generate_pass_pdf(
                template.file_path,
                qr_path,
                data,
                pass_path,
                coordinates,
                template.text_elements
            )
            
            # Update member
            member.qr_code_path = f"/static/qr_codes/{qr_filename}"
            member.pass_path = f"/static/passes/{pass_filename}"
            
            total_generated += 1
            
        except Exception as e:
            failed.append(f"{member.name}: {str(e)}")
    
    db.commit()
    
    return PassGenerationResponse(
        message=f"Generated {total_generated} passes",
        total_generated=total_generated,
        failed=failed
    )

@router.get("/download/{member_id}")
async def download_pass(member_id: int, db: Session = Depends(get_db)):
    """Download individual pass"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member or not member.pass_path:
        raise HTTPException(status_code=404, detail="Pass not found")
    
    file_path = member.pass_path.replace("/static/", settings.STATIC_DIR + "/")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Pass file not found")
    
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=os.path.basename(file_path)
    )

@router.get("/preview/{member_id}")
async def preview_pass(member_id: int, db: Session = Depends(get_db)):
    """Preview pass PDF"""
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member or not member.pass_path:
        raise HTTPException(status_code=404, detail="Pass not found")
    
    file_path = member.pass_path.replace("/static/", settings.STATIC_DIR + "/")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Pass file not found")
    
    return FileResponse(file_path, media_type="application/pdf")

@router.get("/download-all/{event_id}")
async def download_all_passes(event_id: int, db: Session = Depends(get_db)):
    """Download all passes for an event as a zip file"""
    
    # Get all members with passes for this event
    members = db.query(Member).join(Team).filter(
        Team.event_id == event_id,
        Member.pass_path.isnot(None)
    ).all()
    
    if not members:
        raise HTTPException(status_code=404, detail="No passes found for this event")
    
    # Create a temporary zip file
    temp_dir = tempfile.gettempdir()
    zip_filename = f"event_{event_id}_passes.zip"
    zip_path = os.path.join(temp_dir, zip_filename)
    
    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for member in members:
                # Get the actual file path
                file_path = member.pass_path.replace("/static/", settings.STATIC_DIR + "/")
                
                if os.path.exists(file_path):
                    # Add file to zip with a clean name
                    filename = f"{member.team.team_id}_{member.name.replace(' ', '_')}.pdf"
                    zipf.write(file_path, filename)
        
        # Return the zip file
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename=zip_filename,
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create zip file: {str(e)}")
