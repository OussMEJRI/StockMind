from pydantic import BaseModel
from typing import Optional, Dict, Any


class ChatbotQuery(BaseModel):
    """Schema for chatbot natural language query."""
    question: str
    context: Optional[Dict[str, Any]] = None


class ChatbotResponse(BaseModel):
    """Schema for chatbot response."""
    answer: str
    data: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
