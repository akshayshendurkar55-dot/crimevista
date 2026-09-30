from sqlalchemy.orm import Session
from backend.app.models.system import AuditLog

def log_audit_action(
    db: Session,
    action: str,
    user_id: int = None,
    user_email: str = None,
    role: str = None,
    resource: str = None,
    ip_address: str = "127.0.0.1"
):
    try:
        log_entry = AuditLog(
            user_id=user_id,
            user_email=user_email,
            role=role,
            action=action,
            resource=resource,
            ip_address=ip_address
        )
        db.add(log_entry)
        db.commit()
        return log_entry
    except Exception as e:
        db.rollback()
        print(f"Failed to record audit log: {e}")
        return None
