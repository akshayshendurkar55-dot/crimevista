import io
import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session

from backend.app.models.crime import Dataset, CrimeRecord
from backend.app.services.audit_service import log_audit_action

DATASET_STORAGE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "uploaded_datasets"
)

os.makedirs(DATASET_STORAGE_DIR, exist_ok=True)


def parse_file_to_dataframe(file_content: bytes, filename: str) -> pd.DataFrame:
    filename_lower = filename.lower()
    if filename_lower.endswith(".csv"):
        # Try UTF-8 first, fallback to latin-1
        try:
            return pd.read_csv(io.BytesIO(file_content), encoding="utf-8-sig")
        except UnicodeDecodeError:
            return pd.read_csv(io.BytesIO(file_content), encoding="latin-1")
    elif filename_lower.endswith(".xlsx") or filename_lower.endswith(".xls"):
        return pd.read_excel(io.BytesIO(file_content))
    else:
        raise ValueError("Unsupported file format. Please upload CSV or Excel (.csv, .xlsx, .xls).")


def validate_raw_dataset(df: pd.DataFrame) -> dict:
    total_records = len(df)
    if total_records == 0:
        raise ValueError("Dataset is empty. Contains 0 records.")

    col_names = [str(c).strip().lower() for c in df.columns]
    df.columns = col_names

    missing_cols = []
    required = ["crime_type", "latitude", "longitude"]
    for req in required:
        if req not in col_names and not any(req in c for c in col_names):
            missing_cols.append(req)

    # Calculate duplicate records
    duplicate_records = int(df.duplicated().sum())

    # Calculate missing values
    missing_value_summary = {col: int(df[col].isnull().sum()) for col in df.columns}
    total_missing_cells = sum(missing_value_summary.values())

    # Latitude / Longitude validation
    lat_col = next((c for c in col_names if "lat" in c), None)
    lng_col = next((c for c in col_names if "lng" in c or "lon" in c), None)

    invalid_coordinates = 0
    if lat_col and lng_col:
        try:
            lats = pd.to_numeric(df[lat_col], errors="coerce")
            lngs = pd.to_numeric(df[lng_col], errors="coerce")
            invalid_lats = (lats < -90) | (lats > 90) | lats.isnull()
            invalid_lngs = (lngs < -180) | (lngs > 180) | lngs.isnull()
            invalid_coordinates = int((invalid_lats | invalid_lngs).sum())
        except Exception:
            invalid_coordinates = total_records

    # Empty rows check
    empty_rows = int(df.isnull().all(axis=1).sum())

    valid_records = max(0, total_records - duplicate_records - invalid_coordinates - empty_rows)

    report = {
        "total_records": total_records,
        "valid_records": valid_records,
        "duplicate_records": duplicate_records,
        "invalid_coordinates": invalid_coordinates,
        "empty_rows": empty_rows,
        "total_missing_cells": total_missing_cells,
        "missing_columns": missing_cols,
        "column_count": len(df.columns),
        "columns": list(df.columns),
        "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing_values_per_column": missing_value_summary
    }

    return report


