from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Challenge, ChallengeEntry, Video
from datetime import datetime

def resolve_expired_challenges(db: Session):
    """
    Finds challenges that have reached their end_date but haven't had a winner picked.
    Selects the entry with the highest view count as the winner.
    """
    now = datetime.now()
    
    # 1. Find expired challenges without winners
    expired_challenges = db.query(Challenge).filter(
        Challenge.end_date <= now,
        Challenge.winner_picked == False
    ).all()
    
    for challenge in expired_challenges:
        # 2. Find the entry with the highest view count
        # Join ChallengeEntry with Video to get view counts
        winner_entry = db.query(ChallengeEntry).join(Video).filter(
            ChallengeEntry.challenge_id == challenge.id
        ).order_by(Video.views.desc()).first()
        
        if winner_entry:
            # 3. Mark as winner
            winner_entry.is_winner = True
            challenge.winner_picked = True
            
            # Optional: Notify the user they won (can integrate notification service here)
            
            db.commit()
            db.refresh(winner_entry)
            db.refresh(challenge)
            
    return len(expired_challenges)
