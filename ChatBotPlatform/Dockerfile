# ===========================================
# ChatBotPlatform Dockerfile
# Multi-stage build for optimized production image
# ===========================================

# ===========================================
# BUILD STAGE
# ===========================================
FROM python:3.12-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ===========================================
# PRODUCTION STAGE
# ===========================================
FROM python:3.12-slim as production

# Install runtime system dependencies
RUN apt-get update && apt-get install -y \
    # PostgreSQL client
    postgresql-client \
    # File type detection
    libmagic1 \
    # SSL certificates
    ca-certificates \
    # Curl for health checks
    curl \
    # Timezone data
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r chatbot && useradd -r -g chatbot chatbot

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    PYTHONPATH="/app"

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Create application directories
RUN mkdir -p /app/data /app/logs /app/backups && \
    chown -R chatbot:chatbot /app

# Set working directory
WORKDIR /app

# Copy application code
COPY --chown=chatbot:chatbot . .

# Create logs directory and set permissions
RUN mkdir -p logs && \
    chown -R chatbot:chatbot logs data backups

# Switch to non-root user
USER chatbot

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Start application with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]