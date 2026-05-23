from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user, require_roles
from app.models.user import User, UserRole
from app.models.equipment import Equipment as EquipmentModel
from app.models.employee import Employee
from app.models.emplacements import Emplacement
from app.models.movement import EquipmentMovement
from app.models.employee_equipment_history import EmployeeEquipmentHistory
from app.schemas.equipment import EquipmentResponse, EquipmentCreate, EquipmentUpdate

router = APIRouter()

TYPE_MAP = {
    "pc": "PC",
    "laptop": "LAPTOP",
    "monitor": "MONITOR",
    "phone": "PHONE",
    "printer": "ACCESSORY",
    "other": "ACCESSORY",
    "accessory": "ACCESSORY",
    "PC": "PC",
    "LAPTOP": "LAPTOP",
    "MONITOR": "MONITOR",
    "PHONE": "PHONE",
    "ACCESSORY": "ACCESSORY",
}

STATUS_MAP = {
    "in_stock": "IN_STOCK",
    "assigned": "ASSIGNED",
    "maintenance": "MAINTENANCE",
    "stolen": "STOLEN",
    "retired": "STOLEN",
    "IN_STOCK": "IN_STOCK",
    "ASSIGNED": "ASSIGNED",
    "MAINTENANCE": "MAINTENANCE",
    "STOLEN": "STOLEN",
    "RETIRED": "STOLEN",
}

CONDITION_MAP = {
    "new": "NEW",
    "good": "USED",
    "fair": "USED",
    "poor": "OUT_OF_SERVICE",
    "used": "USED",
    "out_of_service": "OUT_OF_SERVICE",
    "NEW": "NEW",
    "USED": "USED",
    "OUT_OF_SERVICE": "OUT_OF_SERVICE",
}


def _display_status(value: Optional[str]) -> Optional[str]:
    mapping = {
        "IN_STOCK": "En stock",
        "ASSIGNED": "Assigné",
        "MAINTENANCE": "En maintenance",
        "STOLEN": "Volé",
        "RETIRED": "Volé",
    }
    if value is None:
        return None
    return mapping.get(value, value)


def _format_emplacement(emplacement: Optional[Emplacement]) -> Optional[str]:
    if not emplacement:
        return None
    return f"{emplacement.site} / {emplacement.etage} / {emplacement.rosace}"


def _format_assignment_label(
    db: Session,
    employee_id: Optional[int],
    emplacement_id: Optional[int],
) -> Optional[str]:
    if employee_id:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if employee:
            return f"Employé: {employee.name}"
        return f"Employé ID {employee_id}"

    if emplacement_id:
        emplacement = db.query(Emplacement).filter(Emplacement.id == emplacement_id).first()
        if emplacement:
            return f"Emplacement: {_format_emplacement(emplacement)}"
        return f"Emplacement ID {emplacement_id}"

    return None


def _add_movement(
    db: Session,
    *,
    equipment_id: int,
    actor_user_id: int,
    action: str,
    from_location: Optional[str] = None,
    to_location: Optional[str] = None,
    notes: Optional[str] = None,
) -> None:
    movement = EquipmentMovement(
        equipment_id=equipment_id,
        employee_id=actor_user_id,
        action=action,
        from_location=from_location,
        to_location=to_location,
        notes=notes,
        timestamp=datetime.utcnow(),
    )
    db.add(movement)


def _close_open_employee_history(
    db: Session,
    *,
    equipment_id: int,
    employee_id: Optional[int],
    notes: Optional[str] = None,
) -> None:
    if not employee_id:
        return

    history = (
        db.query(EmployeeEquipmentHistory)
        .filter(
            EmployeeEquipmentHistory.equipment_id == equipment_id,
            EmployeeEquipmentHistory.employee_id == employee_id,
            EmployeeEquipmentHistory.returned_at.is_(None),
        )
        .order_by(EmployeeEquipmentHistory.assigned_at.desc())
        .first()
    )

    if history:
        history.returned_at = datetime.utcnow()
        if notes and not history.notes:
            history.notes = notes


def _open_employee_history(
    db: Session,
    *,
    equipment_id: int,
    employee_id: Optional[int],
    notes: Optional[str] = None,
) -> None:
    if not employee_id:
        return

    existing_open = (
        db.query(EmployeeEquipmentHistory)
        .filter(
            EmployeeEquipmentHistory.equipment_id == equipment_id,
            EmployeeEquipmentHistory.employee_id == employee_id,
            EmployeeEquipmentHistory.returned_at.is_(None),
        )
        .first()
    )

    if existing_open:
        return

    db.add(
        EmployeeEquipmentHistory(
            equipment_id=equipment_id,
            employee_id=employee_id,
            assigned_at=datetime.utcnow(),
            notes=notes,
        )
    )


