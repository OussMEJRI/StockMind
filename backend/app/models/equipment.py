from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base


class EquipmentType(str, enum.Enum):
    """Types of IT equipment."""
    PC = "pc"
    LAPTOP = "laptop"
    MONITOR = "monitor"
    PHONE = "phone"
    ACCESSORY = "accessory"


class EquipmentCondition(str, enum.Enum):
    """Condition status of equipment."""
    NEW = "new"
    USED = "used"
    OUT_OF_SERVICE = "out_of_service"


class EquipmentStatus(str, enum.Enum):
    """Availability status of equipment."""
    IN_STOCK = "in_stock"
    ASSIGNED = "assigned"


class Equipment(Base):
    """Equipment model for IT inventory items."""
    __tablename__ = "equipment"
    
    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String, unique=True, index=True, nullable=False)
    model = Column(String, nullable=False, index=True)
    equipment_type = Column(SQLEnum(EquipmentType), nullable=False, index=True)
    condition = Column(SQLEnum(EquipmentCondition), nullable=False, default=EquipmentCondition.NEW)
    status = Column(SQLEnum(EquipmentStatus), nullable=False, default=EquipmentStatus.IN_STOCK, index=True)
    
    # Location information
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    
    # Assignment information
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    location = relationship("Location", back_populates="equipment")
    employee = relationship("Employee", back_populates="assigned_equipment")
    assigned_employee = relationship("User", back_populates="equipment_assignments")
    movements = relationship("EquipmentMovement", back_populates="equipment")
