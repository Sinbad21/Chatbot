import pytest
from processing.chunking import split_into_chunks, normalize_text
import tiktoken

def test_normalize_text():
    text = "  Hello   \n\n  World  "
    assert normalize_text(text) == "Hello World"

def test_split_chunks():
    text = "This is a test. " * 100  # Long text
    chunks = split_into_chunks(text, target_tokens=50, overlap_tokens=10)
    enc = tiktoken.encoding_for_model("gpt-4")
    for chunk in chunks:
        n_tokens = len(enc.encode(chunk))
        assert n_tokens <= 50 + 10  # Allow some margin