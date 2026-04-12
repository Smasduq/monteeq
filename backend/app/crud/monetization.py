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
    video.earnings = (video.earnings or 0.0) + float(amount)
    db.add(transaction)
    db.add(video)
    db.commit()
    db.refresh(transaction)
    return transaction

def process_tip(db: Session, from_user_id: int, to_user_id: int, amount: float) -> Transaction:
    dec_amount = Decimal(str(amount))
    
    sender_wallet = get_or_create_wallet(db, from_user_id)
    receiver_wallet = get_or_create_wallet(db, to_user_id)

    if sender_wallet.balance < dec_amount:
        return None # Should be handled by API check, but good for safety

    # 1. Debit Sender
    sender_wallet.balance -= dec_amount
    sender_tx = Transaction(
        wallet_id=sender_wallet.id,
        amount=-dec_amount,
        transaction_type='tip_sent',
        reference_id=f"user_{to_user_id}",
        description=f"Tip sent to user {to_user_id}"
    )
    db.add(sender_tx)

    # 2. Credit Recipient
    receiver_wallet.balance += dec_amount
    receiver_tx = Transaction(
        wallet_id=receiver_wallet.id,
        amount=dec_amount,
        transaction_type='tip_received',
        reference_id=f"user_{from_user_id}",
        description=f"Tip received from user {from_user_id}"
    )
    db.add(receiver_tx)
    db.add(sender_wallet)
    db.add(receiver_wallet)
    
    db.commit()
    db.refresh(sender_wallet)
    db.refresh(receiver_wallet)
    db.refresh(receiver_tx)
    return receiver_tx

def verify_deposit(db: Session, user_id: int, amount: float, reference: str) -> Transaction:
    dec_amount = Decimal(str(amount))
    wallet = get_or_create_wallet(db, user_id)
    
    # Check for existing reference to prevent double funding
    existing = db.query(Transaction).filter(Transaction.reference_id == reference).first()
    if existing:
        return existing

    transaction = Transaction(
        wallet_id=wallet.id,
        amount=dec_amount,
        transaction_type='deposit',
        reference_id=reference,
        description="Wallet Top-up via Paystack"
    )
    
    wallet.balance += dec_amount
    db.add(transaction)
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    db.refresh(transaction)
    return transaction
