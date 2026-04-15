from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db
from app.models.emplacements import Emplacement as EmplacementModel
from app.schemas.emplacements import (
    EmplacementResponse,
    EmplacementCreate,
    EmplacementUpdate
)

router = APIRouter()


@router.get("", response_model=List[EmplacementResponse])
def get_emplacements(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    """Récupérer tous les emplacements avec pagination"""
    emplacements = db.query(EmplacementModel).offset(skip).limit(limit).all()
    return emplacements


@router.post("", response_model=EmplacementResponse, status_code=201)
def create_emplacement(
    emplacement: EmplacementCreate,
    db: Session = Depends(get_db)
):
    """Créer un nouvel emplacement"""
    existing = db.query(EmplacementModel).filter(
        EmplacementModel.site == emplacement.site,
        EmplacementModel.etage == emplacement.etage,
        EmplacementModel.rosace == emplacement.rosace
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Un emplacement avec ce site, étage et rosace existe déjà"
        )

    db_emplacement = EmplacementModel(**emplacement.dict())
    db.add(db_emplacement)
    db.commit()
    db.refresh(db_emplacement)
    return db_emplacement


@router.get("/{emplacement_id}", response_model=EmplacementResponse)
def get_emplacement(
    emplacement_id: int,
    db: Session = Depends(get_db)
):
    """Récupérer un emplacement par ID"""
    emplacement = db.query(EmplacementModel).filter(
        EmplacementModel.id == emplacement_id
    ).first()
    if not emplacement:
        raise HTTPException(status_code=404, detail="Emplacement non trouvé")
    return emplacement


@router.put("/{emplacement_id}", response_model=EmplacementResponse)
def update_emplacement(
    emplacement_id: int,
    emplacement: EmplacementUpdate,
    db: Session = Depends(get_db)
):
    """Mettre à jour un emplacement"""
    db_emplacement = db.query(EmplacementModel).filter(
        EmplacementModel.id == emplacement_id
    ).first()
    if not db_emplacement:
        raise HTTPException(status_code=404, detail="Emplacement non trouvé")

    for key, value in emplacement.dict(exclude_unset=True).items():
        setattr(db_emplacement, key, value)

    db.commit()
    db.refresh(db_emplacement)
    return db_emplacement


@router.delete("/{emplacement_id}")
def delete_emplacement(
    emplacement_id: int,
    db: Session = Depends(get_db)
):
    """Supprimer un emplacement"""
    db_emplacement = db.query(EmplacementModel).filter(
        EmplacementModel.id == emplacement_id
    ).first()
    if not db_emplacement:
        raise HTTPException(status_code=404, detail="Emplacement non trouvé")

    db.delete(db_emplacement)
    db.commit()
    return {"message": "Emplacement supprimé avec succès"}
