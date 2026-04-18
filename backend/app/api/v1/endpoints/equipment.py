from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.deps import get_db
from app.models.equipment import Equipment as EquipmentModel
from app.schemas.equipment import EquipmentResponse, EquipmentCreate, EquipmentUpdate

router = APIRouter()


@router.get("", response_model=List[EquipmentResponse])
def get_equipment(
    skip: int = 0,
    limit: int = 100,
    equipment_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(EquipmentModel)

    type_map = {
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

    status_map = {
        "in_stock": "IN_STOCK",
        "assigned": "ASSIGNED",
        "maintenance": "MAINTENANCE",
        "retired": "RETIRED",
        "IN_STOCK": "IN_STOCK",
        "ASSIGNED": "ASSIGNED",
        "MAINTENANCE": "MAINTENANCE",
        "RETIRED": "RETIRED",
    }

    condition_map = {
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

    if equipment_type:
        mapped_type = type_map.get(equipment_type, equipment_type)
        query = query.filter(EquipmentModel.equipment_type == mapped_type)

    if status:
        mapped_status = status_map.get(status, status)
        query = query.filter(EquipmentModel.status == mapped_status)

    if condition:
        mapped_condition = condition_map.get(condition, condition)
        query = query.filter(EquipmentModel.condition == mapped_condition)

    if search:
        query = query.filter(EquipmentModel.serial_number.ilike(f"%{search}%"))

    return query.offset(skip).limit(limit).all()

@router.post("", response_model=EquipmentResponse, status_code=201)
def create_equipment(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    """Créer un nouvel équipement"""
    existing = db.query(EquipmentModel).filter(EquipmentModel.serial_number == equipment.serial_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Serial number already exists")
    
    db_equipment = EquipmentModel(**equipment.dict())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment_by_id(equipment_id: int, db: Session = Depends(get_db)):
    """Récupérer un équipement par ID"""
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(equipment_id: int, equipment: EquipmentUpdate, db: Session = Depends(get_db)):
    db_equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    payload = equipment.dict(exclude_unset=True)

    target_type = payload.get("equipment_type", db_equipment.equipment_type)
    is_laptop = str(target_type).lower() == "laptop"

    employee_id = payload.get("employee_id")
    emplacement_id = payload.get("emplacement_id")

    if employee_id is not None and not is_laptop:
        raise HTTPException(
            status_code=400,
            detail="Seuls les laptops peuvent être assignés à un employé"
        )

    if emplacement_id is not None and is_laptop:
        raise HTTPException(
            status_code=400,
            detail="Les laptops doivent être assignés à un employé"
        )

    if employee_id is not None:
        payload["emplacement_id"] = None
        payload["status"] = "ASSIGNED"

    if emplacement_id is not None:
        payload["employee_id"] = None
        payload["status"] = "ASSIGNED"

    if "employee_id" in payload and payload["employee_id"] is None and "emplacement_id" not in payload:
        payload["status"] = "IN_STOCK"

    if "emplacement_id" in payload and payload["emplacement_id"] is None and "employee_id" not in payload:
        payload["status"] = "IN_STOCK"

    if (
        "employee_id" in payload and payload.get("employee_id") is None and
        "emplacement_id" in payload and payload.get("emplacement_id") is None
    ):
        payload["status"] = "IN_STOCK"

    for key, value in payload.items():
        setattr(db_equipment, key, value)

    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.delete("/{equipment_id}")
def delete_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """Supprimer un équipement"""
    db_equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    db.delete(db_equipment)
    db.commit()
    return {"message": "Equipment deleted successfully"}

@router.get("/by-serial/{serial_number}", response_model=EquipmentResponse)
def get_equipment_by_serial(serial_number: str, db: Session = Depends(get_db)):
    """Récupérer un équipement par numéro de série"""
    equipment = db.query(EquipmentModel).filter(EquipmentModel.serial_number == serial_number).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment

@router.post("/{equipment_id}/assign", response_model=EquipmentResponse)
def assign_equipment(equipment_id: int, employee_id: int, db: Session = Depends(get_db)):
    """Assigner un équipement à un employé"""
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    equipment.employee_id = employee_id
    equipment.status = "assigned"
    db.commit()
    db.refresh(equipment)
    return equipment

@router.post("/{equipment_id}/unassign", response_model=EquipmentResponse)
def unassign_equipment(equipment_id: int, db: Session = Depends(get_db)):
    """Désassigner un équipement"""
    equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    equipment.employee_id = None
    equipment.status = "in_stock"
    db.commit()
    db.refresh(equipment)
    return equipment

@router.get("/nb_pcs/online")
def get_nb_pcs_online(db: Session = Depends(get_db)):
    """Retourne le nombre de PCs (pc + laptop) assignés = en ligne"""
    from sqlalchemy import func
    nb = db.query(func.count(EquipmentModel.id)).filter(
        EquipmentModel.equipment_type.in_(["pc", "laptop"]),
        EquipmentModel.status == "assigned"
    ).scalar()
    return {"nb_pcs": nb or 0}
