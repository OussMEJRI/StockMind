from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    employees,
    equipment,
    emplacements,
    chatbot,
    health,
    import_excel,
    employee_history
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(equipment.router, prefix="/equipment", tags=["equipment"])
api_router.include_router(emplacements.router, prefix="/emplacements", tags=["emplacements"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(import_excel.router, prefix="/import", tags=["import"])
# ✅ Historique des équipements par employé
api_router.include_router(employee_history.router, prefix="/employees", tags=["employee-history"])
