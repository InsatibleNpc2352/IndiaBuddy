import feedparser
import logging
from typing import List, Dict
from datetime import date

logger = logging.getLogger(__name__)

RSS_FEEDS = {
    'toi_travel': 'https://timesofindia.indiatimes.com/rssfeeds/7097455.cms',
    'et_aviation': 'https://economictimes.indiatimes.com/industry/transportation/airlines-/-aviation/rssfeeds/20.cms',
    'et_travel': 'https://economictimes.indiatimes.com/travel/rssfeeds/21.cms',
    'business_standard': 'https://www.business-standard.com/rss/home_page_top_stories.rss',
}

class NewsFetcher:
    async def fetch_newsapi(self, query: str, from_date: date) -> List[Dict]:
        return [] # Placeholder

    async def fetch_rss(self, feed_url: str) -> List[Dict]:
        articles = []
        try:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries[:10]:
                articles.append({
                    "title": entry.title,
                    "link": entry.link,
                    "summary": entry.get("summary", ""),
                    "published": entry.get("published", "")
                })
        except Exception as e:
            logger.error(f"Failed to fetch RSS {feed_url}: {e}")
        return articles

    async def fetch_google_trends(self, keywords: List[str], timeframe: str) -> Dict:
        return {} # Placeholder
        
    async def fetch_all_sources(self) -> Dict[str, List[Dict]]:
        flight_articles = await self.fetch_rss(RSS_FEEDS['et_aviation'])
        train_articles = await self.fetch_rss(RSS_FEEDS['business_standard'])
        bus_articles = await self.fetch_rss(RSS_FEEDS['toi_travel'])
        fuel_articles = await self.fetch_rss(RSS_FEEDS['et_travel'])
        
        return {
            "flight_articles": flight_articles,
            "train_articles": train_articles,
            "bus_articles": bus_articles,
            "fuel_articles": fuel_articles
        }
