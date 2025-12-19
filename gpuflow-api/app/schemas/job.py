from uuid import UUID
from pydantic import BaseModel
from typing import Optional


class JobCreate(BaseModel):
    code_string: str
    requirements: Optional[dict] = None


class JobResponse(BaseModel):
    id: UUID
    status: str
    creator_id: UUID
    created_at: str

    class Config:
        from_attributes = True
