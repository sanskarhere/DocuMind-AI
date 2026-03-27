from Src.embeddings.embedder import Embedder
from Src.vectorstore.faiss_store import FAISSStore
from Src.retrieval.retriever import Retriever
#Load Vector store

embedder=Embedder()
faiss_store=FAISSStore(embedder.embedding_model)
faiss_store.load_vector_store()

retriever=Retriever(faiss_store.vector_store)

query='What Is The Main Idea Of Document'
context=retriever.retrieve(query)