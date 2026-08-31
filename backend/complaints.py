from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Complaint, User
from schemas import ComplaintCreate, ComplaintResponse, ComplaintUpdate
from security import get_current_user
from email_service import send_complaint_email


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


@router.post(
    "/",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED
)
def create_complaint(
    complaint: ComplaintCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("sub")

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    new_complaint = Complaint(
        title=complaint.title,
        description=complaint.description,
        category=complaint.category,
        priority=complaint.priority,
        status="pending",
        location=complaint.location,
        user_id=int(user_id)
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    send_complaint_email(
        recipient_email=user.email,
        complaint_id=new_complaint.id,
        title=new_complaint.title,
        category=new_complaint.category,
        priority=new_complaint.priority,
        description=new_complaint.description
    )


    return new_complaint

@router.get(
    "/",
    response_model=list[ComplaintResponse]
)
def get_my_complaints(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("sub")

    complaints = (
        db.query(Complaint)
        .filter(Complaint.user_id == int(user_id))
        .all()
    )

    return complaints

@router.get(
    "/{complaint_id}",
    response_model=ComplaintResponse
)
def get_complaint(
    complaint_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("sub")

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id,
            Complaint.user_id == int(user_id)
        )
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    return complaint

@router.put(
    "/{complaint_id}",
    response_model=ComplaintResponse
)
def update_complaint(
    complaint_id: int,
    complaint_data: ComplaintUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("sub")

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id,
            Complaint.user_id == int(user_id)
        )
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    complaint.title = complaint_data.title
    complaint.description = complaint_data.description
    complaint.category = complaint_data.category
    complaint.priority = complaint_data.priority

    db.commit()
    db.refresh(complaint)

    return complaint

@router.delete(
    "/{complaint_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_complaint(
    complaint_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("sub")

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id,
            Complaint.user_id == int(user_id)
        )
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    db.delete(complaint)
    db.commit()

    return None