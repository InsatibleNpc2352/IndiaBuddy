import aiohttp
from bs4 import BeautifulSoup
import logging
from typing import List

logger = logging.getLogger(__name__)

PROMO_SOURCES = [
    {'name': 'coupondunia', 'url': 'https://coupondunia.in/makemytrip', 'type': 'flight'},
    {'name': 'grabon_mmt', 'url': 'https://www.grabon.in/makemytrip-coupons/', 'type': 'flight'},
    {'name': 'grabon_redbus', 'url': 'https://www.grabon.in/redbus-coupons/', 'type': 'bus'},
    {'name': 'cashkaro_flight', 'url': 'https://cashkaro.com/coupons/makemytrip', 'type': 'flight'},
    {'name': 'grabon_irctc', 'url': 'https://www.grabon.in/irctc-coupons/', 'type': 'train'},
]

class PromoCode:
    def __init__(self, code, type, discount, min_booking=0):
        self.code = code
        self.type = type
        self.discount = discount
        self.min_booking = min_booking
        self.is_verified = False
        self.last_verified_at = None

class PromoScraper:
    async def scrape_site(self, source: dict) -> List[PromoCode]:
        promos = []
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(source['url']) as response:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    # This logic depends on the specific site's structure
                    # Pseudo-logic for illustration
                    for item in soup.select('.coupon-code'):
                        code = item.text.strip()
                        if code:
                            promos.append(PromoCode(code, source['type'], "10%", 0))
        except Exception as e:
            logger.error(f"Error scraping {source['name']}: {e}")
        return promos

    async def scrape_all(self) -> List[PromoCode]:
        all_promos = []
        for source in PROMO_SOURCES:
            promos = await self.scrape_site(source)
            all_promos.extend(promos)
        return all_promos
