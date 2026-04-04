from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import shutil

from ...core.database import get_db
from ...core.config import settings
from ...models.models import Template
from ...schemas.schemas import TemplateCreate, TemplateResponse

router = APIRouter()

@router.get("/", response_model=List[TemplateResponse])
def get_templates(
    event_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all templates"""
    query = db.query(Template)
    if event_id:
        query = query.filter(Template.event_id == event_id)
    return query.offset(skip).limit(limit).all()

@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(template_id: int, db: Session = Depends(get_db)):
    """Get template by ID"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.post("/upload")
async def upload_template(
    event_id: int = Form(...),
    name: str = Form(...),
    file: UploadFile = File(...),
    qr_x: int = Form(30),
    qr_y: int = Form(30),
    qr_size: int = Form(100),
    text_x: int = Form(200),
    text_y: int = Form(100),
    text_elements: str = Form(None),
    is_default: bool = Form(False),
    db: Session = Depends(get_db)
):
    """Upload template PDF"""
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Create templates directory
    templates_dir = os.path.join(settings.UPLOAD_DIR, "templates")
    os.makedirs(templates_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(templates_dir, f"{event_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # If this is default, unset other defaults
    if is_default:
        db.query(Template).filter(Template.event_id == event_id).update({"is_default": False})
    
    # Create template record
    template = Template(
        name=name,
        file_path=file_path,
        event_id=event_id,
        qr_x=qr_x,
        qr_y=qr_y,
        qr_size=qr_size,
        text_x=text_x,
        text_y=text_y,
        text_elements=text_elements,
        is_default=is_default
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return template

@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: int,
    template_update: TemplateCreate,
    db: Session = Depends(get_db)
):
    """Update template coordinates"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    for field, value in template_update.dict(exclude={'event_id'}).items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    return template

@router.delete("/{template_id}")
def delete_template(template_id: int, db: Session = Depends(get_db)):
    """Delete template"""
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Delete file
    if os.path.exists(template.file_path):
        os.remove(template.file_path)
    
    db.delete(template)
    db.commit()
    return {"message": "Template deleted successfully"}
