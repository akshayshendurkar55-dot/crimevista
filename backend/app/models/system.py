from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from datetime import datetime
from backend.app.database.base import Base

class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) # e.g. Random Forest Crime Predictor
    algorithm = Column(String(50), nullable=False, default="Random Forest")
    version = Column(String(20), nullable=False, default="1.0.0")
    mae = Column(Float, default=0.0)
    mse = Column(Float, default=0.0)
    rmse = Column(Float, default=0.0)
    r2_score = Column(Float, default=0.0)
    training_records = Column(Integer, default=0)
    testing_records = Column(Integer, default=0)
    features_used = Column(Text, nullable=True) # JSON list of features
    file_path = Column(String(255), nullable=True)
    dataset_name = Column(String(150), nullable=True)
    is_active = Column(Boolean, default=False)
    trained_at = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String(150), nullable=False)
    crime_type = Column(String(100), nullable=True)
    prediction_year = Column(Integer, nullable=True)
    prediction_month = Column(String(50), nullable=True)
    predicted_crime_count = Column(Float, nullable=False, default=0.0)
    risk_level = Column(String(20), nullable=False, default="MEDIUM") # CRITICAL, HIGH, MEDIUM, LOW
    risk_score = Column(Float, nullable=False, default=0.5)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    model_name = Column(String(100), default="CrimeVista AI v1.0")
    created_by = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)
    hotspot_code = Column(String(50), unique=True, nullable=False) # e.g. #H001
    area_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=1.0)
    crime_count = Column(Integer, default=0)
    dominant_crime = Column(String(100), default="Theft")
    risk_level = Column(String(20), default="HIGH") # HIGH, CRITICAL, MEDIUM, LOW
    historical_frequency = Column(Integer, default=0)
    predicted_count = Column(Float, default=0.0)
    detection_method = Column(String(50), default="DBSCAN / Spatial Density")
    analyzed_at = Column(DateTime, default=datetime.utcnow)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    report_type = Column(String(50), nullable=False) # MONTHLY, HOTSPOT, POLICE_PATROL
    file_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(150), nullable=True)
    role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False) # e.g. LOGIN, UPLOAD_DATASET, ADD_CRIME_RECORD
    resource = Column(String(150), nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow)
