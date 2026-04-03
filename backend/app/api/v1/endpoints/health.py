from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
