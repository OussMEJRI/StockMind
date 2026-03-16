from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate

def get(db: Session, employee_id: int) -> Optional[Employee]:
    """Récupérer un employé par ID"""
    return db.query(Employee).filter(Employee.id == employee_id).first()

def get_by_email(db: Session, email: str) -> Optional[Employee]:
    """Récupérer un employé par email"""
    return db.query(Employee).filter(Employee.email == email).first()

def get_multi(db: Session, skip: int = 0, limit: int = 100) -> List[Employee]:
    """Récupérer plusieurs employés"""
    return db.query(Employee).offset(skip).limit(limit).all()

def create(db: Session, employee_in: EmployeeCreate) -> Employee:
    """Créer un nouvel employé"""
    employee = Employee(**employee_in.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee

def update(db: Session, employee: Employee, employee_in: EmployeeUpdate) -> Employee:
    """Mettre à jour un employé"""
    update_data = employee_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    db.commit()
    db.refresh(employee)
    return employee

def delete(db: Session, employee_id: int) -> bool:
    """Supprimer un employé"""
    employee = get(db, employee_id)
    if employee:
        db.delete(employee)
        db.commit()
        return True
    return False
