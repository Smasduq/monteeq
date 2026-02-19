from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas import schemas

router = APIRouter()

@router.get("", response_model=List[schemas.Ad])
def get_active_ads(db: Session = Depends(get_db)):
    from app.models.models import SponsoredAd
    return db.query(SponsoredAd).filter(SponsoredAd.is_active == True).all()
