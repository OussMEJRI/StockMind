from sqlalchemy.orm import Session
from app.models.emplacements import Emplacement
from app.models.equipment import Equipment
from app.schemas.emplacements import EmplacementCreate, EmplacementUpdate
from typing import List, Optional

def get_emplacement(db: Session, emplacement_id: int) -> Optional[Emplacement]:
    return db.query(Emplacement).filter(Emplacement.id == emplacement_id).first()

def get_emplacement_by_equipment(db: Session, equipment_id: int) -> Optional[Emplacement]:
    return db.query(Emplacement).filter(Emplacement.equipment_id == equipment_id).first()

def get_emplacements(db: Session, skip: int = 0, limit: int = 100) -> List[Emplacement]:
    return db.query(Emplacement).offset(skip).limit(limit).all()

def create_emplacement(db: Session, emplacement: EmplacementCreate) -> Emplacement:
    # Vérifier que l'équipement existe
    equipment = db.query(Equipment).filter(Equipment.id == emplacement.equipment_id).first()
    if not equipment:
        raise ValueError("Équipement non trouvé")
    
    # Vérifier qu'il n'y a pas déjà un emplacement pour cet équipement
    existing = get_emplacement_by_equipment(db, emplacement.equipment_id)
    if existing:
        raise ValueError("Cet équipement a déjà un emplacement")
    
    # Créer l'emplacement
    db_emplacement = Emplacement(
        equipment_id=emplacement.equipment_id,
        etage=emplacement.etage,
        rosace=emplacement.rosace,
        type_emplacement=emplacement.type_emplacement
    )
    
    # Générer la désignation
    db_emplacement.generate_designation()
    
    db.add(db_emplacement)
    db.commit()
    db.refresh(db_emplacement)
    return db_emplacement

def update_emplacement(db: Session, emplacement_id: int, emplacement: EmplacementUpdate) -> Optional[Emplacement]:
    db_emplacement = get_emplacement(db, emplacement_id)
    if db_emplacement:
        update_data = emplacement.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_emplacement, key, value)
        
        # Régénérer la désignation
        db_emplacement.generate_designation()
        
        db.commit()
        db.refresh(db_emplacement)
    return db_emplacement

def delete_emplacement(db: Session, emplacement_id: int) -> bool:
    db_emplacement = get_emplacement(db, emplacement_id)
    if db_emplacement:
        db.delete(db_emplacement)
        db.commit()
        return True
    return False

def get_emplacements_count(db: Session) -> int:
    return db.query(Emplacement).count()

def update_designation_for_equipment(db: Session, equipment_id: int):
    """
    Mettre à jour la désignation d'un emplacement quand l'équipement change de statut
    """
    emplacement = get_emplacement_by_equipment(db, equipment_id)
    if emplacement:
        emplacement.generate_designation()
        db.commit()
        db.refresh(emplacement)
    return emplacement
