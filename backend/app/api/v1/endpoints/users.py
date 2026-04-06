from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
import shutil
import os

from app.db.session import get_db
from app.crud import user as crud_user
from app.schemas import schemas
from app.core.dependencies import get_current_user, get_current_user_optional
from app.core import config
from app.core.storage import storage
from app.models.models import User, Video, Like, Follow

router = APIRouter()

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserUpdateResponse)
def update_user_me(
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    # Check if username is taken if changing
    if user_in.username and user_in.username != current_user.username:
        existing_user = crud_user.get_user_by_username(db, username=user_in.username)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username already registered"
            )
    
    updated_user = crud_user.update_user(db, user_id=current_user.id, user_update=user_in)
    
    # If username changed, generate new token
    access_token = None
    if user_in.username and user_in.username != current_user.username:
        from app.core.security import create_access_token
        from datetime import timedelta
        
        access_token_expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_in.username}, expires_delta=access_token_expires
        )
        
    return {"user": updated_user, "access_token": access_token}
    
@router.put("/me/password")
def update_user_password(
    passwords: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    success = crud_user.update_password(db, user_id=current_user.id, passwords=passwords)
    if success is None:
        raise HTTPException(status_code=404, detail="User not found")
    if success is False:
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    return {"message": "Password updated successfully"}

@router.get("/profile/{username}", response_model=schemas.UserProfile)
def get_profile(
    username: str, 
    db: Session = Depends(get_db),
    current_user: Optional[schemas.User] = Depends(get_current_user_optional)
):
    current_user_id = current_user.id if current_user else None
    profile = crud_user.get_user_profile(db, username=username, current_user_id=current_user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.post("/follow/{user_id}")
def follow_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    is_following = crud_user.toggle_follow(db, follower_id=current_user.id, followed_id=user_id)
    return {"is_following": is_following}

@router.get("/search", response_model=schemas.UnifiedSearchResponse)
def search_unified(
    q: str = "", 
    db: Session = Depends(get_db)
):
    if not q:
        return {"videos": [], "users": []}
    
    # Search for users
    users = db.query(User).filter(
        or_(
            User.username.ilike(f"%{q}%"),
            User.full_name.ilike(f"%{q}%")
        )
    ).limit(10).all()
    
    from app.crud import video as crud_video
    videos = crud_video.search_videos(db, query_str=q)
    posts = crud_video.search_posts(db, query_str=q)
    
    return {"videos": videos, "users": users, "posts": posts}

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    from uuid import uuid4
    
    file_ext = file.filename.split(".")[-1]
    file_name = f"profiles/{uuid4()}.{file_ext}"
    
    avatar_url = None

    # Create a temporary local path to save the uploaded file before offloading to S3/B2
    import tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_ext}") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Storage Abstraction (Local or S3/B2)
        s3_key = f"profiles/{uuid4()}.{file_ext}"
        avatar_url = storage.upload_file(tmp_path, s3_key)
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    if not avatar_url:
        raise HTTPException(status_code=500, detail="Failed to upload image")
    
    # Update user in DB
    current_user.profile_pic = avatar_url
    db.commit()
    db.refresh(current_user)
    
    return {"profile_pic": avatar_url}

@router.get("/me/insights", response_model=schemas.UserInsights)
def get_user_insights(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    user_id = current_user.id
    from app.models.models import Achievement
    
    # Total Views
    total_views = db.query(func.sum(Video.views)).filter(Video.owner_id == user_id).scalar() or 0
    
    # Total Likes - Count likes on videos owned by user
    total_likes = db.query(func.count(Like.user_id)).join(Video).filter(Video.owner_id == user_id).scalar() or 0
    
    # Total Earnings
    total_earnings = db.query(func.sum(Video.earnings)).filter(Video.owner_id == user_id).scalar() or 0.0
    
    # Total Shares
    total_shares = db.query(func.sum(Video.shares)).filter(Video.owner_id == user_id).scalar() or 0
    
    # Video counts
    home_count = db.query(func.count(Video.id)).filter(Video.owner_id == user_id, Video.video_type == "home").scalar() or 0
    flash_count = db.query(func.count(Video.id)).filter(Video.owner_id == user_id, Video.video_type == "flash").scalar() or 0
    
    # Post count
    from app.models.models import Post
    posts_count = db.query(func.count(Post.id)).filter(Post.owner_id == user_id, Post.is_active == True).scalar() or 0
    
    # Followers/Following
    followers_count = db.query(func.count(Follow.follower_id)).filter(Follow.followed_id == user_id).scalar() or 0
    following_count = db.query(func.count(Follow.followed_id)).filter(Follow.follower_id == user_id).scalar() or 0
    
    # Milestone Logic
    milestones = [100, 500, 1000, 5000, 10000, 50000, 100000]
    next_milestone = next((m for m in milestones if m > total_views), milestones[-1] * 2)
    
    # Check for newly reached milestones
    existing_achievements = db.query(Achievement).filter(Achievement.user_id == user_id).all()
    achieved_names = {a.milestone_name for a in existing_achievements}
    
    from app.crud import achievement as crud_achievement
    new_milestone_reached = None
    for m in milestones:
        m_name = f"{m}_VIEWS"
        if total_views >= m and m_name not in achieved_names:
            crud_achievement.create_achievement(db, user_id=user_id, milestone_name=m_name)
            new_milestone_reached = m_name
            achieved_names.add(m_name)
    
    # Reload achievements to include any newly created ones
    existing_achievements = db.query(Achievement).filter(Achievement.user_id == user_id).all()
    
    return {
        "total_views": total_views,
        "total_likes": total_likes,
        "total_earnings": total_earnings,
        "total_shares": total_shares,
        "home_videos": home_count,
        "flash_videos": flash_count,
        "posts_count": posts_count,
        "followers": followers_count,
        "following": following_count,
        "next_milestone": next_milestone,
        "new_milestone_reached": new_milestone_reached,
        "achievements": [a.milestone_name for a in existing_achievements]
    }

@router.get("/me/performance", response_model=schemas.UserPerformance)
def get_user_performance(
    metric: str = "views",
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    from datetime import datetime, timedelta
    from app.models.models import View, Like, Follow, Video
    
    user_id = current_user.id
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days-1)
    
    # Initialize daily data
    daily_stats = {}
    for i in range(days):
        d = (start_date + timedelta(days=i)).isoformat()
        daily_stats[d] = {"views": 0, "likes": 0, "followers": 0, "earnings": 0.0}
    
    # Aggregate Views
    views_query = db.query(
        func.date(View.created_at).label("date"),
        func.count(View.id).label("count")
    ).join(Video).filter(
        Video.owner_id == user_id,
        View.created_at >= start_date
    ).group_by(func.date(View.created_at)).all()
    
    for v in views_query:
        d_str = v.date
        if d_str in daily_stats:
            daily_stats[d_str]["views"] = v.count
            # Simple earnings logic: $0.01 per view
            daily_stats[d_str]["earnings"] = v.count * 0.01

    # Aggregate Likes
    likes_query = db.query(
        func.date(Like.created_at).label("date"),
        func.count(Like.id).label("count")
    ).join(Video).filter(
        Video.owner_id == user_id,
        Like.created_at >= start_date
    ).group_by(func.date(Like.created_at)).all()
    
    for l in likes_query:
        d_str = l.date
        if d_str in daily_stats:
            daily_stats[d_str]["likes"] = l.count

    # Aggregate Followers
    follows_query = db.query(
        func.date(Follow.created_at).label("date"),
        func.count(Follow.follower_id).label("count")
    ).filter(
        Follow.followed_id == user_id,
        Follow.created_at >= start_date
    ).group_by(func.date(Follow.created_at)).all()
    
    for f in follows_query:
        d_str = f.date
        if d_str in daily_stats:
            daily_stats[d_str]["followers"] = f.count

    # Convert to list of PerformanceDataPoint
    performance_data = []
    for d_str in sorted(daily_stats.keys()):
        performance_data.append(schemas.PerformanceDataPoint(
            date=d_str,
            views=daily_stats[d_str]["views"],
            likes=daily_stats[d_str]["likes"],
            followers=daily_stats[d_str]["followers"],
            earnings=daily_stats[d_str]["earnings"]
        ))
    
    return {"data": performance_data, "metric": metric}

@router.put("/me/onboarding", response_model=schemas.User)
def update_onboarding(
    onboarding_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure it only updates relevant fields and sets is_onboarded
    onboarding_data.is_onboarded = True
    updated_user = crud_user.update_user(db, user_id=current_user.id, user_update=onboarding_data)
    return updated_user

@router.get("/{username}/followers", response_model=List[schemas.User])
def get_user_followers(
    username: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    user = crud_user.get_user_by_username(db, username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud_user.get_followers(db, user_id=user.id, skip=skip, limit=limit)

@router.get("/{username}/following", response_model=List[schemas.User])
def get_user_following(
    username: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    user = crud_user.get_user_by_username(db, username=username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud_user.get_following(db, user_id=user.id, skip=skip, limit=limit)


