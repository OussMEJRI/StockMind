from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class EquipmentType(str, enum.Enum):
    LAPTOP = "laptop"
    PC = "pc"
    MONITOR = "monitor"
    PHONE = "phone"
    PRINTER = "printer"
    OTHER = "other"


class EquipmentCondition(str, enum.Enum):
    NEW = "new"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class EquipmentStatus(str, enum.Enum):
    IN_STOCK = "in_stock"
    ASSIGNED = "assigned"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    model = Column(String(255), nullable=False)
    equipment_type = Column(String(50), nullable=False)
    condition = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="in_stock")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # ✅ emplacement_id + ForeignKey vers "emplacements.id"
    emplacement_id = Column(Integer, ForeignKey("emplacements.id"), nullable=True)
    emplacement = relationship("Emplacement", back_populates="equipments")

    # ✅ FK vers Employee
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    employee = relationship("Employee", back_populates="equipments")

    # ✅ Relation vers les mouvements
    movements = relationship("EquipmentMovement", back_populates="equipment")
