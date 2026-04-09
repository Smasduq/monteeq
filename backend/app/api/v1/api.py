from fastapi import APIRouter
from app.api.v1.endpoints import auth, videos, admin, users, posts, achievements, notifications, ads, chat, challenges, security_ops, monetization, video_views

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
api_router.include_router(security_ops.router, prefix="/security", tags=["security"])
api_router.include_router(monetization.router, prefix="/monetization", tags=["monetization"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(achievements.router, prefix="/achievements", tags=["achievements"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(ads.router, prefix="/ads", tags=["ads"])
api_router.include_router(video_views.router, prefix="/views", tags=["views"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

