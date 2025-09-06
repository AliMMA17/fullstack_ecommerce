import asyncio, httpx
DEFAULT_TIMEOUT = 5.0
class HttpClient:
    def __init__(self, timeout: float = DEFAULT_TIMEOUT):
        self._client = httpx.AsyncClient(timeout=timeout)
    async def request_json(self, method: str, url: str, **kwargs):
        backoff = 0.2
        for attempt in range(3):
            try:
                r = await self._client.request(method, url, **kwargs)
                r.raise_for_status()
                return r.json()
            except httpx.HTTPError:
                if attempt == 2: raise
                await asyncio.sleep(backoff); backoff *= 2
    async def close(self):
        await self._client.aclose()