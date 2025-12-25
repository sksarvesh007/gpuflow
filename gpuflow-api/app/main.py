from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import CONFIG
from app.db.session import get_db
from app.api.v1.router import router as api_router
import asyncio
import json
from contextlib import asynccontextmanager
from app.services.websocket_manager import manager
from app.services.redis_bridge import redis_bridge
from fastapi.middleware.cors import CORSMiddleware


async def listen_to_Redis():
    pubsub = redis_bridge.redis.pubsub()
    await pubsub.subscribe("gpu_events")

    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            target_machine_id = data.get("machine_id")
            event_type = data.get("event")

            if event_type == "START_JOB":
                print("Bridging job to websocket : ", target_machine_id)
                await manager.send_message(target_machine_id, data)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(listen_to_Redis())
    yield
    task.cancel()
    await redis_bridge.close()


app = FastAPI(title=CONFIG.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,  # type: ignore[arg-type]
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = "disconnected: " + str(e)

    return {
        "status": "ok",
        "db_status": db_status,
        "project": CONFIG.PROJECT_NAME,
        "version": CONFIG.VERSION,
    }


app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
