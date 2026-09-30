from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from backend.app.auth.dependencies import get_db, get_current_user, require_role
from backend.app.models.user import User
from backend.app.models.system import MLModel, Prediction
from backend.app.services.ml_service import (
    train_and_evaluate_models_service,
    predict_crime_rate_service
)

router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning & Predictions"]
)

class TrainRequest(BaseModel):
    dataset_id: Optional[int] = None

class PredictRequest(BaseModel):
    area_name: str
    crime_type: str
    year: int = 2027
    month_name: str = "January"

@router.post("/train")
def train_models(
    body: Optional[TrainRequest] = None,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    try:
        ds_id = body.dataset_id if body else None
        res = train_and_evaluate_models_service(db, selected_dataset_id=ds_id)
        return {
            "message": "AI model training and evaluation completed successfully.",
            "results": res
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/models")
def get_ml_models(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    models = db.query(MLModel).order_by(MLModel.id.desc()).all()
    return models

@router.post("/models/{model_id}/activate")
def activate_model(
    model_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    model = db.query(MLModel).filter(MLModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")

    db.query(MLModel).update({MLModel.is_active: False})
    model.is_active = True
    db.commit()
    db.refresh(model)

    return {"message": f"Model {model.name} (Version {model.version}) activated successfully."}

@router.post("/predict")
def predict_crime(
    req: PredictRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        res = predict_crime_rate_service(
            area_name=req.area_name,
            crime_type=req.crime_type,
            year=req.year,
            month_name=req.month_name,
            db=db,
            user_email=current_user.email
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/predictions")
def get_predictions_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    preds = db.query(Prediction).order_by(Prediction.id.desc()).limit(100).all()
    return preds
