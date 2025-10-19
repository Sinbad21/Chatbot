from trafilatura import extract
from readability import Document
from bs4 import BeautifulSoup
from loguru import logger
from typing import Optional
import re

def extract_text(content: str, url: str) -> tuple[str, Optional[str]]:
    """
    Extract main text content from HTML, removing boilerplate.
    Returns (text, title)
    """
    # Try trafilatura first
    extracted = extract(content, include_comments=False, include_tables=False, include_links=False, include_images=False, include_formatting=False)
    if extracted and len(extracted) > 100:  # Score check
        soup = BeautifulSoup(content, 'html.parser')
        title = soup.title.string if soup.title else None
        return extracted, title

    # Fallback to readability
    try:
        doc = Document(content)
        text = doc.summary()
        title = doc.title()
        # Clean HTML tags
        soup = BeautifulSoup(text, 'html.parser')
        text = soup.get_text()
        return text, title
    except:
        # Last resort: basic cleaning
        soup = BeautifulSoup(content, 'html.parser')
        for script in soup(["script", "style", "nav", "footer", "aside"]):
            script.decompose()
        text = soup.get_text()
        title = soup.title.string if soup.title else None
        return text, title

def normalize_text(text: str) -> str:
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text