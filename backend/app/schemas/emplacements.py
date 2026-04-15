from pydantic import BaseModel
from typing import Optional


class EmplacementBase(BaseModel):
    site: str
    etage: str
    rosace: str
    exact_position: Optional[str] = None


class EmplacementCreate(EmplacementBase):
    pass


class EmplacementUpdate(BaseModel):
    site: Optional[str] = None
    etage: Optional[str] = None
    rosace: Optional[str] = None
    exact_position: Optional[str] = None


class EmplacementResponse(EmplacementBase):
    id: int

    class Config:
        from_attributes = True
