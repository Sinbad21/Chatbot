"""
Configuration Management for ChatBotPlatform

Pydantic settings with environment variable support.
"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"  # Default for testing

    # JWT
    JWT_SECRET_KEY: str = "test-secret-key-for-development-only"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OpenAI
    OPENAI_API_KEY: str = "test-key"
    OPENAI_API_KEY_ENCRYPTED: Optional[str] = None  # For backward compatibility

    # Application
    APP_NAME: str = "ChatBotPlatform"
    DEBUG: bool = True

    # File uploads
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = [".txt", ".pdf", ".md", ".docx"]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Allow extra fields in env file

settings = Settings()