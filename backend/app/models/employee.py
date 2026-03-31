from sqlalchemy import Column, Integer, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.db.session import Base


class ContractType(str, enum.Enum):
    """Types de contrat."""
    CDI = "CDI"
    CDD = "CDD"
    STAGIAIRE = "STAGIAIRE"
    EXTERNE = "EXTERNE"


class Department(str, enum.Enum):
    """Départements de l'entreprise."""
    BLI = "BLI"
    CCI = "CCI"
    DTSI = "DTSI"
    OBDS = "OBDS"
    OBS = "OBS"
    OIT = "OIT"
    OW = "OW"
    SAH = "SAH"
    SN3 = "SN3"
    SUPPORT = "SUPPORT"


class Employee(Base):
    """Modèle pour les employés."""
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    cuid = Column(String(8), unique=True, nullable=True, index=True)
    contract_type = Column(SQLEnum(ContractType), nullable=True)
    department = Column(SQLEnum(Department), nullable=True)
    
    # Relation avec Equipment
    assigned_equipment = relationship("Equipment", back_populates="employee")
