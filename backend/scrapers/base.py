from abc import ABC, abstractmethod
from typing import List
from datetime import date
import aiohttp
import re

class TransportOption:
    def __init__(self, provider, departure, arrival, duration, price, option_class="Economy"):
        self.provider = provider
        self.departure = departure
        self.arrival = arrival
        self.duration = duration
        self.price = price
        self.option_class = option_class

class BaseScraper(ABC):
    ghost_browser_url: str = "http://localhost:8001"
    
    async def fetch_page(self, url: str, site_name: str, selectors: List[str] = [], scroll_to_load: bool = False, wait_for_selector: str = None) -> str:
        payload = {
            "url": url,
            "site_name": site_name,
            "selectors": selectors,
            "scroll_to_load": scroll_to_load,
            "wait_for_selector": wait_for_selector
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{self.ghost_browser_url}/fetch", json=payload) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("html", "")
                return ""
    
    @abstractmethod
    async def search(self, origin: str, destination: str, travel_date: date) -> List[TransportOption]:
        pass
    
    @abstractmethod
    def parse_results(self, html: str) -> List[TransportOption]:
        pass
    
    def normalize_price(self, price_str: str) -> float:
        cleaned = re.sub(r'[^\d.]', '', price_str)
        try:
            return float(cleaned)
        except ValueError:
            return 0.0
            
    def normalize_duration(self, duration_str: str) -> int:
        hours = 0
        minutes = 0
        h_match = re.search(r'(\d+)\s*[hH]', duration_str)
        m_match = re.search(r'(\d+)\s*[mM]', duration_str)
        if h_match:
            hours = int(h_match.group(1))
        if m_match:
            minutes = int(m_match.group(1))
        return hours * 60 + minutes

    def clean_operator_name(self, name: str) -> str:
        return name.strip()
