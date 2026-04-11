from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Emplacement(Base):
    __tablename__ = "emplacements"

    id = Column(Integer, primary_key=True, index=True)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), unique=True, nullable=False)
    
    # Pour les équipements non-laptop
    etage = Column(String(50), nullable=True)
    rosace = Column(Integer, nullable=True)
    type_emplacement = Column(String(10), nullable=True)
    emplacement_exact = Column(String(255), nullable=True)
    
    # Désignation (calculée automatiquement)
    designation = Column(String(255), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    equipment = relationship("Equipment", back_populates="emplacement")

    def generate_designation(self):
        """
        Générer la désignation selon le type d'équipement et son statut
        
        Règles:
        - Laptop + Assigné → "CHEZ COLLABORATEUR"
        - Laptop + En stock → "EN STOCK"
        - Laptop + Autre → "SIMOP"
        - Autres équipements → Code (ex: "1A1-R05-SC")
        """
        if not self.equipment:
            self.designation = "NON DÉFINI"
            return
        
        equipment_type = self.equipment.equipment_type.lower()
        equipment_status = self.equipment.status.lower()
        
        # Si c'est un laptop
        if equipment_type == "laptop":
            if equipment_status == "assigned":
                self.designation = "CHEZ COLLABORATEUR"
            elif equipment_status == "in_stock":
                self.designation = "EN STOCK"
            else:
                self.designation = "SIMOP"
        else:
            # Pour les autres équipements → Code avec étage, rosace et type
            if self.etage and self.rosace and self.type_emplacement:
                self.emplacement_exact = f"{self.etage}-R{self.rosace:02d}-{self.type_emplacement}"
                self.designation = self.emplacement_exact.upper()
            else:
                self.designation = "NON DÉFINI"
