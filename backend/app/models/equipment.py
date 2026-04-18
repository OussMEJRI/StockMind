from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class EquipmentType(str, enum.Enum):
    PC = "PC"
    LAPTOP = "LAPTOP"
    MONITOR = "MONITOR"
    PHONE = "PHONE"
    ACCESSORY = "ACCESSORY"


class EquipmentCondition(str, enum.Enum):
    NEW = "NEW"
    USED = "USED"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"


class EquipmentStatus(str, enum.Enum):
    IN_STOCK = "IN_STOCK"
    ASSIGNED = "ASSIGNED"


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    model = Column(String(255), nullable=False)
    equipment_type = Column(String(50), nullable=False)
    condition = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="IN_STOCK")
    created_at = Column(DateTime(timezone=False), nullable=False, default=func.now())
    updated_at = Column(DateTime(timezone=False), nullable=False, default=func.now(), onupdate=func.now())

    # Keep Python/API name "emplacement_id", but map it to the real DB column "location_id"
    emplacement_id = Column("location_id", Integer, ForeignKey("locations.id"), nullable=True)
    emplacement = relationship("Emplacement", back_populates="equipments")

    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    employee = relationship("Employee", back_populates="equipments")
    movements = relationship("EquipmentMovement", back_populates="equipment")
    assignment_history = relationship("EmployeeEquipmentHistory", back_populates="equipment")
    