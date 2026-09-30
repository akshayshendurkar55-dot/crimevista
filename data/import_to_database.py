import sys
import os

import pandas as pd

# Add project root to Python path
PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.insert(0, PROJECT_ROOT)


from sqlalchemy.orm import Session

from backend.app.database.connection import SessionLocal
from backend.app.models.user import User
from backend.app.models.crime import CrimeRecord


FILE_PATH = os.path.join(
    PROJECT_ROOT,
    "data",
    "processed_crime_data.csv"
)


# ------------------------------------------------
# Check dataset
# ------------------------------------------------

if not os.path.exists(FILE_PATH):

    print("ERROR: Processed dataset not found.")

    print(
        f"Expected file: {FILE_PATH}"
    )

    sys.exit(1)


# ------------------------------------------------
# Read dataset
# ------------------------------------------------

df = pd.read_csv(FILE_PATH)


print("\n========== DATABASE IMPORT ==========\n")

print(
    "Records found:",
    len(df)
)


print(
    "Columns found:"
)

print(
    list(df.columns)
)


# ------------------------------------------------
# Replace NaN with None
# ------------------------------------------------

df = df.where(
    pd.notnull(df),
    None
)


# ------------------------------------------------
# Database connection
# ------------------------------------------------

db: Session = SessionLocal()


inserted = 0
skipped = 0


# ------------------------------------------------
# Import records
# ------------------------------------------------

for index, row in df.iterrows():

    try:
        area_val = str(row["area"]) if "area" in df.columns and row["area"] is not None else (str(row["location"]) if "location" in df.columns and row["location"] is not None else "Nagpur Central")
        loc_val = str(row["location"]) if "location" in df.columns and row["location"] is not None else area_val

        crime = CrimeRecord(
            crime_id=str(row["crime_id"]) if "crime_id" in df.columns and row["crime_id"] is not None else f"NGP{index+1:04d}",
            crime_type=str(row["crime_type"]) if "crime_type" in df.columns and row["crime_type"] is not None else "Theft",
            location=loc_val,
            area=area_val,
            city=str(row["city"]) if "city" in df.columns and row["city"] is not None else "Nagpur",
            state="Maharashtra",
            latitude=float(row["latitude"]) if "latitude" in df.columns and row["latitude"] is not None else 21.1458,
            longitude=float(row["longitude"]) if "longitude" in df.columns and row["longitude"] is not None else 79.0882,
            severity=str(row["severity"]) if "severity" in df.columns and row["severity"] is not None else "Medium",
            police_station=str(row["police_station"]) if "police_station" in df.columns and row["police_station"] is not None else "Nagpur Central PS",
            victim_age=int(row["victim_age"]) if "victim_age" in df.columns and row["victim_age"] is not None and str(row["victim_age"]).isdigit() else None,
            victim_gender=str(row["victim_gender"]) if "victim_gender" in df.columns and row["victim_gender"] is not None else None,
            weapon_used=str(row["weapon_used"]) if "weapon_used" in df.columns and row["weapon_used"] is not None else "None",
            description=str(row["description"]) if "description" in df.columns and row["description"] is not None else f"{row.get('crime_type', 'Incident')} reported at {area_val}.",
            status=str(row["status"]) if "status" in df.columns and row["status"] is not None else "OPEN"
        )

        date_col = "date" if "date" in df.columns else ("crime_date" if "crime_date" in df.columns else None)
        if date_col and row[date_col] is not None:
            date_value = pd.to_datetime(row[date_col], errors="coerce")
            if pd.notna(date_value):
                crime.crime_date = date_value.date()

        time_col = "time" if "time" in df.columns else ("crime_time" if "crime_time" in df.columns else None)
        if time_col and row[time_col] is not None:
            time_value = pd.to_datetime(row[time_col], errors="coerce")
            if pd.notna(time_value):
                crime.crime_time = time_value.time()

        db.add(crime)
        inserted += 1


    except Exception as error:

        skipped += 1

        print(
            f"Skipped row {index}: {error}"
        )


# ------------------------------------------------
# Save records
# ------------------------------------------------

try:

    db.commit()

    print("\nDatabase commit successful.")

except Exception as error:

    db.rollback()

    print(
        "\nDatabase commit failed:"
    )

    print(error)

    db.close()

    sys.exit(1)


db.close()


# ------------------------------------------------
# Final result
# ------------------------------------------------

print("\n========== IMPORT COMPLETED ==========\n")

print(
    "Inserted:",
    inserted
)

print(
    "Skipped:",
    skipped
)

print(
    "\nCrime data import finished successfully."
)