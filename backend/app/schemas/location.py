from pydantic import BaseModel
from typing import Optional


class LocationBase(BaseModel):
    """Base location schema."""
    site: str
    floor: str
    room: str
    exact_position: Optional[str] = None


class LocationCreate(LocationBase):
    """Schema for creating new location."""
    pass


class LocationUpdate(BaseModel):
    """Schema for updating location information."""
    site: Optional[str] = None
    floor: Optional[str] = None
    room: Optional[str] = None
    exact_position: Optional[str] = None


class LocationResponse(LocationBase):
    """Schema for location response."""
    id: int
    
    class Config:
        from_attributes = True
