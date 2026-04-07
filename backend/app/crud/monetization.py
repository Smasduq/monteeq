from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.models import Wallet, Transaction, User, Video

def get_or_create_wallet(db: Session, user_id: int) -> Wallet:
    wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
    if not wallet:
        wallet = Wallet(user_id=user_id, balance=Decimal('0.00'))
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet

def calculate_view_earnings(views: int) -> Decimal:
    """Fixed earning rate: ₦99.00 for every 1000 views"""
    return Decimal('99.00')

def credit_view_milestone(db: Session, video_id: int) -> Transaction:
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video or not video.owner_id:
        return None
        
    wallet = get_or_create_wallet(db, video.owner_id)
    amount = calculate_view_earnings(video.views)
    
    # Ensure idempotency: checking if we already paid for this exact milestone.
    # Note: reference_id format 'video_ID_VIEWS'
    ref_id = f"video_{video.id}_{video.views}"
    existing = db.query(Transaction).filter(Transaction.reference_id == ref_id).first()
    if existing:
        return existing
    
    transaction = Transaction(
        wallet_id=wallet.id,
        amount=amount,
        transaction_type='view_milestone',
        reference_id=ref_id,
        description=f"Earnings for reaching {video.views} views."
    )
    
    wallet.balance += amount
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

def process_tip(db: Session, from_user_id: int, to_user_id: int, amount: float, reference: str = None) -> Transaction:
    dec_amount = Decimal(str(amount))
    
    wallet = get_or_create_wallet(db, to_user_id)
    
    transaction = Transaction(
        wallet_id=wallet.id,
        amount=dec_amount,
        transaction_type='tip',
        reference_id=reference or f"user_{from_user_id}",
        description=f"Tip received"
    )
    
    wallet.balance += dec_amount
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction
