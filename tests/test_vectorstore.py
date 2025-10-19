import pytest
from unittest.mock import patch
from vectorstore.faiss_store import FAISSStore
import numpy as np

def test_faiss_store():
    store = FAISSStore()
    store.create_collections()
    vectors = [[1.0] * 1536, [2.0] * 1536]
    payloads = [{"id": 1}, {"id": 2}]
    store.upsert(vectors, payloads)
    results = store.search([1.0] * 1536, 1)
    assert len(results) == 1
    assert results[0]["id"] == 1