import pytest
from unittest.mock import patch, MagicMock
from embeddings.index import EmbeddingCache, get_embeddings_batch

def test_cache():
    cache = EmbeddingCache(":memory:")
    cache.set("hash1", [1.0, 2.0], "model")
    vec = cache.get("hash1", "model")
    assert vec == [1.0, 2.0]
    assert cache.get("hash2", "model") is None

@patch('embeddings.index.OpenAI')
def test_get_embeddings_batch(mock_openai):
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.data = [MagicMock(embedding=[1.0, 2.0]), MagicMock(embedding=[3.0, 4.0])]
    mock_client.embeddings.create.return_value = mock_response
    
    vectors = get_embeddings_batch(mock_client, ["text1", "text2"], "model")
    assert vectors == [[1.0, 2.0], [3.0, 4.0]]