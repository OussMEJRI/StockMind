from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user  # ✅ Import corrigé
from app.schemas.chatbot import ChatbotQuery, ChatbotResponse
from app.services.chatbot import ChatbotService
from app.models.user import User

router = APIRouter()


@router.post("/query", response_model=ChatbotResponse)
async def chatbot_query(
    query: ChatbotQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Traite une question en langage naturel sur l'inventaire IT.
    
    Args:
        query: Question en langage naturel
        db: Session de base de données
        current_user: Utilisateur authentifié
    
    Returns:
        Réponse du chatbot avec la réponse et les données
    """
    chatbot_service = ChatbotService(db)
    result = await chatbot_service.process_query(query.question)
    
    return ChatbotResponse(
        answer=result["answer"],
        data=result["data"],
        confidence=result.get("confidence")
    )
