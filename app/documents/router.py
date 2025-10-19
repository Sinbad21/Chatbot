"""
Document API Router for ChatBotPlatform

Provides endpoints for document upload and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..core.database import get_db
from ..auth.dependencies import get_current_user
from ..models.user import User
from .service import DocumentService
from ..schemas import DocumentResponse, DocumentUploadResponse, DocumentListResponse

router = APIRouter(prefix="/documents", tags=["documents"])
document_service = DocumentService()

@router.post("/upload/{bot_id}", response_model=DocumentUploadResponse)
async def upload_document(
    bot_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a document to a bot
    """
    try:
        document = await document_service.upload_document(
            file=file,
            bot_id=bot_id,
            user_id=current_user.id,
            db=db
        )

        # Count chunks
        chunks_count = len(document.chunks) if document.chunks else 0

        return DocumentUploadResponse(
            id=document.id,
            filename=document.filename,
            file_size=document.file_size,
            content_type=document.content_type,
            chunks_count=chunks_count,
            message=f"Document uploaded and processed successfully with {chunks_count} chunks"
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
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
            detail=f"Error uploading document: {str(e)}"
        )

@router.get("/bot/{bot_id}", response_model=List[DocumentResponse])
async def get_bot_documents(
    bot_id: int,
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get documents for a specific bot
    """
    try:
        documents = await document_service.get_bot_documents(
            bot_id=bot_id,
            user_id=current_user.id,
            db=db,
            skip=skip,
            limit=limit
        )

        return [
            DocumentResponse.from_orm(doc)
            for doc in documents
        ]

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
            detail=f"Error retrieving documents: {str(e)}"
        )

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a document
    """
    try:
        success = await document_service.delete_document(
            document_id=document_id,
            user_id=current_user.id,
            db=db
        )

        if success:
            return {"message": f"Document {document_id} deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete document"
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
            detail=f"Error deleting document: {str(e)}"
        )