from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

class Generator:
    def __init__(self,temperature:float=0):
        self.llm=ChatGroq(temperature=temperature)

    def build_prompt(self,query:str,context:str):
        '''
        Build Prompt With Context + Question'''

        prompt=f'''
      You are intelligent Assistant

      Answer The Question Based On Only Context Provided Below

      context:
      {context}

      question:
      {query}

       If the answer is not in the context,say:
       "I Dont Know Based On The Given Context"
'''
        return prompt
    
    def generate(self,query:str,context:str):
        '''Generate Answer Using Llm'''

        prompt=self.build_prompt(query,context)

        response=self.llm.invoke(
            [(HumanMessage(content=prompt))]
        )

        return response.content