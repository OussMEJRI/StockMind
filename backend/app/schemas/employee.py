from pydantic import BaseModel, EmailStr
from typing import Optional


class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    cuid: Optional[str] = None
    contract_type: Optional[str] = None
    department: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    cuid: Optional[str] = None
    contract_type: Optional[str] = None
    department: Optional[str] = None


class Employee(EmployeeBase):
    id: int

    class Config:
        from_attributes = True