import os
import sys
import boto3
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Add backend to sys path
sys.path.append(os.getcwd())

from app.core import config
from app.core.storage import storage
from app.db.session import SessionLocal
from app.models.models import Video, User

def migrate_to_b2():
    if config.STORAGE_MODE != "s3":
        print("Error: STORAGE_MODE is not set to 's3' in .env. Please update it first.")
        return

    db = SessionLocal()
    
    # 1. Migrate Profiles (Users)
    print("Migrating User Profile Pictures...")
    users = db.query(User).filter(User.profile_pic.like(f"{config.BASE_URL}/static/profiles/%")).all()
    print(f"Found {len(users)} profile pictures to migrate.")
    for user in users:
        relative_path = user.profile_pic.replace(f"{config.BASE_URL}/static/", "")
        local_path = os.path.join(config.STATIC_DIR, relative_path.replace("/", os.sep))
        
        if os.path.exists(local_path):
            print(f"  Uploading {relative_path}...")
            new_url = storage.upload_file(local_path, relative_path)
            user.profile_pic = new_url
            db.commit()
            print(f"  Updated: {new_url}")
        else:
            print(f"  Warning: Local file not found: {local_path}")

    # 2. Migrate Videos
    print("\nMigrating Videos and Thumbnails...")
    videos = db.query(Video).all()
    for vid in videos:
        # Check all possible URLs
        urls_to_check = [
            ('video_url', vid.video_url),
            ('url_480p', vid.url_480p),
            ('url_720p', vid.url_720p),
            ('url_1080p', vid.url_1080p),
            ('url_2k', vid.url_2k),
            ('url_4k', vid.url_4k),
            ('thumbnail_url', vid.thumbnail_url)
        ]
        
        updated = False
        for attr, url in urls_to_check:
            if url and url.startswith(f"{config.BASE_URL}/static/"):
                relative_path = url.replace(f"{config.BASE_URL}/static/", "")
                local_path = os.path.join(config.STATIC_DIR, relative_path.replace("/", os.sep))
                
                if os.path.exists(local_path):
                    print(f"  Uploading {relative_path}...")
                    new_url = storage.upload_file(local_path, relative_path)
                    setattr(vid, attr, new_url)
                    updated = True
                else:
                    print(f"  Warning: Local file not found: {local_path}")
        
        if updated:
            db.commit()
            print(f"  Updated video ID {vid.id}")

    db.close()
    print("\nMigration to Backblaze B2 complete.")

if __name__ == "__main__":
    # Check if we should dry-run or actual run
    migrate_to_b2()
