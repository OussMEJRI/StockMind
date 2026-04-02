from fastapi import APIRouter
from app.api.v1.endpoints import auth, employees, health, equipment, locations, chatbot, import_excel

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(equipment.router, prefix="/equipment", tags=["equipment"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(import_excel.router, prefix="/equipment", tags=["import"])