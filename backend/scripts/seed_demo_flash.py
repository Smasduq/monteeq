import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Adjust path to import models
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.models.models import Video, User, ApprovalStatus, VideoType
from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

DEMO_VIDEOS = [
    {
        "title": "Elite Football Skills",
        "description": "Unbelievable ball control in the tightest spaces. #football #skills",
        "video_url": "https://player.vimeo.com/external/384738719.sd.mp4?s=38290ef43f65e2524fb72d4ecf97f7e9f3b610c1&profile_id=165",
        "thumbnail_url": "https://images.pexels.com/photos/3074920/pexels-photo-3074920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "tags": "football,football edit,sports",
        "duration": 15
    },
    {
        "title": "Neon City Drift AMV",
        "description": "Synthwave vibes and high-octane anime action. #amv #anime #drift",
        "video_url": "https://player.vimeo.com/external/459389133.sd.mp4?s=1d59663738092f6ceef5d654f59fc93374246ed8&profile_id=165",
        "thumbnail_url": "https://images.pexels.com/photos/1111319/pexels-photo-1111319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "tags": "amv,anime,neon",
        "duration": 12
    },
    {
        "title": "Cyberpunk Gaming Highlights",
        "description": "Pre-fire and precision movements. #gaming #fps #cyberpunk",
        "video_url": "https://player.vimeo.com/external/391054941.sd.mp4?s=d009e4a3ed609f874c76899e9929f6b9076f254b&profile_id=165",
        "thumbnail_url": "https://images.pexels.com/photos/7915234/pexels-photo-7915234.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "tags": "gaming,tactical,fps",
        "duration": 18
    },
    {
        "title": "Tactical CQB Training",
        "description": "Close quarters mastery. High speed, low drag. #tactical #training",
        "video_url": "https://player.vimeo.com/external/517614057.sd.mp4?s=1246c4f9f743c3968603681436573c7f9996d99e&profile_id=165",
        "thumbnail_url": "https://images.pexels.com/photos/4429511/pexels-photo-4429511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "tags": "tactical,training,mil",
        "duration": 20
    },
    {
        "title": "Vintage Anime Aesthetic",
        "description": "Lofi hip hop beats to relax/study to. #anime #lofi #aesthetic",
        "video_url": "https://player.vimeo.com/external/415410118.sd.mp4?s=17f41f021ad2db6a2a07c11b0e071725b827e857&profile_id=165",
        "thumbnail_url": "https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "tags": "anime,lofi,vibes",
        "duration": 25
    }
]

def seed():
    db = SessionLocal()
    try:
        # 1. Create/Get Demo User
        demo_user = db.query(User).filter(User.username == "monteeq_demo").first()
        if not demo_user:
            demo_user = User(
                username="monteeq_demo",
                email="demo@monteeq.com",
                full_name="Monteeq Demo",
                is_verified=True,
                is_onboarded=True,
                profile_pic="https://ui-avatars.com/api/?name=Monteeq+Demo&background=FF3B30&color=fff"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"Created demo user: {demo_user.username}")
        else:
            print(f"Using existing demo user: {demo_user.username}")

        # 2. Add Videos
        for v_data in DEMO_VIDEOS:
            existing = db.query(Video).filter(Video.video_url == v_data["video_url"]).first()
            if not existing:
                video = Video(
                    title=v_data["title"],
                    description=v_data["description"],
                    video_url=v_data["video_url"],
                    thumbnail_url=v_data["thumbnail_url"],
                    video_type=VideoType.FLASH,
                    status=ApprovalStatus.APPROVED,
                    owner_id=demo_user.id,
                    tags=v_data["tags"],
                    duration=v_data["duration"],
                    views=0,
                    likes_count=0,
                    comments_count=0
                )
                db.add(video)
                print(f"Added video: {v_data['title']}")
            else:
                print(f"Video already exists: {v_data['title']}")
        
        db.commit()
        print("Seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
