from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db
from app.models.equipment import Equipment as EquipmentModel
from app.schemas.equipment import EquipmentResponse, EquipmentCreate, EquipmentUpdate

router = APIRouter()

@router.get("", response_model=List[EquipmentResponse])
def get_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer tous les équipements"""
    equipment = db.query(EquipmentModel).offset(skip).limit(limit).all()
    return equipment

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
    """Mettre à jour un équipement"""
    db_equipment = db.query(EquipmentModel).filter(EquipmentModel.id == equipment_id).first()
    if not db_equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    for key, value in equipment.dict(exclude_unset=True).items():
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
