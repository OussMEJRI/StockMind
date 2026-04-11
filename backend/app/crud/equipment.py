from sqlalchemy.orm import Session
from app.models.equipment import Equipment
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate
from typing import List, Optional

def get_equipment(db: Session, skip: int = 0, limit: int = 100) -> List[Equipment]:
    return db.query(Equipment).offset(skip).limit(limit).all()

def get_equipment_by_id(db: Session, equipment_id: int) -> Optional[Equipment]:
    return db.query(Equipment).filter(Equipment.id == equipment_id).first()

def get_equipment_by_serial(db: Session, serial_number: str) -> Optional[Equipment]:
    return db.query(Equipment).filter(Equipment.serial_number == serial_number).first()

def create_equipment(db: Session, equipment: EquipmentCreate) -> Equipment:
    db_equipment = Equipment(
        serial_number=equipment.serial_number,
        model=equipment.model,
        equipment_type=equipment.equipment_type,
        condition=equipment.condition,
        status=equipment.status,
        employee_id=equipment.employee_id
    )
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

def update_equipment(db: Session, equipment_id: int, equipment: EquipmentUpdate) -> Optional[Equipment]:
    db_equipment = get_equipment_by_id(db, equipment_id)
    if db_equipment:
        # Sauvegarder l'ancien statut
        old_status = db_equipment.status
        
        # Mettre à jour l'équipement
        update_data = equipment.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_equipment, key, value)
        
        db.commit()
        db.refresh(db_equipment)
        
        # Si le statut a changé et que c'est un laptop, mettre à jour la désignation
        if old_status != db_equipment.status and db_equipment.equipment_type.lower() == "laptop":
            from app.crud.emplacement import update_designation_for_equipment
            update_designation_for_equipment(db, equipment_id)
    
    return db_equipment

def delete_equipment(db: Session, equipment_id: int) -> bool:
    db_equipment = get_equipment_by_id(db, equipment_id)
    if db_equipment:
        db.delete(db_equipment)
        db.commit()
        return True
    return False

def get_equipment_count(db: Session) -> int:
    return db.query(Equipment).count()
