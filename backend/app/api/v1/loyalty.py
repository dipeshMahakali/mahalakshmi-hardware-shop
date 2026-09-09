from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models import LoyaltyAccount, LoyaltyReward, LoyaltyTransaction, User
from app.schemas import LoyaltyAccountResponse, LoyaltyRedeemRequest, LoyaltyRewardResponse

router = APIRouter()


@router.get("/customers/{customer_id}", response_model=LoyaltyAccountResponse)
def get_loyalty_account(customer_id: str, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    acc = db.scalar(select(LoyaltyAccount).where(LoyaltyAccount.customer_id == customer_id))
    if not acc:
        acc = LoyaltyAccount(customer_id=customer_id, tier="BRONZE", points=0, total_earned=0)
        db.add(acc)
        db.commit()
        db.refresh(acc)
    return acc


@router.get("/rewards", response_model=list[LoyaltyRewardResponse])
def list_rewards(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rewards = list(db.scalars(select(LoyaltyReward).where(LoyaltyReward.is_active.is_(True))).all())
    if not rewards:
        # Seed standard rewards if none present
        r1 = LoyaltyReward(title="10% Discount Voucher", points_required=500, description="10% off next purchase up to ₹1,000")
        r2 = LoyaltyReward(title="Free Drill Bit Set", points_required=800, description="High performance 5-piece masonry drill bit set")
        r3 = LoyaltyReward(title="Carpenter Tool Belt", points_required=1500, description="Heavy-duty leather carpenter tool pouch")
        db.add_all([r1, r2, r3])
        db.commit()
        rewards = [r1, r2, r3]
    return rewards


@router.post("/redeem", response_model=dict)
def redeem_reward(payload: LoyaltyRedeemRequest, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    acc = db.scalar(select(LoyaltyAccount).where(LoyaltyAccount.customer_id == payload.customer_id))
    reward = db.get(LoyaltyReward, payload.reward_id)

    if not acc or not reward:
        raise HTTPException(status_code=404, detail="Loyalty account or reward not found")

    if acc.points < reward.points_required:
        raise HTTPException(status_code=400, detail="Insufficient loyalty points balance")

    acc.points -= reward.points_required
    db.add(LoyaltyTransaction(
        account_id=acc.id,
        points=-reward.points_required,
        description=f"Redeemed reward: {reward.title}"
    ))
    db.commit()

    return {"success": True, "message": f"Successfully redeemed '{reward.title}'", "remaining_points": acc.points}

