from .base import BaseScraper, TransportOption
from typing import List
from datetime import date
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class ErailScraper(BaseScraper):
    async def search(self, origin: str, destination: str, travel_date: date) -> List[TransportOption]:
        date_str = travel_date.strftime("%d-%b-%Y")
        url = f"https://erail.in/rail/getTrains.aspx?Station_From={origin}&Station_To={destination}&DataSource=0&Distance=0&df={date_str}"
        html = await self.fetch_page(url, "erail", wait_for_selector="table", scroll_to_load=False)
        if not html:
            return []
        return self.parse_results(html)

    def parse_results(self, html: str) -> List[TransportOption]:
        soup = BeautifulSoup(html, 'html.parser')
        options = []
        try:
            for row in soup.select("tr"):
                cols = row.select("td")
                if len(cols) > 5:
                    provider = self.clean_operator_name(cols[0].text + " - " + cols[1].text)
                    departure = cols[2].text
                    arrival = cols[3].text
                    duration = self.normalize_duration(cols[4].text)
                    price = 0.0 # Price might require another API call or element
                    options.append(TransportOption(provider, departure, arrival, duration, price, "Sleeper"))
        except Exception as e:
            logger.error(f"Erail parse error: {e}")
        return options

class IxigoTrainScraper(BaseScraper):
    async def search(self, origin: str, destination: str, travel_date: date) -> List[TransportOption]:
        date_str = travel_date.strftime("%Y%m%d")
        url = f"https://www.ixigo.com/search/result/train?from={origin}&to={destination}&date={date_str}&adults=1"
        html = await self.fetch_page(url, "ixigo_trains", wait_for_selector=".train-list", scroll_to_load=True)
        if not html:
            return []
        return self.parse_results(html)

    def parse_results(self, html: str) -> List[TransportOption]:
        soup = BeautifulSoup(html, 'html.parser')
        options = []
        for card in soup.select(".train-card"):
            try:
                provider = self.clean_operator_name(card.select_one(".train-name").text if card.select_one(".train-name") else "Unknown")
                departure = card.select_one(".dep-time").text if card.select_one(".dep-time") else ""
                arrival = card.select_one(".arr-time").text if card.select_one(".arr-time") else ""
                dur_el = card.select_one(".duration")
                duration = self.normalize_duration(dur_el.text) if dur_el else 0
                price_el = card.select_one(".fare")
                price = self.normalize_price(price_el.text) if price_el else 0.0
                options.append(TransportOption(provider, departure, arrival, duration, price, "Sleeper"))
            except Exception as e:
                logger.error(f"Ixigo train parse error: {e}")
        return options
