from typing import Dict
from fastapi import WebSocket
from uuid import UUID


class ConnectionManager:
    def __init__(self):
        # keeps track of the active connections {machine_id: websocket_connection}
        self.active_connections: Dict[UUID, WebSocket] = {}

    async def connect(self, machine_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[machine_id] = websocket

    def disconnect(self, machine_id: str):
        if machine_id in self.active_connections:
            del self.active_connections[machine_id]

    async def send_message(self, machine_id: str, message: dict):
        if machine_id in self.active_connections:
            websocket = self.active_connections[machine_id]
            await websocket.send_json(message)


manager = ConnectionManager()