@router.get("", response_model=List[EquipmentResponse])
def get_equipment(
    skip: int = 0,
    limit: int = 100,
    equipment_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user),
):
    query = db.query(EquipmentModel)

    if equipment_type:
        query = query.filter(EquipmentModel.equipment_type == TYPE_MAP.get(equipment_type, equipment_type))
    if status:
        query = query.filter(EquipmentModel.status == STATUS_MAP.get(status, status))
    if condition:
        query = query.filter(EquipmentModel.condition == CONDITION_MAP.get(condition, condition))
    if search:
        query = query.filter(EquipmentModel.serial_number.ilike(f"%{search}%"))

    return query.offset(skip).limit(limit).all()


@router.post("", response_model=EquipmentResponse, status_code=201)
def create_equipment(
    equipment: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing = db.query(EquipmentModel).filter(
        EquipmentModel.serial_number == equipment.serial_number
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Serial number already exists")

    if equipment.status == "STOLEN":
        raise HTTPException(
            status_code=400,
            detail="Un équipement ne peut pas être créé directement avec le statut Volé",
        )

    db_eq = EquipmentModel(**equipment.dict())
    db.add(db_eq)
    db.flush()

    assignment_label = _format_assignment_label(
        db,
        db_eq.employee_id,
        db_eq.emplacement_id,
    )

    _add_movement(
        db,
        equipment_id=db_eq.id,
        actor_user_id=current_user.id,
        action="created",
        from_location=None,
        to_location=assignment_label,
        notes=f"Création de l'équipement avec statut {_display_status(db_eq.status)}",
    )

    if db_eq.employee_id:
        _open_employee_history(
            db,
            equipment_id=db_eq.id,
            employee_id=db_eq.employee_id,
            notes="Affectation initiale lors de la création",
        )

    db.commit()
    db.refresh(db_eq)
    return db_eq


@router.get("/nb_pcs/online")
def get_nb_pcs_online(
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user),
):
    nb = (
        db.query(func.count(EquipmentModel.id))
        .filter(
            EquipmentModel.equipment_type.in_(["LAPTOP"]),
            EquipmentModel.status == "ASSIGNED",
        )
        .scalar()
    )
    return {"nb_pcs": nb or 0}


@router.get("/by-serial/{serial_number}", response_model=EquipmentResponse)
def get_equipment_by_serial(
    serial_number: str,
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user),
):
    eq = db.query(EquipmentModel).filter(EquipmentModel.serial_number == serial_number).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return eq


@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment_by_id(
    equipment_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user),
):
    eq = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return eq


