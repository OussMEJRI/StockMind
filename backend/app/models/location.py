from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.session import Base


class Location(Base):
    """Location model for precise equipment positioning."""
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    site = Column(String, nullable=False, index=True)
    floor = Column(String, nullable=False, index=True)
    room = Column(String, nullable=False, index=True)
    exact_position = Column(String, nullable=True)  # e.g., "Armoire A, Poste 12"
    
    # Relationships
    equipment = relationship("Equipment", back_populates="location")
