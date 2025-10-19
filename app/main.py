"""
ChatBotPlatform - Main FastAPI Application

A comprehensive chatbot platform with multi-user support, JWT authentication,
PostgreSQL database, and integrated RAG engine.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
import logging
from .core.database import create_tables, lifespan
from .auth.router import router as auth_router
from .users.router import router as users_router
from .bots.router import router as bots_router
from .documents.router import router as documents_router
from .chat.router import router as chat_router
from .core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app with lifespan
app = FastAPI(
    title="ChatBotPlatform",
    description="A comprehensive chatbot platform with RAG capabilities",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(bots_router)
app.include_router(documents_router)
app.include_router(chat_router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "message": "ChatBotPlatform is running"
    }

@app.get("/", response_class=HTMLResponse)
async def root():
    """Simple web interface for the chatbot platform"""
    html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChatBotPlatform</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        .api-info {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .endpoint {
            background: #f8f9fa;
            padding: 1rem;
            margin: 0.5rem 0;
            border-radius: 4px;
            border-left: 4px solid #007bff;
        }
        .method {
            font-weight: bold;
            color: #007bff;
        }
        code {
            background: #e9ecef;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 ChatBotPlatform</h1>
        <p>A comprehensive chatbot platform with RAG capabilities</p>
        <p><a href="/docs">📚 API Documentation</a></p>
    </div>

    <div class="api-info">
        <h2>🚀 API Endpoints</h2>

        <div class="endpoint">
            <span class="method">POST</span> <code>/auth/login</code> - User authentication
        </div>

        <div class="endpoint">
            <span class="method">POST</span> <code>/auth/refresh</code> - Refresh access token
        </div>

        <div class="endpoint">
            <span class="method">GET</span> <code>/users/me</code> - Get current user info
        </div>

        <div class="endpoint">
            <span class="method">POST</span> <code>/bots/</code> - Create a new bot
        </div>

        <div class="endpoint">
            <span class="method">GET</span> <code>/bots/</code> - List user's bots
        </div>

        <div class="endpoint">
            <span class="method">POST</span> <code>/documents/upload/{bot_id}</code> - Upload document to bot
        </div>

        <div class="endpoint">
            <span class="method">POST</span> <code>/chat/</code> - Send message to bot
        </div>

        <div class="endpoint">
            <span class="method">GET</span> <code>/chat/history/{bot_id}</code> - Get chat history
        </div>

        <h3>📋 Getting Started</h3>
        <ol>
            <li>Register a new user account</li>
            <li>Login to get access token</li>
            <li>Create a bot</li>
            <li>Upload documents to your bot</li>
            <li>Start chatting with your bot!</li>
        </ol>

        <p><strong>Note:</strong> This is a development interface. For production use, implement a proper frontend application.</p>
    </div>
</body>
</html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )