"""
Bots API Router for ChatBotPlatform

Provides bot CRUD operations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..core.database import get_db
from ..auth.dependencies import get_current_user
from ..models.user import User, Bot
from ..schemas import BotResponse, BotCreate, BotUpdate, BotDetailResponse

router = APIRouter(prefix="/bots", tags=["bots"])

@router.post("/", response_model=BotResponse)
async def create_bot(
    bot_data: BotCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new bot"""
    new_bot = Bot(
        name=bot_data.name,
        owner_id=current_user.id,
        is_public=bot_data.is_public
    )

    db.add(new_bot)
    await db.commit()
    await db.refresh(new_bot)

    return BotResponse.from_orm(new_bot)

@router.get("/", response_model=List[BotDetailResponse])
async def get_user_bots(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's bots"""
    from sqlalchemy import select
    query = select(Bot).where(Bot.owner_id == current_user.id)
    result = await db.execute(query)
    bots = result.scalars().all()

    bot_responses = []
    for bot in bots:
        # Count documents and chat logs
        documents_count = len(bot.documents) if bot.documents else 0
        chat_logs_count = len(bot.chat_logs) if bot.chat_logs else 0

        bot_response = BotDetailResponse.from_orm(bot)
        bot_response.documents_count = documents_count
        bot_response.chat_logs_count = chat_logs_count
        bot_response.owner_email = current_user.email
        bot_responses.append(bot_response)

    return bot_responses

@router.get("/public", response_model=List[BotResponse])
async def get_public_bots(
    db: AsyncSession = Depends(get_db)
):
    """Get all public bots"""
    from sqlalchemy import select
    query = select(Bot).where(Bot.is_public == True)
    result = await db.execute(query)
    bots = result.scalars().all()

    return [BotResponse.from_orm(bot) for bot in bots]

@router.get("/{bot_id}", response_model=BotDetailResponse)
async def get_bot(
    bot_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get bot by ID"""
    bot = await db.get(Bot, bot_id)
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bot {bot_id} not found"
        )

    if not current_user.can_access_bot(bot):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied to bot {bot_id}"
        )

    # Count documents and chat logs
    documents_count = len(bot.documents) if bot.documents else 0
    chat_logs_count = len(bot.chat_logs) if bot.chat_logs else 0

    response = BotDetailResponse.from_orm(bot)
    response.documents_count = documents_count
    response.chat_logs_count = chat_logs_count
    response.owner_email = bot.owner.email

    return response

@router.put("/{bot_id}", response_model=BotResponse)
async def update_bot(
    bot_id: int,
    bot_data: BotUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update bot"""
    bot = await db.get(Bot, bot_id)
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bot {bot_id} not found"
        )

    if bot.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized to update bot {bot_id}"
        )

    update_data = bot_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bot, field, value)

    db.add(bot)
    await db.commit()
    await db.refresh(bot)

    return BotResponse.from_orm(bot)

@router.delete("/{bot_id}")
async def delete_bot(
    bot_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete bot"""
    bot = await db.get(Bot, bot_id)
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bot {bot_id} not found"
        )

    if bot.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized to delete bot {bot_id}"
        )

    await db.delete(bot)
    await db.commit()

    return {"message": f"Bot {bot_id} deleted successfully"}