from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

class Item(BaseModel):
	name: str
	description: str = Optional[str]

items: List[Item] = []

@app.get("/items", response_model=List[Item])
def get_items():
	return items

@app.post("/items", response_model=Item)
def create_item(item: Item):
	items.append(item)
	return item