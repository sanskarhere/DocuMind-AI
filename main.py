import os
from Src.pipeline.rag_pipeline import RAGPipeline


if __name__=="__main__":
    pdf_path='course.pdf'
    index_path='artifacts/faiss_index'

    pipeline=RAGPipeline(pdf_path)

    if os.path.exists(index_path):
        print(pipeline.load_index())

    else:
        print(pipeline.build_index())

    while True:
        query=input('\nEnter Your Question or type "Exit"\n')

        if query.lower()=='exit':
            print('Exiting')
            break
        
        answer=pipeline.ask(query)
        print('\nAnswer:')
        print(answer)

