"""
Chat Service for ChatBotPlatform

Handles chat conversations and integrates with RAG pipeline.
"""

from typing import Optional, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.user import ChatLog, Bot, User
from ..rag_engine.rag_pipeline import RAGPipeline
from ..rag_engine.vector_store import VectorStoreManager
from ..core.config import settings
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)

class ChatService:
    """Service for handling chat conversations"""

    def __init__(self):
        self.vector_store_manager = VectorStoreManager()
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.rag_pipeline = RAGPipeline(
            vector_store_manager=self.vector_store_manager,
            openai_client=self.openai_client
        )

    async def process_message(
        self,
        message: str,
        bot_id: int,
        user_id: int,
        db: AsyncSession
    ) -> Dict:
        """
        Process a chat message and return response

        Args:
            message: User message
            bot_id: ID of the bot
            user_id: ID of the user
            db: Database session

        Returns:
            Dict with answer and citations
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

            # Process message through RAG pipeline
            answer, citations = await self.rag_pipeline.process_query(message, bot_id)

            # Log the conversation
            chat_log = ChatLog(
                bot_id=bot_id,
                user_id=user_id,
                question=message,
                answer=answer,
                citations=citations
            )
            db.add(chat_log)
            await db.commit()

            logger.info(f"Processed chat message for bot {bot_id}, user {user_id}")

            return {
                "answer": answer,
                "citations": citations,
                "bot_id": bot_id,
                "user_id": user_id
            }

        except Exception as e:
            logger.error(f"Error processing chat message: {e}")
            await db.rollback()
            raise

    async def get_chat_history(
        self,
        bot_id: int,
        user_id: int,
        db: AsyncSession,
        limit: int = 50
    ) -> List[Dict]:
        """
        Get chat history for a bot and user

        Args:
            bot_id: ID of the bot
            user_id: ID of the user
            db: Database session
            limit: Maximum number of messages to return

        Returns:
            List of chat messages
        """
        try:
            from sqlalchemy import select, desc

            query = select(ChatLog).where(
                ChatLog.bot_id == bot_id,
                ChatLog.user_id == user_id
            ).order_by(desc(ChatLog.timestamp)).limit(limit)

            result = await db.execute(query)
            chat_logs = result.scalars().all()

            # Convert to dict format
            history = []
            for log in reversed(chat_logs):  # Reverse to get chronological order
                history.append({
                    "id": log.id,
                    "question": log.question,
                    "answer": log.answer,
                    "citations": log.citations,
                    "timestamp": log.timestamp.isoformat()
                })

            return history

        except Exception as e:
            logger.error(f"Error getting chat history: {e}")
            raise

    async def clear_chat_history(
        self,
        bot_id: int,
        user_id: int,
        db: AsyncSession
    ) -> bool:
        """
        Clear chat history for a bot and user

        Args:
            bot_id: ID of the bot
            user_id: ID of the user
            db: Database session

        Returns:
            True if successful
        """
        try:
            from sqlalchemy import delete

            await db.execute(
                delete(ChatLog).where(
                    ChatLog.bot_id == bot_id,
                    ChatLog.user_id == user_id
                )
            )
            await db.commit()

            logger.info(f"Cleared chat history for bot {bot_id}, user {user_id}")
            return True

        except Exception as e:
            logger.error(f"Error clearing chat history: {e}")
            await db.rollback()
            return False