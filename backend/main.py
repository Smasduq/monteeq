from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.api.v1.endpoints import seo
from app.core import dependencies
# Database initialized via Supabase schema
# Trigger reload - B2 Config Typo Fixed
import app.worker

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Monteeq Video Platform")

# CORS middleware - MUST be added before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.monteeq.com", "https://monteeq.com", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_path = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_path, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_path), name="static")

app.include_router(api_router, prefix="/api/v1")
app.include_router(seo.router)


