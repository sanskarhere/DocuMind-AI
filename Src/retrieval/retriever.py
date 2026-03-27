

class Retriever:
    def __init__(self,vector_store):
        self.vector_store=vector_store

    def get_relevant_documents(self,query:str,k:int=3):
        '''
        Retrieve Top K Relevant Document'''

        results=self.vector_store.similarity_search(query,k=k)

        return results
    
    def format_context(self,documents):
        '''
        Convert Documents into a single context string'''

      
        context='\n\n'.join([doc.page_content for doc in documents])
        return context
    def retrieve(self,query:str,k:int=3):
        '''
        Full Retrieval Pipeline'''

        docs=self.get_relevant_documents(query,k)
        context=self.format_context(docs)
        return context