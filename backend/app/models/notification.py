from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.session import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    recipient_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=True)
    equipment_serial = Column(String(100), nullable=True)
    equipment_model = Column(String(255), nullable=True)

    type = Column(String(50), nullable=False, default="info")
    status = Column(String(50), nullable=False, default="pending")

    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    is_read = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=False), nullable=False, default=func.now())
    processed_at = Column(DateTime(timezone=False), nullable=True)
    processed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)