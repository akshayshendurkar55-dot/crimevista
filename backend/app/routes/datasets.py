from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.auth.dependencies import get_db, get_current_user, require_role
from backend.app.models.user import User
from backend.app.models.crime import Dataset
from backend.app.services.dataset_service import (
    save_and_register_dataset,
    clean_dataset_service,
    preview_dataset_service,
    approve_and_ingest_dataset_service
)

router = APIRouter(
    prefix="/datasets",
    tags=["Dataset Management"]
)

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is missing")
    
    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".csv") or filename_lower.endswith(".xlsx") or filename_lower.endswith(".xls")):
        raise HTTPException(status_code=400, detail="Only CSV (.csv) and Excel (.xlsx, .xls) files are supported")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        result = save_and_register_dataset(content, file.filename, current_user.email, db)
        return {"message": "Dataset uploaded and validated successfully", "dataset": result}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("")
@router.get("/")
def get_all_datasets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    datasets = db.query(Dataset).order_by(Dataset.id.desc()).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "filename": d.filename,
            "total_records": d.total_records,
            "valid_records": d.valid_records,
            "duplicate_records": d.duplicate_records,
            "invalid_coordinates": d.invalid_coordinates,
            "status": d.status,
            "uploaded_by": d.uploaded_by,
            "uploaded_at": d.uploaded_at
        }
        for d in datasets
    ]

@router.get("/{dataset_id}")
def get_dataset_by_id(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    d = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return d

@router.post("/{dataset_id}/clean")
def clean_dataset_endpoint(
    dataset_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    try:
        res = clean_dataset_service(dataset_id, db)
        return {"message": "Dataset cleaned successfully", "cleaning_result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{dataset_id}/preview")
def preview_dataset_endpoint(
    dataset_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return preview_dataset_service(dataset_id, db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{dataset_id}/approve")
def approve_dataset_endpoint(
    dataset_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    try:
        res = approve_and_ingest_dataset_service(dataset_id, db)
        return {"message": "Dataset approved and ingested into operational crime records", "result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    d = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Dataset not found")
    db.delete(d)
    db.commit()
    return {"message": f"Dataset {dataset_id} deleted successfully"}
