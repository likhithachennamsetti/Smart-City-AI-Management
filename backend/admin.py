from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Complaint, User
from schemas import ComplaintResponse, ComplaintStatusUpdate
from security import require_admin
from email_service import send_status_update_email


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get(
    "/complaints",
    response_model=list[ComplaintResponse]
)
def get_all_complaints(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    complaints = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return complaints


@router.put(
    "/complaints/{complaint_id}/status",
    response_model=ComplaintResponse
)
def update_complaint_status(
    complaint_id: int,
    status_data: ComplaintStatusUpdate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    allowed_statuses = [
        "pending",
        "in_progress",
        "resolved"
    ]

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )

    # Find complaint owner
    user = (
        db.query(User)
        .filter(User.id == complaint.user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint owner not found"
        )

    # Update complaint status
    complaint.status = status_data.status

    db.commit()
    db.refresh(complaint)

    # Send status notification email
    send_status_update_email(
        recipient_email=user.email,
        complaint_id=complaint.id,
        title=complaint.title,
        new_status=complaint.status
    )

    return complaint
# =========================================================
# GET ALL USERS - ADMIN ONLY
# =========================================================

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):

    users = db.query(User).order_by(User.id.asc()).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "created_at": user.created_at
        }
        for user in users
    ]