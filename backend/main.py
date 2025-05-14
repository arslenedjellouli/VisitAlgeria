import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

from CSP.CSP import TravelPlanner  # Your itinerary function
from CSP.CSP import UserPreferences  # Your original class

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for request parsing
class UserPreferencesModel(BaseModel):
    currentLat: float
    currentLong: float
    interests: List[str]
    budgetPerDay: float
    minHotelRat: float = 0
    maxHotelRat: float = 5
    visitedAttractions: Dict[str, bool] = {}
    currentWilaya: str = ""

@app.post("/search")
def search_tour(preferences: UserPreferencesModel):
    # Convert Pydantic model (preferences) to actual UserPreferences object

    planner = TravelPlanner('.\CSP\locations.csv', '.\CSP\wilaya_data.json')

    # Convert the incoming preferences data to UserPreferences object
    user_pref = UserPreferences(
        currentLat=preferences.currentLat,
        currentLong=preferences.currentLong,
        interests=preferences.interests,
        budgetPerDay=preferences.budgetPerDay,
        minHotelRat=preferences.minHotelRat,
        maxHotelRat=preferences.maxHotelRat,
        visitedAttractions=preferences.visitedAttractions,
        currentWilaya=preferences.currentWilaya
    )

    # Generate itinerary using the user preferences
    result = planner.generate_itinerary_json(user_pref)
    return result

@app.get("/")
def read_root():
    return {"message": "Tourism API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
