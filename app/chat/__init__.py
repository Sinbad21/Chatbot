"""
Chat Module for ChatBotPlatform

Handles chat conversations, message processing, and bot interactions.
"""

from .service import ChatService
from .router import router as chat_router

__all__ = ["ChatService", "chat_router"]