from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.deps import get_db
from app.models.employee_equipment_history import EmployeeEquipmentHistory
from app.models.employee import Employee
from app.models.equipment import Equipment
from app.schemas.employee_equipment_history import HistoryCreate, HistoryResponse

router = APIRouter()


@router.get("/{employee_id}/history", response_model=List[HistoryResponse])
def get_employee_history(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """Récupérer tout l'historique des équipements d'un employé"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    history = db.query(EmployeeEquipmentHistory).options(
        joinedload(EmployeeEquipmentHistory.equipment)
    ).filter(
        EmployeeEquipmentHistory.employee_id == employee_id
    ).order_by(EmployeeEquipmentHistory.assigned_at.desc()).all()

    result = []
    for h in history:
        result.append(HistoryResponse(
            id=h.id,
            employee_id=h.employee_id,
            equipment_id=h.equipment_id,
            assigned_at=h.assigned_at,
            returned_at=h.returned_at,
            notes=h.notes,
            created_at=h.created_at,
            equipment_serial=h.equipment.serial_number if h.equipment else None,
            equipment_model=h.equipment.model if h.equipment else None,
            equipment_type=h.equipment.equipment_type if h.equipment else None,
        ))
    return result


@router.post("/{employee_id}/history", response_model=HistoryResponse, status_code=201)
def add_equipment_to_history(
    employee_id: int,
    history: HistoryCreate,
    db: Session = Depends(get_db)
):
    """Ajouter une entrée dans l'historique d'un employé"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    equipment = db.query(Equipment).filter(Equipment.id == history.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Équipement non trouvé")

    db_history = EmployeeEquipmentHistory(
        employee_id=employee_id,
        equipment_id=history.equipment_id,
        assigned_at=history.assigned_at,
        returned_at=history.returned_at,
        notes=history.notes
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)

    return HistoryResponse(
        id=db_history.id,
        employee_id=db_history.employee_id,
        equipment_id=db_history.equipment_id,
        assigned_at=db_history.assigned_at,
        returned_at=db_history.returned_at,
        notes=db_history.notes,
        created_at=db_history.created_at,
        equipment_serial=equipment.serial_number,
        equipment_model=equipment.model,
        equipment_type=equipment.equipment_type,
    )


@router.patch("/{employee_id}/history/{history_id}/return")
def return_equipment(
    employee_id: int,
    history_id: int,
    db: Session = Depends(get_db)
):
    """Marquer un équipement comme restitué"""
    from datetime import datetime
    history = db.query(EmployeeEquipmentHistory).filter(
        EmployeeEquipmentHistory.id == history_id,
        EmployeeEquipmentHistory.employee_id == employee_id
    ).first()

    if not history:
        raise HTTPException(status_code=404, detail="Historique non trouvé")

    history.returned_at = datetime.utcnow()
    db.commit()
    return {"message": "Équipement marqué comme restitué ✅"}
