import logging
from celery import shared_task
from app.db.session import SessionLocal
from app.models.models import User, Challenge
from app.services.email_service import send_challenge_announcement_batch

logger = logging.getLogger(__name__)

@shared_task(name="tasks.email.queue_new_challenge_announcement")
def queue_new_challenge_announcement(challenge_id: int):
    """
    Celery task to fetch eligible users and dispatch challenge announcement
    emails in bulk via Brevo's BCC API to respect privacy.
    """
    db = SessionLocal()
    try:
        challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
        if not challenge:
            logger.error(f"Challenge {challenge_id} not found in DB for email task.")
            return

        # Fetch all users who have opted in to challenge emails
        subscribers = db.query(User).filter(
            User.email_challenges == True,
            User.email.isnot(None) # Remove is_active check if it doesn't exist natively
        ).all()

        if not subscribers:
            logger.info("No opted-in users found. Skipping challenge announcement email.")
            return
            
        emails = [u.email for u in subscribers]
        
        # We process in batches of 50 to satisfy standard BCC limit thresholds
        batch_size = 50
        batches = [emails[i:i + batch_size] for i in range(0, len(emails), batch_size)]
        
        success_count = 0
        end_date_str = challenge.end_date.strftime("%Y-%m-%d") if challenge.end_date else "TBD"
        
        for batch in batches:
            res = send_challenge_announcement_batch(
                bcc_emails=batch,
                title=challenge.title,
                prize=challenge.prize,
                end_date=end_date_str
            )
            if res:
                success_count += len(batch)
                
        logger.info(f"Challenge '{challenge.title}' announcement successfully grouped to {success_count} inboxes.")        
    except Exception as e:
        logger.error(f"Failed executing queue_new_challenge_announcement: {e}")
    finally:
        db.close()

@shared_task(name="tasks.email.queue_new_video_admin_alert")
def queue_new_video_admin_alert(video_id: int):
    """
    Celery task to fetch all admins and dispatch a new video alert email.
    """
    db = SessionLocal()
    try:
        from app.models.models import Video
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            logger.error(f"Video {video_id} not found in DB for admin alert.")
            return

        uploader = db.query(User).filter(User.id == video.owner_id).first()
        uploader_username = uploader.username if uploader else "Unknown"

        admins = db.query(User).filter(
            User.role == "admin",
            User.email.isnot(None)
        ).all()

        if not admins:
            logger.info("No admin users found with email addresses.")
            return
            
        emails = [admin.email for admin in admins]
        
        from app.services.email_service import send_new_video_admin_alert_batch
        res = send_new_video_admin_alert_batch(
            bcc_emails=emails,
            video_title=video.title,
            uploader_username=uploader_username,
            video_id=video.id
        )
        if res:
            logger.info(f"Admin alert for video '{video.title}' successfully sent to {len(emails)} admins.")
    except Exception as e:
        logger.error(f"Failed executing queue_new_video_admin_alert: {e}")
    finally:
        db.close()
