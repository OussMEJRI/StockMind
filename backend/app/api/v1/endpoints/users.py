from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db, get_current_active_user, require_roles
from app.models.user import UserRole
from app.schemas.user import User, UserCreate, UserUpdate
from app.crud import user as user_crud

router = APIRouter()

@router.get("", response_model=List[User])
def get_users(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(require_roles([UserRole.ADMIN]))
):
    return user_crud.get_multi(db, skip=skip, limit=limit)

@router.post("", response_model=User, status_code=201)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _=Depends(require_roles([UserRole.ADMIN]))
):
    if user_crud.get_by_email(db, email=user_in.email):
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    return user_crud.create(
        db,
        email=user_in.email,
        password=user_in.password,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        role=user_in.role
    )

@router.get("/{user_id}", response_model=User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles([UserRole.ADMIN]))
):
    user = user_crud.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([UserRole.ADMIN]))
):
    user = user_crud.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    kwargs = user_in.dict(exclude_unset=True)
    if "password" in kwargs:
        from app.core.security import get_password_hash
        kwargs["hashed_password"] = get_password_hash(kwargs.pop("password"))
    return user_crud.update(db, user, **kwargs)

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([UserRole.ADMIN]))
):
    user = user_crud.get(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    user_crud.delete(db, user_id)
    return {"message": "Utilisateur supprimé avec succès"}
