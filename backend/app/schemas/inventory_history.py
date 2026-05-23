from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InventoryHistoryResponse(BaseModel):
    id: int

    equipment_id: Optional[int] = None
    equipment_serial: Optional[str] = None
    equipment_model: Optional[str] = None
    equipment_type: Optional[str] = None
    current_status: Optional[str] = None

    action: str
    from_location: Optional[str] = None
    to_location: Optional[str] = None
    notes: Optional[str] = None
    timestamp: datetime

    actor_user_id: Optional[int] = None
    actor_name: Optional[str] = None
    actor_email: Optional[str] = None

    class Config:
        from_attributes = True