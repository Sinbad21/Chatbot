"""
RAG Engine Module for ChatBotPlatform

This module integrates the existing RAG pipeline with the multi-user chatbot platform.
It provides document ingestion, vector search, and conversational AI capabilities
with support for multiple bots per user.
"""

from .rag_pipeline import RAGPipeline
from .vector_store import VectorStoreManager
from .document_processor import DocumentProcessor

__all__ = ["RAGPipeline", "VectorStoreManager", "DocumentProcessor"]