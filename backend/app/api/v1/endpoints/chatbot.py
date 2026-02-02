from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.chatbot import ChatbotQuery, ChatbotResponse
from app.services.chatbot import ChatbotService
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/query", response_model=ChatbotResponse)
async def chatbot_query(
    query: ChatbotQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process natural language query about the IT inventory.
    
    Args:
        query: Natural language question
        db: Database session
        current_user: Current authenticated user
    
    Returns:
        Chatbot response with answer and data
    """
    chatbot_service = ChatbotService(db)
    result = await chatbot_service.process_query(query.question)
    
    return ChatbotResponse(
        answer=result["answer"],
        data=result["data"],
        confidence=result.get("confidence")
    )
