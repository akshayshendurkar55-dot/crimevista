import numpy as np
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from sklearn.cluster import DBSCAN

from backend.app.models.crime import CrimeRecord
from backend.app.models.system import Hotspot
from backend.app.services.audit_service import log_audit_action

def calculate_and_save_hotspots_service(db: Session, eps_km: float = 1.5, min_samples: int = 2) -> dict:
    records = db.query(CrimeRecord).filter(
        CrimeRecord.latitude.isnot(None),
        CrimeRecord.longitude.isnot(None)
    ).all()

    if not records or len(records) == 0:
        return {"message": "No geographic crime records available to detect hotspots.", "hotspots": []}

    df = pd.DataFrame([{
        "id": r.id,
        "area": r.area or r.location or "Nagpur",
        "crime_type": r.crime_type or "Theft",
        "latitude": r.latitude,
        "longitude": r.longitude
    } for r in records])

    # Convert lat/lng to radians for Haversine DBSCAN
    coords_rad = np.radians(df[["latitude", "longitude"]])

    # Earth radius ~ 6371 km
    kms_per_radian = 6371.0
    epsilon = eps_km / kms_per_radian

    dbscan = DBSCAN(eps=epsilon, min_samples=min_samples, metric="haversine")
    df["cluster"] = dbscan.fit_predict(coords_rad)

    # Clear previous hotspots
    db.query(Hotspot).delete()
    db.commit()

    hotspots_created = []
    cluster_idx = 1

    # Group clusters (exclude noise cluster -1 unless no clusters formed)
    cluster_ids = [c for c in set(df["cluster"]) if c != -1]
    if not cluster_ids:
        # Fallback to area grouping if DBSCAN finds only noise
        area_groups = df.groupby("area")
        for area_name, group in area_groups:
            if len(group) >= 2:
                mean_lat = float(group["latitude"].mean())
                mean_lng = float(group["longitude"].mean())
                count = len(group)
                dom_crime = group["crime_type"].mode()[0] if not group["crime_type"].empty else "Theft"
                
                risk = "HIGH" if count >= 10 else ("MEDIUM" if count >= 5 else "LOW")
                
                code = f"#H{cluster_idx:03d}"
                hs = Hotspot(
                    hotspot_code=code,
                    area_name=area_name,
                    latitude=mean_lat,
                    longitude=mean_lng,
                    radius_km=0.8,
                    crime_count=count,
                    dominant_crime=dom_crime,
                    risk_level=risk,
                    historical_frequency=count,
                    predicted_count=round(count * 0.3, 1),
                    detection_method="Grid Spatial Density"
                )
                db.add(hs)
                hotspots_created.append(hs)
                cluster_idx += 1
    else:
        for cid in cluster_ids:
            group = df[df["cluster"] == cid]
            mean_lat = float(group["latitude"].mean())
            mean_lng = float(group["longitude"].mean())
            count = len(group)
            dom_crime = group["crime_type"].mode()[0] if not group["crime_type"].empty else "Theft"
            area_name = group["area"].mode()[0] if not group["area"].empty else "Nagpur Sector"

            risk = "CRITICAL" if count >= 15 else ("HIGH" if count >= 8 else ("MEDIUM" if count >= 4 else "LOW"))

            code = f"#H{cluster_idx:03d}"
            hs = Hotspot(
                hotspot_code=code,
                area_name=area_name,
                latitude=mean_lat,
                longitude=mean_lng,
                radius_km=round(0.5 + (count * 0.05), 2),
                crime_count=count,
                dominant_crime=dom_crime,
                risk_level=risk,
                historical_frequency=count,
                predicted_count=round(count * 0.35, 1),
                detection_method="DBSCAN Spatial Clustering"
            )
            db.add(hs)
            hotspots_created.append(hs)
            cluster_idx += 1

    db.commit()
    for h in hotspots_created:
        db.refresh(h)

    log_audit_action(db, "RUN_HOTSPOT_ANALYSIS", role="ADMIN", resource=f"Detected {len(hotspots_created)} crime hotspots")

    return {
        "message": f"Hotspot analysis completed. {len(hotspots_created)} hotspots identified.",
        "detection_method": "DBSCAN / Spatial Density",
        "total_hotspots": len(hotspots_created),
        "analyzed_at": datetime.utcnow().isoformat(),
        "hotspots": [
            {
                "id": h.id,
                "hotspot_code": h.hotspot_code,
                "area_name": h.area_name,
                "latitude": h.latitude,
                "longitude": h.longitude,
                "radius_km": h.radius_km,
                "crime_count": h.crime_count,
                "dominant_crime": h.dominant_crime,
                "risk_level": h.risk_level,
                "historical_frequency": h.historical_frequency,
                "predicted_count": h.predicted_count,
                "detection_method": h.detection_method
            }
            for h in hotspots_created
        ]
    }
