from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import Optional

from backend.app.auth.dependencies import get_db, require_role, get_current_user
from backend.app.auth.security import hash_password
from backend.app.models.user import User, Officer
from backend.app.models.crime import CrimeRecord, Dataset
from backend.app.models.system import MLModel, Prediction, Hotspot, AuditLog
from backend.app.services.audit_service import log_audit_action

router = APIRouter(
    prefix="/admin",
    tags=["Admin Management"]
)

# Pydantic Schemas
class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "USER" # ADMIN, OFFICER, USER
    badge_number: Optional[str] = None
    department: Optional[str] = None

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    badge_number: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None

class CreateOfficerRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    badge_id: str
    rank: str = "Inspector"
    police_station: str = "Nagpur Central PS"
    assigned_zone: str = "Zone 4"

class UpdateOfficerRequest(BaseModel):
    name: Optional[str] = None
    rank: Optional[str] = None
    police_station: Optional[str] = None
    assigned_zone: Optional[str] = None
    is_active: Optional[bool] = None


# =========================================================
# ADMIN DASHBOARD OVERVIEW STATS
# =========================================================

@router.get("/dashboard/stats")
def get_admin_dashboard_stats(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).filter(User.role == "USER").scalar() or 0
    total_officers = db.query(func.count(User.id)).filter(User.role == "OFFICER").scalar() or 0
    total_crime_records = db.query(func.count(CrimeRecord.id)).scalar() or 0
    total_datasets = db.query(func.count(Dataset.id)).scalar() or 0
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0
    total_hotspots = db.query(func.count(Hotspot.id)).scalar() or 0

    active_model = db.query(MLModel).filter(MLModel.is_active == True).order_by(MLModel.id.desc()).first()

    return {
        "total_users": total_users,
        "total_officers": total_officers,
        "total_crime_records": total_crime_records,
        "total_datasets": total_datasets,
        "total_predictions": total_predictions,
        "total_hotspots": total_hotspots,
        "active_model": active_model.name if active_model else "No Active Model",
        "active_model_algorithm": active_model.algorithm if active_model else "N/A",
        "active_model_version": active_model.version if active_model else "1.0.0",
        "active_model_r2": active_model.r2_score if active_model else 0.0,
        "latest_training_date": active_model.trained_at if active_model else None
    }


# =========================================================
# USER MANAGEMENT
# =========================================================

@router.get("/users")
def list_users(
    search: Optional[str] = None,
    role_filter: Optional[str] = None,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.badge_number.ilike(f"%{search}%"))
        )
    if role_filter:
        query = query.filter(User.role == role_filter.upper())

    users = query.order_by(User.id.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "badge_number": u.badge_number,
            "department": u.department,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.post("/users")
def add_user(
    req: CreateUserRequest,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role.upper(),
        badge_number=req.badge_number or ("PUBLIC-" + str(User.id)),
        department=req.department or "Public User",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit_action(db, "CREATE_USER", user_email=current_user.email, role="ADMIN", resource=f"User {user.email}")
    return {"message": "User created successfully", "user_id": user.id}

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    req: UpdateUserRequest,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.name is not None:
        user.name = req.name
    if req.email is not None:
        user.email = req.email
    if req.role is not None:
        user.role = req.role.upper()
    if req.badge_number is not None:
        user.badge_number = req.badge_number
    if req.department is not None:
        user.department = req.department
    if req.is_active is not None:
        user.is_active = req.is_active

    db.commit()
    log_audit_action(db, "UPDATE_USER", user_email=current_user.email, role="ADMIN", resource=f"User {user.id}")
    return {"message": "User updated successfully"}

@router.put("/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()
    log_audit_action(db, "TOGGLE_USER_STATUS", user_email=current_user.email, role="ADMIN", resource=f"User {user.id} -> active={user.is_active}")
    return {"message": f"User status changed to {'Active' if user.is_active else 'Inactive'}"}

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    log_audit_action(db, "DELETE_USER", user_email=current_user.email, role="ADMIN", resource=f"User ID {user_id}")
    return {"message": "User deleted successfully"}


# =========================================================
# OFFICER MANAGEMENT
# =========================================================

@router.get("/officers")
def list_officers(
    search: Optional[str] = None,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role == "OFFICER")
    if search:
        query = query.filter(
            (User.name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.badge_number.ilike(f"%{search}%"))
        )
    officers_list = query.order_by(User.id.desc()).all()

    result = []
    for u in officers_list:
        prof = db.query(Officer).filter(Officer.user_id == u.id).first()
        result.append({
            "id": u.id,
            "officer_profile_id": prof.id if prof else None,
            "name": u.name,
            "email": u.email,
            "badge_id": prof.badge_id if prof else (u.badge_number or "POL-UNKNOWN"),
            "rank": prof.rank if prof else "Inspector",
            "police_station": prof.police_station if prof else "Nagpur Central PS",
            "assigned_zone": prof.assigned_zone if prof else "Zone 4",
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return result

@router.post("/officers")
def add_officer(
    req: CreateOfficerRequest,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        role="OFFICER",
        badge_number=req.badge_id,
        department="Nagpur Police Department",
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    officer_profile = Officer(
        user_id=user.id,
        badge_id=req.badge_id,
        rank=req.rank,
        police_station=req.police_station,
        assigned_zone=req.assigned_zone
    )
    db.add(officer_profile)
    db.commit()

    log_audit_action(db, "CREATE_OFFICER", user_email=current_user.email, role="ADMIN", resource=f"Officer {user.email}")
    return {"message": "Officer created successfully", "user_id": user.id}

@router.put("/officers/{user_id}")
def update_officer(
    user_id: int,
    req: UpdateOfficerRequest,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id, User.role == "OFFICER").first()
    if not user:
        raise HTTPException(status_code=404, detail="Officer user not found")

    if req.name is not None:
        user.name = req.name
    if req.is_active is not None:
        user.is_active = req.is_active

    prof = db.query(Officer).filter(Officer.user_id == user_id).first()
    if prof:
        if req.rank is not None:
            prof.rank = req.rank
        if req.police_station is not None:
            prof.police_station = req.police_station
        if req.assigned_zone is not None:
            prof.assigned_zone = req.assigned_zone

    db.commit()
    log_audit_action(db, "UPDATE_OFFICER", user_email=current_user.email, role="ADMIN", resource=f"Officer ID {user_id}")
    return {"message": "Officer updated successfully"}


# =========================================================
# AUDIT LOGS
# =========================================================

@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 100,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
    return logs