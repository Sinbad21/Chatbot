# ===========================================
# Application Settings Configuration
# Pydantic settings with environment variable support
# ===========================================

from pydantic import BaseSettings, Field
from typing import List, Optional
import secrets
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ===========================================
    # SECURITY SETTINGS
    # ===========================================

    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    bcrypt_rounds: int = Field(default=12, env="BCRYPT_ROUNDS")

    # JWT settings
    access_token_expire_minutes: int = Field(default=60, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")

    # ===========================================
    # DATABASE SETTINGS
    # ===========================================

    database_url: str = Field(..., env="DATABASE_URL")
    db_pool_size: int = Field(default=10, env="DB_POOL_SIZE")
    db_max_overflow: int = Field(default=20, env="DB_MAX_OVERFLOW")
    db_pool_recycle: int = Field(default=3600, env="DB_POOL_RECYCLE")

    # ===========================================
    # OPENAI API SETTINGS
    # ===========================================

    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    embedding_model: str = Field(default="text-embedding-3-small", env="EMBEDDING_MODEL")
    chat_model: str = Field(default="gpt-4o-mini", env="CHAT_MODEL")
    openai_max_tokens: int = Field(default=3000, env="OPENAI_MAX_TOKENS")
    openai_temperature: float = Field(default=0.1, env="OPENAI_TEMPERATURE")

    # ===========================================
    # FILE STORAGE SETTINGS
    # ===========================================

    storage_path: str = Field(default="data", env="STORAGE_PATH")
    max_upload_size_mb: int = Field(default=50, env="MAX_UPLOAD_SIZE_MB")
    allowed_extensions: List[str] = Field(default=["pdf", "txt", "docx", "md"], env="ALLOWED_EXTENSIONS")

    # ===========================================
    # RAG ENGINE SETTINGS
    # ===========================================

    chunk_size: int = Field(default=1000, env="CHUNK_SIZE")
    chunk_overlap: int = Field(default=200, env="CHUNK_OVERLAP")
    max_chunks_per_doc: int = Field(default=1000, env="MAX_CHUNKS_PER_DOC")
    top_k_results: int = Field(default=5, env="TOP_K_RESULTS")
    similarity_threshold: float = Field(default=0.7, env="SIMILARITY_THRESHOLD")

    # ===========================================
    # RATE LIMITING
    # ===========================================

    rate_limit_requests: int = Field(default=50, env="RATE_LIMIT_REQUESTS")
    rate_limit_burst: int = Field(default=100, env="RATE_LIMIT_BURST")

    # ===========================================
    # CORS SETTINGS
    # ===========================================

    cors_origins: List[str] = Field(default=["http://localhost:3000", "http://localhost:5173"], env="CORS_ORIGINS")

    # ===========================================
    # LOGGING SETTINGS
    # ===========================================

    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_file: str = Field(default="logs/chatbot.log", env="LOG_FILE")
    log_max_size: int = Field(default=10, env="LOG_MAX_SIZE")
    log_backup_count: int = Field(default=5, env="LOG_BACKUP_COUNT")

    # ===========================================
    # DEVELOPMENT SETTINGS
    # ===========================================

    debug: bool = Field(default=False, env="DEBUG")
    auto_reload: bool = Field(default=True, env="AUTO_RELOAD")

    # ===========================================
    # DEPLOYMENT SETTINGS
    # ===========================================

    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    workers: int = Field(default=4, env="WORKERS")

    # ===========================================
    # OPTIONAL SERVICES
    # ===========================================

    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")

    # Email settings
    smtp_server: Optional[str] = Field(default=None, env="SMTP_SERVER")
    smtp_port: Optional[int] = Field(default=None, env="SMTP_PORT")
    smtp_username: Optional[str] = Field(default=None, env="SMTP_USERNAME")
    smtp_password: Optional[str] = Field(default=None, env="SMTP_PASSWORD")

    # ===========================================
    # MONITORING
    # ===========================================

    enable_metrics: bool = Field(default=False, env="ENABLE_METRICS")
    metrics_port: int = Field(default=9090, env="METRICS_PORT")

    # ===========================================
    # BACKUP SETTINGS
    # ===========================================

    backup_dir: str = Field(default="backups", env="BACKUP_DIR")
    backup_interval: int = Field(default=24, env="BACKUP_INTERVAL")
    backup_retention: int = Field(default=30, env="BACKUP_RETENTION")

    # ===========================================
    # COMPUTED PROPERTIES
    # ===========================================

    @property
    def max_upload_size_bytes(self) -> int:
        """Maximum upload size in bytes."""
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def storage_path_obj(self) -> Path:
        """Storage path as Path object."""
        return Path(self.storage_path)

    @property
    def log_file_obj(self) -> Path:
        """Log file path as Path object."""
        return Path(self.log_file)

    @property
    def backup_dir_obj(self) -> Path:
        """Backup directory as Path object."""
        return Path(self.backup_dir)

    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()