@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    equipment: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db_eq = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Equipment not found")

    payload = equipment.dict(exclude_unset=True)

    before_status = db_eq.status
    before_condition = db_eq.condition
    before_model = db_eq.model
    before_serial = db_eq.serial_number
    before_employee_id = db_eq.employee_id
    before_emplacement_id = db_eq.emplacement_id
    before_assignment_label = _format_assignment_label(db, before_employee_id, before_emplacement_id)

    target_type = payload.get("equipment_type", db_eq.equipment_type)
    is_laptop = str(target_type).upper() == "LAPTOP"

    requested_status = payload.get("status", db_eq.status)

    current_employee_id = payload["employee_id"] if "employee_id" in payload else db_eq.employee_id
    current_emplacement_id = payload["emplacement_id"] if "emplacement_id" in payload else db_eq.emplacement_id
    has_assignment = bool(current_employee_id or current_emplacement_id)

    if requested_status == "STOLEN" and not has_assignment:
        raise HTTPException(
            status_code=400,
            detail="Un équipement ne peut être marqué Volé que s'il est déjà affecté",
        )

    if requested_status == "ASSIGNED" and not has_assignment:
        raise HTTPException(
            status_code=400,
            detail="Un équipement assigné doit avoir une affectation",
        )

    if current_employee_id and not is_laptop:
        raise HTTPException(
            status_code=400,
            detail="Seuls les laptops peuvent être assignés à un employé",
        )

    if current_emplacement_id and is_laptop:
        raise HTTPException(
            status_code=400,
            detail="Les laptops doivent être assignés à un employé",
        )

    if "employee_id" in payload and payload["employee_id"] is not None:
        payload["emplacement_id"] = None

    if "emplacement_id" in payload and payload["emplacement_id"] is not None:
        payload["employee_id"] = None

    if "status" not in payload:
        payload["status"] = "ASSIGNED" if has_assignment else "IN_STOCK"
    elif requested_status == "IN_STOCK":
        payload["employee_id"] = None
        payload["emplacement_id"] = None
    elif requested_status == "ASSIGNED":
        if not has_assignment:
            raise HTTPException(
                status_code=400,
                detail="Un équipement assigné doit avoir une affectation",
            )
    elif requested_status == "MAINTENANCE":
        pass
    elif requested_status == "STOLEN":
        if not has_assignment:
            raise HTTPException(
                status_code=400,
                detail="Un équipement ne peut être marqué Volé que s'il est déjà affecté",
            )

    for key, value in payload.items():
        setattr(db_eq, key, value)

    after_assignment_label = _format_assignment_label(db, db_eq.employee_id, db_eq.emplacement_id)

    assignment_changed = (
        before_employee_id != db_eq.employee_id
        or before_emplacement_id != db_eq.emplacement_id
    )
    status_changed = before_status != db_eq.status
    condition_changed = before_condition != db_eq.condition
    model_changed = before_model != db_eq.model
    serial_changed = before_serial != db_eq.serial_number

    notes_parts = []

    if status_changed:
        notes_parts.append(f"Statut: {_display_status(before_status)} → {_display_status(db_eq.status)}")
    if condition_changed:
        notes_parts.append(f"État: {before_condition} → {db_eq.condition}")
    if model_changed:
        notes_parts.append(f"Modèle: {before_model} → {db_eq.model}")
    if serial_changed:
        notes_parts.append(f"S/N: {before_serial} → {db_eq.serial_number}")

    if assignment_changed:
        if not before_assignment_label and after_assignment_label:
            action = "assigned"
        elif before_assignment_label and not after_assignment_label:
            action = "unassigned"
        else:
            action = "reassigned"
    elif status_changed:
        action = "status_changed"
    elif condition_changed:
        action = "condition_changed"
    else:
        action = "updated"

    movement_notes = " | ".join(notes_parts) if notes_parts else "Mise à jour de l'équipement"

    _add_movement(
        db,
        equipment_id=db_eq.id,
        actor_user_id=current_user.id,
        action=action,
        from_location=before_assignment_label,
        to_location=after_assignment_label,
        notes=movement_notes,
    )

    if before_employee_id != db_eq.employee_id:
        if before_employee_id:
            _close_open_employee_history(
                db,
                equipment_id=db_eq.id,
                employee_id=before_employee_id,
                notes=f"Fin d'affectation ({action})",
            )

        if db_eq.employee_id:
            _open_employee_history(
                db,
                equipment_id=db_eq.id,
                employee_id=db_eq.employee_id,
                notes=f"Nouvelle affectation ({action})",
            )

    db.commit()
    db.refresh(db_eq)
    return db_eq


@router.delete("/{equipment_id}")
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    _current_user: User = Depends(require_roles([UserRole.ADMIN])),
):
    db_eq = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Equipment not found")

    db.query(EmployeeEquipmentHistory).filter(
        EmployeeEquipmentHistory.equipment_id == equipment_id
    ).delete(synchronize_session=False)

    db.query(EquipmentMovement).filter(
        EquipmentMovement.equipment_id == equipment_id
    ).delete(synchronize_session=False)

    db.delete(db_eq)
    db.commit()
    return {"message": "Equipment deleted successfully"}


@router.post("/{equipment_id}/assign", response_model=EquipmentResponse)
def assign_equipment(
    equipment_id: int,
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    eq = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")

    before_label = _format_assignment_label(db, eq.employee_id, eq.emplacement_id)

    eq.employee_id = employee_id
    eq.emplacement_id = None
    eq.status = "ASSIGNED"

    after_label = _format_assignment_label(db, eq.employee_id, eq.emplacement_id)

    _add_movement(
        db,
        equipment_id=eq.id,
        actor_user_id=current_user.id,
        action="assigned",
        from_location=before_label,
        to_location=after_label,
        notes="Affectation directe à un employé",
    )

    _close_open_employee_history(
        db,
        equipment_id=eq.id,
        employee_id=before_label and None,  # no-op volontaire
    )

    _open_employee_history(
        db,
        equipment_id=eq.id,
        employee_id=employee_id,
        notes="Affectation directe via endpoint assign",
    )

    db.commit()
    db.refresh(eq)
    return eq


@router.post("/{equipment_id}/unassign", response_model=EquipmentResponse)
def unassign_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    eq = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")

    before_employee_id = eq.employee_id
    before_label = _format_assignment_label(db, eq.employee_id, eq.emplacement_id)

    eq.employee_id = None
    eq.emplacement_id = None
    eq.status = "IN_STOCK"

    _add_movement(
        db,
        equipment_id=eq.id,
        actor_user_id=current_user.id,
        action="unassigned",
        from_location=before_label,
        to_location=None,
        notes="Désaffectation directe via endpoint unassign",
    )

    if before_employee_id:
        _close_open_employee_history(
            db,
            equipment_id=eq.id,
            employee_id=before_employee_id,
            notes="Désaffectation via endpoint unassign",
        )

    db.commit()
    db.refresh(eq)
    return eq