from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core import deps
from app.crud import employee as employee_crud
from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate

router = APIRouter()


@router.get("/", response_model=List[Employee])
def get_employees(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Récupérer la liste des employés
    """
    employees = employee_crud.get_multi(db, skip=skip, limit=limit)
    return employees


@router.post("/", response_model=Employee)
def create_employee(
    *,
    db: Session = Depends(deps.get_db),
    employee_in: EmployeeCreate,
):
    """
    Créer un nouvel employé
    """
    # Vérifier si l'email existe déjà
    existing_employee = employee_crud.get_by_email(db, email=employee_in.email)
    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Un employé avec cet email existe déjà"
        )
    
    employee = employee_crud.create(db, employee_in)
    return employee


@router.get("/{employee_id}", response_model=Employee)
def get_employee(
    employee_id: int,
    db: Session = Depends(deps.get_db),
):
    """
    Récupérer un employé par son ID
    """
    employee = employee_crud.get(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    return employee


@router.put("/{employee_id}", response_model=Employee)
def update_employee(
    *,
    db: Session = Depends(deps.get_db),
    employee_id: int,
    employee_in: EmployeeUpdate,
):
    """
    Mettre à jour un employé
    """
    employee = employee_crud.get(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    # Vérifier si l'email existe déjà (si modifié)
    if employee_in.email and employee_in.email != employee.email:
        existing_employee = employee_crud.get_by_email(db, email=employee_in.email)
        if existing_employee:
            raise HTTPException(
                status_code=400,
                detail="Un employé avec cet email existe déjà"
            )
    
    employee = employee_crud.update(db, employee, employee_in)
    return employee


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(deps.get_db),
):
    """
    Supprimer un employé
    """
    success = employee_crud.delete(db, employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    return {"message": "Employé supprimé avec succès"}