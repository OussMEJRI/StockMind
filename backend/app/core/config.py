from typing import Optional, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "IT Inventory Management"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "inventory_db"
    POSTGRES_PORT: int = 5432
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - AUTORISER TOUTES LES ORIGINES EN DEV
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # LLM API Configuration
    LLM_API_ENDPOINT: Optional[str] = None
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-3.5-turbo"
    
    class Config:
        case_sensitive = True

settings = Settings()
