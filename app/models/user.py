# ===========================================
# Database Models
# SQLAlchemy models for the application
# ===========================================

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from typing import Optional, List

from ..core.database import Base


# ===========================================
# USER MODEL
# ===========================================

class User(Base):
    """User model with role-based access control."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")  # user, manager, admin
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For hierarchical management
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    parent = relationship("User", remote_side=[id], backref="children")
    bots = relationship("Bot", back_populates="owner")
    chat_logs = relationship("ChatLog", back_populates="user")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")

    # ===========================================
    # CLASS METHODS
    # ===========================================

    @classmethod
    async def get_by_id(cls, db, user_id: int):
        """Get user by ID."""
        from sqlalchemy import select
        result = await db.execute(select(cls).where(cls.id == user_id))
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_email(cls, db, email: str):
        """Get user by email."""
        from sqlalchemy import select
        result = await db.execute(select(cls).where(cls.email == email))
        return result.scalar_one_or_none()

    @classmethod
    async def get_users_by_role(cls, db, role: str, parent_id: Optional[int] = None):
        """Get users by role, optionally filtered by parent."""
        from sqlalchemy import select
        query = select(cls).where(cls.role == role)
        if parent_id is not None:
            query = query.where(cls.parent_id == parent_id)
        result = await db.execute(query)
        return result.scalars().all()

    # ===========================================
    # INSTANCE METHODS
    # ===========================================

    def can_manage_user(self, target_user) -> bool:
        """Check if this user can manage the target user."""
        if self.role == "admin":
            return True
        if self.role == "manager" and target_user.role == "user":
            # Manager can manage their direct subordinates or unassigned users
            return target_user.parent_id == self.id or target_user.parent_id is None
        return False

    def can_access_bot(self, bot) -> bool:
        """Check if user can access a bot."""
        if bot.is_public:
            return True
        return bot.owner_id == self.id or self.can_manage_user(bot.owner)


# ===========================================
# BOT MODEL
# ===========================================

class Bot(Base):
    """Bot model representing a chatbot instance."""

    __tablename__ = "bots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="bots")
    documents = relationship("Document", back_populates="bot", cascade="all, delete-orphan")
    chat_logs = relationship("ChatLog", back_populates="bot", cascade="all, delete-orphan")


# ===========================================
# DOCUMENT MODEL
# ===========================================

class Document(Base):
    """Document model for uploaded files."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    content_type = Column(String(100), nullable=False)
    bot_id = Column(Integer, ForeignKey("bots.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    bot = relationship("Bot", back_populates="documents")
    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Document(id={self.id}, filename='{self.filename}', bot_id={self.bot_id})>"


# ===========================================
# DOCUMENT CHUNK MODEL
# ===========================================

class DocumentChunk(Base):
    """Document chunk model for vector storage"""

    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=False)  # Store as JSON array
    chunk_metadata = Column(JSON, nullable=True)  # Additional metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    document = relationship("Document", back_populates="chunks")

    # Indexes for performance
    __table_args__ = (
        Index('ix_document_chunks_document_id', 'document_id'),
        Index('ix_document_chunks_chunk_index', 'document_id', 'chunk_index'),
    )

    def __repr__(self):
        return f"<DocumentChunk(id={self.id}, document_id={self.document_id}, chunk_index={self.chunk_index})>"


# ===========================================
# CHAT LOG MODEL
# ===========================================

class ChatLog(Base):
    """Chat conversation log model."""

    __tablename__ = "chat_logs"

    id = Column(Integer, primary_key=True, index=True)
    bot_id = Column(Integer, ForeignKey("bots.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    citations = Column(JSON, nullable=True)  # Store citations as JSON
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    bot = relationship("Bot", back_populates="chat_logs")
    user = relationship("User", back_populates="chat_logs")