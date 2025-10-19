# ===========================================
# Pydantic Schemas
# Request/Response models for API validation
# ===========================================

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ===========================================
# USER SCHEMAS
# ===========================================

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    role: str = Field(default="user", pattern="^(user|manager|admin)$")


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = None
    role: Optional[str] = Field(None, pattern="^(user|manager|admin)$")
    is_active: Optional[bool] = None
    parent_id: Optional[int] = None


class UserResponse(UserBase):
    """Schema for user response data."""
    id: int
    is_active: bool
    parent_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Schema for paginated user list response."""
    users: List[UserResponse]
    total: int
    page: int
    per_page: int


# ===========================================
# AUTHENTICATION SCHEMAS
# ===========================================

class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class PasswordChangeRequest(BaseModel):
    """Schema for password change request."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ===========================================
# BOT SCHEMAS
# ===========================================

class BotBase(BaseModel):
    """Base bot schema."""
    name: str = Field(..., min_length=1, max_length=100)


class BotCreate(BotBase):
    """Schema for creating a new bot."""
    is_public: bool = False


class BotUpdate(BaseModel):
    """Schema for updating bot information."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_public: Optional[bool] = None


class BotResponse(BotBase):
    """Schema for bot response data."""
    id: int
    owner_id: int
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class BotDetailResponse(BotResponse):
    """Schema for detailed bot response with related data."""
    documents_count: int = 0
    chat_logs_count: int = 0
    owner_email: str


# ===========================================
# DOCUMENT SCHEMAS
# ===========================================

class DocumentUploadResponse(BaseModel):
    """Schema for document upload response."""
    id: int
    filename: str
    file_size: int
    content_type: str
    chunks_count: int
    message: str


class DocumentResponse(BaseModel):
    """Schema for document response data."""
    id: int
    filename: str
    file_path: str
    file_size: int
    content_type: str
    bot_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Schema for paginated document list response."""
    documents: List[DocumentResponse]
    total: int
    page: int
    per_page: int


# ===========================================
# CHAT SCHEMAS
# ===========================================

class Citation(BaseModel):
    """Schema for citation data."""
    document_id: Optional[int]
    source_id: str
    chunk_id: str
    snippet: str


class ChatRequest(BaseModel):
    """Schema for chat message request."""
    message: str = Field(..., min_length=1, max_length=2000)
    bot_id: int


class ChatResponse(BaseModel):
    """Schema for chat response."""
    answer: str
    citations: List[Citation] = []
    bot_id: int
    user_id: int


class ChatHistoryResponse(BaseModel):
    """Schema for chat history response."""
    id: int
    question: str
    answer: str
    citations: Optional[List[Citation]]
    timestamp: str


# ===========================================
# GENERAL SCHEMAS
# ===========================================

class HealthResponse(BaseModel):
    """Schema for health check response."""
    status: str = "healthy"
    timestamp: datetime
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str
    message: str
    timestamp: datetime


class PaginationParams(BaseModel):
    """Schema for pagination parameters."""
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)