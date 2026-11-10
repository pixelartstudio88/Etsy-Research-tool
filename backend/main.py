# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI(title="Etsy Analyzer Backend")

# CORS must be enabled so the Chrome extension can make POST requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your specific chrome-extension:// ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected structure of the incoming data from content.js
class Listing(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = None
    price: Optional[float] = None
    url: Optional[str] = None
    image: Optional[str] = None

class EstimateRequest(BaseModel):
    listings: List[Listing]

@app.post("/api/estimates")
async def generate_estimates(payload: EstimateRequest):
    processed_listings = []
    
    for item in payload.listings:
        # Convert the Pydantic model to a dictionary to append new fields
        listing_data = item.model_dump()
        
        # MOCK ALGORITHM: Generate a random placeholder sales velocity
        mock_sales = random.randint(10, 850)
        
        listing_data["estimatedSales"] = mock_sales
        listing_data["estimatedRevenue"] = round(mock_sales * (item.price or 0), 2)
        
        processed_listings.append(listing_data)

    # background.js expects a { success: true, data: [...] } structure
    return {"success": True, "data": processed_listings}