import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, LargeBinary, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base


class Job(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    creator_id = Column(UUID(as_uuid=True), ForeignKey("user.id"))
    machine_id = Column(UUID(as_uuid=True), ForeignKey("machine.id"), nullable=True)

    status = Column(String, default="pending", index=True)

    pickled_function = Column(LargeBinary, nullable=False)

    result_url = Column(String, nullable=True)

    function_args = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    owner = relationship("User", back_populates="jobs")
    machine = relationship("Machine", back_populates="jobs")
