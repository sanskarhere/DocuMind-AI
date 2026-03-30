from Src.ingestion.data_loader import DataIngestion
from Src.embeddings.embedder import Embedder
from Src.vectorstore.faiss_store import FAISSSSTORE
from Src.retrieval.retriever import Retriever
from Src.llm.generator import Generator

class RAGPipeline:
    def __init__(self,file_path:str):
        self.file_path=file_path
        self.embedder=Embedder()
        self.generator=Generator()
        self.faiss_store=FAISSSSTORE(self.embedder.embedding_model)
        self.chat_memory=[]

    def build_index(self):
        ingestion=DataIngestion(self.file_path)
        chunks=ingestion.ingests()

        self.faiss_store.create_vector_store(chunks)
        self.faiss_store.save_vector_store()

        return 'Vector Store Created And Saved Succesfully'
    
    def load_index(self):
        '''
        Load Saved Vector Store From Disk'''

        self.faiss_store.load_vector_store()

        return 'Vector Store Loaded Succesfully'
    
    def get_chat_history(self,limit:int=3):
        '''
        Return last Few Conv Turns as Text'''
        history=self.chat_memory[-limit]
        formatted_history=''

        for i,item in enumerate(history,1):
            formatted_history+=(
                f"Turn {i}:\n"
                f"user: {item['question']}\n"
                f"Assistant: {item['answer']}\n\n"
            )


    def ask(self,query:str,k:int=3):
        """Full RAG flow:
        query -> retrieve context -> generate answer
        """         
        retriever=Retriever(self.faiss_store.vector_store)
        context=retriever.retrieve(query,k=k)
    
        answer=self.generator.generate(query,context)
        return answer