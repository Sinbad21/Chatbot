"""
Bots Module for ChatBotPlatform

Handles bot management operations and document associations.
"""

from .service import BotService
from .router import router as bots_router

__all__ = ["BotService", "bots_router"]