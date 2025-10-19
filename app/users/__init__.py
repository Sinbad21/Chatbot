"""
Users Module for ChatBotPlatform

Handles user management operations with hierarchical role support.
"""

from .service import UserService
from .router import router as users_router

__all__ = ["UserService", "users_router"]