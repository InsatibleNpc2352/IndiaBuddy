import os
import logging
from playwright.async_api import BrowserContext

logger = logging.getLogger(__name__)

SESSION_DIR = "/app/sessions"
os.makedirs(SESSION_DIR, exist_ok=True)

async def save_session(context: BrowserContext, site_name: str):
    try:
        path = os.path.join(SESSION_DIR, f"{site_name}_session.json")
        await context.storage_state(path=path)
        logger.info(f"Session saved for {site_name}")
    except Exception as e:
        logger.error(f"Failed to save session for {site_name}: {e}")

async def get_session_path(site_name: str) -> str:
    path = os.path.join(SESSION_DIR, f"{site_name}_session.json")
    if os.path.exists(path):
        return path
    return None
