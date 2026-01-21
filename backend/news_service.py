"""News API service for fetching location-based news articles."""

import os
import random
import httpx
from typing import Optional

NEWS_API_BASE_URL = "https://newsapi.org/v2"


class NewsService:
    """Service for fetching news from NewsAPI."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("NEWS_API_KEY")
        if not self.api_key:
            raise ValueError("NEWS_API_KEY environment variable is required")
    
    async def get_news_for_location(self, location: str, count: int = 1) -> list[dict]:
        """
        Fetch news articles for a given location (country, state, or city).
        
        Args:
            location: Name of the location (e.g., "France", "California", "Tokyo")
            count: Number of random articles to return
            
        Returns:
            List of news article dictionaries
        """
        async with httpx.AsyncClient() as client:
            # Search for news mentioning the location
            response = await client.get(
                f"{NEWS_API_BASE_URL}/everything",
                params={
                    "q": f'"{location}"',
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 30,  # Get more to pick random from
                },
                headers={"X-Api-Key": self.api_key},
                timeout=15.0
            )
            
            if response.status_code != 200:
                error_data = response.json()
                raise Exception(f"NewsAPI error: {error_data.get('message', 'Unknown error')}")
            
            data = response.json()
            articles = data.get("articles", [])
            
            if not articles:
                # Try without quotes for more results
                response = await client.get(
                    f"{NEWS_API_BASE_URL}/everything",
                    params={
                        "q": location,
                        "language": "en",
                        "sortBy": "publishedAt",
                        "pageSize": 30,
                    },
                    headers={"X-Api-Key": self.api_key},
                    timeout=15.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    articles = data.get("articles", [])
            
            if not articles:
                return []
            
            # Filter out articles with [Removed] content
            valid_articles = [
                a for a in articles 
                if a.get("title") != "[Removed]" 
                and a.get("description") 
                and a.get("description") != "[Removed]"
            ]
            
            if not valid_articles:
                return []
            
            # Select random articles
            selected = random.sample(valid_articles, min(count, len(valid_articles)))
            
            # Format the response
            return [
                {
                    "title": article.get("title", ""),
                    "description": article.get("description", ""),
                    "source": article.get("source", {}).get("name", "Unknown"),
                    "url": article.get("url", ""),
                    "imageUrl": article.get("urlToImage"),
                    "publishedAt": article.get("publishedAt", ""),
                }
                for article in selected
            ]
