from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.session import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False, index=True)
    last_name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    department = Column(String(100), nullable=False, index=True)
    cuid = Column(String(50), nullable=True, index=True)
    contract_type = Column(String(50), nullable=True)
    # Relations
    equipments = relationship("Equipment", back_populates="employee")
    equipment_history = relationship("EmployeeEquipmentHistory", back_populates="employee")

    @property
    def name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()