from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List
import pyotp
import qrcode
import io
import base64
import secrets
import json
import hashlib
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, UserSession
from app.schemas import schemas
from app.core.config import BASE_URL

router = APIRouter()

@router.post("/me/2fa/setup")
def setup_totp(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a new TOTP secret and return the provisioning URI (QR code)."""
    if current_user.totp_secret:
        # User already has 2FA set up (or at least a secret)
        pass # We allow re-setup
    
    secret = pyotp.random_base32()
    current_user.totp_secret = secret
    db.commit()
    
    # Generate provisioning URI
    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_user.email,
        issuer_name="Monteeq"
    )
    
    # Generate QR Code as base64
    img = qrcode.make(uri)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return {"qr_code": f"data:image/png;base64,{img_str}", "uri": uri, "secret": secret}

@router.post("/me/2fa/verify")
def verify_and_enable_totp(
    code: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify the first TOTP code and enable 2FA for the account."""
    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="2FA setup not initialized"
        )
    
    totp = pyotp.TOTP(current_user.totp_secret)
    if totp.verify(code):
        current_user.two_factor_enabled = True
        db.commit()
        return {"message": "2FA enabled successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )

@router.post("/me/2fa/disable")
def disable_totp(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Disable TOTP 2FA."""
    current_user.two_factor_enabled = False
    current_user.totp_secret = None
    db.commit()
    return {"message": "2FA disabled successfully"}

@router.get("/me/sessions", response_model=List[schemas.SessionOut])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List active sessions for the current user."""
    sessions = db.query(UserSession).filter(UserSession.user_id == current_user.id).order_by(UserSession.last_active.desc()).all()
    
    return [
        schemas.SessionOut(
            id=s.id,
            device_info=s.device_info or "Unknown Device",
            ip_address=s.ip_address or "Unknown IP",
            last_active=s.last_active,
            is_current=False # logic later
        ) for s in sessions
    ]

@router.delete("/me/sessions/{session_id}")
def revoke_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revoke a specific session."""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    return {"message": "Session revoked"}

@router.post("/me/deactivate")
def deactivate_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deactivate the current user's account."""
    current_user.is_active = False
    db.commit()
    return {"message": "Account deactivated"}

@router.post("/me/2fa/recovery-codes", response_model=List[str])
def generate_recovery_codes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate 10 new recovery codes and replace old ones."""
    codes = []
    hashed_codes = []
    for _ in range(10):
        # Format: XXXX-XXXX-XXXX
        code = secrets.token_hex(6).upper()
        formatted_code = f"{code[:4]}-{code[4:8]}-{code[8:]}"
        codes.append(formatted_code)
        
        # Store clean hash (no dashes, upper)
        clean_code = code.upper()
        hashed_codes.append(hashlib.sha256(clean_code.encode()).hexdigest())

    current_user.recovery_codes = json.dumps(hashed_codes)
    db.commit()
    return codes

@router.get("/me/2fa/recovery-codes-status")
def check_recovery_codes(
    current_user: User = Depends(get_current_user)
):
    """Check how many recovery codes are left."""
    if not current_user.recovery_codes:
        return {"count": 0}
    codes = json.loads(current_user.recovery_codes)
    return {"count": len(codes)}

@router.delete("/me/delete")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Permanently delete the current user's account and all associated data."""
    # SQLAlchemy cascade will handle related records if configured correctly
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted forever"}
