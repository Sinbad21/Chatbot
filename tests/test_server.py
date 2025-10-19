import pytest
from fastapi.testclient import TestClient
from server.main import app
from unittest.mock import patch, MagicMock

def test_health():
    client = TestClient(app)
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@patch('server.main.QdrantStore')
@patch('server.main.OpenAI')
@patch('server.main.rag_pipeline')
@patch.dict('os.environ', {'OPENAI_API_KEY': 'test-key'})
def test_chat(mock_rag, mock_openai, mock_store):
    mock_store_instance = MagicMock()
    mock_store.return_value = mock_store_instance
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    mock_rag.return_value = ("answer", [{"url": None, "source_id": "test", "chunk_id": "1", "snippet": "test"}])
    client = TestClient(app)
    response = client.post("/chat", json={"message": "test"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["citations"]) == 1