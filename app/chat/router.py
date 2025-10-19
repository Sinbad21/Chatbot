"""
Chat API Router for ChatBotPlatform

Provides endpoints for chat conversations and message handling.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..core.database import get_db
from ..auth.dependencies import get_current_user
from ..models.user import User
from .service import ChatService
from ..schemas import ChatRequest, ChatResponse, ChatHistoryResponse

router = APIRouter(prefix="/chat", tags=["chat"])
chat_service = ChatService()

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message to a bot and get a response
    """
    try:
        result = await chat_service.process_message(
            message=request.message,
            bot_id=request.bot_id,
            user_id=current_user.id,
            db=db
        )

        return ChatResponse(
            answer=result["answer"],
            citations=result["citations"],
            bot_id=result["bot_id"],
            user_id=result["user_id"]
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat message: {str(e)}"
        )

@router.get("/history/{bot_id}", response_model=List[ChatHistoryResponse])
async def get_chat_history(
    bot_id: int,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get chat history for a specific bot
    """
    try:
        # Verify user has access to the bot
        from ..models.user import Bot
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

        history = await chat_service.get_chat_history(
            bot_id=bot_id,
            user_id=current_user.id,
            db=db,
            limit=limit
        )

        return [
            ChatHistoryResponse(
                id=msg["id"],
                question=msg["question"],
                answer=msg["answer"],
                citations=msg["citations"],
                timestamp=msg["timestamp"]
            )
            for msg in history
        ]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving chat history: {str(e)}"
        )

@router.delete("/history/{bot_id}")
async def clear_chat_history(
    bot_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Clear chat history for a specific bot
    """
    try:
        # Verify user has access to the bot
        from ..models.user import Bot
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

        success = await chat_service.clear_chat_history(
            bot_id=bot_id,
            user_id=current_user.id,
            db=db
        )

        if success:
            return {"message": f"Chat history cleared for bot {bot_id}"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clear chat history"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error clearing chat history: {str(e)}"
        )