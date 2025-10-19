"""
Document Service for ChatBotPlatform

Handles document upload, processing, and management.
"""

import os
import uuid
from pathlib import Path
from typing import List, Optional
import shutil
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile, HTTPException
from ..models.user import Document, Bot, User
from ..rag_engine.document_processor import DocumentProcessor
from ..rag_engine.vector_store import VectorStoreManager
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

class DocumentService:
    """Service for document management"""

    def __init__(self):
        self.document_processor = DocumentProcessor()
        self.vector_store_manager = VectorStoreManager()
        self.upload_dir = Path("data/uploads")
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def upload_document(
        self,
        file: UploadFile,
        bot_id: int,
        user_id: int,
        db: AsyncSession
    ) -> Document:
        """
        Upload and process a document for a bot

        Args:
            file: Uploaded file
            bot_id: ID of the bot
            user_id: ID of the user
            db: Database session

        Returns:
            Created document record
        """
        try:
            # Verify bot exists and user has access
            bot = await db.get(Bot, bot_id)
            if not bot:
                raise ValueError(f"Bot {bot_id} not found")

            user = await db.get(User, user_id)
            if not user:
                raise ValueError(f"User {user_id} not found")

            if not user.can_access_bot(bot):
                raise PermissionError(f"User {user_id} cannot access bot {bot_id}")

            # Validate file type
            if not self._is_supported_file_type(file.filename):
                raise ValueError(f"Unsupported file type: {file.filename}")

            # Generate unique filename
            file_extension = Path(file.filename).suffix
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = self.upload_dir / unique_filename

            # Save uploaded file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Process document and create chunks
            document, chunks = await self.document_processor.process_document(
                file_path=str(file_path),
                filename=file.filename,
                bot_id=bot_id,
                user_id=user_id,
                db=db
            )

            # Add chunks to vector store
            chunk_data = [
                {
                    'document_id': chunk.document_id,
                    'source_id': f"{chunk.document_id}_{chunk.chunk_index}",
                    'chunk_id': f"{chunk.document_id}_{chunk.chunk_index}",
                    'text': chunk.content,
                    'metadata': chunk.metadata or {}
                }
                for chunk in chunks
            ]

            embeddings = [chunk.embedding for chunk in chunks]
            await self.vector_store_manager.add_document_chunks(bot_id, chunk_data, embeddings)

            logger.info(f"Uploaded document {file.filename} for bot {bot_id}: {len(chunks)} chunks")
            return document

        except Exception as e:
            # Clean up uploaded file on error
            if 'file_path' in locals() and file_path.exists():
                file_path.unlink()
            logger.error(f"Error uploading document: {e}")
            raise

    async def get_bot_documents(
        self,
        bot_id: int,
        user_id: int,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20
    ) -> List[Document]:
        """
        Get documents for a bot

        Args:
            bot_id: ID of the bot
            user_id: ID of the user
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of documents
        """
        try:
            # Verify access
            bot = await db.get(Bot, bot_id)
            if not bot:
                raise ValueError(f"Bot {bot_id} not found")

            user = await db.get(User, user_id)
            if not user or not user.can_access_bot(bot):
                raise PermissionError(f"Access denied to bot {bot_id}")

            from sqlalchemy import select
            query = select(Document).where(Document.bot_id == bot_id).offset(skip).limit(limit)
            result = await db.execute(query)
            return result.scalars().all()

        except Exception as e:
            logger.error(f"Error getting bot documents: {e}")
            raise

    async def delete_document(
        self,
        document_id: int,
        user_id: int,
        db: AsyncSession
    ) -> bool:
        """
        Delete a document and its chunks

        Args:
            document_id: ID of the document
            user_id: ID of the user
            db: Database session

        Returns:
            True if successful
        """
        try:
            # Get document and verify ownership
            document = await db.get(Document, document_id)
            if not document:
                raise ValueError(f"Document {document_id} not found")

            user = await db.get(User, user_id)
            if not user or not user.can_access_bot(document.bot):
                raise PermissionError(f"Access denied to document {document_id}")

            # Delete chunks from vector store
            await self.document_processor.delete_document_chunks(document_id, db)

            # Delete vector store data
            await self.vector_store_manager.delete_bot_store(document.bot_id)

            # Delete physical file
            if os.path.exists(document.file_path):
                os.unlink(document.file_path)

            # Delete from database
            await db.delete(document)
            await db.commit()

            logger.info(f"Deleted document {document_id}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting document: {e}")
            return False

    def _is_supported_file_type(self, filename: str) -> bool:
        """Check if file type is supported"""
        supported_extensions = ['.txt', '.pdf', '.md', '.docx']
        file_extension = Path(filename).suffix.lower()
        return file_extension in supported_extensions