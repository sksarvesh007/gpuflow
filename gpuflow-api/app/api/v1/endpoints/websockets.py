from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.websocket_manager import manager
from app.models.machine import Machine

router = APIRouter()

@router.websocket("/ws/machine/{auth_token}")
async def websocket_endpoint