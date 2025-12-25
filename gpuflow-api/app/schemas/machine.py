from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class MachineCreate(BaseModel):
    name: str
    description: Optional[str] = None
    device_id: str
    gpu_name: Optional[str] = None
    vram_gb: Optional[int] = None


class MachineResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    auth_token: str
    is_online: bool
    status: str
    device_id: Optional[str] = None
    gpu_name: Optional[str] = None
    vram_gb: Optional[int] = None

    class Config:
        from_attributes = True
