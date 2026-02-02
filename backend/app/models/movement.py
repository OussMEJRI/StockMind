from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base


class EquipmentMovement(Base):
    """Equipment movement history for tracking who moved what, when, and where."""
    __tablename__ = "equipment_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Movement details
    action = Column(String, nullable=False)  # e.g., "assigned", "returned", "moved"
    from_location = Column(String, nullable=True)
    to_location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="movements")
    employee = relationship("User", back_populates="movement_history")
