import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.models import User, Video, Post
from app.core.security import get_password_hash

def seed():
    db = SessionLocal()
    try:
        # Create a test user if not exists
        admin_user = db.query(User).filter(User.username == "icedmist").first()
        if not admin_user:
            print("Creating test user: icedmist")
            admin_user = User(
                username="icedmist",
                email="talk2icedmist@gmail.com",
                full_name="Iced Mist",
                hashed_password=get_password_hash("Monteeq2026!"),
                role="admin",
                is_verified=True,
                is_onboarded=True
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        else:
            # Ensure existing test user is verified and onboarded to avoid loops
            admin_user.is_verified = True
            admin_user.is_onboarded = True
            db.commit()
        
        # Create a sample video
        video_count = db.query(Video).count()
        if video_count == 0:
            print("Creating sample video...")
            video = Video(
                title="Cinematic Monteeq Intro",
                description="Experience the future of video platforms.",
                video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                thumbnail_url="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80",
                video_type="home",
                status="approved",
                owner_id=admin_user.id
            )
            db.add(video)
            db.commit()
            
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
