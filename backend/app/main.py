from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database.connection import test_database_connection
from backend.app.routes.crimes import router as crime_router
from backend.app.routes.auth import router as auth_router
from backend.app.routes.admin import router as admin_router
from backend.app.routes.crime_upload import router as crime_upload_router
from backend.app.routes.datasets import router as datasets_router
from backend.app.routes.ml import router as ml_router
from backend.app.routes.hotspots import router as hotspots_router
from backend.app.routes.analytics import router as analytics_router

app = FastAPI(
    title="CrimeVista API",
    description="AI-powered geospatial crime intelligence and predictive platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(crime_router)
app.include_router(crime_upload_router)
app.include_router(datasets_router)
app.include_router(ml_router)
app.include_router(hotspots_router)
app.include_router(analytics_router)

@app.get("/")
def home():
    return {
        "message": "CrimeVista Intelligence Backend API is Running",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    database_status = test_database_connection()
    return {
        "backend": "healthy",
        "database": "connected" if database_status else "not connected"
    }
