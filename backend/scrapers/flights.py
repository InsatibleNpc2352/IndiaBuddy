from .base import BaseScraper, TransportOption
from typing import List
from datetime import date
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class MakeMyTripScraper(BaseScraper):
    async def search(self, origin: str, destination: str, travel_date: date) -> List[TransportOption]:
        date_str = travel_date.strftime("%d%m%Y")
        url = f"https://www.makemytrip.com/flight/search?itinerary={origin}-{destination}-{date_str}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E"
        html = await self.fetch_page(url, "makemytrip", wait_for_selector=".fli-list", scroll_to_load=True)
        if not html:
            return []
        return self.parse_results(html)

    def parse_results(self, html: str) -> List[TransportOption]:
        soup = BeautifulSoup(html, 'html.parser')
        options = []
        for card in soup.select(".fli-list"):
            try:
                provider = self.clean_operator_name(card.select_one(".airlineName").text if card.select_one(".airlineName") else "Unknown")
                dep_el = card.select(".flightTimeInfo")
                departure = dep_el[0].text if len(dep_el) > 0 else ""
                arrival = dep_el[1].text if len(dep_el) > 1 else ""
                dur_el = card.select_one(".stop-info")
                duration = self.normalize_duration(dur_el.text) if dur_el else 0
                price_el = card.select_one(".blackText.fontSize18.blackFont")
                price = self.normalize_price(price_el.text) if price_el else 0.0
                options.append(TransportOption(provider, departure, arrival, duration, price))
            except Exception as e:
                logger.error(f"MMT parse error: {e}")
        return options

class GoibiboScraper(BaseScraper):
    async def search(self, origin: str, destination: str, travel_date: date) -> List[TransportOption]:
        date_str = travel_date.strftime("%Y%m%d")
        url = f"https://www.goibibo.com/flights/search/?from={origin}&to={destination}&date={date_str}&pax=1-0-0&class=E&source=metaSearch"
        html = await self.fetch_page(url, "goibibo", wait_for_selector=".search-result-card", scroll_to_load=True)
        if not html:
            return []
        return self.parse_results(html)

    def parse_results(self, html: str) -> List[TransportOption]:
        soup = BeautifulSoup(html, 'html.parser')
        options = []
        for card in soup.select(".search-result-card"):
            try:
                provider = self.clean_operator_name(card.select_one(".srp-card-uistyles__AirlineName-sc-3flq99-13").text if card.select_one(".srp-card-uistyles__AirlineName-sc-3flq99-13") else "Unknown")
                times = card.select(".srp-card-uistyles__Time-sc-3flq99-15")
                departure = times[0].text if len(times) > 0 else ""
                arrival = times[1].text if len(times) > 1 else ""
                dur_el = card.select_one(".srp-card-uistyles__DurTime-sc-3flq99-16")
                duration = self.normalize_duration(dur_el.text) if dur_el else 0
                price_el = card.select_one(".srp-card-uistyles__Price-sc-3flq99-17")
                price = self.normalize_price(price_el.text) if price_el else 0.0
                options.append(TransportOption(provider, departure, arrival, duration, price))
            except Exception as e:
                logger.error(f"Goibibo parse error: {e}")
        return options

class IxigoScraper(BaseScraper):
    async def search(self, origin: str, destination: str, travel_date: date) -> List[TransportOption]:
        date_str = travel_date.strftime("%d%m%Y")
        url = f"https://www.ixigo.com/search/result/flight?from={origin}&to={destination}&date={date_str}&adults=1&children=0&infants=0&class=e&source=Search%20Form"
        html = await self.fetch_page(url, "ixigo", wait_for_selector=".flight-list-container", scroll_to_load=True)
        if not html:
            return []
        return self.parse_results(html)

    def parse_results(self, html: str) -> List[TransportOption]:
        soup = BeautifulSoup(html, 'html.parser')
        options = []
        for card in soup.select(".c-flight-card"):
            try:
                provider = self.clean_operator_name(card.select_one(".u-text-ellipsis").text if card.select_one(".u-text-ellipsis") else "Unknown")
                dep_el = card.select_one(".time-info .start-time")
                arr_el = card.select_one(".time-info .end-time")
                departure = dep_el.text if dep_el else ""
                arrival = arr_el.text if arr_el else ""
                dur_el = card.select_one(".duration")
                duration = self.normalize_duration(dur_el.text) if dur_el else 0
                price_el = card.select_one(".price-text")
                price = self.normalize_price(price_el.text) if price_el else 0.0
                options.append(TransportOption(provider, departure, arrival, duration, price))
            except Exception as e:
                logger.error(f"Ixigo parse error: {e}")
        return options
