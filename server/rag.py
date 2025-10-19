from openai import OpenAI
from vectorstore.qdrant_store import QdrantStore
from typing import List, Dict
import os

def embed_query(text: str, client: OpenAI) -> List[float]:
    response = client.embeddings.create(input=[text], model="text-embedding-3-small")
    return response.data[0].embedding

def retrieve(query_vector: List[float], top_k: int, store) -> List[Dict]:
    return store.search(query_vector, top_k)

def rerank(query: str, docs: List[Dict]) -> List[Dict]:
    # Optional re-rank with lazy import to avoid SSL issues
    try:
        from sentence_transformers import CrossEncoder
        model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        scores = model.predict([(query, doc['text']) for doc in docs])
        ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
        return [doc for doc, score in ranked]
    except Exception as e:
        print(f"Re-ranking disabled due to: {e}")
        return docs  # Skip if not available

def build_prompt(query: str, docs: List[Dict]) -> str:
    context = "\n".join([f"Source {i+1}: {doc['text']}" for i, doc in enumerate(docs)])
    prompt = f"""Answer the question based only on the provided context. Cite the sources. If the context does not contain the information, say "Non trovato nei documenti".

Context:

{context}

Question: {query}

Answer:"""
    return prompt

def generate_answer(prompt: str, client: OpenAI, model: str = "gpt-4o-mini") -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1000
    )
    return response.choices[0].message.content

def rag_pipeline(query: str, store, client: OpenAI, top_k: int = 5) -> tuple[str, List[Dict]]:
    query_vector = embed_query(query, client)
    docs = retrieve(query_vector, top_k, store)
    docs = rerank(query, docs)
    prompt = build_prompt(query, docs)
    answer = generate_answer(prompt, client)
    citations = [
        {
            "url": doc.get('url'),
            "source_id": doc['source_id'],
            "chunk_id": doc['chunk_id'],
            "snippet": doc['text'][:200] + "..."
        } for doc in docs
    ]
    return answer, citations