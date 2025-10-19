import pdfplumber
from loguru import logger
from typing import Dict, Optional

def extract_pdf_text(path: str) -> tuple[str, Dict]:
    """
    Extract text from PDF page by page.
    Returns (full_text, metadata)
    """
    text = ""
    metadata = {}
    try:
        with pdfplumber.open(path) as pdf:
            metadata = pdf.metadata or {}
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        logger.error(f"Error extracting PDF {path}: {e}")
        return "", {}

    return text, metadata