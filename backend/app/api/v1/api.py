from fastapi import APIRouter
from app.api.v1.endpoints import auth, employees, health

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
