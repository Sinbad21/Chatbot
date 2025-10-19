#!/usr/bin/env python3
import os
import uvicorn

# Load environment variables
if os.path.exists('.env'):
    from dotenv import load_dotenv
    load_dotenv()

# Ensure the encrypted API key is available
if 'OPENAI_API_KEY_ENCRYPTED' not in os.environ:
    print("❌ OPENAI_API_KEY_ENCRYPTED not found in environment")
    exit(1)

print("✅ Starting server with encrypted API key")
if __name__ == "__main__":
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=False)