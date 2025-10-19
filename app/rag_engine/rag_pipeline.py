"""
RAG Pipeline for ChatBotPlatform

Adapted from the existing RAG implementation to work with the multi-user platform.
Supports multiple bots per user with isolated vector stores.
"""

from openai import OpenAI
from typing import List, Dict, Tuple, Optional
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class RAGPipeline:
    """RAG Pipeline for document-based question answering"""

    def __init__(self, vector_store_manager, openai_client: Optional[OpenAI] = None):
        self.vector_store_manager = vector_store_manager
        self.openai_client = openai_client or OpenAI(api_key=settings.OPENAI_API_KEY)
        self.embedding_model = "text-embedding-3-small"
        self.llm_model = "gpt-4o-mini"

    def embed_query(self, text: str) -> List[float]:
        """Generate embeddings for query text"""
        try:
            response = self.openai_client.embeddings.create(
                input=[text],
                model=self.embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error embedding query: {e}")
            raise

    def retrieve_documents(self, query_vector: List[float], bot_id: int, top_k: int = 5) -> List[Dict]:
        """Retrieve relevant documents for a specific bot"""
        try:
            return self.vector_store_manager.search(bot_id, query_vector, top_k)
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return []

    def rerank_documents(self, query: str, docs: List[Dict]) -> List[Dict]:
        """Re-rank documents using cross-encoder (optional)"""
        try:
            from sentence_transformers import CrossEncoder
            model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
            scores = model.predict([(query, doc['text']) for doc in docs])
            ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
            return [doc for doc, score in ranked]
        except Exception as e:
            logger.warning(f"Re-ranking disabled: {e}")
            return docs

    def build_prompt(self, query: str, docs: List[Dict]) -> str:
        """Build prompt with context from retrieved documents"""
        if not docs:
            return f"""Answer the question based on general knowledge. If you cannot answer, say "Non ho informazioni sufficienti per rispondere a questa domanda."

Question: {query}

Answer:"""

        context = "\n".join([f"Source {i+1}: {doc['text']}" for i, doc in enumerate(docs)])
        prompt = f"""Answer the question based only on the provided context. Cite the sources when relevant. If the context does not contain the information, say "Non trovato nei documenti caricati".

Context:

{context}

Question: {query}

Answer:"""
        return prompt

    def generate_answer(self, prompt: str) -> str:
        """Generate answer using OpenAI LLM"""
        try:
            response = self.openai_client.chat.completions.create(
                model=self.llm_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1000
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return "Si è verificato un errore durante la generazione della risposta."

    def create_citations(self, docs: List[Dict]) -> List[Dict]:
        """Create citation objects from retrieved documents"""
        citations = []
        for doc in docs:
            citations.append({
                "document_id": doc.get('document_id'),
                "source_id": doc.get('source_id', 'unknown'),
                "chunk_id": doc.get('chunk_id', 'unknown'),
                "snippet": doc['text'][:200] + "..." if len(doc['text']) > 200 else doc['text']
            })
        return citations

    async def process_query(self, query: str, bot_id: int, top_k: int = 5) -> Tuple[str, List[Dict]]:
        """
        Process a user query through the RAG pipeline

        Args:
            query: User question
            bot_id: ID of the bot to query
            top_k: Number of documents to retrieve

        Returns:
            Tuple of (answer, citations)
        """
        try:
            # Generate query embedding
            query_vector = self.embed_query(query)

            # Retrieve relevant documents
            docs = self.retrieve_documents(query_vector, bot_id, top_k)

            # Re-rank documents (optional)
            docs = self.rerank_documents(query, docs)

            # Build prompt and generate answer
            prompt = self.build_prompt(query, docs)
            answer = self.generate_answer(prompt)

            # Create citations
            citations = self.create_citations(docs)

            logger.info(f"Processed query for bot {bot_id}: {query[:50]}...")
            return answer, citations

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return "Si è verificato un errore durante l'elaborazione della domanda.", []