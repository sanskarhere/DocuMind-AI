from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

class Generator:
    def __init__(self,temperature:float=0.14):
        self.llm=ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=temperature,
            )

    def build_prompt(self,query:str,context:str,chat_history:str):
        '''
        Build Prompt With Context + Question'''

        prompt=f'''
      You are intelligent Assistant
Use the document context and conversation history only to answer the user's question.

Rules:
1. Prefer the document context for document-related questions.
2. Use chat history for conversation-related questions like:
   - "what was my last question?"
   - "what did you answer before?"
3. If the answer is not available in either the context or the chat history, say:
   "I don't know based on the given context."
      Conversation History:
      {chat_history}

      context:
      {context}

      Current question:
      {query}

       If the answer is not in the context,say:
       "I Dont Know Based On The Given Context"


'''
        return prompt
    
    def generate(self,query:str,context:str,chat_history:str=""):
        '''Generate Answer Using Llm'''

        prompt=self.build_prompt(query,context,chat_history)

        response=self.llm.invoke(prompt)

        return response.content