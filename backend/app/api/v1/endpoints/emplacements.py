from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_active_user, require_roles
from app.models.user import UserRole
from app.models.emplacements import Emplacement as EmplacementModel
from app.schemas.emplacements import EmplacementResponse, EmplacementCreate, EmplacementUpdate

router = APIRouter()

@router.get("", response_model=List[EmplacementResponse])
def get_emplacements(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user)
):
    return db.query(EmplacementModel).offset(skip).limit(limit).all()

@router.post("", response_model=EmplacementResponse, status_code=201)
def create_emplacement(
    emplacement: EmplacementCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user)
):
    existing = db.query(EmplacementModel).filter(
        EmplacementModel.site == emplacement.site,
        EmplacementModel.etage == emplacement.etage,
        EmplacementModel.rosace == emplacement.rosace
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un emplacement avec ce site, étage et rosace existe déjà")
    db_emp = EmplacementModel(**emplacement.dict())
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.get("/{emplacement_id}", response_model=EmplacementResponse)
def get_emplacement(
    emplacement_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user)
):
    emp = db.query(EmplacementModel).filter(EmplacementModel.id == emplacement_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Emplacement non trouvé")
    return emp

@router.put("/{emplacement_id}", response_model=EmplacementResponse)
def update_emplacement(
    emplacement_id: int,
    emplacement: EmplacementUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user)
):
    db_emp = db.query(EmplacementModel).filter(EmplacementModel.id == emplacement_id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Emplacement non trouvé")
    for key, value in emplacement.dict(exclude_unset=True).items():
        setattr(db_emp, key, value)
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.delete("/{emplacement_id}")
def delete_emplacement(
    emplacement_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles([UserRole.ADMIN]))   # 🔒 ADMIN uniquement
):
    db_emp = db.query(EmplacementModel).filter(EmplacementModel.id == emplacement_id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Emplacement non trouvé")
    db.delete(db_emp)
    db.commit()
    return {"message": "Emplacement supprimé avec succès"}

@router.get("/{emplacement_id}/equipments")
def get_equipments_by_emplacement(
    emplacement_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_active_user)
):
    from app.models.equipment import Equipment as EquipmentModel
    emp = db.query(EmplacementModel).filter(EmplacementModel.id == emplacement_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Emplacement non trouvé")
    equipments = db.query(EquipmentModel).filter(
        EquipmentModel.emplacement_id == emplacement_id
    ).all()
    return [{
        "id": e.id, "serial_number": e.serial_number, "model": e.model,
        "equipment_type": e.equipment_type, "status": e.status, "condition": e.condition
    } for e in equipments]
