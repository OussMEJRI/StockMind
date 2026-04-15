from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class Emplacement(Base):
    __tablename__ = "emplacements"

    id = Column(Integer, primary_key=True, index=True)
    site = Column(String(100), nullable=False)
    etage = Column(String(50), nullable=False)
    rosace = Column(String(50), nullable=False)
    exact_position = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    equipments = relationship("Equipment", back_populates="emplacement")
