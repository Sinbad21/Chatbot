# ===========================================
# Core Configuration Module
# Database, settings, logging, and utilities
# ===========================================

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.pool import AsyncAdaptedQueuePool
import structlog
import logging
from pathlib import Path
from typing import AsyncGenerator
from contextlib import asynccontextmanager

from .config import settings


# ===========================================
# DATABASE SETUP
# ===========================================

class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


# Create async engine with connection pooling
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=settings.db_pool_size,
    max_overflow=settings.db_max_overflow,
    pool_recycle=settings.db_pool_recycle,
)

# Create async session factory
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ===========================================
# DATABASE SESSION MANAGEMENT
# ===========================================

@asynccontextmanager
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Alternative session provider for dependency injection."""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


# ===========================================
# LOGGING CONFIGURATION
# ===========================================

def setup_logging() -> None:
    """Configure structured logging with file and console output."""
    # Create logs directory
    log_dir = Path(settings.log_file).parent
    log_dir.mkdir(exist_ok=True)

    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Configure standard logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.log_level.upper()),
    )

    # Add file handler for application logs
    file_handler = logging.FileHandler(settings.log_file)
    file_handler.setFormatter(
        logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    )
    file_handler.setLevel(getattr(logging, settings.log_level.upper()))

    # Add handler to root logger
    root_logger = logging.getLogger()
    root_logger.addHandler(file_handler)

    # Set specific log levels for noisy libraries
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    logging.getLogger('httpx').setLevel(logging.WARNING)
    logging.getLogger('openai').setLevel(logging.INFO)


# ===========================================
# LIFESPAN MANAGEMENT
# ===========================================

@asynccontextmanager
async def lifespan(app):
    """Application lifespan manager for startup/shutdown events."""
    # Startup
    logger = structlog.get_logger(__name__)
    logger.info("Starting ChatBotPlatform")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database tables created/verified")

    yield

    # Shutdown
    logger.info("Shutting down ChatBotPlatform")
    await engine.dispose()


# ===========================================
# UTILITY FUNCTIONS
# ===========================================

def create_storage_dirs() -> None:
    """Create necessary storage directories."""
    dirs = [
        Path(settings.storage_path),
        Path(settings.storage_path) / "bots",
        Path(settings.storage_path) / "temp",
        Path(settings.log_file).parent,
        Path(settings.backup_dir),
    ]

    for dir_path in dirs:
        dir_path.mkdir(parents=True, exist_ok=True)


async def init_db() -> None:
    """Initialize database and create tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# Import here to avoid circular imports
import sys
from .config import settings