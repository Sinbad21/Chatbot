"""
Bot Service for ChatBotPlatform

Handles bot management operations and access control.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..models.user import Bot, User, Document
from ..schemas import BotCreate, BotUpdate
import logging

logger = logging.getLogger(__name__)

class BotService:
    """Service for bot management operations"""

    @staticmethod
    async def create_bot(
        bot_data: BotCreate,
        owner: User,
        db: AsyncSession
    ) -> Bot:
        """Create a new bot"""
        try:
            bot = Bot(
                name=bot_data.name,
                owner_id=owner.id,
                is_public=bot_data.is_public
            )

            db.add(bot)
            await db.commit()
            await db.refresh(bot)

            logger.info(f"Bot '{bot.name}' created by user {owner.email}")
            return bot

        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating bot: {e}")
            raise

    @staticmethod
    async def get_bot_by_id(bot_id: int, db: AsyncSession) -> Optional[Bot]:
        """Get bot by ID with owner relationship loaded"""
        query = select(Bot).where(Bot.id == bot_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_bots(
        user: User,
        include_public: bool = True,
        db: AsyncSession = None
    ) -> List[Bot]:
        """Get bots accessible by user"""
        try:
            query = select(Bot)

            if user.role == "admin":
                # Admins can see all bots
                pass
            elif user.role == "manager":
                # Managers can see their own bots and public bots
                query = query.where(
                    (Bot.owner_id == user.id) |
                    (Bot.is_public == True)
                )
            else:
                # Regular users can see their own bots and public bots
                query = query.where(
                    (Bot.owner_id == user.id) |
                    (Bot.is_public == True)
                )

            result = await db.execute(query)
            return result.scalars().all()

        except Exception as e:
            logger.error(f"Error getting user bots: {e}")
            raise

    @staticmethod
    async def update_bot(
        bot: Bot,
        update_data: BotUpdate,
        updated_by: User,
        db: AsyncSession
    ) -> Bot:
        """Update bot information"""
        try:
            # Check permissions
            if not updated_by.can_access_bot(bot):
                raise PermissionError("Access denied to bot")

            # Update fields
            update_dict = update_data.dict(exclude_unset=True)

            for field, value in update_dict.items():
                setattr(bot, field, value)

            db.add(bot)
            await db.commit()
            await db.refresh(bot)

            logger.info(f"Bot '{bot.name}' updated by user {updated_by.email}")
            return bot

        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating bot: {e}")
            raise

    @staticmethod
    async def delete_bot(
        bot: Bot,
        deleted_by: User,
        db: AsyncSession
    ) -> bool:
        """Delete a bot"""
        try:
            # Check permissions
            if bot.owner_id != deleted_by.id and deleted_by.role != "admin":
                raise PermissionError("Access denied to bot")

            # Delete bot (cascade will handle related records)
            await db.delete(bot)
            await db.commit()

            logger.info(f"Bot '{bot.name}' deleted by user {deleted_by.email}")
            return True

        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting bot: {e}")
            raise

    @staticmethod
    async def get_bot_stats(bot_id: int, db: AsyncSession) -> dict:
        """Get statistics for a bot"""
        try:
            # Count documents
            doc_query = select(func.count(Document.id)).where(Document.bot_id == bot_id)
            doc_result = await db.execute(doc_query)
            documents_count = doc_result.scalar()

            # Count chat logs
            from ..models.user import ChatLog
            chat_query = select(func.count(ChatLog.id)).where(ChatLog.bot_id == bot_id)
            chat_result = await db.execute(chat_query)
            chat_logs_count = chat_result.scalar()

            return {
                "documents_count": documents_count or 0,
                "chat_logs_count": chat_logs_count or 0
            }

        except Exception as e:
            logger.error(f"Error getting bot stats: {e}")
            return {"documents_count": 0, "chat_logs_count": 0}