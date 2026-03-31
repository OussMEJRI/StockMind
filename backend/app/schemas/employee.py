from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from enum import Enum
import re

class ContractType(str, Enum):
    CDI = "CDI"
    CDD = "CDD"
    STAGIAIRE = "STAGIAIRE"
    EXTERNE = "EXTERNE"

class DepartmentType(str, Enum):
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

class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    cuid: Optional[str] = None
    contract_type: Optional[ContractType] = None
    department: Optional[DepartmentType] = None

    @field_validator('cuid')
    @classmethod
    def validate_cuid(cls, v):
        if v is not None:
            # Validation : 4 lettres + 4 chiffres
            if not re.match(r'^[A-Z]{4}\d{4}$', v):
                raise ValueError('CUID doit contenir 4 lettres majuscules suivies de 4 chiffres (ex: ABCD1234)')
        return v

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    cuid: Optional[str] = None
    contract_type: Optional[ContractType] = None
    department: Optional[DepartmentType] = None

    @field_validator('cuid')
    @classmethod
    def validate_cuid(cls, v):
        if v is not None:
            if not re.match(r'^[A-Z]{4}\d{4}$', v):
                raise ValueError('CUID doit contenir 4 lettres majuscules suivies de 4 chiffres (ex: ABCD1234)')
        return v

class Employee(EmployeeBase):
    id: int

    class Config:
        from_attributes = True