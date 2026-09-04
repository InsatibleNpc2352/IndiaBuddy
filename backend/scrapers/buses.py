from .base import BaseScraper, TransportOption
from typing import List
from datetime import date
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class RedBusScraper(BaseScraper):
    async def search(self, origin: str, destination: str, travel_date: date, origin_id: str = "", dest_id: str = "") -> List[TransportOption]:
        date_str = travel_date.strftime("%d-%b-%Y")
        url = f"https://www.redbus.in/bus-tickets/{origin}-to-{destination}?fromCityName={origin}&toCityName={destination}&fromCityId={origin_id}&toCityId={dest_id}&onward={date_str}&busType=Any"
        html = await self.fetch_page(url, "redbus", wait_for_selector=".bus-items", scroll_to_load=True)
        if not html:
            return []
        return self.parse_results(html)

    def parse_results(self, html: str) -> List[TransportOption]:
        soup = BeautifulSoup(html, 'html.parser')
        options = []
        for card in soup.select(".bus-item"):
            try:
                provider = self.clean_operator_name(card.select_one(".travels").text if card.select_one(".travels") else "Unknown")
                departure = card.select_one(".dp-time").text if card.select_one(".dp-time") else ""
                arrival = card.select_one(".bp-time").text if card.select_one(".bp-time") else ""
                dur_el = card.select_one(".dur")
                duration = self.normalize_duration(dur_el.text) if dur_el else 0
                price_el = card.select_one(".fare")
                price = self.normalize_price(price_el.text) if price_el else 0.0
                options.append(TransportOption(provider, departure, arrival, duration, price, "Seater"))
            except Exception as e:
                logger.error(f"Redbus parse error: {e}")
        return options

class AbhiBusScraper(BaseScraper):
    async def search(self, origin: str, destination: str, travel_date: date) -> List[TransportOption]:
        date_str = travel_date.strftime("%Y-%m-%d")
        origin_lower = origin.lower()
        dest_lower = destination.lower()
        url = f"https://www.abhibus.com/{origin_lower}-to-{dest_lower}-bus-tickets?date={date_str}"
        html = await self.fetch_page(url, "abhibus", wait_for_selector=".bus-item", scroll_to_load=True)
        if not html:
            return []
        return self.parse_results(html)

    def parse_results(self, html: str) -> List[TransportOption]:
        soup = BeautifulSoup(html, 'html.parser')
        options = []
        for card in soup.select(".bus-item"):
            try:
                provider = self.clean_operator_name(card.select_one(".travel-agency").text if card.select_one(".travel-agency") else "Unknown")
                departure = card.select_one(".departure-time").text if card.select_one(".departure-time") else ""
                arrival = card.select_one(".arrival-time").text if card.select_one(".arrival-time") else ""
                dur_el = card.select_one(".duration")
                duration = self.normalize_duration(dur_el.text) if dur_el else 0
                price_el = card.select_one(".price")
                price = self.normalize_price(price_el.text) if price_el else 0.0
                options.append(TransportOption(provider, departure, arrival, duration, price, "Sleeper"))
            except Exception as e:
                logger.error(f"Abhibus parse error: {e}")
        return options
