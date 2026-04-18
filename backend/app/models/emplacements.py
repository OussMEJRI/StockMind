from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.session import Base


class Emplacement(Base):
    # We keep the Python class name "Emplacement" for the app,
    # but map it to the real DB table: locations
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    site = Column(String, nullable=False, index=True)
    etage = Column("floor", String, nullable=False, index=True)
    rosace = Column("room", String, nullable=False, index=True)
    exact_position = Column(String, nullable=True)

    equipments = relationship("Equipment", back_populates="emplacement")