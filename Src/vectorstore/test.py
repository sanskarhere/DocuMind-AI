from Src.ingestion.data_loader import DataIngestion
from Src.embeddings.embedder import Embedder
from Src.vectorstore.faiss_store import FAISSStore

# Step 1: Load and chunk documents
ingestion = DataIngestion("")
chunks = ingestion.ingest()

# Step 2: Load embedding model
embedder = Embedder()

# Step 3: Create vector store
faiss_store = FAISSStore(embedder.embedding_model)
faiss_store.create_vector_store(chunks)

# Step 4: Search
results = faiss_store.similarity_search("What is the main topic of the document?", k=2)

for i, doc in enumerate(results, 1):
    print(f"\nResult {i}:")
    print(doc.page_content[:500])
    print("-" * 50)