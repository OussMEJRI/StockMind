from fastapi import APIRouter
from app.api.v1.endpoints import auth, equipment, employees, locations, chatbot

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(equipment.router, prefix="/equipment", tags=["equipment"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(locations.router, prefix="/locations", tags=["locations"])
api_router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])
