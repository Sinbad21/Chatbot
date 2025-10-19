"""
Authentication Module for ChatBotPlatform

Handles user authentication, JWT tokens, and role-based access control.
"""

from .jwt import create_access_token, create_refresh_token, verify_token
from .password import hash_password, verify_password
from .dependencies import get_current_user
from .router import router as auth_router

__all__ = [
    "create_access_token",
    "create_refresh_token",
    "verify_token",
    "hash_password",
    "verify_password",
    "get_current_user",
    "auth_router"
]