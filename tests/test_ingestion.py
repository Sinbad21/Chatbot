import pytest
from ingestion.schemas import RawDoc
from ingestion.extract import extract_text, normalize_text
from ingestion.pdf import extract_pdf_text
from datetime import datetime

def test_extract_text():
    html = "<html><head><title>Test</title></head><body><h1>Hello</h1><p>World</p></body></html>"
    text, title = extract_text(html, "http://example.com")
    assert "Hello" in text
    assert "World" in text
    assert title == "Test"

def test_normalize_text():
    text = "  Hello   \n\n  World  "
    normalized = normalize_text(text)
    assert normalized == "Hello World"

def test_pdf_extract():
    # Mock or use a test PDF, but for now skip
    pass

def test_raw_doc():
    doc = RawDoc(
        url="http://example.com",
        content="test",
        content_type="text/html",
        fetched_at=datetime.now(),
        source_id="test"
    )
    assert doc.url == "http://example.com"