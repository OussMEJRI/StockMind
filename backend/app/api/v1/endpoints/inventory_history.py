from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_db, get_current_active_user
from app.models.movement import EquipmentMovement
from app.models.equipment import Equipment
from app.models.user import User
from app.schemas.inventory_history import InventoryHistoryResponse
from app.schemas.equipment import DB_TO_API_STATUS, DB_TO_API_TYPE

router = APIRouter()


def _actor_name(user: Optional[User]) -> Optional[str]:
    if not user:
        return None
    return f"{user.first_name} {user.last_name}".strip()


@router.get("", response_model=List[InventoryHistoryResponse])
def get_inventory_history(
    skip: int = 0,
    limit: int = 200,
    search: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    query = (
        db.query(EquipmentMovement)
        .options(
            joinedload(EquipmentMovement.equipment),
            joinedload(EquipmentMovement.employee),
        )
        .order_by(EquipmentMovement.timestamp.desc())
    )

    if action:
        query = query.filter(EquipmentMovement.action == action)

    if search:
        search_value = f"%{search}%"
        query = (
            query.outerjoin(EquipmentMovement.equipment)
            .outerjoin(EquipmentMovement.employee)
            .filter(
                or_(
                    EquipmentMovement.action.ilike(search_value),
                    EquipmentMovement.notes.ilike(search_value),
                    EquipmentMovement.from_location.ilike(search_value),
                    EquipmentMovement.to_location.ilike(search_value),
                    Equipment.serial_number.ilike(search_value),
                    Equipment.model.ilike(search_value),
                    User.first_name.ilike(search_value),
                    User.last_name.ilike(search_value),
                    User.email.ilike(search_value),
                )
            )
        )

    rows = query.offset(skip).limit(limit).all()

    result: List[InventoryHistoryResponse] = []
    for row in rows:
        equipment = row.equipment
        actor = row.employee

        result.append(
            InventoryHistoryResponse(
                id=row.id,
                equipment_id=row.equipment_id,
                equipment_serial=equipment.serial_number if equipment else None,
                equipment_model=equipment.model if equipment else None,
                equipment_type=DB_TO_API_TYPE.get(equipment.equipment_type, equipment.equipment_type) if equipment else None,
                current_status=DB_TO_API_STATUS.get(equipment.status, equipment.status) if equipment else None,
                action=row.action,
                from_location=row.from_location,
                to_location=row.to_location,
                notes=row.notes,
                timestamp=row.timestamp,
                actor_user_id=row.employee_id,
                actor_name=_actor_name(actor),
                actor_email=actor.email if actor else None,
            )
        )

    return result