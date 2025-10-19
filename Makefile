.PHONY: install encrypt-keys ingest-web ingest-pdf chunk embed vector-load serve web eval clean db-upgrade db-downgrade db-init

install:
	pip install -r requirements.txt

encrypt-keys:
	python encrypt_keys.py

ingest-web:
	python -m cli.ingest crawl --seed $(SEED_URL)

ingest-pdf:
	python -m cli.ingest ingest-pdf --path $(PDF_PATH)

chunk:
	python -m cli.chunk process --in data/clean --out data/chunks --target 400 --overlap 80

embed:
	python -m cli.embed run --in data/chunks --model text-embedding-3-small --batch-size 128

vector-load:
	python -m cli.vectorstore load --from data/embeddings/text-embedding-3-small.parquet --backend qdrant

serve:
	uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload

web:
	cd web && npm run dev

eval:
	python eval/run_eval.py

db-init:
	alembic revision --autogenerate -m "initial"

db-upgrade:
	alembic upgrade head

db-downgrade:
	alembic downgrade -1

clean:
	rm -rf data/raw/* data/clean/* data/chunks/* data/embeddings/* data/faiss/*