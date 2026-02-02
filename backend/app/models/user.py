from sqlalchemy import Column, Integer, String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base


class UserRole(str, enum.Enum):
    """User roles for role-based access control."""
    ADMIN = "admin"
    GESTIONNAIRE = "gestionnaire"
    COLLABORATEUR = "collaborateur"


class User(Base):
    """User model for authentication and authorization."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.COLLABORATEUR)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    equipment_assignments = relationship("Equipment", back_populates="assigned_employee")
    movement_history = relationship("EquipmentMovement", back_populates="employee")
