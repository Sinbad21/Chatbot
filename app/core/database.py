"""
Database Configuration for ChatBotPlatform

Async SQLAlchemy setup with PostgreSQL.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from contextlib import asynccontextmanager
import logging
from .config import settings

logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    """Base class for all database models"""
    pass

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# Create async session factory
async_session = async_sessionmaker(engine, expire_on_commit=False)

@asynccontextmanager
async def lifespan(app):
    """Application lifespan context manager"""
    # Startup
    logger.info("Starting up ChatBotPlatform...")
    await create_tables()
    yield
    # Shutdown
    logger.info("Shutting down ChatBotPlatform...")
    await engine.dispose()

async def create_tables():
    """Create all database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")

async def get_db() -> AsyncSession:
    """Get database session"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()