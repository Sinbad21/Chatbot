"""
Vector Store Manager for ChatBotPlatform

Manages multiple FAISS vector stores, one per bot, with persistence to database.
Adapted from the existing FAISS implementation.
"""

import faiss
import numpy as np
import pickle
import os
from typing import List, Dict, Optional
import asyncio
from pathlib import Path
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.database import get_db
from ..models.user import DocumentChunk

logger = logging.getLogger(__name__)

class VectorStoreManager:
    """Manages FAISS vector stores for multiple bots"""

    def __init__(self, base_path: str = "data/vector_stores"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
        self.stores = {}  # bot_id -> FAISSStore instance
        self.embedding_dim = 1536  # text-embedding-3-small dimension

    def _get_store_path(self, bot_id: int) -> Path:
        """Get the path for a bot's vector store"""
        return self.base_path / f"bot_{bot_id}"

    def _get_index_path(self, bot_id: int) -> Path:
        """Get the path for a bot's FAISS index"""
        return self._get_store_path(bot_id) / "index.faiss"

    def _get_payloads_path(self, bot_id: int) -> Path:
        """Get the path for a bot's payloads"""
        return self._get_store_path(bot_id) / "payloads.pkl"

    def _load_store(self, bot_id: int) -> Optional[object]:
        """Load or create a FAISS store for a bot"""
        if bot_id in self.stores:
            return self.stores[bot_id]

        index_path = self._get_index_path(bot_id)
        payloads_path = self._get_payloads_path(bot_id)

        if index_path.exists() and payloads_path.exists():
            try:
                # Load existing store
                index = faiss.read_index(str(index_path))
                with open(payloads_path, 'rb') as f:
                    payloads = pickle.load(f)

                store = FAISSStore(index, payloads)
                self.stores[bot_id] = store
                logger.info(f"Loaded vector store for bot {bot_id}")
                return store
            except Exception as e:
                logger.error(f"Error loading store for bot {bot_id}: {e}")

        # Create new store
        store = FAISSStore()
        self.stores[bot_id] = store
        logger.info(f"Created new vector store for bot {bot_id}")
        return store

    def _save_store(self, bot_id: int):
        """Save a bot's vector store to disk"""
        if bot_id not in self.stores:
            return

        store = self.stores[bot_id]
        store_path = self._get_store_path(bot_id)
        store_path.mkdir(parents=True, exist_ok=True)

        try:
            # Save FAISS index
            faiss.write_index(store.index, str(self._get_index_path(bot_id)))

            # Save payloads
            with open(self._get_payloads_path(bot_id), 'wb') as f:
                pickle.dump(store.payloads, f)

            logger.info(f"Saved vector store for bot {bot_id}")
        except Exception as e:
            logger.error(f"Error saving store for bot {bot_id}: {e}")

    async def add_document_chunks(self, bot_id: int, chunks: List[Dict], vectors: List[List[float]]):
        """
        Add document chunks to a bot's vector store

        Args:
            bot_id: ID of the bot
            chunks: List of chunk dictionaries with metadata
            vectors: List of embedding vectors
        """
        store = self._load_store(bot_id)

        # Prepare payloads with document metadata
        payloads = []
        for chunk in chunks:
            payload = {
                'document_id': chunk['document_id'],
                'source_id': chunk.get('source_id', 'unknown'),
                'chunk_id': chunk['chunk_id'],
                'text': chunk['text'],
                'metadata': chunk.get('metadata', {})
            }
            payloads.append(payload)

        # Add to FAISS store
        store.upsert(vectors, payloads)

        # Save to disk
        self._save_store(bot_id)

        logger.info(f"Added {len(chunks)} chunks to bot {bot_id}")

    async def search(self, bot_id: int, query_vector: List[float], top_k: int = 5) -> List[Dict]:
        """
        Search for similar vectors in a bot's store

        Args:
            bot_id: ID of the bot
            query_vector: Query embedding vector
            top_k: Number of results to return

        Returns:
            List of similar document chunks
        """
        store = self._load_store(bot_id)
        return store.search(query_vector, top_k)

    async def delete_bot_store(self, bot_id: int):
        """Delete a bot's vector store"""
        if bot_id in self.stores:
            del self.stores[bot_id]

        store_path = self._get_store_path(bot_id)
        if store_path.exists():
            import shutil
            shutil.rmtree(store_path)
            logger.info(f"Deleted vector store for bot {bot_id}")

    async def get_store_stats(self, bot_id: int) -> Dict:
        """Get statistics for a bot's vector store"""
        store = self._load_store(bot_id)
        return {
            'total_vectors': len(store.payloads),
            'index_size': store.index.ntotal if store.index else 0
        }


class FAISSStore:
    """FAISS vector store implementation"""

    def __init__(self, index=None, payloads=None):
        self.index = index or faiss.IndexFlatIP(1536)  # Inner product for cosine
        self.payloads = payloads or []

    def upsert(self, vectors: List[List[float]], payloads: List[Dict]):
        """Add vectors and payloads to the store"""
        vecs = np.array(vectors, dtype=np.float32)
        faiss.normalize_L2(vecs)
        self.index.add(vecs)
        self.payloads.extend(payloads)

    def search(self, query_vector: List[float], top_k: int) -> List[Dict]:
        """Search for similar vectors"""
        if self.index.ntotal == 0:
            return []

        query = np.array([query_vector], dtype=np.float32)
        faiss.normalize_L2(query)

        distances, indices = self.index.search(query, min(top_k, self.index.ntotal))
        results = []

        for idx in indices[0]:
            if idx < len(self.payloads):
                results.append(self.payloads[idx])

        return results