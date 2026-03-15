from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, get_password_hash

def get_by_email(db: Session, email: str) -> Optional[User]:
    """Récupérer un utilisateur par email"""
    return db.query(User).filter(User.email == email).first()

def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    """Authentifier un utilisateur"""
    user = get_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create(db: Session, email: str, password: str, first_name: str, last_name: str, role: str = "user") -> User:
    """Créer un nouvel utilisateur"""
    hashed_password = get_password_hash(password)
    user = User(
        email=email,
        hashed_password=hashed_password,
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get(db: Session, user_id: int) -> Optional[User]:
    """Récupérer un utilisateur par ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_multi(db: Session, skip: int = 0, limit: int = 100):
    """Récupérer plusieurs utilisateurs"""
    return db.query(User).offset(skip).limit(limit).all()

def update(db: Session, user: User, **kwargs) -> User:
    """Mettre à jour un utilisateur"""
    for key, value in kwargs.items():
        if hasattr(user, key):
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

def delete(db: Session, user_id: int) -> bool:
    """Supprimer un utilisateur"""
    user = get(db, user_id)
    if user:
        db.delete(user)
        db.commit()
        return True
    return False
