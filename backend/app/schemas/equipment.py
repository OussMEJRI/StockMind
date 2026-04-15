from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.equipment import EquipmentType, EquipmentCondition, EquipmentStatus


class EquipmentBase(BaseModel):
    serial_number: str
    model: str
    equipment_type: EquipmentType
    condition: EquipmentCondition
    status: EquipmentStatus


class EquipmentCreate(EquipmentBase):
    # ✅ emplacement_id au lieu de location_id
    emplacement_id: Optional[int] = None
    employee_id: Optional[int] = None


class EquipmentUpdate(BaseModel):
    serial_number: Optional[str] = None
    model: Optional[str] = None
    equipment_type: Optional[EquipmentType] = None
    condition: Optional[EquipmentCondition] = None
    status: Optional[EquipmentStatus] = None
    # ✅ emplacement_id au lieu de location_id
    emplacement_id: Optional[int] = None
    employee_id: Optional[int] = None


class EquipmentResponse(EquipmentBase):
    id: int
    # ✅ emplacement_id au lieu de location_id
    emplacement_id: Optional[int] = None
    employee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True