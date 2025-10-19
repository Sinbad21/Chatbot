from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RawDoc(BaseModel):
    url: Optional[str] = None
    path: Optional[str] = None
    content: str
    content_type: str
    lang: Optional[str] = None
    title: Optional[str] = None
    fetched_at: datetime
    source_id: str