from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional

from app.core.deps import get_db
from app.models.employee import Employee as EmployeeModel
from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate

router = APIRouter()


def split_full_name(full_name: str) -> tuple[str, str]:
    parts = (full_name or "").strip().split()
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])


@router.get("", response_model=List[Employee])
def get_employees(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, le=500),
    department: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(EmployeeModel)

    if department:
        query = query.filter(EmployeeModel.department == department)

    if search:
        term = f"%{search.strip()}%"
        full_name = func.concat(EmployeeModel.first_name, ' ', EmployeeModel.last_name)

        query = query.filter(
            or_(
                EmployeeModel.first_name.ilike(term),
                EmployeeModel.last_name.ilike(term),
                full_name.ilike(term),
                EmployeeModel.cuid.ilike(term)
            )
        )

    employees = query.offset(skip).limit(limit).all()
    return employees


@router.post("", response_model=Employee, status_code=201)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(EmployeeModel).filter(
        EmployeeModel.email == employee.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà existant")

    first_name, last_name = split_full_name(employee.name)

    db_employee = EmployeeModel(
        first_name=first_name,
        last_name=last_name,
        email=employee.email,
        department=employee.department or "",
        cuid=employee.cuid,
        contract_type=employee.contract_type,
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee


@router.get("/{employee_id}", response_model=Employee)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
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
    db_employee = db.query(EmployeeModel).filter(
        EmployeeModel.id == employee_id
    ).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    data = employee.dict(exclude_unset=True)

    if "name" in data:
        first_name, last_name = split_full_name(data.pop("name"))
        db_employee.first_name = first_name
        db_employee.last_name = last_name

    if "email" in data:
        db_employee.email = data["email"]

    if "department" in data:
        db_employee.department = data["department"] or ""

    if "cuid" in data:
        db_employee.cuid = data["cuid"]

    if "contract_type" in data:
        db_employee.contract_type = data["contract_type"]

    db.commit()
    db.refresh(db_employee)
    return db_employee


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = db.query(EmployeeModel).filter(
        EmployeeModel.id == employee_id
    ).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")

    db.delete(db_employee)
    db.commit()
    return {"message": "Employé supprimé avec succès"}