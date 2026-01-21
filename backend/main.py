"""FastAPI backend for the Global News Explorer."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from news_service import NewsService
from world_regions import (
    COUNTRIES, REGIONS,
    get_all_countries, get_regions_for_country,
    is_valid_country, has_regions
)

# Load environment variables
load_dotenv()

# Global news service instance
news_service: NewsService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    global news_service
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        print("WARNING: NEWS_API_KEY not set. Set it in .env file or environment.")
    else:
        news_service = NewsService(api_key)
        print("NewsService initialized successfully")
    yield


app = FastAPI(
    title="Global News Explorer API",
    description="API for fetching news by country and region",
    version="3.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "message": "Global News Explorer API",
        "version": "3.0.0",
        "docs": "/docs",
        "endpoints": {
            "countries": "/api/countries",
            "regions": "/api/countries/{country}/regions",
            "news": "/api/news/{location}",
            "health": "/health"
        }
    }


@app.get("/api/countries")
async def get_countries():
    """Get list of all available countries with their info."""
    countries_list = []
    for name, info in COUNTRIES.items():
        countries_list.append({
            "name": name,
            "code": info["code"],
            "iso2": info["iso2"],
            "capital": info["capital"],
            "hasRegions": has_regions(name)
        })
    return {
        "countries": countries_list,
        "total": len(countries_list)
    }


@app.get("/api/countries/{country}/regions")
async def get_country_regions(country: str):
    """Get all regions (states/provinces) for a country."""
    # URL decode country name
    country = country.replace("%20", " ").strip()
    
    if not is_valid_country(country):
        raise HTTPException(
            status_code=404,
            detail=f"Country '{country}' not found"
        )
    
    regions = get_regions_for_country(country)
    regions_list = []
    for name, info in regions.items():
        regions_list.append({
            "name": name,
            "code": info["code"],
            "capital": info["capital"]
        })
    
    return {
        "country": country,
        "regions": regions_list,
        "total": len(regions_list)
    }


@app.get("/api/news/{location}")
async def get_news_for_location(location: str, count: int = 1):
    """
    Get random news articles for a specific location (country or state).
    
    Args:
        location: Name of the country or state (e.g., "France", "California")
        count: Number of articles to return (default: 1, max: 5)
    
    Returns:
        List of news articles for the location
    """
    if not news_service:
        raise HTTPException(
            status_code=503,
            detail="News service not available. Please set NEWS_API_KEY."
        )
    
    # Normalize location name (handle URL encoding)
    location = location.replace("%20", " ").strip()
    
    if not location:
        raise HTTPException(
            status_code=400,
            detail="Location name cannot be empty"
        )
    
    # Limit count to prevent abuse
    count = min(max(1, count), 5)
    
    try:
        # Fetch news for the location
        articles = await news_service.get_news_for_location(location, count)
        
        if not articles:
            return {
                "location": location,
                "articles": [],
                "message": f"No recent news found for {location}"
            }
        
        return {
            "location": location,
            "articles": articles
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching news: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "news_service": "available" if news_service else "unavailable",
        "countries_available": len(COUNTRIES),
        "regions_available": sum(len(r) for r in REGIONS.values())
    }
