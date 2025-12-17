from fastapi import APIRouter
from app.api.v1.endpoints import users, auth, machines

router = APIRouter()
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(auth.router, tags=["auth"])
router.include_router(machines.router, prefix="/machines", tags=["machines"])