def save_and_register_dataset(file_content: bytes, filename: str, uploaded_by: str, db: Session) -> dict:
    df = parse_file_to_dataframe(file_content, filename)
    validation_report = validate_raw_dataset(df)

    saved_filename = f"{int(datetime.utcnow().timestamp())}_{filename}"
    file_path = os.path.join(DATASET_STORAGE_DIR, saved_filename)
    
    with open(file_path, "wb") as f:
        f.write(file_content)

    dataset = Dataset(
        name=os.path.splitext(filename)[0].replace("_", " ").title(),
        filename=filename,
        file_path=file_path,
        total_records=validation_report["total_records"],
        valid_records=validation_report["valid_records"],
        duplicate_records=validation_report["duplicate_records"],
        invalid_coordinates=validation_report["invalid_coordinates"],
        status="VALIDATED",
        uploaded_by=uploaded_by,
        validation_report=json.dumps(validation_report)
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    log_audit_action(db, "UPLOAD_DATASET", user_email=uploaded_by, role="ADMIN", resource=f"Dataset {dataset.name} (ID: {dataset.id})")

    return {
        "id": dataset.id,
        "name": dataset.name,
        "filename": dataset.filename,
        "status": dataset.status,
        "total_records": dataset.total_records,
        "valid_records": dataset.valid_records,
        "duplicate_records": dataset.duplicate_records,
        "invalid_coordinates": dataset.invalid_coordinates,
        "uploaded_at": dataset.uploaded_at,
        "validation_report": validation_report
    }


def clean_dataset_service(dataset_id: int, db: Session) -> dict:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise ValueError("Dataset not found")

    if not dataset.file_path or not os.path.exists(dataset.file_path):
        raise ValueError("Dataset file is missing on server storage.")

    with open(dataset.file_path, "rb") as f:
        content = f.read()

    df = parse_file_to_dataframe(content, dataset.filename)
    before_rows = len(df)
    before_cols = len(df.columns)

    # 1. Clean column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    # 2. Remove duplicates
    df = df.drop_duplicates()

    # 3. Drop completely empty rows and columns
    df = df.dropna(how="all", axis=0)
    df = df.dropna(how="all", axis=1)

    # 4. Strip string fields
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace({"nan": None, "None": None, "": None})

    # 5. Coordinate validation
    lat_col = next((c for c in df.columns if "lat" in c), None)
    lng_col = next((c for c in df.columns if "lng" in c or "lon" in c), None)
    if lat_col and lng_col:
        df[lat_col] = pd.to_numeric(df[lat_col], errors="coerce")
        df[lng_col] = pd.to_numeric(df[lng_col], errors="coerce")
        df = df[(df[lat_col] >= -90) & (df[lat_col] <= 90)]
        df = df[(df[lng_col] >= -180) & (df[lng_col] <= 180)]

    # 6. Save cleaned CSV
    cleaned_path = dataset.file_path.replace(".csv", "_cleaned.csv").replace(".xlsx", "_cleaned.csv").replace(".xls", "_cleaned.csv")
    df.to_csv(cleaned_path, index=False)

    after_rows = len(df)
    after_cols = len(df.columns)

    dataset.status = "CLEANED"
    dataset.valid_records = after_rows
    db.commit()

    log_audit_action(db, "CLEAN_DATASET", role="ADMIN", resource=f"Dataset ID {dataset_id}")

    return {
        "dataset_id": dataset.id,
        "name": dataset.name,
        "status": dataset.status,
        "before_cleaning": {"rows": before_rows, "columns": before_cols},
        "after_cleaning": {"rows": after_rows, "columns": after_cols},
        "records_removed": before_rows - after_rows,
        "cleaned_file": cleaned_path
    }


def preview_dataset_service(dataset_id: int, db: Session, limit: int = 50) -> dict:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise ValueError("Dataset not found")

    cleaned_path = dataset.file_path.replace(".csv", "_cleaned.csv").replace(".xlsx", "_cleaned.csv").replace(".xls", "_cleaned.csv")
    target_path = cleaned_path if os.path.exists(cleaned_path) else dataset.file_path

    if not os.path.exists(target_path):
        raise ValueError("File not found on storage")

    if target_path.endswith(".csv"):
        df = pd.read_csv(target_path)
    else:
        df = pd.read_excel(target_path)

    # Convert NaN to None
    df = df.where(pd.notnull(df), None)

    records = df.head(limit).to_dict(orient="records")
    summary = {
        "columns": list(df.columns),
        "total_rows": len(df),
        "data_types": {c: str(df[c].dtype) for c in df.columns},
        "null_counts": {c: int(df[c].isnull().sum()) for c in df.columns}
    }

    return {
        "dataset": {
            "id": dataset.id,
            "name": dataset.name,
            "filename": dataset.filename,
            "status": dataset.status,
            "uploaded_at": dataset.uploaded_at
        },
        "summary": summary,
        "preview_records": records
    }


def approve_and_ingest_dataset_service(dataset_id: int, db: Session) -> dict:
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise ValueError("Dataset not found")

    cleaned_path = dataset.file_path.replace(".csv", "_cleaned.csv").replace(".xlsx", "_cleaned.csv").replace(".xls", "_cleaned.csv")
    target_path = cleaned_path if os.path.exists(cleaned_path) else dataset.file_path

    if not os.path.exists(target_path):
        raise ValueError("Dataset file missing.")

    df = pd.read_csv(target_path) if target_path.endswith(".csv") else pd.read_excel(target_path)
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

    inserted = 0
    skipped = 0

    for index, row in df.iterrows():
        try:
            area_val = str(row["area"]) if "area" in df.columns and pd.notna(row["area"]) else (str(row["location"]) if "location" in df.columns and pd.notna(row["location"]) else "Nagpur Central")
            loc_val = str(row["location"]) if "location" in df.columns and pd.notna(row["location"]) else area_val
            c_type = str(row["crime_type"]) if "crime_type" in df.columns and pd.notna(row["crime_type"]) else "General Incident"

            date_val = None
            date_col = next((c for c in df.columns if "date" in c), None)
            if date_col and pd.notna(row[date_col]):
                parsed = pd.to_datetime(row[date_col], errors="coerce")
                if pd.notna(parsed):
                    date_val = parsed.date()

            time_val = None
            time_col = next((c for c in df.columns if "time" in c), None)
            if time_col and pd.notna(row[time_col]):
                parsed = pd.to_datetime(row[time_col], errors="coerce")
                if pd.notna(parsed):
                    time_val = parsed.time()

            crime = CrimeRecord(
                crime_id=str(row["crime_id"]) if "crime_id" in df.columns and pd.notna(row["crime_id"]) else f"DS-{dataset_id}-{index+1:04d}",
                crime_type=c_type,
                location=loc_val,
                area=area_val,
                city=str(row["city"]) if "city" in df.columns and pd.notna(row["city"]) else "Nagpur",
                state="Maharashtra",
                latitude=float(row["latitude"]) if "latitude" in df.columns and pd.notna(row["latitude"]) else 21.1458,
                longitude=float(row["longitude"]) if "longitude" in df.columns and pd.notna(row["longitude"]) else 79.0882,
                crime_date=date_val,
                crime_time=time_val,
                severity=str(row["severity"]) if "severity" in df.columns and pd.notna(row["severity"]) else "Medium",
                police_station=str(row["police_station"]) if "police_station" in df.columns and pd.notna(row["police_station"]) else "Nagpur Central PS",
                victim_age=int(row["victim_age"]) if "victim_age" in df.columns and pd.notna(row["victim_age"]) and str(row["victim_age"]).isdigit() else None,
                victim_gender=str(row["victim_gender"]) if "victim_gender" in df.columns and pd.notna(row["victim_gender"]) else None,
                weapon_used=str(row["weapon_used"]) if "weapon_used" in df.columns and pd.notna(row["weapon_used"]) else "None",
                description=str(row["description"]) if "description" in df.columns and pd.notna(row["description"]) else f"Record imported from dataset {dataset.name}.",
                status=str(row["status"]) if "status" in df.columns and pd.notna(row["status"]) else "OPEN",
                dataset_id=dataset.id
            )
            db.add(crime)
            inserted += 1
        except Exception:
            skipped += 1

    dataset.status = "APPROVED"
    db.commit()

    log_audit_action(db, "APPROVE_DATASET", role="ADMIN", resource=f"Dataset ID {dataset_id} ({inserted} records ingested)")

    return {
        "dataset_id": dataset.id,
        "name": dataset.name,
        "status": dataset.status,
        "records_ingested": inserted,
        "records_skipped": skipped
    }
