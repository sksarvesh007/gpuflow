from fastapi import APIRouter
from app.api.v1.endpoints import users, auth, machines, websockets, jobs

router = APIRouter()
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(auth.router, tags=["auth"])
router.include_router(machines.router, prefix="/machines", tags=["machines"])
router.include_router(websockets.router, tags=["websockets"])
router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
