from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.websocket_manager import manager
from app.models.machine import Machine

router = APIRouter()


@router.websocket("/ws/machine/{auth_token}")
async def websocket_endpoint(
    websocket: WebSocket, auth_token: str, db: Session = Depends(get_db)
):
    machine = db.query(Machine).filter(Machine.auth_token == auth_token).first()
    if not machine:
        await websocket.close(code=4003)  # Unauthorized
        return

    machine_id = str(machine.id)
    await manager.connect(machine_id, websocket)

    machine.is_online = True
    machine.status = "idle"
    db.commit()

    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "hardware_info":
                machine.gpu_name = data.get("gpu_name")
                machine.vram_gb = data.get("vram_gb")
                db.commit()
                print(
                    f"Updated hardware specs for {machine.name}: GPU={machine.gpu_name}, VRAM={machine.vram_gb}GB"
                )
            if data.get("type") == "heartbeat":
                print(f"Heartbeat received from {machine.name}")
                pass
    except WebSocketDisconnect:
        manager.disconnect(machine_id)
        machine.is_online = False
        machine.status = "offline"
        db.commit()
        print(f"Machine {machine.name} disconnected")
