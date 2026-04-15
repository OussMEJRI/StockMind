from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class EmployeeEquipmentHistory(Base):
    """Historique complet des équipements attribués à chaque employé."""
    __tablename__ = "employee_equipment_history"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False, index=True)

    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    returned_at = Column(DateTime(timezone=True), nullable=True)  # None = encore assigné
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    employee = relationship("Employee", back_populates="equipment_history")
    equipment = relationship("Equipment", back_populates="assignment_history")
