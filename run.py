#!/usr/bin/env python3
"""
ChatBotPlatform Runner

Starts the FastAPI application with uvicorn.
"""

import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Add current directory to Python path
    import sys
    sys.path.insert(0, str(Path(__file__).parent))

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )