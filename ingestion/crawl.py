import asyncio
import aiohttp
from urllib.robotparser import RobotFileParser
from urllib.parse import urlparse, urljoin
import hashlib
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger
from typing import List, Set, Dict, Optional
import time
from datetime import datetime
from slugify import slugify
from slugify import slugify

class Crawler:
    def __init__(self, user_agent: str = "ChatBotCrawler/1.0", concurrency: int = 10, rate_limit: float = 1.0):
        self.user_agent = user_agent
        self.concurrency = concurrency
        self.rate_limit = rate_limit
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, Dict] = {}  # url -> {'etag': str, 'last_modified': str}

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(headers={'User-Agent': self.user_agent})
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    def can_fetch(self, url: str) -> bool:
        parsed = urlparse(url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = RobotFileParser()
        rp.set_url(robots_url)
        try:
            rp.read()
            return rp.can_fetch(self.user_agent, url)
        except:
            return True  # If can't read robots, assume allowed

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def fetch_url(self, url: str) -> Optional[Dict]:
        if not self.can_fetch(url):
            logger.warning(f"Blocked by robots.txt: {url}")
            return None

        headers = {}
        if url in self.cache:
            if 'etag' in self.cache[url]:
                headers['If-None-Match'] = self.cache[url]['etag']
            if 'last_modified' in self.cache[url]:
                headers['If-Modified-Since'] = self.cache[url]['last_modified']

        await asyncio.sleep(1 / self.rate_limit)  # Rate limiting

        try:
            async with self.session.get(url, headers=headers) as resp:
                if resp.status == 304:
                    logger.info(f"Not modified: {url}")
                    return None
                if resp.status != 200:
                    logger.warning(f"Failed to fetch {url}: {resp.status}")
                    return None

                content = await resp.text()
                etag = resp.headers.get('ETag')
                last_modified = resp.headers.get('Last-Modified')

                self.cache[url] = {'etag': etag, 'last_modified': last_modified}

                return {
                    'url': url,
                    'content': content,
                    'content_type': resp.headers.get('Content-Type', 'text/html'),
                    'fetched_at': datetime.now()
                }
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    async def crawl_sitemap(self, sitemap_url: str) -> List[str]:
        data = await self.fetch_url(sitemap_url)
        if not data:
            return []

        # Simple XML parsing for sitemap
        import xml.etree.ElementTree as ET
        try:
            root = ET.fromstring(data['content'])
            urls = []
            for elem in root.iter():
                if 'loc' in elem.tag:
                    urls.append(elem.text)
            return urls
        except:
            return []

    async def crawl_seed_urls(self, seed_urls: List[str], max_depth: int = 2) -> List[Dict]:
        visited: Set[str] = set()
        to_visit = seed_urls.copy()
        results = []

        for depth in range(max_depth):
            if not to_visit:
                break

            semaphore = asyncio.Semaphore(self.concurrency)
            tasks = []

            async def fetch_with_semaphore(url):
                async with semaphore:
                    return await self.fetch_url(url)

            for url in to_visit:
                if url not in visited:
                    visited.add(url)
                    tasks.append(fetch_with_semaphore(url))

            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            for res in batch_results:
                if isinstance(res, dict):
                    results.append(res)
                    # Extract links for next depth (simple)
                    # For brevity, not implementing link extraction

            to_visit = []  # Not continuing depth for now

        return results

async def crawl(seed_urls: List[str], sitemap_url: Optional[str] = None) -> List[Dict]:
    async with Crawler() as crawler:
        urls = seed_urls.copy()
        if sitemap_url:
            sitemap_urls = await crawler.crawl_sitemap(sitemap_url)
            urls.extend(sitemap_urls)

        # Dedup
        urls = list(set(urls))

        results = await crawler.crawl_seed_urls(urls)
        return results