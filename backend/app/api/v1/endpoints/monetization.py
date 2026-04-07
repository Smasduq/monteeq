from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime

from app.db.session import get_db
from app.schemas import schemas
from app.core.dependencies import get_current_user
from app.models.models import User, Wallet, Transaction, Subscription, PayoutRequest
from app.crud.monetization import get_or_create_wallet, process_tip

router = APIRouter()

@router.get("/wallet", response_model=schemas.Wallet)
def get_creator_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch the authenticated user's wallet and transaction history."""
    return get_or_create_wallet(db, current_user.id)

@router.post("/tip/{user_id}", response_model=schemas.Transaction)
def send_tip(
    user_id: int,
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a direct tip to a creator."""
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Tip amount must be positive.")
    creator = db.query(User).filter(User.id == user_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return process_tip(db, from_user_id=current_user.id, to_user_id=creator.id, amount=amount)

@router.post("/subscribe/{user_id}", response_model=schemas.Subscription)
def subscribe_to_creator(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Subscribe to a creator for exclusive home/flash videos."""
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot subscribe to yourself")
    creator = db.query(User).filter(User.id == user_id).first()
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    existing = db.query(Subscription).filter(
        Subscription.subscriber_id == current_user.id,
        Subscription.creator_id == creator.id,
        Subscription.status == 'active'
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already subscribed")

    from dateutil.relativedelta import relativedelta
    sub = Subscription(
        subscriber_id=current_user.id,
        creator_id=creator.id,
        monthly_price=5000.00,
        next_billing_date=datetime.datetime.now() + relativedelta(months=1)
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

# ------------------------------------------------------------------ #
#  PAYOUT REQUEST ENDPOINTS
# ------------------------------------------------------------------ #

@router.post("/payout/request", response_model=schemas.PayoutRequestSchema)
def request_payout(
    payload: schemas.PayoutRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creator requests a payout from their wallet.
    Minimum payout: ₦1,000. Funds stay frozen until admin marks as completed.
    """
    wallet = get_or_create_wallet(db, current_user.id)
    balance = float(wallet.balance)

    MIN_PAYOUT = 1000.0
    if payload.amount < MIN_PAYOUT:
        raise HTTPException(status_code=400, detail=f"Minimum payout is ₦{MIN_PAYOUT:,.2f}")
    if payload.amount > balance:
        raise HTTPException(status_code=400, detail=f"Insufficient balance. Your balance is ₦{balance:,.2f}")

    # Block duplicate pending requests
    existing_pending = db.query(PayoutRequest).filter(
        PayoutRequest.user_id == current_user.id,
        PayoutRequest.status == "pending"
    ).first()
    if existing_pending:
        raise HTTPException(status_code=400, detail="You already have a pending payout request. Please wait for it to be processed.")

    payout = PayoutRequest(
        user_id=current_user.id,
        wallet_id=wallet.id,
        amount=payload.amount,
        bank_details=payload.bank_details,
        status="pending"
    )

    # Deduct from wallet immediately (held in escrow until approved)
    from decimal import Decimal
    wallet.balance -= Decimal(str(payload.amount))

    db.add(payout)
    db.commit()
    db.refresh(payout)
    return payout

@router.get("/payout/my-requests", response_model=List[schemas.PayoutRequestSchema])
def get_my_payout_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List the authenticated user's payout history."""
    return db.query(PayoutRequest).filter(
        PayoutRequest.user_id == current_user.id
    ).order_by(PayoutRequest.requested_at.desc()).all()

# ------------------------------------------------------------------ #
#  ADMIN-ONLY PAYOUT MANAGEMENT
# ------------------------------------------------------------------ #

def _require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

@router.get("/admin/payouts", response_model=List[schemas.PayoutRequestSchema])
def admin_list_payouts(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin: list all payout requests, optionally filtered by status."""
    _require_admin(current_user)
    q = db.query(PayoutRequest)
    if status:
        q = q.filter(PayoutRequest.status == status)
    return q.order_by(PayoutRequest.requested_at.desc()).all()

@router.put("/admin/payouts/{payout_id}", response_model=schemas.PayoutRequestSchema)
def admin_update_payout(
    payout_id: int,
    status: str,
    admin_note: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin: approve, reject, or mark a payout as completed."""
    _require_admin(current_user)
    payout = db.query(PayoutRequest).filter(PayoutRequest.id == payout_id).first()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout request not found")

    valid_statuses = {"pending", "processing", "completed", "rejected"}
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")

    # If rejected, refund the escrowed amount back to wallet
    if status == "rejected" and payout.status != "rejected":
        wallet = db.query(Wallet).filter(Wallet.id == payout.wallet_id).first()
        if wallet:
            from decimal import Decimal
            wallet.balance += Decimal(str(payout.amount))

    payout.status = status
    payout.admin_note = admin_note
    payout.processed_at = datetime.datetime.now()
    db.commit()
    db.refresh(payout)
    return payout
