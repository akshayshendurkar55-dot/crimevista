from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time, datetime

from backend.app.auth.dependencies import get_db, get_current_user, require_role
from backend.app.models.user import User
from backend.app.models.crime import CrimeRecord
from backend.app.services.audit_service import log_audit_action

router = APIRouter(
    prefix="/crimes",
    tags=["Crime Records Management"]
)

class CreateCrimeRecordRequest(BaseModel):
    crime_type: str
    area: str
    location: Optional[str] = None
    city: str = "Nagpur"
    state: str = "Maharashtra"
    latitude: float
    longitude: float
    crime_date: Optional[str] = None # YYYY-MM-DD
    crime_time: Optional[str] = None # HH:MM
    severity: str = "Medium"
    police_station: Optional[str] = "Nagpur Central PS"
    victim_age: Optional[int] = None
    victim_gender: Optional[str] = None
    weapon_used: Optional[str] = "None"
    description: Optional[str] = None
    status: str = "OPEN"

class UpdateCrimeRecordRequest(BaseModel):
    crime_type: Optional[str] = None
    area: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    crime_date: Optional[str] = None
    crime_time: Optional[str] = None
    severity: Optional[str] = None
    police_station: Optional[str] = None
    victim_age: Optional[int] = None
    victim_gender: Optional[str] = None
    weapon_used: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


@router.get("")
@router.get("/")
def get_crimes(
    search: Optional[str] = None,
    area: Optional[str] = None,
    crime_type: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    police_station: Optional[str] = None,
    status_filter: Optional[str] = None,
    limit: int = 200,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CrimeRecord)

    if search:
        query = query.filter(
            (CrimeRecord.crime_id.ilike(f"%{search}%")) |
            (CrimeRecord.crime_type.ilike(f"%{search}%")) |
            (CrimeRecord.area.ilike(f"%{search}%")) |
            (CrimeRecord.location.ilike(f"%{search}%")) |
            (CrimeRecord.police_station.ilike(f"%{search}%")) |
            (CrimeRecord.description.ilike(f"%{search}%"))
        )
    if area:
        query = query.filter(CrimeRecord.area.ilike(f"%{area}%"))
    if crime_type:
        query = query.filter(CrimeRecord.crime_type.ilike(f"%{crime_type}%"))
    if police_station:
        query = query.filter(CrimeRecord.police_station.ilike(f"%{police_station}%"))
    if status_filter:
        query = query.filter(CrimeRecord.status.ilike(f"%{status_filter}%"))
    if year:
        query = query.filter(extract('year', CrimeRecord.crime_date) == year)
    if month:
        query = query.filter(extract('month', CrimeRecord.crime_date) == month)

    total_count = query.count()
    records = query.order_by(CrimeRecord.id.desc()).offset(offset).limit(limit).all()

    return [
        {
            "id": r.id,
            "crime_id": r.crime_id or f"CR-{r.id:04d}",
            "crime_type": r.crime_type,
            "area": r.area or r.location or "Nagpur Central",
            "location": r.location or r.area or "Nagpur Central",
            "city": r.city or "Nagpur",
            "state": r.state or "Maharashtra",
            "latitude": r.latitude,
            "longitude": r.longitude,
            "crime_date": r.crime_date,
            "crime_time": r.crime_time.strftime("%H:%M") if r.crime_time and hasattr(r.crime_time, "strftime") else str(r.crime_time or "12:00"),
            "severity": r.severity or "Medium",
            "police_station": r.police_station or "Nagpur Central PS",
            "victim_age": r.victim_age,
            "victim_gender": r.victim_gender,
            "weapon_used": r.weapon_used,
            "description": r.description,
            "status": r.status or "OPEN",
            "created_at": r.created_at
        }
        for r in records
    ]


@router.get("/statistics")
def get_crime_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_crimes = db.query(func.count(CrimeRecord.id)).scalar() or 0
    total_locations = db.query(func.count(func.distinct(CrimeRecord.area))).scalar() or 0

    crime_types = db.query(
        CrimeRecord.crime_type, func.count(CrimeRecord.id)
    ).group_by(CrimeRecord.crime_type).order_by(func.count(CrimeRecord.id).desc()).all()

    areas = db.query(
        CrimeRecord.area, func.count(CrimeRecord.id)
    ).group_by(CrimeRecord.area).order_by(func.count(CrimeRecord.id).desc()).all()

    return {
        "total_crimes": total_crimes,
        "total_locations": total_locations,
        "crime_types": [{"name": name or "General", "count": count} for name, count in crime_types],
        "locations": [{"name": name or "Nagpur Central", "count": count} for name, count in areas]
    }


@router.get("/nagpur")
def get_nagpur_crimes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(CrimeRecord).filter(
        (CrimeRecord.city.ilike("%nagpur%")) | (CrimeRecord.location.ilike("%nagpur%")) | (CrimeRecord.area.ilike("%nagpur%")) | (CrimeRecord.city.is_(None))
    ).order_by(CrimeRecord.id.desc()).all()

    return [
        {
            "id": r.id,
            "crime_id": r.crime_id or f"CR-{r.id:04d}",
            "crime_type": r.crime_type,
            "area": r.area or r.location or "Nagpur Central",
            "location": r.location or r.area or "Nagpur Central",
            "latitude": r.latitude,
            "longitude": r.longitude,
            "crime_date": r.crime_date,
            "severity": r.severity or "Medium",
            "police_station": r.police_station or "Nagpur Central PS",
            "description": r.description,
            "status": r.status or "OPEN"
        }
        for r in records
    ]


