import json
import os
import hashlib
import tiktoken
from loguru import logger
from typing import List, Dict, Optional
import re

class Chunk:
    def __init__(self, chunk_id: str, source_id: str, url: Optional[str], path: Optional[str], start_char: int, end_char: int, text: str, n_tokens: int, title: Optional[str], lang: Optional[str], hash_val: str):
        self.chunk_id = chunk_id
        self.source_id = source_id
        self.url = url
        self.path = path
        self.start_char = start_char
        self.end_char = end_char
        self.text = text
        self.n_tokens = n_tokens
        self.title = title
        self.lang = lang
        self.hash = hash_val

    def to_dict(self):
        return {
            'chunk_id': self.chunk_id,
            'source_id': self.source_id,
            'url': self.url,
            'path': self.path,
            'start_char': self.start_char,
            'end_char': self.end_char,
            'text': self.text,
            'n_tokens': self.n_tokens,
            'title': self.title,
            'lang': self.lang,
            'hash': self.hash
        }

def normalize_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def split_into_chunks(text: str, target_tokens: int = 400, overlap_tokens: int = 80, model: str = "gpt-4") -> List[str]:
    enc = tiktoken.encoding_for_model(model)
    
    # Split by paragraphs
    paragraphs = re.split(r'\n\s*\n', text)
    chunks = []
    current_chunk = ""
    current_tokens = 0
    
    for para in paragraphs:
        para = normalize_text(para)
        if not para:
            continue
        para_tokens = len(enc.encode(para))
        
        if current_tokens + para_tokens > target_tokens:
            if current_chunk:
                chunks.append(current_chunk)
                # Overlap: take last overlap_tokens from current
                overlap_text = enc.decode(enc.encode(current_chunk)[-overlap_tokens:])
                current_chunk = overlap_text + " " + para
                current_tokens = len(enc.encode(current_chunk))
            else:
                # If para too long, split by sentences
                sentences = re.split(r'(?<=[.!?])\s+', para)
                temp_chunk = ""
                temp_tokens = 0
                for sent in sentences:
                    sent_tokens = len(enc.encode(sent))
                    if temp_tokens + sent_tokens > target_tokens:
                        if temp_chunk:
                            chunks.append(temp_chunk)
                            temp_chunk = sent
                            temp_tokens = sent_tokens
                        else:
                            # Force split
                            chunks.append(sent[:target_tokens*4])  # approx
                            temp_chunk = sent[target_tokens*4:]
                            temp_tokens = len(enc.encode(temp_chunk))
                    else:
                        temp_chunk += " " + sent
                        temp_tokens += sent_tokens
                if temp_chunk:
                    current_chunk = temp_chunk
                    current_tokens = temp_tokens
        else:
            current_chunk += " " + para
            current_tokens += para_tokens
    
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks

def process_jsonl(input_dir: str, output_dir: str, target_tokens: int = 400, overlap_tokens: int = 80):
    os.makedirs(output_dir, exist_ok=True)
    
    for file in os.listdir(input_dir):
        if not file.endswith('.jsonl'):
            continue
        input_file = os.path.join(input_dir, file)
        output_file = os.path.join(output_dir, file)
        
        with open(input_file, 'r', encoding='utf-8') as f_in, open(output_file, 'w', encoding='utf-8') as f_out:
            for line in f_in:
                doc = json.loads(line)
                text = doc['content']
                chunks = split_into_chunks(text, target_tokens, overlap_tokens)
                
                start_char = 0
                for i, chunk_text in enumerate(chunks):
                    end_char = start_char + len(chunk_text)
                    enc = tiktoken.encoding_for_model("gpt-4")
                    n_tokens = len(enc.encode(chunk_text))
                    hash_val = hashlib.sha256(chunk_text.encode()).hexdigest()
                    chunk_id = f"{doc['source_id']}_{i}"
                    
                    chunk = Chunk(
                        chunk_id=chunk_id,
                        source_id=doc['source_id'],
                        url=doc.get('url'),
                        path=doc.get('path'),
                        start_char=start_char,
                        end_char=end_char,
                        text=chunk_text,
                        n_tokens=n_tokens,
                        title=doc.get('title'),
                        lang=doc.get('lang'),
                        hash_val=hash_val
                    )
                    f_out.write(json.dumps(chunk.to_dict()) + '\n')
                    start_char = end_char - overlap_tokens * 4  # approx char overlap