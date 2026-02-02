from pydantic import BaseModel, EmailStr
from typing import Optional


class EmployeeBase(BaseModel):
    """Base employee schema."""
    first_name: str
    last_name: str
    email: EmailStr
    department: str


class EmployeeCreate(EmployeeBase):
    """Schema for creating new employee."""
    pass


class EmployeeUpdate(BaseModel):
    """Schema for updating employee information."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None


class EmployeeResponse(EmployeeBase):
    """Schema for employee response."""
    id: int
    
    class Config:
        from_attributes = True
