from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.equipment import EquipmentType, EquipmentCondition, EquipmentStatus


class EquipmentBase(BaseModel):
    """Base equipment schema."""
    serial_number: str
    model: str
    equipment_type: EquipmentType
    condition: EquipmentCondition
    status: EquipmentStatus


class EquipmentCreate(EquipmentBase):
    """Schema for creating new equipment."""
    location_id: Optional[int] = None
    employee_id: Optional[int] = None


class EquipmentUpdate(BaseModel):
    """Schema for updating equipment information."""
    serial_number: Optional[str] = None
    model: Optional[str] = None
    equipment_type: Optional[EquipmentType] = None
    condition: Optional[EquipmentCondition] = None
    status: Optional[EquipmentStatus] = None
    location_id: Optional[int] = None
    employee_id: Optional[int] = None


class EquipmentResponse(EquipmentBase):
    """Schema for equipment response."""
    id: int
    location_id: Optional[int]
    employee_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EquipmentAssignment(BaseModel):
    """Schema for assigning equipment to employee."""
    equipment_id: int
    employee_id: int
    notes: Optional[str] = None
