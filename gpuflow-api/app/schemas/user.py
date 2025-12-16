from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=50)

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    credits: int
    is_active: bool

    class Config:
        from_attributes = True