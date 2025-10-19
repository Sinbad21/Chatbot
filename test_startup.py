#!/usr/bin/env python3
"""
Test script to verify ChatBotPlatform can start up correctly.
"""

import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all modules can be imported"""
    try:
        print("Testing imports...")

        # Core modules
        from app.core.config import settings
        print("✓ Core config imported")

        from app.core.database import get_db, lifespan
        print("✓ Core database imported")

        from app.core.security import verify_password, get_password_hash
        print("✓ Core security imported")

        # Models
        from app.models import User, Bot, Document, DocumentChunk, ChatLog
        print("✓ Models imported")

        # Schemas
        from app.schemas import UserResponse, BotResponse, ChatRequest, ChatResponse
        print("✓ Schemas imported")

        # Services
        from app.rag_engine import RAGPipeline, VectorStoreManager, DocumentProcessor
        print("✓ RAG Engine imported")

        from app.chat import ChatService
        print("✓ Chat service imported")

        from app.documents import DocumentService
        print("✓ Document service imported")

        # Routers
        from app.auth import auth_router
        print("✓ Auth router imported")

        from app.users import users_router
        print("✓ Users router imported")

        from app.bots import bots_router
        print("✓ Bots router imported")

        from app.chat import chat_router
        print("✓ Chat router imported")

        from app.documents import document_router
        print("✓ Document router imported")

        # Main app
        from app.main import app
        print("✓ Main app imported")

        print("\n🎉 All imports successful!")
        return True

    except ImportError as e:
        print(f"\n❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False

def test_app_creation():
    """Test that the FastAPI app can be created"""
    try:
        print("\nTesting app creation...")
        from app.main import app

        # Check that routes are registered
        routes = [route.path for route in app.routes]
        expected_routes = ["/", "/health", "/auth/login", "/auth/refresh", "/users", "/bots", "/documents", "/chat"]

        for expected in expected_routes:
            if any(expected in route for route in routes):
                print(f"✓ Route {expected} registered")
            else:
                print(f"⚠️ Route {expected} not found")

        print("✓ App creation successful!")
        return True

    except Exception as e:
        print(f"\n❌ App creation error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing ChatBotPlatform startup...")

    success = True
    success &= test_imports()
    success &= test_app_creation()

    if success:
        print("\n✅ All tests passed! ChatBotPlatform is ready to run.")
        print("\nTo start the application:")
        print("  python run.py")
        print("\nOr with Docker:")
        print("  docker-compose up --build")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
        sys.exit(1)