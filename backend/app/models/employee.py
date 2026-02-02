from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Employee(Base):
    """Employee model for staff information and equipment assignments."""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False, index=True)
    last_name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False, index=True)
    
    # Relationships
    assigned_equipment = relationship("Equipment", back_populates="employee")
