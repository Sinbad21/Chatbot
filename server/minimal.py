from fastapi import FastAPI
import os

# Load environment variables
if os.path.exists('.env'):
    from dotenv import load_dotenv
    load_dotenv()

print("🔧 Initializing minimal FastAPI app...")
app = FastAPI()

@app.get("/healthz")
def health():
    print("💚 Health check called - about to return response")
    result = {"status": "ok"}
    print(f"💚 Returning: {result}")
    return result

@app.on_event("shutdown")
def shutdown_event():
    print("🔄 Server shutting down")

print("✅ Minimal server initialized successfully")