@echo off
cd /d %~dp0
python -c "
import os
if os.path.exists('.env'):
    from dotenv import load_dotenv
    load_dotenv()
from server.main import app
import uvicorn
uvicorn.run(app, host='127.0.0.1', port=8000)
"