from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HistoryBase(BaseModel):
    equipment_id: int
    assigned_at: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    notes: Optional[str] = None


class HistoryCreate(HistoryBase):
    pass  # ✅ employee_id vient de l'URL, pas du body


class HistoryResponse(HistoryBase):
    id: int
    employee_id: int
    created_at: datetime

    # Infos équipement
    equipment_serial: Optional[str] = None
    equipment_model: Optional[str] = None
    equipment_type: Optional[str] = None

    class Config:
        from_attributes = True
