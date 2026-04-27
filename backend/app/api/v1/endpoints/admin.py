from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.schemas import schemas
from app.core.dependencies import admin_only
from app.core import security, config
from app.crud import user as crud_user, setting as crud_setting
from app.models.models import User, Video, View, Challenge, ChallengeEntry, Transaction, PayoutRequest
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from typing import List
from sqlalchemy import cast, Date
from app.tasks.email_tasks import queue_new_challenge_announcement

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
async def login_for_admin_access_token(
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
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Admin privileges required",
        )

    access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users", response_model=List[schemas.User])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/stats")
def read_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    user_count = db.query(func.count(User.id)).scalar() or 0
    video_count = db.query(func.count(Video.id)).scalar() or 0
    premium_count = db.query(func.count(User.id)).filter(User.is_premium == True).scalar() or 0
    
    # Sum views
    total_views_sum = db.query(func.sum(Video.views)).scalar() or 0

    # Total Revenue (Subscriptions)
    total_rev = db.query(func.sum(Transaction.amount)).filter(Transaction.transaction_type == 'pro_subscription').scalar() or 0
    
    # Pending Payouts (Liabilities)
    pending_payouts_sum = db.query(func.sum(PayoutRequest.amount)).filter(PayoutRequest.status == 'pending').scalar() or 0

    return {
        "users": user_count,
        "videos": video_count,
        "premium_users": premium_count,
        "total_views": total_views_sum,
        "total_revenue": float(total_rev),
        "pending_payouts": float(pending_payouts_sum)
    }

@router.post("/promote/{user_id}")
def promote_user(
    user_id: int,
    is_premium: bool = True,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    user = crud_user.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_premium = is_premium
    db.commit()
    db.refresh(user)
    
    return {"message": f"User {user.username} premium status set to {is_premium}"}

@router.get("/settings/storage-mode")
def get_storage_mode(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    mode = crud_setting.get_setting(db, "storage_mode")
    return {"mode": mode or config.STORAGE_MODE}

@router.put("/settings/storage-mode")
def update_storage_mode(
    mode: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    if mode not in ["gcs", "local"]:
        raise HTTPException(status_code=400, detail="Invalid storage mode")
    
    crud_setting.update_setting(db, "storage_mode", mode)
    return {"message": f"Storage mode updated to {mode}", "mode": mode}

@router.get("/stats/performance")
def get_performance_stats(
    metric: str,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    if metric == "users":
        query = db.query(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("value")
        ).filter(User.created_at >= start_date)
    elif metric == "videos":
        query = db.query(
            func.date(Video.created_at).label("date"),
            func.count(Video.id).label("value")
        ).filter(Video.created_at >= start_date)
    elif metric == "premium":
        query = db.query(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("value")
        ).filter(User.created_at >= start_date, User.is_premium == True)
    elif metric == "views":
        query = db.query(
            func.date(View.created_at).label("date"),
            func.count(View.id).label("value")
        ).filter(View.created_at >= start_date)
    elif metric == "revenue":
        query = db.query(
            func.date(Transaction.created_at).label("date"),
            func.sum(Transaction.amount).label("value")
        ).filter(
            Transaction.created_at >= start_date,
            Transaction.transaction_type == 'pro_subscription'
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid metric")

    results = query.group_by("date").order_by("date").all()
    
    return [{"date": str(r.date), "value": float(r.value or 0)} for r in results]

@router.get("/config")
def get_admin_config(
    current_user: dict = Depends(admin_only)
):
    return {
        "rust_service_url": config.RUST_SERVICE_URL
    }

# Challenges Management

@router.get("/challenges", response_model=List[schemas.Challenge])
def read_challenges(
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    return db.query(Challenge).order_by(Challenge.created_at.desc()).all()

@router.post("/challenges", response_model=schemas.Challenge)
def create_challenge(
    challenge_in: schemas.ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    db_challenge = Challenge(**challenge_in.model_dump())
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    
    # Dispatch Celery background task for email broadcasting
    queue_new_challenge_announcement.delay(db_challenge.id)
    
    return db_challenge

@router.put("/challenges/{challenge_id}", response_model=schemas.Challenge)
def update_challenge(
    challenge_id: int,
    challenge_in: schemas.ChallengeBase, # using base for partial update logic if desired or complete update
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    db_challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not db_challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    update_data = challenge_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_challenge, key, value)
    
    db.commit()
    db.refresh(db_challenge)
    return db_challenge

@router.delete("/challenges/{challenge_id}")
def delete_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(admin_only)
):
    db_challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not db_challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    db.delete(db_challenge)
    db.commit()
    return {"message": "Challenge deleted successfully"}
