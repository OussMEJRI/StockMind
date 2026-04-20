from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.deps import get_db, get_current_active_user
from app.crud import user as user_crud
from app.schemas.token import Token
from app.models.user import User

router = APIRouter()

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = user_crud.authenticate(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return {
        "id":         current_user.id,
        "email":      current_user.email,
        "first_name": current_user.first_name,
        "last_name":  current_user.last_name,
        "role":       current_user.role,
        "is_active":  current_user.is_active
    }
