from Src.embeddings.embedder import Embedder

embedder = Embedder()

text = ["Machine learning is amazing"]
vector = embedder.embed_documents(text)

print(len(vector[0]))  # vector dimension