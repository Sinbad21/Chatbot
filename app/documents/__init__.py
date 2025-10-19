"""
Document Management Module for ChatBotPlatform

Handles document upload, storage, and processing for RAG.
"""

from .service import DocumentService
from .router import router as document_router

__all__ = ["DocumentService", "document_router"]