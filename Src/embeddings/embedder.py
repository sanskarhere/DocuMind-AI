from langchain_huggingface import HuggingFaceEmbeddings

class Embedder:
    def __init__(self,model_name:str='sentence-transformers/all-MiniLM-L6-v2'):
        self.model_name=model_name
        self.embedding_model=self.load_model()

    def load_model(self):
        '''
        Load Embedding Model
        '''

        model=HuggingFaceEmbeddings(
            model_name=self.model_name
        )

        return model
    
    def embed_documents(self,documents):
        '''
        Conbert Documents Into Embedding
        '''
        return self.embedding_model.embed_documents(documents)
    def embed_query(self,query:str):

        return self.embedding_model.embed_query(query)