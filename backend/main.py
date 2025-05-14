import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List , Dict, Any

from .CSP import run_search  # Replace with your actual function

app = FastAPI()

# Allow CORS (adjust origin for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set your frontend domain here in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model from frontend
class SearchRequest(BaseModel):
    attractions: List[str]
    hotels: List[str]
    restaurants: List[str]
    budget: float
    preferences: Dict[str, Any]  # Can hold anything like {'nature': True, 'culture': False}

@app.post("/search")
def search_tour(request: SearchRequest):
    input_data = request.dict()

    # Call your CSP logic with preferences
    result = run_search(
        attractions=input_data["attractions"],
        hotels=input_data["hotels"],
        restaurants=input_data["restaurants"],
        budget=input_data["budget"],
        preferences=input_data["preferences"]
    )

    return {"result": result}

@app.get("/")
def read_root():
    return {"message": "Tourism API is running"}