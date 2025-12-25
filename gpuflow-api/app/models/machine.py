import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Machine(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("user.id"))

    # machine identity
    name = Column(String, nullable=False)
    description = Column(String)
    auth_token = Column(String, unique=True, index=True)
    device_id = Column(String, unique=True, index=True)

    # specs for the rig
    gpu_name = Column(String)
    vram_gb = Column(Integer)

    # status
    is_online = Column(Boolean, default=False)
    status = Column(String, default="offline")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="machines")
    jobs = relationship("Job", back_populates="machine")
