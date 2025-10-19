#!/usr/bin/env python3
import os
import uvicorn

# Load environment variables
if os.path.exists('.env'):
    from dotenv import load_dotenv
    load_dotenv()

from server.main import app

if __name__ == "__main__":
    print("🚀 Starting ChatBot RAG Server...")
    print("📍 Backend: http://127.0.0.1:8000")
    print("🌐 Frontend: http://localhost:5173")
    print("💾 Using FAISS vector store")
    uvicorn.run(app, host="127.0.0.1", port=8000)