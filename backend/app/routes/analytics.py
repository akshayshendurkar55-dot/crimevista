from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from backend.app.auth.dependencies import get_db, get_current_user
from backend.app.models.user import User
from backend.app.models.crime import CrimeRecord
from backend.app.models.system import Hotspot, Prediction

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics & Intelligence"]
)

@router.get("/overview")
def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_crimes = db.query(func.count(CrimeRecord.id)).scalar() or 0
    total_areas = db.query(func.count(func.distinct(CrimeRecord.area))).scalar() or 0
    total_hotspots = db.query(func.count(Hotspot.id)).scalar() or 0
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0

    top_crime_type_res = db.query(
        CrimeRecord.crime_type, func.count(CrimeRecord.id)
    ).group_by(CrimeRecord.crime_type).order_by(func.count(CrimeRecord.id).desc()).first()

    top_crime_type = top_crime_type_res[0] if top_crime_type_res else "None"

    return {
        "total_crimes": total_crimes,
        "total_areas": total_areas,
        "total_hotspots": total_hotspots,
        "total_predictions": total_predictions,
        "top_crime_type": top_crime_type
    }

@router.get("/by-type")
def get_crime_by_type(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(
        CrimeRecord.crime_type, func.count(CrimeRecord.id)
    ).group_by(CrimeRecord.crime_type).order_by(func.count(CrimeRecord.id).desc()).all()

    return [{"name": name or "Unspecified", "count": count} for name, count in results]

@router.get("/by-area")
def get_crime_by_area(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(
        CrimeRecord.area, func.count(CrimeRecord.id)
    ).group_by(CrimeRecord.area).order_by(func.count(CrimeRecord.id).desc()).all()

    return [{"area": area or "Nagpur Central", "count": count} for area, count in results]

@router.get("/by-month")
def get_crime_by_month(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    results = db.query(
        extract('month', CrimeRecord.crime_date).label('month_num'),
        func.count(CrimeRecord.id)
    ).group_by('month_num').all()

    counts_dict = {int(m): c for m, c in results if m is not None}
    
    return [
        {"month": months[i - 1], "count": counts_dict.get(i, 0)}
        for i in range(1, 13)
    ]

@router.get("/by-year")
def get_crime_by_year(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(
        extract('year', CrimeRecord.crime_date).label('year_num'),
        func.count(CrimeRecord.id)
    ).group_by('year_num').order_by('year_num').all()

    return [
        {"year": str(int(y)) if y else "Unknown", "count": count}
        for y, count in results if y is not None
    ]

@router.get("/by-day")
def get_crime_by_day(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    # SQLite strftime('%w', date) -> 0=Sunday, 1=Monday...
    records = db.query(CrimeRecord.crime_date).all()
    day_counts = {d: 0 for d in days}
    for r in records:
        if r.crime_date:
            day_name = days[r.crime_date.weekday()]
            day_counts[day_name] += 1

    return [{"day": d, "count": day_counts[d]} for d in days]

@router.get("/by-hour")
def get_crime_by_hour(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(CrimeRecord.crime_time).all()
    hour_counts = {h: 0 for h in range(24)}
    for r in records:
        if r.crime_time and hasattr(r.crime_time, 'hour'):
            hour_counts[r.crime_time.hour] += 1

    return [{"hour": f"{h:02d}:00", "count": hour_counts[h]} for h in range(24)]
