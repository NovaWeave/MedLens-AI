import os
from typing import Optional
import json

import structlog

logger = structlog.get_logger()

try:
    import redis  # type: ignore
except Exception:
    redis = None  # type: ignore


class CacheClient:
    def __init__(self, url: Optional[str] = None) -> None:
        self.url = url or os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.client = None
        if redis is None:
            logger.warning("redis library not installed; cache disabled")
            return
        try:
            self.client = redis.from_url(self.url, decode_responses=True)
            self.client.ping()
            logger.info("Redis cache connected", url=self.url)
        except Exception as e:
            logger.warning("Redis cache unavailable; proceeding without cache", error=str(e))
            self.client = None

    def get_json(self, key: str) -> Optional[dict]:
        if not self.client:
            return None
        try:
            val = self.client.get(key)
            return json.loads(val) if val else None
        except Exception:
            return None

    def set_json(self, key: str, value: dict, ttl_seconds: int = 3600) -> None:
        if not self.client:
            return
        try:
            self.client.setex(key, ttl_seconds, json.dumps(value))
        except Exception:
            pass
