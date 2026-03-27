from Src.llm.generator import Generator

gen=Generator()

context='Transformers use attention mechanism'

query='why do transformer use'

answer=gen.generate(query,context)

print(answer)