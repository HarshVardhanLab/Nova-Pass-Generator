from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .core.config import settings
from .core.database import engine, Base
from .api.routes import auth, events, teams, members, csv_handler, passes, templates, dashboard, scanner

# Create tables
Base.metadata.create_all(bind=engine)

# Create directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.STATIC_DIR, "qr_codes"), exist_ok=True)
os.makedirs(os.path.join(settings.STATIC_DIR, "passes"), exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(events.router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(teams.router, prefix=f"{settings.API_V1_STR}/teams", tags=["teams"])
app.include_router(members.router, prefix=f"{settings.API_V1_STR}/members", tags=["members"])
app.include_router(csv_handler.router, prefix=f"{settings.API_V1_STR}/csv", tags=["csv"])
app.include_router(passes.router, prefix=f"{settings.API_V1_STR}/passes", tags=["passes"])
app.include_router(templates.router, prefix=f"{settings.API_V1_STR}/templates", tags=["templates"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(scanner.router, prefix=f"{settings.API_V1_STR}/scanner", tags=["scanner"])

@app.get("/")
def root():
    return {"message": "Nova Pass Generator API", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
