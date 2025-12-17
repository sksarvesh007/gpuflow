from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class MachineCreate(BaseModel):
    name: str
    description: Optional[str] = None
    
class MachineResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    auth_token: str
    is_online: bool
    status : str
    
    class Config:
        from_attributes = True