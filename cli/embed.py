import typer
from embeddings.index import embed_chunks
import os
from cryptography.fernet import Fernet

def decrypt_api_key(encrypted_key: str, key: str) -> str:
    """Decrypt the API key using Fernet symmetric encryption."""
    f = Fernet(key.encode())
    return f.decrypt(encrypted_key.encode()).decode()

app = typer.Typer()

@app.command()
def run(input_glob: str = "data/chunks/*.jsonl", model: str = "text-embedding-3-small", batch_size: int = 128):
    """
    Generate embeddings for chunks
    """
    # Try encrypted key first, fallback to plain
    encryption_key = os.getenv("ENCRYPTION_KEY")
    encrypted_api_key = os.getenv("ENCRYPTED_OPENAI_API_KEY")
    
    if encryption_key and encrypted_api_key:
        api_key = decrypt_api_key(encrypted_api_key, encryption_key)
    else:
        api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        raise ValueError("No API key found. Set ENCRYPTION_KEY/ENCRYPTED_OPENAI_API_KEY or OPENAI_API_KEY")
    
    embed_chunks(input_glob, model, batch_size, api_key)

if __name__ == "__main__":
    app()