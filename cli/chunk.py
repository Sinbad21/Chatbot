import typer
from processing.chunking import process_jsonl

app = typer.Typer()

@app.command()
def process(input_dir: str = "data/clean", output_dir: str = "data/chunks", target: int = 400, overlap: int = 80):
    """
    Process JSONL files into chunks
    """
    process_jsonl(input_dir, output_dir, target, overlap)

if __name__ == "__main__":
    app()