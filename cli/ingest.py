import typer
from ingestion.crawl import crawl
from ingestion.extract import extract_text, normalize_text
from ingestion.pdf import extract_pdf_text
from ingestion.schemas import RawDoc
from ingestion.store import save_raw_docs
from langdetect import detect
from datetime import datetime
from typing import Optional
import os

app = typer.Typer()

@app.command()
def crawl_web(seed: str, sitemap: Optional[str] = None, output_dir: str = "data"):
    """
    Crawl web from seed URL and optional sitemap
    """
    import asyncio
    from slugify import slugify

    async def run():
        seed_urls = [seed]
        results = await crawl(seed_urls, sitemap)
        docs = []
        for res in results:
            text, title = extract_text(res['content'], res['url'])
            text = normalize_text(text)
            try:
                lang = detect(text)
            except:
                lang = None
            doc = RawDoc(
                url=res['url'],
                content=text,
                content_type=res['content_type'],
                lang=lang,
                title=title,
                fetched_at=res['fetched_at'],
                source_id=slugify(res['url'])
            )
            docs.append(doc)
        save_raw_docs(docs, output_dir)

    asyncio.run(run())

@app.command()
def ingest_pdf(path: str, output_dir: str = "data"):
    """
    Ingest PDF file
    """
    text, metadata = extract_pdf_text(path)
    text = normalize_text(text)
    try:
        lang = detect(text)
    except:
        lang = None
    doc = RawDoc(
        path=path,
        content=text,
        content_type="application/pdf",
        lang=lang,
        title=metadata.get('Title'),
        fetched_at=datetime.now(),
        source_id=os.path.basename(path).replace('.pdf', '')
    )
    save_raw_docs([doc], output_dir)

if __name__ == "__main__":
    app()