import json
import os
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
import pandas as pd
from server.rag import rag_pipeline
from vectorstore.qdrant_store import QdrantStore
from openai import OpenAI
from cryptography.fernet import Fernet

def decrypt_api_key(encrypted_key: str, key: str) -> str:
    """Decrypt the API key using Fernet symmetric encryption."""
    f = Fernet(key.encode())
    return f.decrypt(encrypted_key.encode()).decode()

def run_eval():
    # Load questions
    questions_file = 'eval/questions.jsonl'
    if not os.path.exists(questions_file):
        print("Questions file not found")
        return

    with open(questions_file, 'r', encoding='utf-8') as f:
        questions = [json.loads(line) for line in f]

    # Initialize real components
    encryption_key = os.getenv("ENCRYPTION_KEY")
    encrypted_api_key = os.getenv("ENCRYPTED_OPENAI_API_KEY")
    
    if not encryption_key or not encrypted_api_key:
        print("Missing encryption key or encrypted API key. Set ENCRYPTION_KEY and ENCRYPTED_OPENAI_API_KEY")
        return
    
    api_key = decrypt_api_key(encrypted_api_key, encryption_key)
    client = OpenAI(api_key=api_key)
    store = QdrantStore()

    # Run real RAG evaluation
    results = []
    for q in questions:
        try:
            answer, citations = rag_pipeline(q['question'], store, client)
            contexts = [c['snippet'] for c in citations]
            result = {
                'question': q['question'],
                'answer': answer,
                'contexts': contexts,
                'ground_truth': q.get('expected_answer', '')
            }
            results.append(result)
            print(f"Evaluated: {q['question'][:50]}...")
        except Exception as e:
            print(f"Error evaluating question '{q['question']}': {e}")
            continue

    if not results:
        print("No results to evaluate")
        return

    df = pd.DataFrame(results)
    metrics = evaluate(df, metrics=[faithfulness, answer_relevancy, context_precision])
    print("Evaluation Metrics:")
    print(metrics)

    with open('eval/report.md', 'w', encoding='utf-8') as f:
        f.write("# Evaluation Report\n\n")
        f.write("## Metrics\n\n")
        f.write(str(metrics))
        f.write("\n\n## Sample Results\n\n")
        for i, result in enumerate(results[:5]):  # Show first 5
            f.write(f"### Question {i+1}: {result['question']}\n")
            f.write(f"**Answer:** {result['answer']}\n")
            f.write(f"**Ground Truth:** {result['ground_truth']}\n")
            f.write(f"**Contexts:** {len(result['contexts'])} retrieved\n\n")
        f.write("\n\n## Suggestions\n")
        f.write("- Vary chunk_size if precision low\n")
        f.write("- Enable re-ranker if relevancy low\n")
        f.write("- Check data quality if faithfulness is low\n")

if __name__ == "__main__":
    run_eval()