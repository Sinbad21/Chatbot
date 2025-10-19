import json
import os
from loguru import logger
from ingestion.schemas import RawDoc
from datetime import datetime
from typing import List
from slugify import slugify

def save_raw_docs(docs: List[RawDoc], output_dir: str):
    """
    Save RawDoc to data/raw/ and data/clean/ in JSONL
    """
    raw_dir = os.path.join(output_dir, 'raw')
    clean_dir = os.path.join(output_dir, 'clean')
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(clean_dir, exist_ok=True)

    # Group by source_id
    grouped = {}
    for doc in docs:
        if doc.source_id not in grouped:
            grouped[doc.source_id] = []
        grouped[doc.source_id].append(doc)

    for source_id, source_docs in grouped.items():
        # Raw
        raw_file = os.path.join(raw_dir, f"{source_id}.jsonl")
        with open(raw_file, 'w', encoding='utf-8') as f:
            for doc in source_docs:
                f.write(doc.model_dump_json() + '\n')

        # Clean: assume content is already clean
        clean_file = os.path.join(clean_dir, f"{source_id}.jsonl")
        with open(clean_file, 'w', encoding='utf-8') as f:
            for doc in source_docs:
                f.write(doc.model_dump_json() + '\n')

        logger.info(f"Saved {len(source_docs)} docs for source {source_id}")