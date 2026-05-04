from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.deps import get_db, get_current_active_user, require_roles
from app.models.user import User, UserRole
from app.models.equipment import Equipment
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse

router = APIRouter()


@router.get("/my", response_model=List[NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(Notification).filter(
        Notification.recipient_user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    count = db.query(func.count(Notification.id)).filter(
        Notification.recipient_user_id == current_user.id,
        Notification.is_read == False
    ).scalar()

    return {"count": count or 0}


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification introuvable")

    notification.is_read = True
    db.commit()

    return {"message": "Notification marquée comme lue"}


@router.post("/equipment/{equipment_id}/request-delete")
def request_delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.GESTIONNAIRE]))
):
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()

    if not equipment:
        raise HTTPException(status_code=404, detail="Équipement introuvable")

    existing_request = db.query(Notification).filter(
        Notification.equipment_id == equipment_id,
        Notification.sender_user_id == current_user.id,
        Notification.type == "delete_request",
        Notification.status == "pending"
    ).first()

    if existing_request:
        raise HTTPException(
            status_code=400,
            detail="Une demande de suppression est déjà en attente pour cet équipement"
        )

    admins = db.query(User).filter(
        User.role == UserRole.ADMIN,
        User.is_active == True
    ).all()

    if not admins:
        raise HTTPException(status_code=404, detail="Aucun administrateur actif trouvé")

    manager_name = f"{current_user.first_name} {current_user.last_name}"

    for admin in admins:
        notification = Notification(
            recipient_user_id=admin.id,
            sender_user_id=current_user.id,
            equipment_id=equipment.id,
            equipment_serial=equipment.serial_number,
            equipment_model=equipment.model,
            type="delete_request",
            status="pending",
            title="Demande de suppression d'équipement",
            message=(
                f"Le gestionnaire {manager_name} demande la suppression "
                f"de l'équipement {equipment.serial_number} - {equipment.model}."
            )
        )
        db.add(notification)

    db.commit()

    return {"message": "Une notification a été envoyée à l'administrateur pour traiter votre demande."}


@router.put("/{notification_id}/approve-delete")
def approve_delete_request(
    notification_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_user_id == admin_user.id,
        Notification.type == "delete_request",
        Notification.status == "pending"
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Demande introuvable ou déjà traitée")

    equipment = db.query(Equipment).filter(
        Equipment.id == notification.equipment_id
    ).first()

    notification.status = "approved"
    notification.is_read = True
    notification.processed_at = func.now()
    notification.processed_by_user_id = admin_user.id

    if equipment:
        db.delete(equipment)

    response = Notification(
        recipient_user_id=notification.sender_user_id,
        sender_user_id=admin_user.id,
        equipment_id=None,
        equipment_serial=notification.equipment_serial,
        equipment_model=notification.equipment_model,
        type="delete_response",
        status="approved",
        title="Demande de suppression acceptée",
        message=(
            f"L'administrateur a validé votre demande. "
            f"L'équipement {notification.equipment_serial} - {notification.equipment_model} a été supprimé."
        )
    )

    db.add(response)
    db.commit()

    return {"message": "Demande validée. L'équipement a été supprimé."}


@router.put("/{notification_id}/reject-delete")
def reject_delete_request(
    notification_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_user_id == admin_user.id,
        Notification.type == "delete_request",
        Notification.status == "pending"
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Demande introuvable ou déjà traitée")

    notification.status = "rejected"
    notification.is_read = True
    notification.processed_at = func.now()
    notification.processed_by_user_id = admin_user.id

    response = Notification(
        recipient_user_id=notification.sender_user_id,
        sender_user_id=admin_user.id,
        equipment_id=notification.equipment_id,
        equipment_serial=notification.equipment_serial,
        equipment_model=notification.equipment_model,
        type="delete_response",
        status="rejected",
        title="Demande de suppression refusée",
        message=(
            f"L'administrateur a refusé votre demande. "
            f"L'équipement {notification.equipment_serial} - {notification.equipment_model} n'a pas été supprimé."
        )
    )

    db.add(response)
    db.commit()

    return {"message": "Demande refusée. Aucun équipement n'a été supprimé."}