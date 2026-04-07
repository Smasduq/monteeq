from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from app.db.session import get_db
from app.core import security, config
from app.crud import user as crud_user
from app.schemas import schemas
from app.models.models import User, UserSession
import hashlib

router = APIRouter()

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    db: Session = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = crud_user.get_user_by_username(db, username=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email first.",
        )

    if getattr(user, 'two_factor_enabled', False) is True:
        methods = ["totp"]
        if user.recovery_codes:
            methods.append("recovery_code")
        return {"two_factor_required": True, "username": user.username, "methods": methods}

    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Create Session
    token_hash = hashlib.sha256(access_token.encode()).hexdigest()
    new_session = UserSession(
        user_id=user.id,
        token_hash=token_hash,
        device_info="Mock Device (Browser)", 
        ip_address="127.0.0.1"
    )
    db.add(new_session)
    db.commit()

    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

@router.post("/register", response_model=schemas.VerificationResponse)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = crud_user.get_user_by_username(db, username=user_in.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user = crud_user.create_user(db, user=user_in, is_onboarded=False)
    
    # Generate verification code
    code = crud_user.create_verification_code(db, email=user.email)
    print(f"VERIFICATION CODE FOR {user.email}: {code}") # Log for testing
    
    return {
        "message": "Registration successful. Please check your email for the verification code.",
        "email": user.email,
        "username": user.username
    }

@router.post("/verify-email", response_model=schemas.VerificationResponse)
def verify_email(data: schemas.EmailVerification, db: Session = Depends(get_db)):
    if crud_user.verify_code(db, email=data.email, code=data.code):
        user = crud_user.get_user_by_email(db, email=data.email)
        if user:
            # Update is_verified
            user.is_verified = True
            db.commit()
            db.refresh(user)
            return {"message": "Email verified successfully", "username": user.username}
    
    raise HTTPException(status_code=400, detail="Invalid or expired verification code")

@router.post("/google", response_model=schemas.Token)
async def google_auth(auth_data: schemas.UserGoogleAuth, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            auth_data.credential, requests.Request(), config.GOOGLE_CLIENT_ID
        )
        email = idinfo['email']
        google_id = idinfo['sub']
        name = idinfo.get('name', email.split('@')[0])
        picture = idinfo.get('picture')
        
        user = crud_user.get_user_by_email(db, email=email)
        if not user:
            # Generate a temporary unique username
            base_username = name.lower().replace(" ", "")
            if not base_username:
                base_username = "user"
            username = base_username
            suffix = 1
            while crud_user.get_user_by_username(db, username=username):
                username = f"{base_username}{suffix}"
                suffix += 1
            
            user_create = schemas.UserCreate(
                username=username, 
                email=email, 
                full_name=name,
                profile_pic=picture,
                password=None # Google auth users don't have passwords
            )
            # Google users are auto-verified
            user = crud_user.create_user(db, user=user_create, google_id=google_id, is_onboarded=False)
            user.is_verified = True
            db.commit()
            db.refresh(user)
        else:
            if not user.google_id:
                user.google_id = google_id
            if picture and not user.profile_pic:
                user.profile_pic = picture
            
            user.is_verified = True
            db.commit()
            db.refresh(user)

        if getattr(user, 'two_factor_enabled', False) is True:
            methods = ["totp"]
            if user.recovery_codes:
                methods.append("recovery_code")
            return {"two_factor_required": True, "username": user.username, "methods": methods}

        access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        # Create Session
        token_hash = hashlib.sha256(access_token.encode()).hexdigest()
        new_session = UserSession(
            user_id=user.id,
            token_hash=token_hash,
            device_info="Google Auth Device", 
            ip_address="127.0.0.1"
        )
        db.add(new_session)
        db.commit()
        
        return {"access_token": access_token, "token_type": "bearer", "username": user.username}
        
    except ValueError as e:
        print(f"Google Auth Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

@router.post("/verify-2fa", response_model=schemas.Token)
def verify_login_2fa(
    data: schemas.TokenData, # Reusing schemas to avoid new ones
    db: Session = Depends(get_db)
):
    """Verify TOTP code for login."""
    if not data.username or not data.code:
        raise HTTPException(status_code=400, detail="Missing username or code")
    
    user = crud_user.get_user_by_username(db, username=data.username)
    if not user or not user.totp_secret:
         raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    import pyotp
    import json
    
    is_valid = False
    
    # Try TOTP
    totp = pyotp.TOTP(user.totp_secret)
    if totp.verify(data.code):
        is_valid = True
    
    # Try Recovery Codes
    if not is_valid and user.recovery_codes:
        codes = json.loads(user.recovery_codes)
        hashed_input = hashlib.sha256(data.code.replace("-", "").upper().encode()).hexdigest()
        if hashed_input in codes:
            is_valid = True
            # Consume the code
            codes.remove(hashed_input)
            user.recovery_codes = json.dumps(codes)
            db.commit()
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid verification code")
    
    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Create Session
    token_hash = hashlib.sha256(access_token.encode()).hexdigest()
    new_session = UserSession(
        user_id=user.id,
        token_hash=token_hash,
        device_info="2FA Verified Device", 
        ip_address="127.0.0.1"
    )
    db.add(new_session)
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

@router.get("/check-username")
def check_username(username: str, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_username(db, username=username)
    return {"available": user is None}