@router.get("/{crime_id}")
def get_crime_by_id(
    crime_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    r = db.query(CrimeRecord).filter(CrimeRecord.id == crime_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Crime record not found")
    return r


@router.post("")
@router.post("/")
def add_crime_record(
    req: CreateCrimeRecordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "OFFICER"]:
        raise HTTPException(status_code=403, detail="Unauthorized. Only Officers and Administrators can add crime records.")

    parsed_date = None
    if req.crime_date:
        try:
            parsed_date = datetime.strptime(req.crime_date, "%Y-%m-%d").date()
        except ValueError:
            parsed_date = datetime.now().date()
    else:
        parsed_date = datetime.now().date()

    parsed_time = None
    if req.crime_time:
        try:
            parsed_time = datetime.strptime(req.crime_time, "%H:%M").time()
        except ValueError:
            parsed_time = datetime.now().time()
    else:
        parsed_time = datetime.now().time()

    record_count = db.query(func.count(CrimeRecord.id)).scalar() or 0
    generated_code = f"CR-{datetime.now().year}-{(record_count + 101):04d}"

    crime = CrimeRecord(
        crime_id=generated_code,
        crime_type=req.crime_type.strip(),
        area=req.area.strip(),
        location=req.location.strip() if req.location else req.area.strip(),
        city=req.city.strip(),
        state=req.state.strip(),
        latitude=req.latitude,
        longitude=req.longitude,
        crime_date=parsed_date,
        crime_time=parsed_time,
        severity=req.severity,
        police_station=req.police_station or "Nagpur Central PS",
        victim_age=req.victim_age,
        victim_gender=req.victim_gender,
        weapon_used=req.weapon_used or "None",
        description=req.description or f"{req.crime_type} reported in {req.area}.",
        status=req.status or "OPEN",
        created_by_id=current_user.id
    )

    db.add(crime)
    db.commit()
    db.refresh(crime)

    log_audit_action(db, "ADD_CRIME_RECORD", user_email=current_user.email, role=current_user.role, resource=f"Crime Record {crime.crime_id} (ID: {crime.id})")

    return {
        "message": "Crime record added successfully",
        "crime": {
            "id": crime.id,
            "crime_id": crime.crime_id,
            "crime_type": crime.crime_type,
            "area": crime.area,
            "latitude": crime.latitude,
            "longitude": crime.longitude,
            "crime_date": crime.crime_date,
            "status": crime.status
        }
    }


@router.put("/{crime_id}")
def update_crime_record(
    crime_id: int,
    req: UpdateCrimeRecordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "OFFICER"]:
        raise HTTPException(status_code=403, detail="Unauthorized. Only Officers and Administrators can edit crime records.")

    crime = db.query(CrimeRecord).filter(CrimeRecord.id == crime_id).first()
    if not crime:
        raise HTTPException(status_code=404, detail="Crime record not found")

    if req.crime_type is not None:
        crime.crime_type = req.crime_type.strip()
    if req.area is not None:
        crime.area = req.area.strip()
    if req.location is not None:
        crime.location = req.location.strip()
    if req.latitude is not None:
        crime.latitude = req.latitude
    if req.longitude is not None:
        crime.longitude = req.longitude
    if req.severity is not None:
        crime.severity = req.severity
    if req.police_station is not None:
        crime.police_station = req.police_station
    if req.victim_age is not None:
        crime.victim_age = req.victim_age
    if req.victim_gender is not None:
        crime.victim_gender = req.victim_gender
    if req.weapon_used is not None:
        crime.weapon_used = req.weapon_used
    if req.description is not None:
        crime.description = req.description
    if req.status is not None:
        crime.status = req.status

    if req.crime_date:
        try:
            crime.crime_date = datetime.strptime(req.crime_date, "%Y-%m-%d").date()
        except ValueError:
            pass

    if req.crime_time:
        try:
            crime.crime_time = datetime.strptime(req.crime_time, "%H:%M").time()
        except ValueError:
            pass

    db.commit()
    log_audit_action(db, "UPDATE_CRIME_RECORD", user_email=current_user.email, role=current_user.role, resource=f"Crime Record ID {crime_id}")

    return {"message": "Crime record updated successfully"}


@router.delete("/{crime_id}")
def delete_crime_record(
    crime_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "OFFICER"]:
        raise HTTPException(status_code=403, detail="Unauthorized. Only Officers and Administrators can delete crime records.")

    crime = db.query(CrimeRecord).filter(CrimeRecord.id == crime_id).first()
    if not crime:
        raise HTTPException(status_code=404, detail="Crime record not found")

    db.delete(crime)
    db.commit()

    log_audit_action(db, "DELETE_CRIME_RECORD", user_email=current_user.email, role=current_user.role, resource=f"Crime Record ID {crime_id}")

    return {"message": f"Crime record {crime_id} deleted successfully"}