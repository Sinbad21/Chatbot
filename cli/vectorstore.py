import typer
import pyarrow.parquet as pq
import os
from openai import OpenAI
from vectorstore.qdrant_store import QdrantStore
from vectorstore.faiss_store import FAISSStore
from cryptography.fernet import Fernet

def decrypt_api_key(encrypted_key: str, key: str) -> str:
    """Decrypt the API key using Fernet symmetric encryption."""
    f = Fernet(key.encode())
    return f.decrypt(encrypted_key.encode()).decode()

def get_openai_client():
    """Get OpenAI client with decrypted API key."""
    encryption_key = os.getenv("ENCRYPTION_KEY")
    encrypted_api_key = os.getenv("ENCRYPTED_OPENAI_API_KEY")
    
    if encryption_key and encrypted_api_key:
        api_key = decrypt_api_key(encrypted_api_key, encryption_key)
    else:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("No API key found")
    
    return OpenAI(api_key=api_key)

app = typer.Typer()

@app.command()
def load(from_file: str, backend: str = "qdrant"):
    """
    Load embeddings from parquet into vectorstore
    """
    table = pq.read_table(from_file)
    df = table.to_pandas()
    vectors = df['vector'].tolist()
    payloads = df[['chunk_id', 'source_id', 'n_tokens', 'url', 'path']].to_dict('records')
    
    if backend == "qdrant":
        store = QdrantStore()
        store.create_collections()
        store.upsert(vectors, payloads)
    elif backend == "faiss":
        store = FAISSStore()
        store.upsert(vectors, payloads)
        store.save()
    else:
        raise ValueError("Backend must be qdrant or faiss")

@app.command()
def search(text: str, k: int = 5, backend: str = "qdrant"):
    """
    Search for text in vectorstore
    """
    client = get_openai_client()
    response = client.embeddings.create(input=[text], model="text-embedding-3-small")
    query_vector = response.data[0].embedding
    
    if backend == "qdrant":
        store = QdrantStore()
    elif backend == "faiss":
        store = FAISSStore()
        store.load()
    else:
        raise ValueError("Backend must be qdrant or faiss")
    
    results = store.search(query_vector, k)
    for res in results:
        print(res)

if __name__ == "__main__":
    app()