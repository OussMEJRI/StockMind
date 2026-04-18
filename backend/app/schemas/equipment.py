from pydantic import BaseModel, field_validator, field_serializer
from typing import Optional
from datetime import datetime


TYPE_TO_DB = {
    "pc": "PC",
    "laptop": "LAPTOP",
    "monitor": "MONITOR",
    "phone": "PHONE",
    "accessory": "ACCESSORY",
    "printer": "ACCESSORY",
    "other": "ACCESSORY",
    "PC": "PC",
    "LAPTOP": "LAPTOP",
    "MONITOR": "MONITOR",
    "PHONE": "PHONE",
    "ACCESSORY": "ACCESSORY",
}

COND_TO_DB = {
    "new": "NEW",
    "good": "USED",
    "fair": "USED",
    "poor": "OUT_OF_SERVICE",
    "out_of_service": "OUT_OF_SERVICE",
    "NEW": "NEW",
    "USED": "USED",
    "OUT_OF_SERVICE": "OUT_OF_SERVICE",
}

STATUS_TO_DB = {
    "in_stock": "IN_STOCK",
    "assigned": "ASSIGNED",
    "maintenance": "MAINTENANCE",
    "retired": "RETIRED",
    "IN_STOCK": "IN_STOCK",
    "ASSIGNED": "ASSIGNED",
    "MAINTENANCE": "MAINTENANCE",
    "RETIRED": "RETIRED",
}

DB_TO_API_TYPE = {
    "PC": "pc",
    "LAPTOP": "laptop",
    "MONITOR": "monitor",
    "PHONE": "phone",
    "ACCESSORY": "other",
}

DB_TO_API_CONDITION = {
    "NEW": "new",
    "USED": "good",
    "OUT_OF_SERVICE": "poor",
}

DB_TO_API_STATUS = {
    "IN_STOCK": "in_stock",
    "ASSIGNED": "assigned",
    "MAINTENANCE": "maintenance",
    "RETIRED": "retired",
}


def normalize_type(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    if value not in TYPE_TO_DB:
        raise ValueError(f"Unsupported equipment_type: {value}")
    return TYPE_TO_DB[value]


def normalize_condition(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    if value not in COND_TO_DB:
        raise ValueError(f"Unsupported condition: {value}")
    return COND_TO_DB[value]


def normalize_status(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    if value not in STATUS_TO_DB:
        raise ValueError(f"Unsupported status: {value}")
    return STATUS_TO_DB[value]


class EquipmentBase(BaseModel):
    serial_number: str
    model: str
    equipment_type: str
    condition: str
    status: str

    @field_validator("equipment_type", mode="before")
    @classmethod
    def validate_equipment_type(cls, v):
        return normalize_type(v)

    @field_validator("condition", mode="before")
    @classmethod
    def validate_condition(cls, v):
        return normalize_condition(v)

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, v):
        return normalize_status(v)


class EquipmentCreate(EquipmentBase):
    emplacement_id: Optional[int] = None
    employee_id: Optional[int] = None


class EquipmentUpdate(BaseModel):
    serial_number: Optional[str] = None
    model: Optional[str] = None
    equipment_type: Optional[str] = None
    condition: Optional[str] = None
    status: Optional[str] = None
    emplacement_id: Optional[int] = None
    employee_id: Optional[int] = None

    @field_validator("equipment_type", mode="before")
    @classmethod
    def validate_equipment_type(cls, v):
        return normalize_type(v)

    @field_validator("condition", mode="before")
    @classmethod
    def validate_condition(cls, v):
        return normalize_condition(v)

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, v):
        return normalize_status(v)


class EquipmentResponse(BaseModel):
    id: int
    serial_number: str
    model: str
    equipment_type: str
    condition: str
    status: str
    emplacement_id: Optional[int] = None
    employee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    @field_serializer("equipment_type")
    def serialize_equipment_type(self, value: str):
        return DB_TO_API_TYPE.get(value, value)

    @field_serializer("condition")
    def serialize_condition(self, value: str):
        return DB_TO_API_CONDITION.get(value, value)

    @field_serializer("status")
    def serialize_status(self, value: str):
        return DB_TO_API_STATUS.get(value, value)

    class Config:
        from_attributes = True