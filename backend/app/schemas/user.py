from typing import Optional
from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


# Schémas de base
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.COLLABORATEUR  # Utiliser le bon nom
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserInDB(UserBase):
    id: int

    class Config:
        from_attributes = True


class User(UserInDB):
    pass
