from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dataclasses import dataclass
#Create DataIngestionConfig


class DataIngestion:
    def __init__(self,file_path:str):
        self.file_path=file_path

    def load_documents(self):
        '''
        load pdf and return document object
        '''
        loader=PyPDFLoader(self.file_path)
        documents=loader.load()
        return documents
    
    def split_documents(self,documents):
        '''
        Split Document into chunks
        '''
        text_splitter=RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )

        chunks=text_splitter.split_documents(documents)
        return chunks
    def ingests(self):
        '''Pipeline'''

        docs=self.load_documents()
        chunks=self.split_documents(docs)
        return chunks