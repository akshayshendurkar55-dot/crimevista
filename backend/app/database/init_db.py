import datetime
from backend.app.database.connection import engine, SessionLocal
from backend.app.database.base import Base

from backend.app.auth.security import hash_password

# Import all SQLAlchemy models to register them with metadata
from backend.app.models.user import Role, Permission, RolePermission, User, Officer
from backend.app.models.crime import CrimeCategory, Location, Dataset, CrimeRecord
from backend.app.models.system import MLModel, Prediction, Hotspot, Report, Notification, AuditLog


def create_tables():
    print("Dropping and recreating fresh database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database tables ready.")


def seed_data():
    session = SessionLocal()
    try:
        # 1. Seed Roles
        admin_role = session.query(Role).filter_by(name="ADMIN").first()
        if not admin_role:
            admin_role = Role(name="ADMIN", description="System administration and complete platform management.")
            officer_role = Role(name="OFFICER", description="Crime management, geographic intelligence and operational analytics.")
            user_role = Role(name="USER", description="Explore public crime information, trends and geographic insights.")
            session.add_all([admin_role, officer_role, user_role])
            session.commit()
            print("Seeded Roles: ADMIN, OFFICER, USER")

        # 2. Seed Permissions
        if session.query(Permission).count() == 0:
            permissions = [
                Permission(name="user:manage", description="Create, update, delete user accounts"),
                Permission(name="system:config", description="Manage system and security settings"),
                Permission(name="crime:create", description="Create new verified crime records"),
                Permission(name="crime:read", description="Read public crime records"),
                Permission(name="crime:read_private", description="Read confidential police FIR records"),
                Permission(name="ai:predict", description="Run AI risk prediction algorithms"),
                Permission(name="audit:view", description="View platform audit security logs"),
            ]
            session.add_all(permissions)
            session.commit()
            print("Seeded Permissions")

        # 3. Seed Demo Users
        if session.query(User).count() == 0:
            admin_user = User(
                name="System Administrator",
                email="admin@crimevista.gov.in",
                password_hash=hash_password("adminpassword"),
                role="ADMIN",
                badge_number="ADM-9001",
                department="Central Operations & Security"
            )
            officer_user = User(
                name="Inspector Vikram Sharma",
                email="officer.sharma@police.gov.in",
                password_hash=hash_password("officerpassword"),
                role="OFFICER",
                badge_number="POL-4482",
                department="Special Crime Branch"
            )
            citizen_user = User(
                name="Aniket Deshmukh",
                email="citizen.user@crimevista.org",
                password_hash=hash_password("userpassword"),
                role="USER",
                badge_number="PUBLIC-108",
                department="Verified Public User"
            )
            session.add_all([admin_user, officer_user, citizen_user])
            session.commit()

            # Seed Officer Profile
            officer_profile = Officer(
                user_id=officer_user.id,
                badge_id="POL-4482",
                rank="Inspector",
                police_station="Nagpur Central PS",
                assigned_zone="Zone 4"
            )
            session.add(officer_profile)
            session.commit()
            print("Seeded Demo Users & Officer Profile")

        # 4. Seed Crime Categories & Sample Locations
        if session.query(CrimeCategory).count() == 0:
            cat1 = CrimeCategory(name="Burglary", code="BURG", severity_level="HIGH")
            cat2 = CrimeCategory(name="Vehicle Theft", code="VTHEFT", severity_level="MEDIUM")
            cat3 = CrimeCategory(name="Cyber Fraud", code="CYBER", severity_level="LOW")
            cat4 = CrimeCategory(name="Assault", code="ASSAULT", severity_level="HIGH")
            session.add_all([cat1, cat2, cat3, cat4])

            loc1 = Location(area_name="Sitabuldi", city="Nagpur", state="Maharashtra", latitude=21.1458, longitude=79.0882, risk_score=0.84)
            loc2 = Location(area_name="Dharampeth", city="Nagpur", state="Maharashtra", latitude=21.1400, longitude=79.0600, risk_score=0.45)
            loc3 = Location(area_name="Sadar", city="Nagpur", state="Maharashtra", latitude=21.1550, longitude=79.0900, risk_score=0.72)
            session.add_all([loc1, loc2, loc3])
            session.commit()
            print("Seeded Crime Categories & Locations")

        # 5. Seed ML Models & Predictions
        if session.query(MLModel).count() == 0:
            ml_model = MLModel(
                name="Random Forest Crime Regressor",
                algorithm="Random Forest",
                version="1.0.0",
                mae=0.18,
                mse=0.06,
                rmse=0.24,
                r2_score=0.912,
                training_records=80,
                testing_records=20,
                features_used='["Area", "Crime_Type", "Year", "Month", "Latitude", "Longitude"]',
                dataset_name="crime_data.csv",
                is_active=True
            )
            session.add(ml_model)

            pred1 = Prediction(
                area_name="Sadar",
                crime_type="Burglary",
                prediction_year=2027,
                prediction_month="January",
                predicted_crime_count=4.2,
                risk_level="HIGH",
                risk_score=0.84,
                latitude=21.1550,
                longitude=79.0900,
                model_name="Random Forest Crime Regressor v1.0.0",
                created_by="admin@crimevista.gov.in"
            )
            session.add(pred1)
            session.commit()
            print("Seeded ML Model & Predictions")

        # 6. Seed Hotspots
        if session.query(Hotspot).count() == 0:
            hs1 = Hotspot(
                hotspot_code="#H001",
                area_name="Sitabuldi Commercial Zone",
                latitude=21.1458,
                longitude=79.0882,
                radius_km=0.8,
                crime_count=18,
                dominant_crime="Theft",
                risk_level="HIGH",
                historical_frequency=18,
                predicted_count=5.2,
                detection_method="DBSCAN / Spatial Density"
            )
            hs2 = Hotspot(
                hotspot_code="#H002",
                area_name="Sadar Market Square",
                latitude=21.1550,
                longitude=79.0900,
                radius_km=0.6,
                crime_count=14,
                dominant_crime="Assault",
                risk_level="HIGH",
                historical_frequency=14,
                predicted_count=4.1,
                detection_method="DBSCAN / Spatial Density"
            )
            hs3 = Hotspot(
                hotspot_code="#H003",
                area_name="Dharampeth West",
                latitude=21.1400,
                longitude=79.0600,
                radius_km=0.5,
                crime_count=8,
                dominant_crime="Cyber Fraud",
                risk_level="MEDIUM",
                historical_frequency=8,
                predicted_count=2.0,
                detection_method="DBSCAN / Spatial Density"
            )
            session.add_all([hs1, hs2, hs3])
            session.commit()
            print("Seeded Hotspots")

    except Exception as e:
        session.rollback()
        print("Error during database seeding:", e)
    finally:
        session.close()


if __name__ == "__main__":
    create_tables()
    seed_data()