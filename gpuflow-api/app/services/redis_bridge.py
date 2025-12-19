import redis.asyncio as redis
import json
from app.core.config import CONFIG

redis_url: str = CONFIG.REDIS_URL


class RedisBridge:
    def __init__(self) -> None:
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)
        self.pubsub = self.redis.pubsub()

    async def publish_job_start(
        self, machine_id: str, job_id: str, code_payload: str
    ) -> None:
        message = {
            "event": "START_JOB",
            "machine_id": machine_id,
            "job_id": job_id,
            "code_payload": code_payload,
        }

        await self.redis.publish("gpu_events", json.dumps(message))

    async def close(self) -> None:
        await self.redis.close()


redis_bridge = RedisBridge()
