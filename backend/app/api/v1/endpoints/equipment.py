from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models import Equipment, EquipmentStatus, EquipmentType, User, UserRole
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentResponse, EquipmentAssignment
from app.core.deps import get_current_user, require_roles

router = APIRouter()


@router.get("/", response_model=List[EquipmentResponse])
def list_equipment(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    equipment_type: Optional[EquipmentType] = None,
    status: Optional[EquipmentStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all equipment with optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        equipment_type: Filter by equipment type
        status: Filter by status
        db: Database session
        current_user: Current authenticated user
    
    Returns:
        List of equipment
    """
    query = db.query(Equipment)
    
    if equipment_type:
        query = query.filter(Equipment.equipment_type == equipment_type)
    
    if status:
        query = query.filter(Equipment.status == status)
    
    equipment = query.offset(skip).limit(limit).all()
    return equipment


@router.get("/{equipment_id}", response_model=EquipmentResponse)
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get equipment by ID.
    
    Args:
        equipment_id: Equipment ID
        db: Database session
        current_user: Current authenticated user
    
    Returns:
        Equipment details
    """
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    return equipment


@router.post("/", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
def create_equipment(
    equipment_in: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.GESTIONNAIRE]))
):
    """
    Create new equipment. Requires admin or gestionnaire role.
    
    Args:
        equipment_in: Equipment creation data
        db: Database session
        current_user: Current authenticated user
    
    Returns:
        Created equipment
    """
    # Check if serial number already exists
    existing = db.query(Equipment).filter(Equipment.serial_number == equipment_in.serial_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Serial number already exists"
        )
    
    db_equipment = Equipment(**equipment_in.model_dump())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    
    return db_equipment


@router.put("/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    equipment_in: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.GESTIONNAIRE]))
):
    """
    Update equipment. Requires admin or gestionnaire role.
    
    Args:
        equipment_id: Equipment ID
        equipment_in: Equipment update data
        db: Database session
        current_user: Current authenticated user
    
    Returns:
        Updated equipment
    """
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    # Update fields
    update_data = equipment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(equipment, field, value)
    
    db.commit()
    db.refresh(equipment)
    
    return equipment


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """
    Delete equipment. Requires admin role.
    
    Args:
        equipment_id: Equipment ID
        db: Database session
        current_user: Current authenticated user
    """
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    db.delete(equipment)
    db.commit()
    
    return None


@router.post("/assign", response_model=EquipmentResponse)
def assign_equipment(
    assignment: EquipmentAssignment,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.GESTIONNAIRE]))
):
    """
    Assign equipment to an employee.
    
    Args:
        assignment: Assignment data
        db: Database session
        current_user: Current authenticated user
    
    Returns:
        Updated equipment
    """
    equipment = db.query(Equipment).filter(Equipment.id == assignment.equipment_id).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    if equipment.status == EquipmentStatus.ASSIGNED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Equipment is already assigned"
        )
    
    # Update equipment
    equipment.employee_id = assignment.employee_id
    equipment.status = EquipmentStatus.ASSIGNED
    
    db.commit()
    db.refresh(equipment)
    
    return equipment
