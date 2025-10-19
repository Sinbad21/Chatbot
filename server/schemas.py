from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class Citation(BaseModel):
    url: Optional[str]
    source_id: str
    chunk_id: str
    snippet: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]