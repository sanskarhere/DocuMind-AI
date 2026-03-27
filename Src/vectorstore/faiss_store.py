import os
from langchain_community.vectorstores import FAISS

class FAISSSSTORE:
    def __init__(self,embedding_model):
        self.embedding_model=embedding_model
        self.vector_store=None

    def create_vector_store(self,chunks):
        '''
        Create FAISS vector store from document chunks
        '''

        self.vector_store=FAISS.from_documents(
            documents=chunks,
            embedding=self.embedding_model
        )
        return self.vector_store
    
    def save_vector_store(self,folder_path:str='artifacts/faiss_index'):
        '''
        Save Faoiss index Locally
        '''

        if self.vector_store is None:
            raise ValueError('Vector Has Not Been Created yet')
        os.makedirs(folder_path,exist_ok=True)
        self.vector_store.save_local(folder_path)
    def load_vector_store(self,folder_path:str='artifacts/faiss_index'):
        '''
        Load Faiss index from local storage
        '''
        self.vector_store = FAISS.load_local(
            folder_path=folder_path,
            embbeddings=self.embedding_model,
            allow_dangerous_deserialization=True
        )
        return self.vector_store


    def similarity_search(self,query:str,k:int=3):
        '''
        Search Similar Chunk Of Query
        '''

        if self.vector_store is None:
            raise ValueError('Vector Store is Not loaded or Created yet')
         
        results=self.vector_store.similarity_search(query,k=k)
        return results