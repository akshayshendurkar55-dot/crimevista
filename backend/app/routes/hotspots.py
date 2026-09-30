from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import get_db, get_current_user, require_role
from backend.app.models.user import User
from backend.app.models.system import Hotspot
from backend.app.services.hotspot_service import calculate_and_save_hotspots_service

router = APIRouter(
    prefix="/hotspots",
    tags=["Hotspot Intelligence"]
)

@router.post("/analyze")
def trigger_hotspot_analysis(
    eps_km: float = Query(1.5, description="Epsilon radius in kilometers"),
    min_samples: int = Query(2, description="Minimum crime points per cluster"),
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    try:
        return calculate_and_save_hotspots_service(db, eps_km=eps_km, min_samples=min_samples)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("")
@router.get("/")
def get_all_hotspots(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    hotspots = db.query(Hotspot).order_by(Hotspot.crime_count.desc()).all()
    return hotspots

@router.get("/map")
def get_hotspot_map_layers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    hotspots = db.query(Hotspot).order_by(Hotspot.crime_count.desc()).all()
    return {
        "count": len(hotspots),
        "layers": [
            {
                "id": h.id,
                "code": h.hotspot_code,
                "area": h.area_name,
                "latitude": h.latitude,
                "longitude": h.longitude,
                "radius_km": h.radius_km,
                "crime_count": h.crime_count,
                "dominant_crime": h.dominant_crime,
                "risk_level": h.risk_level,
                "predicted_count": h.predicted_count,
                "detection_method": h.detection_method
            }
            for h in hotspots
        ]
    }
