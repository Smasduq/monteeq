import os
import shutil
import time
import requests
import subprocess
import json
from celery import shared_task
from sqlalchemy import func

from app.db.session import SessionLocal
from app.models.models import Video, User
from app.core import config
from app.core.storage import storage
from app.utils.push import notify_user_push
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, name="video_tasks.process_video", max_retries=3)
def process_video_task(self, temp_file_path: str, video_type: str, title: str, video_id: int, thumbnail_provided: bool, task_id: str):
    logger.info(f"Starting Celery task: video_id={video_id}, task_id={task_id}")
    db = SessionLocal()
    try:
        # Phase 1: Communication with Rust Service
            logger.info(f"Phase 1: POST to Rust service at {config.RUST_SERVICE_URL}/process")
            rust_response = requests.post(
                f"{config.RUST_SERVICE_URL}/process",
                json={
                    "video_id": temp_file_path,
                    "target_format": video_type,
                    "skip_thumbnail": thumbnail_provided,
                    "task_id": task_id
                },
                timeout=600.0
            )
            logger.info(f"Rust service accepted task. Starting polling for task_id={task_id}")
            max_retries = 300 # 10 minutes with 2s sleep
            retries = 0
            while retries < max_retries:
                try:
                    status_resp = requests.get(f"{config.RUST_SERVICE_URL}/status/{task_id}")
                    if status_resp.status_code == 200:
                        status_data = status_resp.json()
                        if status_data:
                            current_status = status_data.get("status")
                            logger.debug(f"Task {task_id} status: {current_status} ({status_data.get('progress')}%)")
                            
                            # Update DB status if it changed
                            if current_status == "completed":
                                logger.info(f"Transcoding completed for task_id={task_id}")
                                break
                            if current_status == "error":
                                logger.error(f"Rust processing error for task {task_id}: {status_data.get('message')}")
                                raise Exception(f"Rust processing error: {status_data.get('message')}")
                            
                            # Provide progress update to DB for frontend polling
                            db_video = db.query(Video).filter(Video.id == video_id).first()
                            if db_video:
                                db_video.processing_message = f"Transcoding... {status_data.get('progress')}%"
                                db.commit()
                                
                    elif status_resp.status_code == 404:
                        logger.warning(f"Task {task_id} not found in Rust status map yet.")
                except Exception as e:
                    if "Rust processing error" in str(e):
                        raise e
                    logger.warning(f"Polling error (try {retries}): {e}")
                
                time.sleep(2)
                retries += 1
            
            if retries >= max_retries:
                logger.error(f"Background processing timed out for task {task_id}")
                raise Exception(f"Background processing timed out for task {task_id}")

        except Exception as e:
            print(f"Error in background processing phase: {e}")
            video = db.query(Video).filter(Video.id == video_id).first()
            if video:
                video.status = "failed"
                video.failed_at = func.now()
                owner = db.query(User).filter(User.id == video.owner_id).first()
                if owner:
                    if video.video_type == "flash":
                        owner.flash_uploads = max(0, (owner.flash_uploads or 1) - 1)
                    else:
                        owner.home_uploads = max(0, (owner.home_uploads or 1) - 1)
                db.commit()
            raise self.retry(exc=e, countdown=60)

            # Phase 2: Post-processing (Moving files and updating DB)
            logger.info(f"Phase 2: Starting post-processing for video_id={video_id}")
            clean_title = "".join([c if c.isalnum() else "_" for c in title])
            timestamp = int(os.path.getmtime(temp_file_path))
            base_filename = f"{clean_title}_{timestamp}"
            hls_dir = f"{temp_file_path}_hls"
            video_url = ""
            url_480p = None
            url_720p = None
            url_1080p = None
            url_2k = None
            url_4k = None
            
            # Secure HLS directory discovery
            if os.path.isdir(hls_dir):
                logger.info(f"HLS directory found: {hls_dir}. Starting cloud upload.")
                # Update DB to show upload stage
                db_video = db.query(Video).filter(Video.id == video_id).first()
                if db_video:
                    db_video.processing_message = "Optimizing for streaming..."
                    db.commit()

                for root, _, files in os.walk(hls_dir):
                    for file in files:
                        local_path = os.path.join(root, file)
                        rel_path = os.path.relpath(local_path, hls_dir)
                        s3_key = f"videos/{base_filename}_hls/{rel_path}".replace("\\", "/")
                        
                        try:
                            url = storage.upload_file(local_path, s3_key)
                            if file == "master.m3u8":
                                video_url = url
                            elif file == "480p.m3u8":
                                url_480p = url
                            elif file == "720p.m3u8":
                                url_720p = url
                            elif file == "1080p.m3u8":
                                url_1080p = url
                        except Exception as e:
                            logger.error(f"Error uploading HLS segment {file}: {e}")
            else:
                logger.error(f"Critical Error: HLS directory {hls_dir} not found after processing task {task_id}")
                # If HLS failed but the original file is there, we might fallback or fail
                if os.path.exists(temp_file_path):
                     logger.info(f"Fallback: Original file exists at {temp_file_path}")

            
            temp_thumb_path = f"{temp_file_path}.jpg"
            thumbnail_url = None
            if not thumbnail_provided and os.path.exists(temp_thumb_path):
                s3_key = f"thumbs/{base_filename}.jpg"
                thumbnail_url = storage.upload_file(temp_thumb_path, s3_key)

            duration = 0
            try:
                probe_cmd = [
                    "ffprobe", "-v", "error", "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1", temp_file_path
                ]
                duration_str = subprocess.check_output(probe_cmd).decode('utf-8').strip()
                duration = int(float(duration_str))
            except Exception as e:
                print(f"Failed to get duration: {e}")

            video = db.query(Video).filter(Video.id == video_id).first()
            if video:
                video.video_url = video_url
                video.url_480p = url_480p
                video.url_720p = url_720p
                video.url_1080p = url_1080p
                video.url_2k = url_2k
                video.url_4k = url_4k
                video.duration = duration
                # video.status = "approved"  # Manual Approval Required per user request
                video.failed_at = None 
                
                if thumbnail_url:
                    video.thumbnail_url = thumbnail_url
                
                # Automated Video Recognition
                try:
                    import sys
                    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
                    recognition_script = os.path.join(backend_dir, "..", "video-service", "scripts", "video_recognition.py")
                    
                    if os.path.exists(recognition_script):
                        rec_result = subprocess.run(
                            [sys.executable, recognition_script, temp_file_path],
                            capture_output=True, text=True, timeout=60
                        )
                        if rec_result.returncode == 0:
                            auto_tags = json.loads(rec_result.stdout)
                            if auto_tags:
                                existing_tags = [t.strip() for t in (video.tags or "").split(",") if t.strip()]
                                all_tags = list(set(existing_tags + auto_tags))
                                video.tags = ",".join(all_tags)
                except Exception as e:
                    print(f"Video recognition failed: {e}")

                db.commit()
                return {"status": "success", "video_id": video_id}
        except Exception as e:
            # Notify user of failure
            try:
                 video = db.query(Video).filter(Video.id == video_id).first()
                 if video:
                     notify_user_push(
                         db, 
                         user_id=video.owner_id, 
                         title="Video Processing Failed", 
                         body=f"Something went wrong while processing '{title}'. Please try uploading again.", 
                         link="/upload",
                         n_type="status_change"
                     )
            except: pass
            
            print(f"Error in post-processing: {e}")
            raise e

    finally:
        db.close()
        temp_dir = os.path.dirname(temp_file_path)
        if os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                print(f"Error cleaning up temp dir {temp_dir}: {e}")

@shared_task(name="video_tasks.update_discovery_score")
def update_discovery_score_task(video_id: int = None, post_id: int = None):
    from datetime import datetime
    from app.models.models import Post
    db = SessionLocal()
    try:
        target = None
        if video_id:
            target = db.query(Video).filter(Video.id == video_id).first()
        elif post_id:
            target = db.query(Post).filter(Post.id == post_id).first()
        
        if not target:
            return
            
        likes_count = target.likes_count or 0
        comments_count = target.comments_count or 0
        shares_count = target.shares if video_id else 0
        views_count = target.views if video_id else target.views_count
        
        score = (likes_count * 10) + (comments_count * 20) + (shares_count * 30) + ((views_count or 0) * 1)
        
        if target.last_owner_interaction_at:
            score += 50
            
        age_seconds = (datetime.now() - target.created_at).total_seconds()
        age_hours = max(age_seconds / 3600, 0)
        
        gravity = 1.8
        final_score = score / pow((age_hours + 2), gravity)
        
        target.discovery_score = final_score
        db.commit()
    finally:
        db.close()
