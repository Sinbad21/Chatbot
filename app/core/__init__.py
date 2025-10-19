"""
Core Module for ChatBotPlatform

Contains configuration, database, and security utilities.
"""

from .config import settings
from .database import get_db, lifespan
from .security import verify_password, get_password_hash

__all__ = ["settings", "get_db", "lifespan", "verify_password", "get_password_hash"]