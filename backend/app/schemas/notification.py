from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: int
    recipient_user_id: int
    sender_user_id: Optional[int] = None

    equipment_id: Optional[int] = None
    equipment_serial: Optional[str] = None
    equipment_model: Optional[str] = None

    type: str
    status: str
    title: str
    message: str
    is_read: bool

    created_at: datetime
    processed_at: Optional[datetime] = None
    processed_by_user_id: Optional[int] = None

    class Config:
        from_attributes = True