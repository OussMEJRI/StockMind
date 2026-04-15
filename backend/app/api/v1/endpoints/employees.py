from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.deps import get_db
from app.models.employee import Employee as EmployeeModel
from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate

router = APIRouter()

@router.get("", response_model=List[Employee])
def get_employees(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    """Récupérer tous les employés avec pagination"""
    employees = db.query(EmployeeModel).offset(skip).limit(limit).all()
    return employees

@router.post("", response_model=Employee, status_code=201)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """Créer un nouvel employé"""
    existing = db.query(EmployeeModel).filter(
        EmployeeModel.cuid == employee.cuid
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="CUID déjà existant")
    
    db_employee = EmployeeModel(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.get("/{employee_id}", response_model=Employee)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """Récupérer un employé par ID"""
    employee = db.query(EmployeeModel).filter(
        EmployeeModel.id == employee_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    return employee

@router.put("/{employee_id}", response_model=Employee)
def update_employee(
    employee_id: int,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db)
):
    """Mettre à jour un employé"""
    db_employee = db.query(EmployeeModel).filter(
        EmployeeModel.id == employee_id
    ).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    for key, value in employee.dict(exclude_unset=True).items():
        setattr(db_employee, key, value)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Supprimer un employé"""
    db_employee = db.query(EmployeeModel).filter(
        EmployeeModel.id == employee_id
    ).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    db.delete(db_employee)
    db.commit()
    return {"message": "Employé supprimé avec succès"}
