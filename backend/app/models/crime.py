from sqlalchemy import Column, Integer, String, Float, Date, Time, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database.base import Base

class CrimeCategory(Base):
    __tablename__ = "crime_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False) # e.g. Burglary, Cyber Fraud, Assault
    code = Column(String(20), unique=True, nullable=False)
    severity_level = Column(String(20), default="MEDIUM") # HIGH, MEDIUM, LOW

    records = relationship("CrimeRecord", back_populates="category_rel")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String(150), nullable=False)
    city = Column(String(100), nullable=False, default="Nagpur")
    state = Column(String(100), nullable=False, default="Maharashtra")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    risk_score = Column(Float, default=0.0)

    records = relationship("CrimeRecord", back_populates="location_rel")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=True)
    total_records = Column(Integer, default=0)
    valid_records = Column(Integer, default=0)
    duplicate_records = Column(Integer, default=0)
    invalid_coordinates = Column(Integer, default=0)
    status = Column(String(50), default="UPLOADED") # UPLOADED, VALIDATED, CLEANED, APPROVED
    uploaded_by = Column(String(150), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    validation_report = Column(Text, nullable=True) # JSON string

    records = relationship("CrimeRecord", back_populates="dataset_rel")


class CrimeRecord(Base):
    __tablename__ = "crime_records"

    id = Column(Integer, primary_key=True, index=True)
    crime_id = Column(String(100), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("crime_categories.id"), nullable=True)
    crime_type = Column(String(100), nullable=True, index=True)
    crime_date = Column(Date, nullable=True, index=True)
    crime_time = Column(Time, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    location = Column(String(255), nullable=True) # Full location description or landmark
    area = Column(String(150), nullable=True, index=True) # Area / Zone e.g. Sadar, Mahal
    city = Column(String(100), nullable=True, default="Nagpur")
    state = Column(String(100), nullable=True, default="Maharashtra")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    severity = Column(String(50), nullable=True, default="Medium") # Low, Medium, High, Critical
    police_station = Column(String(150), nullable=True)
    victim_age = Column(Integer, nullable=True)
    victim_gender = Column(String(50), nullable=True)
    weapon_used = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="OPEN") # OPEN, UNDER_INVESTIGATION, CLOSED, SOLVED, REPORTED
    dataset_id = Column(Integer, ForeignKey("datasets.id"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category_rel = relationship("CrimeCategory", back_populates="records")
    location_rel = relationship("Location", back_populates="records")
    dataset_rel = relationship("Dataset", back_populates="records")